# Wish

Flux d'actus en temps réel : IA, Tech, Fintech, Startups de la Silicon Valley et d'Afrique, Crypto, Innovation.

Une seule base de code React Native (Expo) → app Android (APK), app Windows (Electron) et version web.

## Ce que l'app fait

- **Fil en direct** : 33 flux RSS lus toutes les 5 minutes, articles des 7 derniers jours seulement.
- **Catégories** : IA, Fintech, Startups US, Startups Afrique, Crypto, Tech, Innovation.
- **Recherche** par mot-clé, **filtres** par catégorie et par source.
- **Détail d'un article** : résumé, bouton vers la source, articles similaires, vidéos YouTube, Google News.
- **L'essentiel du jour** : les 5 infos à retenir.
- **Favoris** (gardés même hors ligne), **partage**, **notifications**.
- **Langue** : français ou anglais.
- **Thème** clair / sombre / auto.

## Structure

```
packages/
├── backend    Node + Express : agrégateur RSS (serveur optionnel)
├── mobile     Expo (Android + web) : la vraie app
├── desktop    Electron (Windows) : embarque la version web + le backend
└── shared     Types et moteur d'agrégation commun
```

## Lancer en local

```bash
# Backend (optionnel, embarqué dans Electron)
cd packages/backend && npm install && npm start

# Web / dev mobile
cd packages/mobile && npm install && npx expo start --web

# Windows
cd packages/desktop && npm install && npm run build && npm start
```

## Compiler l'APK Android

Avec les serveurs de compilation d'Expo, sans Android Studio :

```bash
cd packages/mobile
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

Le profil `preview` est déjà réglé pour produire un APK installable.

## Design

- **Police titres** : Titan One (Google Fonts)
- **Police texte** : Nunito
- **Fonds** : « mesh gradient » WebGL inspiré de ScrollShaders
- **Icônes** : vectorielles animées (Reanimated) — aucun emoji
- **Animation d'entrée** : logo qui rebondit avec éclats de lumière

## Sources d'actus

33 flux RSS, répartis en IA, Fintech, Startups, Crypto, Tech et Innovation —
10 en français, 6 spécialisées sur l'Afrique.
Liste complète : `packages/shared/src/sources.ts`.
