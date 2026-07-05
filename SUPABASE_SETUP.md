# Supabase Setup — Alien Imposter

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a name, password, and region
3. Wait for the project to finish provisioning

## 2. Run the database SQL

1. Open **SQL Editor** → **New query**
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Click **Run**

This creates:

| Table | Purpose |
|-------|---------|
| `profiles` | Player display name + avatar color |
| `lobbies` | Lobby codes, roster (JSON), status |
| `games` | Full game state (JSONB) + realtime sync |
| `matchmaking` | Quick match queue |
| `matchmaking_locks` | Prevents duplicate matchmaking |

Also enables **Row Level Security** and adds tables to **Realtime**.

## 3. Configure Auth

1. **Authentication → Providers → Email** → enable Email
2. For development, turn **off** “Confirm email” under Email settings (so signup works instantly)
3. Optional: disable “Secure email change” while testing

## 4. Enable Realtime (verify)

1. **Database → Publications** → confirm `supabase_realtime` includes:
   - `lobbies`
   - `games`
   - `matchmaking`

If the SQL ran successfully, this is already done.

## 5. Get your API keys

1. **Project Settings → API**
2. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Never put the `service_role` key in the mobile app.

## 6. Link the Expo app

Create `.env` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Then restart Expo with a clean cache:

```bash
cd alien-imposter
npx expo start --clear
```

## 7. Test the flow

1. Sign up with email/password
2. Check **Table Editor → profiles** — a row should appear
3. Create a private lobby → check **lobbies** table
4. Join from a second account/device
5. Ready up → Launch Mission → check **games** table

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Signup works but no profile row | Re-run the `handle_new_user` trigger section of `schema.sql` |
| Lobby/game updates not live | Confirm Realtime publication + restart app |
| `permission denied` errors | Check you're logged in; RLS requires `authenticated` role |
| Updates silently fail | Postgres RLS needs both SELECT + UPDATE policies (already in schema) |

## Firebase cleanup

This project no longer uses Firebase. Remove old keys from `.env` if present:

```
EXPO_PUBLIC_FIREBASE_*  ← delete these
```
