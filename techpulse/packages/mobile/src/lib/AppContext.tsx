import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import type { Category, NewsArticle } from "@shared";
import { Api, createApi, defaultServerUrl } from "./api";
import { DICTS, type Language } from "./i18n";
import { notify, setupNotifications } from "./notify";
import { darkTheme, lightTheme, Theme } from "./theme";

export type ThemeMode = "system" | "light" | "dark";

export interface Preferences {
  themeMode: ThemeMode;
  language: Language;
  hiddenCategories: Category[];
  hiddenSources: string[];
  notificationsEnabled: boolean;
  serverUrl: string;
}

const DEFAULT_PREFS: Preferences = {
  themeMode: "system",
  language: "fr",
  hiddenCategories: [],
  hiddenSources: [],
  notificationsEnabled: true,
  serverUrl: "",
};

const PREFS_KEY = "wish:prefs";
const FAVORITES_KEY = "wish:favorites";
const POLL_MS = 60_000;

interface AppContextValue {
  ready: boolean;
  theme: Theme;
  api: Api;
  serverUrl: string;
  prefs: Preferences;
  updatePrefs: (patch: Partial<Preferences>) => void;
  isVisible: (a: NewsArticle) => boolean;
  favorites: NewsArticle[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (a: NewsArticle) => void;
  pendingNew: NewsArticle[];
  clearPending: () => void;
  connected: boolean;
  t: (typeof DICTS)["fr"];
}

const AppContext = createContext<AppContextValue | null>(null);

async function load<T extends object>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [favorites, setFavorites] = useState<NewsArticle[]>([]);
  const [pendingNew, setPendingNew] = useState<NewsArticle[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    (async () => {
      setPrefs(await load(PREFS_KEY, DEFAULT_PREFS));
      try {
        const raw = await AsyncStorage.getItem(FAVORITES_KEY);
        if (raw) setFavorites(JSON.parse(raw));
      } catch {}
      setReady(true);
    })();
  }, []);

  const updatePrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((article: NewsArticle) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === article.id);
      const next = exists ? prev.filter((f) => f.id !== article.id) : [article, ...prev];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearPending = useCallback(() => setPendingNew([]), []);

  const t = DICTS[prefs.language];
  const serverUrl = prefs.serverUrl.trim() || defaultServerUrl();
  const api = useMemo(
    () => createApi(serverUrl, { timeout: t.errors.timeout, unreachable: t.errors.serverUnreachable }),
    [serverUrl, t],
  );

  const isVisible = useCallback(
    (a: NewsArticle) => !prefs.hiddenCategories.includes(a.category) && !prefs.hiddenSources.includes(a.source),
    [prefs.hiddenCategories, prefs.hiddenSources],
  );

  const isVisibleRef = useRef(isVisible);
  const notifyRef = useRef(prefs.notificationsEnabled);
  const langRef = useRef(prefs.language);
  useEffect(() => {
    isVisibleRef.current = isVisible;
    notifyRef.current = prefs.notificationsEnabled;
    langRef.current = prefs.language;
  }, [isVisible, prefs.notificationsEnabled, prefs.language]);

  useEffect(() => {
    if (ready && prefs.notificationsEnabled) setupNotifications().catch(() => {});
  }, [ready, prefs.notificationsEnabled]);

  const handleIncoming = useCallback((articles: NewsArticle[]) => {
    const visible = articles.filter((a) => isVisibleRef.current(a));
    if (visible.length === 0) return;
    setPendingNew((prev) => {
      const known = new Set(prev.map((p) => p.id));
      return [...visible.filter((a) => !known.has(a.id)), ...prev];
    });
    if (!notifyRef.current) return;
    const first = visible[0];
    const dict = DICTS[langRef.current];
    const title =
      visible.length === 1 ? dict.categoryLabels[first.category] : dict.feed.newBadge(visible.length);
    notify(title, first.title, visible.length === 1 ? first.id : undefined).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (Platform.OS === "web" && typeof EventSource !== "undefined") {
      const es = new EventSource(api.streamUrl());
      es.addEventListener("ready", () => setConnected(true));
      es.addEventListener("new-articles", (e) => handleIncoming(JSON.parse((e as MessageEvent).data)));
      es.onerror = () => setConnected(false);
      return () => es.close();
    }
    const seen = new Set<string>();
    let seeded = false;
    let cancelled = false;
    const poll = async () => {
      try {
        const { items } = await api.news({ limit: 30 });
        if (cancelled) return;
        setConnected(true);
        const fresh = items.filter((a) => !seen.has(a.id));
        fresh.forEach((a) => seen.add(a.id));
        if (seeded && fresh.length > 0) handleIncoming(fresh);
        seeded = true;
      } catch {
        if (!cancelled) setConnected(false);
      }
    };
    poll();
    const timer = setInterval(poll, POLL_MS);
    const sub = AppState.addEventListener("change", (s) => s === "active" && poll());
    return () => {
      cancelled = true;
      clearInterval(timer);
      sub.remove();
    };
  }, [ready, api, handleIncoming]);

  const theme =
    prefs.themeMode === "dark" || (prefs.themeMode === "system" && systemScheme === "dark") ? darkTheme : lightTheme;

  const value: AppContextValue = {
    ready,
    theme,
    api,
    serverUrl,
    prefs,
    updatePrefs,
    isVisible,
    favorites,
    isFavorite: (id) => favorites.some((f) => f.id === id),
    toggleFavorite,
    pendingNew,
    clearPending,
    connected,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
