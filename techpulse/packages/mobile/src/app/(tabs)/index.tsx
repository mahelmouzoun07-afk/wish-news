import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { Category, NewsArticle } from "@shared";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryChips } from "@/components/CategoryChips";
import { PageHeader } from "@/components/PageHeader";
import { EmptyView, ErrorView, Loading } from "@/components/StateViews";
import { useApp } from "@/lib/AppContext";
import { CONTENT_WIDTH, FONTS } from "@/lib/theme";

const PAGE = 40;

export default function FeedScreen() {
  const { theme, api, serverUrl, ready, isVisible, pendingNew, clearPending, connected, t } = useApp();
  const [category, setCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const listRef = useRef<FlatList<NewsArticle>>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  const key = `${serverUrl}|${category ?? ""}|${debouncedQuery}|${attempt}`;
  const loading = loadedKey !== key;

  const fetchPage = useCallback(
    (offset: number) => api.news({ category: category ?? undefined, q: debouncedQuery, limit: PAGE, offset }),
    [api, category, debouncedQuery],
  );

  useEffect(() => {
    if (!ready) return;
    const id = ++requestId.current;
    fetchPage(0)
      .then((page) => {
        if (id !== requestId.current) return;
        setItems(page.items);
        setTotal(page.total);
        setError(null);
        clearPending();
      })
      .catch((e: Error) => id === requestId.current && setError(e.message))
      .finally(() => id === requestId.current && setLoadedKey(key));
  }, [ready, fetchPage, key, clearPending]);

  const refresh = async () => {
    const id = ++requestId.current;
    setRefreshing(true);
    try {
      const page = await fetchPage(0);
      if (id !== requestId.current) return;
      setItems(page.items);
      setTotal(page.total);
      setError(null);
      clearPending();
    } catch (e) {
      if (id === requestId.current) setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (refreshing || loading || items.length >= total) return;
    const id = requestId.current;
    try {
      const page = await fetchPage(items.length);
      if (id !== requestId.current) return;
      setItems((prev) => {
        const known = new Set(prev.map((a) => a.id));
        return [...prev, ...page.items.filter((a) => !known.has(a.id))];
      });
      setTotal(page.total);
    } catch {}
  };

  const showNew = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    refresh();
  };

  const visible = items.filter(isVisible);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t.appName} subtitle={t.tagline} />
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <AnimatedIcon name="search" size={18} color={theme.textMuted} accent={theme.textMuted} playing={false} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.feed.searchPlaceholder}
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <AnimatedIcon name="close" size={18} color={theme.textMuted} accent={theme.textMuted} playing={false} />
          </Pressable>
        )}
      </View>

      <CategoryChips value={category} onChange={setCategory} />

      <View style={styles.statusRow}>
        <AnimatedIcon name="live" size={10} color={connected ? "#22C55E" : theme.danger} accent={connected ? "#22C55E" : theme.danger} />
        <Text style={[styles.statusText, { color: theme.textMuted }]}>
          {connected ? t.feed.live : t.feed.offline} · {total} {t.feed.articles}
        </Text>
      </View>

      {pendingNew.length > 0 && (
        <Pressable onPress={showNew} style={[styles.banner, { backgroundColor: theme.accent }]}>
          <AnimatedIcon name="sparkle" size={14} color={theme.accentText} accent={theme.accentText} />
          <Text style={[styles.bannerText, { color: theme.accentText }]}>{t.feed.newBadge(pendingNew.length)}</Text>
        </Pressable>
      )}

      {loading ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorView message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : (
        <FlatList
          ref={listRef}
          data={visible}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          contentContainerStyle={[CONTENT_WIDTH, { paddingTop: 10, paddingBottom: 40 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<EmptyView icon="search" title={t.feed.empty.title} text={t.feed.empty.text(debouncedQuery)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: -22,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 15, height: "100%", fontFamily: FONTS.body },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingTop: 4 },
  statusText: { fontSize: 12, fontFamily: FONTS.bodyBold },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 8,
  },
  bannerText: { fontFamily: FONTS.bodyBold, fontSize: 13 },
});
