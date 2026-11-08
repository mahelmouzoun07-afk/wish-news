import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

let configured = false;

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    return (await Notification.requestPermission()) === "granted";
  }

  if (!configured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      // Android 13+ only shows the permission prompt once a channel exists.
      await Notifications.setNotificationChannelAsync("news", {
        name: "Nouvelles actus",
        importance: AndroidImportance.HIGH,
      });
    }
    configured = true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function notify(title: string, body: string, articleId?: string) {
  if (Platform.OS === "web") {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const n = new Notification(title, { body });
    if (articleId) {
      n.onclick = () => {
        window.focus();
        window.location.assign(`/article/${articleId}`);
      };
    }
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: articleId ? { url: `/article/${articleId}` } : {} },
    trigger: null,
  });
}
