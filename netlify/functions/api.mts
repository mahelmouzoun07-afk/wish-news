import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import Parser from "rss-parser";
import type { FeedSource, NewsArticle, RawItem } from "../../techpulse/packages/shared/src";
import { FEED_SOURCES, NewsStore } from "../../techpulse/packages/shared/src";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const STORE_NAME = "wish-news";
const CACHE_KEY = "feed-cache-v1";
const FETCH_CONCURRENCY = 6;

type CachedFeed = { articles: NewsArticle[]; refreshedAt: number };

type FeedItem = {
  title?: unknown;
  link?: unknown;
  guid?: unknown;
  isoDate?: string;
  pubDate?: string;
  content?: unknown;
  contentSnippet?: unknown;
  categories?: unknown[];
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, FeedItem>({
  timeout: 15000,
  headers: { "User-Agent": "Wish/1.0 (news aggregator)" },
  customFields: { item: ["media:content"] },
});

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_" in value) return String((value as { _: unknown })._);
  return "";
}

async function fetchFeed(source: FeedSource): Promise<RawItem[]> {
  const feed = await parser.parseURL(source.url);
  return feed.items.map((item) => ({
    title: asText(item.title),
    link: asText(item.link),
    guid: asText(item.guid),
    date: item.isoDate ?? item.pubDate,
    content: asText(item.content) || asText(item.contentSnippet),
    categories: (item.categories ?? []).map(asText),
    imageUrl: item.enclosure?.url ?? item["media:content"]?.$?.url,
  }));
}

/** Build a fresh NewsStore populated from either the Blob cache or the live feeds. */
async function buildStore(force = false): Promise<NewsStore> {
  const store = new NewsStore(fetchFeed, FEED_SOURCES);
  const blobs = getStore(STORE_NAME);
  if (!force) {
    const cached = await blobs.get(CACHE_KEY, { type: "json" }).catch(() => null) as CachedFeed | null;
    if (cached && Date.now() - cached.refreshedAt < REFRESH_INTERVAL_MS) {
      // Replay the cached articles through the store using its internal list format.
      for (const a of cached.articles) {
        // Cheap hydration: push the article straight into the private Map.
        (store as unknown as { articles: Map<string, NewsArticle> }).articles.set(a.id, a);
      }
      (store as unknown as { lastRefresh: Date }).lastRefresh = new Date(cached.refreshedAt);
      return store;
    }
  }
  // Pull fresh feeds in parallel; concurrency is already limited inside refresh().
  await store.refresh((source, err) => console.warn(`[api] ${source.name}: ${(err as Error)?.message ?? err}`));
  const fresh: CachedFeed = {
    articles: store.list({ limit: 2000 }).items,
    refreshedAt: Date.now(),
  };
  await blobs.setJSON(CACHE_KEY, fresh);
  return store;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
  });
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  // Path under /api/* thanks to the netlify.toml redirect that strips the prefix.
  // We also handle /.netlify/functions/api/* for direct calls.
  const raw = url.pathname.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "") || "/";

  try {
    if (raw === "/health" || raw === "/") {
      const store = await buildStore();
      return json({ ok: true, articles: store.size, lastRefresh: store.lastRefresh?.toISOString() ?? null });
    }

    if (raw === "/sources") {
      const store = await buildStore();
      return json(store.sourceList());
    }

    if (raw === "/digest") {
      const store = await buildStore();
      return json(store.digest());
    }

    if (raw === "/news") {
      const store = await buildStore();
      const q = url.searchParams.get("q") ?? undefined;
      const category = url.searchParams.get("category") ?? undefined;
      const source = url.searchParams.get("source") ?? undefined;
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
      const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
      return json(store.list({ q, category, source, limit, offset }));
    }

    const detailMatch = raw.match(/^\/news\/([^/]+)$/);
    if (detailMatch) {
      const store = await buildStore();
      const article = store.get(decodeURIComponent(detailMatch[1]));
      if (!article) return json({ error: "Article introuvable" }, 404);
      return json(article);
    }

    if (raw === "/refresh" && req.method === "POST") {
      const store = await buildStore(true);
      return json({ added: store.size });
    }

    return json({ error: `Route inconnue: ${raw}` }, 404);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
};

export const config: Config = {
  path: ["/api", "/api/*"],
};
