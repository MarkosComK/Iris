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

## Deploying a new version to her Android

```bash
cd mobile

# Build APK (runs on EAS cloud, ~10-15 min, free up to 30/month)
eas build --platform android --profile preview

# When done, EAS gives a download link — send her that via WhatsApp/etc.
# She installs it over the old one, data is preserved (Firebase is remote)
```

**For small changes (UI tweaks, no new native libs):**
```bash
eas update --branch preview --message "o que mudou"
# She gets it automatically next time she opens the app, no reinstall needed
```

**After she installs a new build**, check Firebase Console → Realtime Database → `tokens/`
Her push token should appear within seconds of opening the app.

**Pending before next build:**
- Test push notifications (tokens/ node should populate after she opens new APK)
- Customize notification popup UI (icon, color, sound) — test with cheap Android via USB + `adb logcat | grep notifications` for real-time logs

## Adding a new physical letter
Drop the JPG into `mobile/assets/` and add an entry to the `PHYSICAL` array in `mobile/src/screens/CartinhasScreen.js`. Also add the card to the `letters-grid` in `letters.html`. Then do a new `eas build` so she gets the updated APK.

## Files to never touch
- `iris-a9ccc-firebase-adminsdk-fbsvc-d5a8b2bcca.json` (gitignored, Firebase admin SDK key)

---

## Session carry-over prompt
At the start of each session, after reading this file, check if there are recent git commits or file changes that add context beyond what's written here. If the last session left something in progress, surface it. Update this file with anything material that changed — new features shipped, new branches, decisions made — so the next session starts fully informed.
