import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { NewsArticle } from "@shared";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { useApp } from "@/lib/AppContext";
import { timeAgo } from "@/lib/format";
import { CATEGORY_GRADIENTS, FONTS } from "@/lib/theme";

const CATEGORY_ICONS: Record<string, IconName> = {
  ai: "ai",
  fintech: "fintech",
  "startups-us": "startups-us",
  "startups-africa": "startups-africa",
  crypto: "crypto",
  tech: "tech",
  innovation: "innovation",
};

export function ArticleCard({ article }: { article: NewsArticle }) {
  const { theme, isFavorite, toggleFavorite, prefs, t } = useApp();
  const gradient = CATEGORY_GRADIENTS[article.category];
  const fav = isFavorite(article.id);
  const label = t.categoryLabels[article.category];

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/article/[id]", params: { id: article.id } })}
      accessibilityRole="link"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: gradient[1] }]} />
      <View style={styles.body}>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: gradient[0] + "33" }]}>
            <AnimatedIcon name={CATEGORY_ICONS[article.category]} size={14} color={gradient[1]} accent={gradient[1]} playing={false} />
            <Text style={[styles.badgeText, { color: gradient[1] }]}>{label}</Text>
          </View>
          {article.tags.includes("levée-de-fonds") && (
            <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
              <AnimatedIcon name="funding" size={12} color={theme.accent} accent={theme.accent} playing={false} />
              <Text style={[styles.badgeText, { color: theme.textMuted }]}>{prefs.language === "fr" ? "Levée" : "Raise"}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={3}>
          {article.title}
        </Text>
        {!!article.summary && (
          <Text style={[styles.summary, { color: theme.textMuted }]} numberOfLines={2}>
            {article.summary}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={[styles.source, { color: theme.textMuted }]} numberOfLines={1}>
            {article.source} · {timeAgo(article.publishedAt, prefs.language)}
          </Text>
          <Pressable
            hitSlop={12}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(article);
            }}
            accessibilityLabel={fav ? t.article.unsave : t.article.save}
          >
            <AnimatedIcon name="favorite" size={20} color={fav ? theme.accent : theme.textMuted} accent={fav ? theme.accent : theme.textMuted} playing={fav} />
          </Pressable>
        </View>
      </View>
      {article.imageUrl ? <Image source={{ uri: article.imageUrl }} style={[styles.thumb, { backgroundColor: theme.surfaceAlt }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  stripe: { width: 4 },
  body: { flex: 1, padding: 14, gap: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontFamily: FONTS.bodyBold },
  title: { fontFamily: FONTS.display, fontSize: 18, lineHeight: 22 },
  summary: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  source: { fontSize: 12, flex: 1, marginRight: 8, fontFamily: FONTS.body },
  thumb: { width: 90, alignSelf: "stretch" },
});
