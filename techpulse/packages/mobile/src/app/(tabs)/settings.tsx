import { ReactNode, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { Category, SourceInfo } from "@shared";
import { CATEGORIES } from "@shared";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/AppContext";
import { ThemeMode } from "@/lib/AppContext";
import { defaultServerUrl } from "@/lib/api";
import type { Language } from "@/lib/i18n";
import { notify, setupNotifications } from "@/lib/notify";
import { CONTENT_WIDTH, FONTS } from "@/lib/theme";

type ThemeOpt = { value: ThemeMode; label: string; icon: IconName };
type LangOpt = { value: Language; label: string };

const CATEGORY_ICONS: Record<Category, IconName> = {
  ai: "ai",
  fintech: "fintech",
  "startups-us": "startups-us",
  "startups-africa": "startups-africa",
  crypto: "crypto",
  tech: "tech",
  innovation: "innovation",
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useApp();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, onChange }: { icon?: IconName; label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useApp();
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      {icon && <AnimatedIcon name={icon} size={18} color={theme.text} accent={theme.accent} playing={value} />}
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent, false: theme.border }} />
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, prefs, updatePrefs, api, serverUrl, connected, t } = useApp();
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [urlDraft, setUrlDraft] = useState(prefs.serverUrl);

  useEffect(() => {
    api.sources().then(setSources).catch(() => setSources([]));
  }, [api]);

  const themeOptions: ThemeOpt[] = [
    { value: "system", label: t.settings.themeAuto, icon: "sparkle" },
    { value: "light", label: t.settings.themeLight, icon: "sun" },
    { value: "dark", label: t.settings.themeDark, icon: "moon" },
  ];
  const langOptions: LangOpt[] = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t.tabs.settings} compact />
      <ScrollView contentContainerStyle={[CONTENT_WIDTH, styles.content]}>
        <Section title={t.settings.appearance}>
          <View style={styles.segment}>
            {themeOptions.map((o) => {
              const active = prefs.themeMode === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => updatePrefs({ themeMode: o.value })}
                  style={[styles.segmentItem, { backgroundColor: active ? theme.accent : theme.surfaceAlt }]}
                >
                  <AnimatedIcon name={o.icon} size={16} color={active ? theme.accentText : theme.text} accent={active ? theme.accentText : theme.accent} playing={active} />
                  <Text style={{ color: active ? theme.accentText : theme.text, fontFamily: FONTS.bodyBold }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title={t.settings.language}>
          <View style={styles.segment}>
            {langOptions.map((o) => {
              const active = prefs.language === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => updatePrefs({ language: o.value })}
                  style={[styles.segmentItem, { backgroundColor: active ? theme.accent : theme.surfaceAlt }]}
                >
                  <Text style={{ color: active ? theme.accentText : theme.text, fontFamily: FONTS.bodyBold }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title={t.settings.notifications}>
          <Row
            icon="live"
            label={t.settings.notificationsToggle}
            value={prefs.notificationsEnabled}
            onChange={(v) => updatePrefs({ notificationsEnabled: v })}
          />
          <Pressable
            style={styles.linkRow}
            onPress={async () => {
              if (await setupNotifications()) notify(t.appName, t.settings.notificationsTest);
            }}
          >
            <AnimatedIcon name="sparkle" size={16} color={theme.accent} accent={theme.accent} />
            <Text style={{ color: theme.accent, fontFamily: FONTS.bodyBold }}>{t.settings.notificationsTest}</Text>
          </Pressable>
        </Section>

        <Section title={t.settings.categories}>
          {CATEGORIES.map((c) => (
            <Row
              key={c}
              icon={CATEGORY_ICONS[c]}
              label={t.categoryLabels[c]}
              value={!prefs.hiddenCategories.includes(c)}
              onChange={() => updatePrefs({ hiddenCategories: toggle(prefs.hiddenCategories, c) })}
            />
          ))}
        </Section>

        <Section title={t.settings.sources}>
          {sources.length === 0 ? (
            <Text style={[styles.muted, { color: theme.textMuted }]}>…</Text>
          ) : (
            sources.map((s) => (
              <Row
                key={s.name}
                label={s.name}
                value={!prefs.hiddenSources.includes(s.name)}
                onChange={() => updatePrefs({ hiddenSources: toggle(prefs.hiddenSources, s.name) })}
              />
            ))
          )}
        </Section>

        <Section title={t.settings.server}>
          <Text style={[styles.muted, { color: theme.textMuted }]}>
            {connected ? t.settings.serverConnected : t.settings.serverDisconnected} {serverUrl}
          </Text>
          <TextInput
            value={urlDraft}
            onChangeText={setUrlDraft}
            placeholder={defaultServerUrl()}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
          />
          <Pressable
            onPress={() => updatePrefs({ serverUrl: urlDraft.trim() })}
            style={[styles.saveBtn, { backgroundColor: theme.accent }]}
          >
            <Text style={{ color: theme.accentText, fontFamily: FONTS.bodyBold }}>{t.settings.serverSave}</Text>
          </Pressable>
        </Section>

        <Text style={[styles.footer, { color: theme.textMuted }]}>{t.settings.footer}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 60 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: FONTS.bodyBold, fontSize: 11, letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontFamily: FONTS.body, fontSize: 15, flex: 1 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  segment: { flexDirection: "row", gap: 8, padding: 10 },
  segmentItem: { flex: 1, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  muted: { fontFamily: FONTS.body, fontSize: 13, padding: 14 },
  input: { marginHorizontal: 14, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44, fontFamily: FONTS.body, fontSize: 15 },
  saveBtn: { margin: 14, padding: 12, borderRadius: 10, alignItems: "center" },
  footer: { textAlign: "center", fontSize: 12, marginTop: 8, fontFamily: FONTS.body },
});
