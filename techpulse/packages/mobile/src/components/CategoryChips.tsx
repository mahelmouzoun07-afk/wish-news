import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Category } from "@shared";
import { CATEGORIES } from "@shared";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { useApp } from "@/lib/AppContext";
import { CATEGORY_GRADIENTS, FONTS } from "@/lib/theme";

const ICONS: Record<Category, IconName> = {
  ai: "ai",
  fintech: "fintech",
  "startups-us": "startups-us",
  "startups-africa": "startups-africa",
  crypto: "crypto",
  tech: "tech",
  innovation: "innovation",
};

export function CategoryChips({ value, onChange }: { value: Category | null; onChange: (c: Category | null) => void }) {
  const { theme, prefs, t } = useApp();
  const categories = CATEGORIES.filter((c) => !prefs.hiddenCategories.includes(c));

  const Chip = ({ active, label, icon, onPress, color }: { active: boolean; label: string; icon?: IconName; onPress: () => void; color?: string }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? color ?? theme.accent : theme.border, backgroundColor: active ? color ?? theme.accent : theme.surface },
      ]}
    >
      {icon && <AnimatedIcon name={icon} size={14} color={active ? theme.accentText : theme.text} accent={active ? theme.accentText : color ?? theme.text} playing={active} />}
      <Text style={[styles.text, { color: active ? theme.accentText : theme.text }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      <Chip active={value === null} label={t.feed.all} icon="sparkle" onPress={() => onChange(null)} />
      {categories.map((c) => (
        <Chip
          key={c}
          active={value === c}
          label={t.categoryLabels[c]}
          icon={ICONS[c]}
          color={CATEGORY_GRADIENTS[c][1]}
          onPress={() => onChange(c)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 4, alignItems: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  text: { fontSize: 13, fontFamily: FONTS.bodyBold },
});
