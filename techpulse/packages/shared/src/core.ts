import { AFRICA_KEYWORDS, CATEGORY_KEYWORDS, FEED_SOURCES, FeedSource } from "./sources";
import type { Category, DailyDigest, NewsArticle, NewsPage, RelatedLink, SourceInfo } from "./types";

/** Feed item normalised from any RSS/Atom parser. */
export interface RawItem {
  title: string;
  link: string;
  guid?: string;
  date?: string;
  content?: string;
  categories?: string[];
  imageUrl?: string;
}

const MAX_ARTICLES = 1500;
// Some feeds (e.g. OpenAI) ship years of history; only recent news belongs in the feed.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is", "are", "its", "it", "at", "by",
  "from", "as", "new", "how", "why", "what", "this", "that", "be", "has", "have", "after", "says", "will",
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "en", "pour", "sur", "dans", "est", "qui", "que",
]);

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">",
  "&rsquo;": "'", "&lsquo;": "'", "&ldquo;": '"', "&rdquo;": '"', "&hellip;": "…", "&eacute;": "é",
  "&egrave;": "è", "&agrave;": "à", "&ccedil;": "ç", "&ecirc;": "ê",
};

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)) + "…";
}

// FNV-1a: stable ids without depending on Node's crypto (runs on phones too).
function hashId(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x5bd1e995);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

