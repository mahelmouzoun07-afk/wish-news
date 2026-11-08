import Constants from "expo-constants";
import { Platform } from "react-native";
import type { DailyDigest, NewsArticle, NewsPage, SourceInfo } from "@shared";

// On a real phone "localhost" is the phone itself, so reuse the IP of the PC running the Expo dev server.
export function defaultServerUrl(): string {
  // On a hosted build (Netlify), use same-origin API routes.
  const envOverride = (process.env.EXPO_PUBLIC_WISH_API ?? "").trim();
  if (envOverride) return envOverride;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location?.hostname && window.location.hostname !== "localhost") {
      return window.location.origin;
    }
    return "http://localhost:4000";
  }
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:4000`;
  return Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";
}

async function getJson<T>(base: string, path: string, errMsgs: { timeout: string; unreachable: (u: string) => string }): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    return (await res.json()) as T;
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new Error(errMsgs.timeout);
    if (e instanceof TypeError) throw new Error(errMsgs.unreachable(base));
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export interface ApiErrorMessages {
  timeout: string;
  unreachable: (url: string) => string;
}

export function createApi(base: string, errMsgs: ApiErrorMessages) {
  return {
    news: (params: { category?: string; q?: string; limit?: number; offset?: number } = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
      return getJson<NewsPage>(base, `/api/news?${qs}`, errMsgs);
    },
    article: (id: string) => getJson<NewsArticle>(base, `/api/news/${encodeURIComponent(id)}`, errMsgs),
    digest: () => getJson<DailyDigest>(base, "/api/digest", errMsgs),
    sources: () => getJson<SourceInfo[]>(base, "/api/sources", errMsgs),
    streamUrl: () => `${base.replace(/\/$/, "")}/api/stream`,
  };
}

export type Api = ReturnType<typeof createApi>;
