import type { Category } from "./types";

export interface FeedSource {
  name: string;
  url: string;
  defaultCategory: Category;
}

export const FEED_SOURCES: FeedSource[] = [
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", defaultCategory: "ai" },
  { name: "TechCrunch Fintech", url: "https://techcrunch.com/category/fintech/feed/", defaultCategory: "fintech" },
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", defaultCategory: "startups-us" },
  { name: "The Decoder", url: "https://the-decoder.com/feed/", defaultCategory: "ai" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", defaultCategory: "innovation" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", defaultCategory: "tech" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", defaultCategory: "tech" },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", defaultCategory: "tech" },
  { name: "TechCabal", url: "https://techcabal.com/feed/", defaultCategory: "startups-africa" },
  { name: "Disrupt Africa", url: "https://disrupt-africa.com/feed/", defaultCategory: "startups-africa" },
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", defaultCategory: "crypto" },

  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", defaultCategory: "ai" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", defaultCategory: "ai" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", defaultCategory: "ai" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", defaultCategory: "tech" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", defaultCategory: "startups-us" },
  { name: "Y Combinator Blog", url: "https://www.ycombinator.com/blog/rss/", defaultCategory: "startups-us" },
  { name: "Product Hunt", url: "https://www.producthunt.com/feed", defaultCategory: "innovation" },
  { name: "CNBC Tech", url: "https://www.cnbc.com/id/19854910/device/rss/rss.html", defaultCategory: "tech" },
  { name: "Finextra", url: "https://www.finextra.com/rss/headlines.aspx", defaultCategory: "fintech" },
  { name: "Fintech Futures", url: "https://www.fintechfutures.com/feed/", defaultCategory: "fintech" },
  { name: "WeeTracker", url: "https://weetracker.com/feed/", defaultCategory: "startups-africa" },
  { name: "Benjamindada", url: "https://www.benjamindada.com/rss/", defaultCategory: "startups-africa" },
  { name: "Launch Base Africa", url: "https://launchbaseafrica.com/feed/", defaultCategory: "startups-africa" },
  { name: "Wamda", url: "https://www.wamda.com/feed", defaultCategory: "startups-africa" },
  { name: "Social Net Link", url: "https://www.socialnetlink.org/feed/", defaultCategory: "startups-africa" },
  { name: "Agence Ecofin", url: "https://www.agenceecofin.com/rss", defaultCategory: "startups-africa" },
  { name: "Maddyness", url: "https://www.maddyness.com/feed/", defaultCategory: "innovation" },
  { name: "Siècle Digital", url: "https://siecledigital.fr/feed/", defaultCategory: "tech" },
  { name: "FrenchWeb", url: "https://www.frenchweb.fr/feed", defaultCategory: "innovation" },
  { name: "Journal du Geek", url: "https://www.journaldugeek.com/feed/", defaultCategory: "tech" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss", defaultCategory: "crypto" },
  { name: "Decrypt", url: "https://decrypt.co/feed", defaultCategory: "crypto" },
];

// Keyword rules override the source's default category when an article clearly belongs elsewhere.
export const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  { category: "crypto", keywords: ["bitcoin", "ethereum", "crypto", "blockchain", "stablecoin", "web3", "token"] },
  { category: "fintech", keywords: ["fintech", "payment", "paiement", "neobank", "mobile money", "lending", "banking", "wallet", "stripe", "flutterwave", "wave mobile money", "wave money", "m-pesa", "mpesa", "orange money", "moniepoint", "paystack", "chipper"] },
  { category: "ai", keywords: ["ai", "ia", "artificial intelligence", "intelligence artificielle", "openai", "anthropic", "claude", "gpt", "llm", "gemini", "machine learning", "deepmind", "nvidia"] },
];

export const AFRICA_KEYWORDS = [
  "africa", "afrique", "nigeria", "kenya", "senegal", "sénégal", "ghana", "egypt", "south africa",
  "côte d'ivoire", "ivory coast", "mali", "cameroon", "rwanda", "morocco", "lagos", "nairobi", "dakar", "abidjan",
];
