import { FlatList, View } from "react-native";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyView } from "@/components/StateViews";
import { useApp } from "@/lib/AppContext";
import { CONTENT_WIDTH } from "@/lib/theme";

export default function FavoritesScreen() {
  const { theme, favorites, t } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t.tabs.favorites} subtitle={`${favorites.length} ${t.feed.articles}`} compact />
      <FlatList
        style={{ flex: 1 }}
        data={favorites}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        contentContainerStyle={[CONTENT_WIDTH, { paddingTop: 12, paddingBottom: 40, flexGrow: 1 }]}
        ListEmptyComponent={<EmptyView icon="favorite" title={t.favorites.empty.title} text={t.favorites.empty.text} />}
      />
    </View>
  );
}