// Explicit letter ranges instead of \p{L}: Unicode property escapes aren't reliable on every JS engine.
const WORD_CHARS = "A-Za-z0-9\\u00C0-\\u024F";

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(new RegExp(`[^${WORD_CHARS}\\s-]`, "g"), " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordPattern = (words: string[]) =>
  new RegExp(`(^|[^${WORD_CHARS}])(${words.map(escapeRegex).join("|")})(?![${WORD_CHARS}])`, "i");
const CATEGORY_PATTERNS = CATEGORY_KEYWORDS.map((r) => ({ category: r.category, pattern: wordPattern(r.keywords) }));
const AFRICA_PATTERN = wordPattern(AFRICA_KEYWORDS);

function detectCategory(text: string, source: FeedSource): Category {
  if (source.defaultCategory === "startups-africa") return "startups-africa";
  return CATEGORY_PATTERNS.find((r) => r.pattern.test(text))?.category ?? source.defaultCategory;
}

function detectTags(text: string, category: Category): string[] {
  const tags = new Set<string>([category]);
  if (AFRICA_PATTERN.test(text)) tags.add("afrique");
  for (const rule of CATEGORY_PATTERNS) if (rule.pattern.test(text)) tags.add(rule.category);
  if (/\b(raises?|funding|series [a-e]|seed round|lève|levée)\b/i.test(text)) tags.add("levée-de-fonds");
  if (/\b(launch(es|ed)?|lance|unveils?)\b/i.test(text)) tags.add("lancement");
  return [...tags];
}

function buildExternalLinks(title: string): RelatedLink[] {
  const query = encodeURIComponent(title);
  return [
    { title: "youtube", url: `https://www.youtube.com/results?search_query=${query}`, type: "video" },
    { title: "google-news", url: `https://news.google.com/search?q=${query}`, type: "article" },
  ];
}

export function toArticle(item: RawItem, source: FeedSource): NewsArticle | null {
  const title = stripHtml(item.title ?? "");
  if (!title || !item.link) return null;
  // Hacker News items only carry link metadata, which is noise as a summary.
  const body = stripHtml(item.content ?? "")
    .replace(/(Article URL|Comments URL|Points|# Comments):\s*\S+/g, "")
    .trim();
  const text = `${title} ${body} ${(item.categories ?? []).join(" ")}`;
  const category = detectCategory(text, source);
  const parsed = item.date ? Date.parse(item.date) : NaN;
  return {
    id: hashId(item.guid || item.link),
    title,
    summary: truncate(body, 280),
    content: truncate(body, 3000),
    category,
    source: source.name,
    sourceUrl: item.link,
    imageUrl: item.imageUrl,
    publishedAt: new Date(isNaN(parsed) ? Date.now() : parsed).toISOString(),
    relatedLinks: buildExternalLinks(title),
    tags: detectTags(text, category),
  };
}

function byDateDesc(a: NewsArticle, b: NewsArticle) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export type FeedFetcher = (source: FeedSource) => Promise<RawItem[]>;

// Fetching 30+ feeds at once saturates slow connections and makes most of them time out.
const FETCH_CONCURRENCY = 6;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export class NewsStore {
  private articles = new Map<string, NewsArticle>();
  lastRefresh: Date | null = null;

  constructor(private fetchFeed: FeedFetcher, private sources: FeedSource[] = FEED_SOURCES) {}

  /** Fetches every feed and returns the articles that weren't known yet. */
  async refresh(onError?: (source: FeedSource, error: unknown) => void): Promise<NewsArticle[]> {
    const results = await mapLimit(this.sources, FETCH_CONCURRENCY, (s) => this.fetchFeed(s));
    const cutoff = Date.now() - MAX_AGE_MS;
    const fresh: NewsArticle[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        onError?.(this.sources[i], result.reason);
        return;
      }
      for (const raw of result.value) {
        const article = toArticle(raw, this.sources[i]);
        if (!article || new Date(article.publishedAt).getTime() < cutoff) continue;
        if (!this.articles.has(article.id)) {
          this.articles.set(article.id, article);
          fresh.push(article);
        }
      }
    });
    this.prune();
    this.lastRefresh = new Date();
    return fresh.sort(byDateDesc);
  }

  private prune() {
    if (this.articles.size <= MAX_ARTICLES) return;
    const sorted = [...this.articles.values()].sort(byDateDesc);
    for (const old of sorted.slice(MAX_ARTICLES)) this.articles.delete(old.id);
  }

  get size() {
    return this.articles.size;
  }

  list(opts: { category?: string; q?: string; source?: string; limit?: number; offset?: number }): NewsPage {
    let items = [...this.articles.values()];
    if (opts.category) items = items.filter((a) => a.category === opts.category || a.tags.includes(opts.category!));
    if (opts.source) items = items.filter((a) => a.source === opts.source);
    if (opts.q) {
      const terms = opts.q.toLowerCase().split(/\s+/).filter(Boolean);
      items = items.filter((a) => {
        const hay = `${a.title} ${a.summary} ${a.tags.join(" ")} ${a.source}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
    items.sort(byDateDesc);
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? 50;
    return { total: items.length, items: items.slice(offset, offset + limit) };
  }

  get(id: string): NewsArticle | undefined {
    const article = this.articles.get(id);
    if (!article) return undefined;
    return { ...article, relatedLinks: [...this.findRelated(article), ...article.relatedLinks] };
  }

  private findRelated(article: NewsArticle): RelatedLink[] {
    const keywords = new Set(extractKeywords(article.title));
    return [...this.articles.values()]
      .filter((a) => a.id !== article.id)
      .map((a) => ({ a, score: extractKeywords(a.title).filter((w) => keywords.has(w)).length }))
      .filter(({ score }) => score >= 2)
      .sort((x, y) => y.score - x.score)
      .slice(0, 3)
      .map(({ a }) => ({ title: `${a.title} — ${a.source}`, url: a.sourceUrl, type: "article" as const }));
  }

  digest(): DailyDigest {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const recent = [...this.articles.values()].filter((a) => new Date(a.publishedAt).getTime() >= since);
    // Stories covered by several sources rank higher, then funding/launch/Africa news.
    const scored = recent.map((a) => {
      const words = new Set(extractKeywords(a.title));
      const coverage = recent.filter(
        (b) => b.source !== a.source && extractKeywords(b.title).filter((w) => words.has(w)).length >= 2,
      ).length;
      const bonus = ["levée-de-fonds", "lancement", "afrique"].filter((t) => a.tags.includes(t)).length;
      return { a, score: coverage * 2 + bonus };
    });
    scored.sort((x, y) => y.score - x.score || byDateDesc(x.a, y.a));

    const top: NewsArticle[] = [];
    const perCategory = new Map<string, number>();
    for (const { a } of scored) {
      if ((perCategory.get(a.category) ?? 0) >= 2) continue;
      top.push(a);
      perCategory.set(a.category, (perCategory.get(a.category) ?? 0) + 1);
      if (top.length === 5) break;
    }

    const counts: Partial<Record<Category, number>> = {};
    for (const a of recent) counts[a.category] = (counts[a.category] ?? 0) + 1;
    return { date: new Date().toISOString().slice(0, 10), topStories: top, total: recent.length, counts };
  }

  sourceList(): SourceInfo[] {
    return this.sources.map((s) => ({ name: s.name, category: s.defaultCategory }));
  }
}
