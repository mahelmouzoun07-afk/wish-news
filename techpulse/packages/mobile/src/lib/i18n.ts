import type { Category } from "@shared";

export type Language = "fr" | "en";

type Dict = {
  appName: string;
  tagline: string;
  tabs: { feed: string; digest: string; favorites: string; settings: string };
  feed: {
    searchPlaceholder: string;
    all: string;
    live: string;
    offline: string;
    articles: string;
    newBadge: (n: number) => string;
    empty: { title: string; text: (q: string) => string };
  };
  digest: {
    kicker: string;
    heading: (n: number) => string;
    summary: (n: number, counts: string) => string;
  };
  favorites: { empty: { title: string; text: string } };
  article: {
    readOriginal: (source: string) => string;
    related: string;
    youtube: string;
    googleNews: string;
    openSource: string;
    share: string;
    save: string;
    unsave: string;
  };
  settings: {
    appearance: string;
    themeAuto: string;
    themeLight: string;
    themeDark: string;
    notifications: string;
    notificationsToggle: string;
    notificationsTest: string;
    language: string;
    categories: string;
    sources: string;
    server: string;
    serverConnected: string;
    serverDisconnected: string;
    serverPlaceholder: string;
    serverSave: string;
    footer: string;
  };
  categoryLabels: Record<Category, string>;
  errors: {
    serverUnreachable: (url: string) => string;
    timeout: string;
    retry: string;
    noResults: string;
  };
  time: {
    now: string;
    minutes: (n: number) => string;
    hours: (n: number) => string;
    days: (n: number) => string;
  };
};

export const DICTS: Record<Language, Dict> = {
  fr: {
    appName: "Wish",
    tagline: "L'actu tech, IA, fintech et startups — en direct",
    tabs: { feed: "Fil", digest: "Essentiel", favorites: "Favoris", settings: "Réglages" },
    feed: {
      searchPlaceholder: "Rechercher (ex : OpenAI, Wave, levée…)",
      all: "Tout",
      live: "En direct",
      offline: "Hors ligne",
      articles: "articles",
      newBadge: (n) => `${n} nouvelle${n > 1 ? "s" : ""} actu${n > 1 ? "s" : ""}`,
      empty: {
        title: "Aucun résultat",
        text: (q) => (q ? `Rien pour « ${q} »` : "Aucune actu dans cette catégorie pour l'instant."),
      },
    },
    digest: {
      kicker: "RÉSUMÉ DU JOUR",
      heading: (n) => `Les ${n} infos à retenir`,
      summary: (n, counts) => `${n} articles ces dernières 24h. ${counts}`,
    },
    favorites: { empty: { title: "Aucun favori", text: "Touche l'icône signet sur un article pour le garder ici." } },
    article: {
      readOriginal: (source) => `Lire l'article complet sur ${source}`,
      related: "Pour mieux comprendre",
      youtube: "Vidéos YouTube sur ce sujet",
      googleNews: "Plus d'articles (Google News)",
      openSource: "Ouvrir la source",
      share: "Partager",
      save: "Ajouter aux favoris",
      unsave: "Retirer des favoris",
    },
    settings: {
      appearance: "APPARENCE",
      themeAuto: "Auto",
      themeLight: "Clair",
      themeDark: "Sombre",
      notifications: "NOTIFICATIONS",
      notificationsToggle: "Alerte à chaque nouvelle actu",
      notificationsTest: "Envoyer une notification de test",
      language: "LANGUE",
      categories: "CATÉGORIES AFFICHÉES",
      sources: "SOURCES SUIVIES",
      server: "SERVEUR",
      serverConnected: "Connecté à",
      serverDisconnected: "Non connecté à",
      serverPlaceholder: "http://192.168.1.20:4000 (optionnel)",
      serverSave: "Enregistrer l'adresse",
      footer: "Wish 1.0 — IA, tech, fintech et startups",
    },
    categoryLabels: {
      ai: "Intelligence Artificielle",
      fintech: "Fintech",
      "startups-us": "Startups US",
      "startups-africa": "Startups Afrique",
      crypto: "Crypto",
      tech: "Technologie",
      innovation: "Innovation",
    },
    errors: {
      serverUnreachable: (url) => `Impossible de joindre ${url}`,
      timeout: "Le serveur ne répond pas (délai dépassé)",
      retry: "Réessayer",
      noResults: "Aucun résultat",
    },
    time: {
      now: "à l'instant",
      minutes: (n) => `il y a ${n} min`,
      hours: (n) => `il y a ${n} h`,
      days: (n) => `il y a ${n} j`,
    },
  },
  en: {
    appName: "Wish",
    tagline: "Tech, AI, fintech and startup news — live",
    tabs: { feed: "Feed", digest: "Daily", favorites: "Saved", settings: "Settings" },
    feed: {
      searchPlaceholder: "Search (e.g. OpenAI, Wave, raises…)",
      all: "All",
      live: "Live",
      offline: "Offline",
      articles: "articles",
      newBadge: (n) => `${n} new stor${n > 1 ? "ies" : "y"}`,
      empty: {
        title: "Nothing here",
        text: (q) => (q ? `No match for “${q}”` : "No stories in this category yet."),
      },
    },
    digest: {
      kicker: "TODAY'S BRIEF",
      heading: (n) => `${n} stories to remember`,
      summary: (n, counts) => `${n} stories in the last 24h. ${counts}`,
    },
    favorites: { empty: { title: "Nothing saved", text: "Tap the bookmark on any story to keep it here." } },
    article: {
      readOriginal: (source) => `Read the full story on ${source}`,
      related: "Dig deeper",
      youtube: "YouTube videos on this topic",
      googleNews: "More coverage (Google News)",
      openSource: "Open the source",
      share: "Share",
      save: "Save",
      unsave: "Unsave",
    },
    settings: {
      appearance: "APPEARANCE",
      themeAuto: "Auto",
      themeLight: "Light",
      themeDark: "Dark",
      notifications: "NOTIFICATIONS",
      notificationsToggle: "Alert me on every new story",
      notificationsTest: "Send a test notification",
      language: "LANGUAGE",
      categories: "VISIBLE CATEGORIES",
      sources: "FOLLOWED SOURCES",
      server: "SERVER",
      serverConnected: "Connected to",
      serverDisconnected: "Not connected to",
      serverPlaceholder: "http://192.168.1.20:4000 (optional)",
      serverSave: "Save server address",
      footer: "Wish 1.0 — AI, tech, fintech and startups",
    },
    categoryLabels: {
      ai: "Artificial Intelligence",
      fintech: "Fintech",
      "startups-us": "US Startups",
      "startups-africa": "Africa Startups",
      crypto: "Crypto",
      tech: "Tech",
      innovation: "Innovation",
    },
    errors: {
      serverUnreachable: (url) => `Can't reach ${url}`,
      timeout: "Server didn't respond in time",
      retry: "Retry",
      noResults: "No results",
    },
    time: {
      now: "just now",
      minutes: (n) => `${n}m ago`,
      hours: (n) => `${n}h ago`,
      days: (n) => `${n}d ago`,
    },
  },
};
