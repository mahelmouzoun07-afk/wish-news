import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NewsArticle, RelatedLink } from "@shared";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { ShaderBackground } from "@/components/ShaderBackground";
import { ErrorView, Loading } from "@/components/StateViews";
import { openLink, shareArticle } from "@/lib/actions";
import { useApp } from "@/lib/AppContext";
import { timeAgo } from "@/lib/format";
import { CATEGORY_GRADIENTS, FONTS } from "@/lib/theme";

const LINK_ICONS: Record<RelatedLink["type"], IconName> = {
  video: "youtube",
  article: "article",
  podcast: "sparkle",
};

const CATEGORY_ICONS: Record<string, IconName> = {
  ai: "ai",
  fintech: "fintech",
  "startups-us": "startups-us",
  "startups-africa": "startups-africa",
  crypto: "crypto",
  tech: "tech",
  innovation: "innovation",
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, api, ready, favorites, isFavorite, toggleFavorite, prefs, t } = useApp();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    api
      .article(id)
      .then((a) => {
        if (cancelled) return;
        setArticle(a);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const saved = favoritesRef.current.find((f) => f.id === id);
        if (saved) setArticle(saved);
        else setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, api, id, attempt]);

  if (error) return <ErrorView message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  if (!article) return <Loading />;

  const gradient = CATEGORY_GRADIENTS[article.category];
  const fav = isFavorite(article.id);
  const linkTitle = (link: RelatedLink) => {
    if (link.title === "youtube") return t.article.youtube;
    if (link.title === "google-news") return t.article.googleNews;
    return link.title;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerBackTitle: "",
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => shareArticle(article)} hitSlop={10} accessibilityLabel={t.article.share}>
                <AnimatedIcon name="share" size={22} color={theme.text} accent={theme.accent} />
              </Pressable>
              <Pressable onPress={() => toggleFavorite(article)} hitSlop={10} accessibilityLabel={fav ? t.article.unsave : t.article.save}>
                <AnimatedIcon name="favorite" size={22} color={fav ? theme.accent : theme.text} accent={fav ? theme.accent : theme.text} playing={fav} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.hero}>
          <ShaderBackground palette={[gradient[0], gradient[1], theme.accent, theme.bg]} />
          <View style={styles.heroContent}>
            <View style={[styles.badge, { backgroundColor: gradient[1] }]}>
              <AnimatedIcon name={CATEGORY_ICONS[article.category]} size={14} color={"#fff"} accent={"#fff"} />
              <Text style={styles.badgeText}>{t.categoryLabels[article.category]}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {article.source} · {timeAgo(article.publishedAt, prefs.language)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {article.imageUrl ? <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" /> : null}

          <Text style={[styles.body, { color: theme.text }]}>{article.content || article.summary}</Text>

          {article.tags.length > 0 && (
            <View style={styles.tags}>
              {article.tags.map((tag) => (
                <Text key={tag} style={[styles.tag, { color: theme.textMuted, backgroundColor: theme.surfaceAlt }]}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          <Pressable onPress={() => openLink(article.sourceUrl)} style={[styles.primaryBtn, { backgroundColor: theme.accent }]}>
            <AnimatedIcon name="external" size={18} color={theme.accentText} accent={theme.accentText} />
            <Text style={[styles.primaryText, { color: theme.accentText }]}>{t.article.readOriginal(article.source)}</Text>
          </Pressable>

          <Text style={[styles.section, { color: theme.text }]}>{t.article.related}</Text>
          {article.relatedLinks.map((link) => (
            <Pressable
              key={link.url}
              onPress={() => openLink(link.url)}
              style={({ pressed }) => [
                styles.link,
                { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <AnimatedIcon name={LINK_ICONS[link.type]} size={22} color={link.type === "video" ? "#FF0033" : theme.accent} accent={link.type === "video" ? "#FF0033" : theme.accent} playing={false} />
              <Text style={[styles.linkText, { color: theme.text }]} numberOfLines={2}>
                {linkTitle(link)}
              </Text>
              <AnimatedIcon name="chevron" size={16} color={theme.textMuted} accent={theme.textMuted} playing={false} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 90, paddingHorizontal: 20, paddingBottom: 28, overflow: "hidden" },
  heroContent: { gap: 10 },
  headerActions: { flexDirection: "row", gap: 18, marginRight: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontFamily: FONTS.bodyBold, fontSize: 12, color: "#fff" },
  title: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 34 },
  meta: { fontFamily: FONTS.body, fontSize: 13 },
  content: { padding: 18, gap: 14, maxWidth: 760, width: "100%", alignSelf: "center" },
  image: { width: "100%", aspectRatio: 16 / 9, borderRadius: 14 },
  body: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 25 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { fontFamily: FONTS.body, fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14 },
  primaryText: { fontFamily: FONTS.bodyBold, fontSize: 15, flexShrink: 1 },
  section: { fontFamily: FONTS.display, fontSize: 20, marginTop: 6 },
  link: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  linkText: { flex: 1, fontFamily: FONTS.bodyBold, fontSize: 14 },
});
