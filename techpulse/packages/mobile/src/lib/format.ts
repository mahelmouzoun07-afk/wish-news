import type { Language } from "./i18n";
import { DICTS } from "./i18n";

export function timeAgo(iso: string, lang: Language = "fr"): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  const t = DICTS[lang].time;
  if (min < 1) return t.now;
  if (min < 60) return t.minutes(min);
  const h = Math.floor(min / 60);
  if (h < 24) return t.hours(h);
  const d = Math.floor(h / 24);
  if (d < 7) return t.days(d);
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
}
