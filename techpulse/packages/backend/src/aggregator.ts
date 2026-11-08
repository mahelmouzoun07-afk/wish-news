import { EventEmitter } from "events";
import Parser from "rss-parser";
import { NewsStore, type FeedSource, type RawItem } from "../../shared/src";

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
  timeout: 25000,
  headers: { "User-Agent": "Wish/1.0 (news aggregator)" },
  customFields: { item: ["media:content"] },
});

// Some feeds (e.g. CoinDesk) return XML nodes as objects instead of strings.
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

export class NewsAggregator extends EventEmitter {
  readonly store = new NewsStore(fetchFeed);

  async refresh() {
    const isFirstLoad = this.store.lastRefresh === null;
    const fresh = await this.store.refresh((source, error) =>
      console.warn(`[aggregator] ${source.name} indisponible: ${(error as Error)?.message ?? error}`),
    );
    // Skip the event on the very first load so clients aren't flooded with "new" notifications.
    if (fresh.length > 0 && !isFirstLoad) this.emit("new-articles", fresh);
    console.log(`[aggregator] ${fresh.length} nouveaux articles (total ${this.store.size})`);
    return fresh;
  }

  status() {
    return { articles: this.store.size, lastRefresh: this.store.lastRefresh?.toISOString() ?? null };
  }
}
