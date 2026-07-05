# Alien Imposter

A mobile social-deduction party game built with **React Native**, **Expo Go**, and **Supabase** (auth + realtime multiplayer). Complete five missions, compare answers, and find the infiltrators before the final vote.

Inspired by hidden-role party games — original prompts, chambers, and branding throughout.

## Features

- Email/password accounts with crew profiles
- Private lobbies with shareable 6-character codes (tap to copy)
- Full game flow:
  - Tap-to-reveal classified role assignment (crew vs infiltrator)
  - **Opinion Bay** — agree/disagree scale
  - **Decision Deck** — scenario choices
  - **Sketch Bay** — draw prompts (infiltrators get different prompts)
  - **Fill-in-the-Blank Pod** — written answers
  - **Likely Locker** — who is most likely to…
  - **Bio Scanner** — glyph matching + hidden scan
  - **Mission Log** — review every answer from every task
  - **Neural Hacks** — infiltrators flip prompt alignment (shared pool)
  - **Final Extraction** — nominate suspects, unanimous vote to eject
- Player scaling (4–10): infiltrator count and hack pool adjust automatically
- Animated "deep space terminal" UI: nebula glows, parallax starfield, vector alien mascot

## Quick Start

### 1. Supabase project (free tier works)

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Authentication → Email** provider
3. Create the `lobbies` and `games` tables (see `supabase/` or `.env.example` notes)
4. Enable Realtime on both tables
5. Copy the project URL and anon key

### 2. Environment

```bash
cd alien-imposter
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Run with Expo Go

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi recommended).

### 4. Play test

1. Create 4+ accounts (or use multiple devices/emulators)
2. **Host a Party** and share the code, or join with a code
3. Everyone taps **Ready Up** → host taps **Launch Mission**

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | Expo SDK 54, Expo Router |
| Backend | Supabase Auth + Postgres realtime |
| State | Optimistic client actions, Supabase as source of truth |
| Animation | react-native-reanimated 4 |
| UI | Custom dark space design system (`src/theme`) |

## Project Structure

```
app/                 Expo Router screens
src/game/            Rules, prompts, state engine
src/services/        Auth, lobby, matchmaking, sync
src/components/      Design system + chamber views
src/theme/           Colors, typography, spacing tokens
```

## Game Rules Summary

| Players | Infiltrators | Hacks | Missions |
|---------|--------------|-------|----------|
| 4–5 | 1 | 2 | 5 |
| 6–10 | 2 | 4 | 5 |

- Infiltrators see each other; crew must deduce from test answers
- Hacks flip prompt alignment (shared pool, 2 per infiltrator)
- Wrong ejection or a non-unanimous vote → infiltrators win
- All infiltrators ejected → crew wins

## Notes

- Game state updates are client-driven; tighten Supabase RLS policies for production
- Bio Scanner scan results are shown only to the captain

## License

MIT — original game content; not affiliated with any existing party game franchise.
