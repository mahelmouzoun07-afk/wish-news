import type { Category } from "@shared";

export interface Theme {
  dark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceGlass: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  danger: string;
  // Background mesh gradient palette — three blob colours plus the base.
  mesh: [string, string, string, string];
}

export const lightTheme: Theme = {
  dark: false,
  bg: "#F6F2E7",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEAD8",
  surfaceGlass: "rgba(255,255,255,0.72)",
  border: "#E3DBC3",
  text: "#1C1A14",
  textMuted: "#6A6453",
  accent: "#2E7D4F",
  accentText: "#FFFFFF",
  danger: "#D94B3B",
  mesh: ["#C7E6A8", "#F4E29C", "#F7C5A1", "#F6F2E7"],
};

export const darkTheme: Theme = {
  dark: true,
  bg: "#0D1117",
  surface: "#161B22",
  surfaceAlt: "#1E242D",
  surfaceGlass: "rgba(22,27,34,0.68)",
  border: "#262D37",
  text: "#F3EFE2",
  textMuted: "#A89F85",
  accent: "#7CEA9C",
  accentText: "#0D1117",
  danger: "#FF7A6B",
  mesh: ["#1F5B3A", "#4C3A72", "#8A4A2D", "#0D1117"],
};

// Each category gets its own gradient pair for cards and badges.
export const CATEGORY_GRADIENTS: Record<Category, [string, string]> = {
  ai: ["#A78BFA", "#7C3AED"],
  fintech: ["#4ADE80", "#059669"],
  "startups-us": ["#60A5FA", "#1D4ED8"],
  "startups-africa": ["#FDBA74", "#C2410C"],
  crypto: ["#FCD34D", "#D97706"],
  tech: ["#67E8F9", "#0E7490"],
  innovation: ["#F9A8D4", "#BE185D"],
};

export const CONTENT_WIDTH = { width: "100%", maxWidth: 920, alignSelf: "center" } as const;

export const FONTS = {
  display: "TitanOne",
  body: "Nunito_400Regular",
  bodyBold: "Nunito_700Bold",
  bodyBlack: "Nunito_900Black",
};
