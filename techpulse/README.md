# ⚡ TechPulse

Actus en temps réel : IA, tech, fintech, startups de la Silicon Valley et d'Afrique, crypto, innovation.
Une seule interface React Native (Expo) → app Android (APK) + version web + app Windows (Electron).

## Structure

```
techpulse/
├── packages/backend   Serveur Node : lit les flux RSS toutes les 5 min, classe, résume, pousse en direct
├── packages/mobile    App Expo (React Native) : Android + web
├── packages/desktop   App Windows (Electron) : affiche l'app web + embarque le backend
└── packages/shared    Types communs (Article, catégories…)
```

## Fonctionnalités

- Fil d'actu en direct (nouvelles actus poussées automatiquement + badge « N nouvelles actus »)
- 7 catégories : IA, Fintech, Startups US, Startups Afrique, Crypto, Technologie, Innovation
- Recherche par mot-clé, filtres par catégorie
- Détail d'un article : résumé, tags, lien vers l'article complet, articles similaires, vidéos YouTube, Google News
- « L'essentiel » : les 5 infos du jour
- Favoris (gardés même hors ligne)
- Notifications (Android, Windows, navigateur)
- Partage (WhatsApp, etc.)
- Mode clair / sombre / automatique
- Choix des catégories et des sources suivies

## Lancer en développement

Prérequis : Node.js 20+.

1. Backend :
   ```bash
   cd packages/backend
   npm install
   npm start
   ```
   Il écoute sur http://localhost:4000 (test : http://localhost:4000/api/news).

2. App mobile sur ton téléphone :
   - Installe **Expo Go** depuis le Play Store.
   - Le PC et le téléphone doivent être sur le **même Wi-Fi**.
   ```bash
   cd packages/mobile
   npm install
   npx expo start
   ```
   Scanne le QR code avec Expo Go. L'app trouve le backend toute seule (même IP que le PC).
   Sinon, mets l'adresse dans Réglages → Serveur, par ex. `http://192.168.1.20:4000`.
   Si Windows demande d'autoriser Node.js dans le pare-feu, accepte pour les réseaux privés.

3. Version web : `npx expo start --web` dans `packages/mobile`.

4. App Windows :
   ```bash
   cd packages/desktop
   npm install
   npm run build     # compile l'interface web + le backend
   npm start         # ouvre l'app
   ```
   `npm run dist` crée l'installateur `.exe` dans `packages/desktop/dist`.

## Créer l'APK Android

Avec les serveurs de compilation d'Expo (gratuit, pas besoin d'Android Studio) :

```bash
cd packages/mobile
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

Le profil `preview` de `eas.json` est déjà réglé pour produire un `.apk` installable directement.
À la fin, Expo donne un lien pour télécharger l'APK.

⚠️ Pour que l'APK marche partout (4G, hors de chez toi), le backend doit être **hébergé en ligne**
(Render, Railway, Fly.io…) et son adresse saisie dans Réglages → Serveur.

## Ajouter une source

Ajoute une ligne dans `packages/backend/src/sources.ts` :

```ts
{ name: "Mon site", url: "https://monsite.com/feed/", defaultCategory: "fintech" },
```
