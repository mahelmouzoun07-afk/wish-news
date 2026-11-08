export type Category =
  | "ai"
  | "fintech"
  | "startups-us"
  | "startups-africa"
  | "crypto"
  | "tech"
  | "innovation";

export const CATEGORIES: Category[] = ["ai", "fintech", "startups-us", "startups-africa", "crypto", "tech", "innovation"];

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: Category;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
  relatedLinks: RelatedLink[];
  tags: string[];
}

export interface RelatedLink {
  title: string;
  url: string;
  type: "article" | "video" | "podcast";
}

export interface DailyDigest {
  date: string;
  topStories: NewsArticle[];
  total: number;
  counts: Partial<Record<Category, number>>;
}

export interface NewsPage {
  total: number;
  items: NewsArticle[];
}

export interface SourceInfo {
  name: string;
  category: Category;
}
