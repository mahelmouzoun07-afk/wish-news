import { TitanOne_400Regular } from "@expo-google-fonts/titan-one";
import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from "@expo-google-fonts/nunito";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { SplashIntro } from "@/components/SplashIntro";
import { AppProvider, useApp } from "@/lib/AppContext";
import { FONTS } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function NotificationRouter() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url === "string") {
      router.push(url as never);
      Notifications.clearLastNotificationResponse();
    }
  }, [response]);
  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();
  const [introDone, setIntroDone] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      {Platform.OS !== "web" && <NotificationRouter />}
      <View style={{ flex: 1, opacity: introDone ? 1 : 0 }}>{children}</View>
      {!introDone && <SplashIntro onFinish={() => setIntroDone(true)} />}
    </View>
  );
}

function RootStack() {
  const { theme } = useApp();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: FONTS.display },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="article/[id]" options={{ title: "" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      TitanOne: TitanOne_400Regular,
      Nunito_400Regular,
      Nunito_700Bold,
      Nunito_900Black,
    })
      .catch(() => {})
      .finally(() => setFontsLoaded(true));
  }, []);

  const onReady = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <AppProvider>
      <View style={{ flex: 1 }} onLayout={onReady}>
        <Shell>
          <RootStack />
        </Shell>
      </View>
    </AppProvider>
  );
}
