# Alien Imposter

A mobile social-deduction game built with **React Native**, **Expo Go**, and **Firebase** (auth + realtime multiplayer). Find the infiltrators before time runs out.

Inspired by hidden-role party games — original prompts, chambers, and branding throughout.

## Features

- Email/password accounts with crew profiles
- Private lobbies (6-character codes) and public lobbies
- Quick match queue (auto-forms a lobby at 4+ players)
- Full game flow:
  - Role assignment (crew vs infiltrator)
  - Rotating captain picks tests each round
  - **Opinion Bay** — agree/disagree scale
  - **Decision Deck** — scenario choices (infiltrators choose blind)
  - **Sketch Bay** — draw prompts (infiltrators get different prompts)
  - **Text Pod** — written answers
  - **Likely Locker** — who is most likely to… (bonus chamber)
  - **Bio Scanner** — glyph matching + hidden scan (unlocks round 2+, 5 min cooldown)
  - **Probe Log** — review past tests + infiltrator hacks
  - **Emergency Eject** — once per player, unanimous vote required
- Player scaling (4–10): alien count, hacks, test size, timer match party-game rules

## Quick Start

### 1. Firebase project (free tier works)

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Create a **Firestore** database
4. Paste rules from `firestore.rules` into Firestore Rules
5. Register a **Web app** and copy config values

### 2. Environment

```bash
cd alien-imposter
cp .env.example .env
# Fill in your Firebase keys
```

### 3. Run with Expo Go

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi recommended).

### 4. Play test

1. Create 4+ accounts (or use multiple devices/emulators)
2. **Quick Match** or create a **Private Lobby** and share the code
3. Everyone taps **Ready Up** → host taps **Launch Mission**

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | Expo SDK 57, Expo Router |
| Backend | Firebase Auth + Firestore realtime |
| State | Zustand-ready services, Firestore as source of truth |
| UI | Custom v0-inspired dark space theme |

Firebase replaces a Supabase-style stack: auth, Postgres-like documents, and live subscriptions without managing servers.

## Project Structure

```
app/                 Expo Router screens
src/game/            Rules, prompts, state engine
src/services/        Auth, lobby, matchmaking, sync
src/components/      UI + chamber views
```

## Game Rules Summary

| Players | Infiltrators | Hacks | Max testees | Timer |
|---------|--------------|-------|-------------|-------|
| 4 | 1 | 2 | 2 | 12 min |
| 5–6 | 2 | 4 | 2–3 | 15 min |
| 7 | 2 | 4 | 3 | 18 min |
| 8–10 | 3 | 6 | 3–4 | 18–20 min |

- Infiltrators see each other; crew must deduce from test answers
- Hacks flip prompt alignment (2 hacks per infiltrator)
- Wrong ejection → infiltrators win instantly
- Timer expiry → infiltrators win
- All infiltrators ejected → crew wins

## Notes

- Game state updates are client-driven; tighten Firestore rules for production
- Bio Scanner scan results are shown only to the captain
- Enable Firestore indexes if prompted when querying lobbies by `code`

## License

MIT — original game content; not affiliated with any existing party game franchise.
