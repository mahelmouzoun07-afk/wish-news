import { Tabs } from "expo-router";
import { AnimatedIcon, type IconName } from "@/components/AnimatedIcon";
import { useApp } from "@/lib/AppContext";
import { FONTS } from "@/lib/theme";

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <AnimatedIcon name={name} size={24} color={color} accent={color} playing={focused} />
  );
}

export default function TabLayout() {
  const { theme, pendingNew, favorites, t } = useApp();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11 },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: FONTS.display, fontSize: 22 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.feed,
          headerShown: false,
          tabBarIcon: tabIcon("feed"),
          tabBarBadge: pendingNew.length > 0 ? pendingNew.length : undefined,
        }}
      />
      <Tabs.Screen name="digest" options={{ title: t.tabs.digest, headerShown: false, tabBarIcon: tabIcon("digest") }} />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t.tabs.favorites,
          headerShown: false,
          tabBarIcon: tabIcon("favorite"),
          tabBarBadge: favorites.length > 0 ? favorites.length : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.surfaceAlt, color: theme.text },
        }}
      />
      <Tabs.Screen name="settings" options={{ title: t.tabs.settings, headerShown: false, tabBarIcon: tabIcon("settings") }} />
    </Tabs>
  );
}
