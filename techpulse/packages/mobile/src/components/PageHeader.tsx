import { StyleSheet, Text, View } from "react-native";
import { ShaderBackground } from "@/components/ShaderBackground";
import { WishMark } from "@/components/WishLogo";
import { useApp } from "@/lib/AppContext";
import { FONTS } from "@/lib/theme";

interface Props {
  title: string;
  subtitle?: string;
  compact?: boolean;
}

/** Hero-style page header with the animated shader behind the title. */
export function PageHeader({ title, subtitle, compact = false }: Props) {
  const { theme } = useApp();
  return (
    <View style={[styles.wrap, { height: compact ? 140 : 190, backgroundColor: theme.bg }]}>
      <ShaderBackground palette={theme.mesh} intensity={0.9} />
      <View style={styles.content}>
        <WishMark color={theme.text} accent={theme.accent} size={22} />
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sub, { color: theme.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 48, paddingHorizontal: 20, justifyContent: "flex-end", paddingBottom: 14, overflow: "hidden" },
  content: { gap: 4 },
  title: { fontFamily: FONTS.display, fontSize: 36, lineHeight: 40 },
  sub: { fontFamily: FONTS.body, fontSize: 13, marginTop: 2 },
});
