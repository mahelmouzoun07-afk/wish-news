import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { useApp } from "@/lib/AppContext";
import { FONTS } from "@/lib/theme";

export function Loading() {
  const { theme } = useApp();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.accent} size="large" />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { theme, serverUrl, t } = useApp();
  return (
    <View style={styles.center}>
      <AnimatedIcon name="sparkle" size={56} color={theme.textMuted} accent={theme.danger} />
      <Text style={[styles.title, { color: theme.text }]}>{message}</Text>
      <Text style={[styles.hint, { color: theme.textMuted }]}>{serverUrl}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={[styles.btn, { backgroundColor: theme.accent }]}>
          <Text style={{ color: theme.accentText, fontFamily: FONTS.bodyBold }}>{t.errors.retry}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyView({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const { theme } = useApp();
  return (
    <View style={styles.center}>
      <AnimatedIcon name={icon} size={64} color={theme.textMuted} accent={theme.accent} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.text, { color: theme.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10, minHeight: 300 },
  title: { fontSize: 18, fontFamily: FONTS.display },
  text: { fontSize: 14, textAlign: "center", fontFamily: FONTS.body },
  hint: { fontSize: 12, textAlign: "center", marginTop: 4, fontFamily: FONTS.body },
  btn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
});
