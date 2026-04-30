# Para Iris — Project Context

## What this is
A personal love site built by Markos for Iris Kemilly. Romantic, intimate, no strangers — just the two of them. The web version is already live and the mobile app is in progress on the `mobile-app` branch.

## Stack

### Web (`/` root)
- Pure HTML/CSS/JS, no framework, no build step
- `index.html` — main page (Periodic Table of Love, date ideas, letter cards)
- `letters.html` — dedicated letters page (physical letters + Firebase letter exchange)
- Hosted as static files (GitHub Pages or similar)
- Run locally: `python3 -m http.server 8080` from project root

### Mobile (`/mobile`)
- Expo (SDK 54) + React Native, managed workflow
- Three tab screens: HomeScreen (periodic table), ProgramasScreen (date ideas), CartinhasScreen (letters)
- Run: `cd mobile && npx expo start`
- Branch: `mobile-app` (not yet merged to `main`)

### Backend
- Firebase Realtime Database (same project for both web and mobile)
- Project: `iris-a9ccc`
- DB URL: `https://iris-a9ccc-default-rtdb.firebaseio.com`
- Two nodes in use: `date-ideas/` and `letters/`
- No auth — security through obscurity (private repo, no public link)

## Design system
Dark, minimalist, romantic. Never break these:
- Fonts: Cormorant Garamond (serif headings, italic body) + DM Mono (UI labels, monospace)
- Background: `#0e0c0a`, Surface: `#161410`
- Gold `#c9a84c` — Markos, precious things
- Rose `#c46b8a` — Iris, love, letters
- Teal `#4a9e8a` — actions, date ideas
- Language: Portuguese (pt-BR)
- No emojis in UI except the `✉` envelope and `✓` check

## Branch strategy
- `main` — production (web is live here)
- `mobile-app` — mobile app in progress, merge to main when ready

## Adding a new physical letter
1. Drop the JPG into `iris-fotos` repo (public GitHub repo, just images)
2. Push to main
3. In Firebase Console → Realtime Database → `physical-letters` node → Add child:
```json
{
  "title": "Cartinha — DD de mês, YYYY",
  "sub": "de Markos, com carinho",
  "color": "gold",
  "url": "https://raw.githubusercontent.com/MarkosComK/iris-fotos/main/filename.jpg",
  "createdAt": 1234567890000
}
```
Use `color: "gold"` for Markos, `color: "rose"` for Iris. `createdAt` is a Unix timestamp in ms — get it from `Date.now()` in browser console.

## Files to never touch
- `iris-a9ccc-firebase-adminsdk-fbsvc-d5a8b2bcca.json` (gitignored, Firebase admin SDK key)

---

## Session carry-over prompt
At the start of each session, after reading this file, check if there are recent git commits or file changes that add context beyond what's written here. If the last session left something in progress, surface it. Update this file with anything material that changed — new features shipped, new branches, decisions made — so the next session starts fully informed.
