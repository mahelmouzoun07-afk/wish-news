import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import Parser from "rss-parser";
import type { FeedSource, NewsArticle, RawItem } from "../../techpulse/packages/shared/src";
import { FEED_SOURCES, NewsStore } from "../../techpulse/packages/shared/src";

const STORE_NAME = "wish-news";
const CACHE_KEY = "feed-cache-v1";

const parser = new Parser({
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
  return feed.items.map((item: any) => ({
    title: asText(item.title),
    link: asText(item.link),
    guid: asText(item.guid),
    date: item.isoDate ?? item.pubDate,
    content: asText(item.content) || asText(item.contentSnippet),
    categories: (item.categories ?? []).map(asText),
    imageUrl: item.enclosure?.url ?? item["media:content"]?.$?.url,
  }));
}

export default async () => {
  const store = new NewsStore(fetchFeed, FEED_SOURCES);
  await store.refresh((source, err) => console.warn(`[cron] ${source.name}: ${(err as Error)?.message ?? err}`));
  const articles = store.list({ limit: 2000 }).items;
  await getStore(STORE_NAME).setJSON(CACHE_KEY, { articles, refreshedAt: Date.now() });
  console.log(`[cron] cached ${articles.length} articles`);
};

export const config: Config = {
  // Every 10 minutes, matching the backend's polling cadence.
  schedule: "*/10 * * * *",
};
