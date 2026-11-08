import * as WebBrowser from "expo-web-browser";
import { Alert, Platform, Share } from "react-native";
import type { NewsArticle } from "@shared";

export async function openLink(url: string) {
  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  await WebBrowser.openBrowserAsync(url);
}

export async function shareArticle(article: NewsArticle) {
  const text = `${article.title}\n\n${article.sourceUrl}\n\nVia TechPulse`;
  if (Platform.OS === "web") {
    if (navigator.share) {
      await navigator.share({ title: article.title, url: article.sourceUrl, text: article.title }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(text);
    window.alert("Lien copié dans le presse-papiers");
    return;
  }
  try {
    await Share.share({ message: text, title: article.title });
  } catch {
    Alert.alert("Partage impossible");
  }
}
