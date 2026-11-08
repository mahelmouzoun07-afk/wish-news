import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyDigest } from "@shared";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHeader } from "@/components/PageHeader";
import { ErrorView, Loading } from "@/components/StateViews";
import { useApp } from "@/lib/AppContext";
import { CONTENT_WIDTH, FONTS } from "@/lib/theme";

export default function DigestScreen() {
  const { theme, api, ready, t } = useApp();
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setRefreshing(true);
    api
      .digest()
      .then((d) => {
        if (cancelled) return;
        setDigest(d);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
  }, [ready, api, attempt]);

  if (!digest && error) return <ErrorView message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  if (!digest) return <Loading />;

  const date = new Date(digest.date).toLocaleDateString(t.appName === "Wish" && undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const counts = Object.entries(digest.counts)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([c, n]) => `${t.categoryLabels[c as keyof typeof t.categoryLabels]} (${n})`)
    .join(" · ");

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[CONTENT_WIDTH, { paddingBottom: 40 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setAttempt((n) => n + 1)} tintColor={theme.accent} />}
    >
      <PageHeader title={t.digest.kicker} subtitle={date.charAt(0).toUpperCase() + date.slice(1)} />
      <View style={{ paddingHorizontal: 16, marginTop: -14, marginBottom: 12 }}>
        <Text style={[styles.summary, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}>
          {t.digest.summary(digest.total, counts)}
        </Text>
      </View>
      <Text style={[styles.heading, { color: theme.text }]}>{t.digest.heading(digest.topStories.length)}</Text>
      {digest.topStories.map((a, i) => (
        <View key={a.id}>
          <Text style={[styles.rank, { color: theme.textMuted }]}>#{i + 1}</Text>
          <ArticleCard article={a} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summary: { padding: 14, borderRadius: 14, borderWidth: 1, fontFamily: FONTS.body, fontSize: 13, lineHeight: 19 },
  heading: { fontFamily: FONTS.display, fontSize: 22, marginHorizontal: 18, marginBottom: 10 },
  rank: { marginHorizontal: 20, marginBottom: 4, fontSize: 12, fontFamily: FONTS.bodyBold },
});
