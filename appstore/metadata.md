# Alien Imposter — App Store Connect metadata

Copy-paste these into App Store Connect. Character limits are noted; everything below fits.

---

## App name (30 chars max)

```
Alien Imposter
```

## Subtitle (30 chars max)

```
Party game of hidden aliens
```

## Promotional Text (170 chars max — can be updated without review)

```
Round up 4–10 friends, share a party code, and find the aliens hiding in your crew. Same questions… almost. Spot the answers that don't add up. Free, no ads.
```

## Description (4000 chars max)

```
Someone in your crew isn't human.

Alien Imposter is a social deduction party game for 4–10 friends, each on their own iPhone. Everyone answers the same fun prompts — except the imposters, who secretly see slightly different ones. Their answers almost fit. Almost.

HOW IT WORKS
One player hosts a party and shares a 6-character code. Everyone joins, readies up, and gets a secret role: crew or infiltrator. Then the whole crew plays five missions together, comparing answers after each one. Talk it out, catch the contradictions, and when the missions end, vote on who to eject into space.

FIVE MISSION STATIONS
• Opinion Bay — take a stand on spicy takes like "pineapple belongs on pizza"
• Decision Deck — what would you do? Pick your move in awkward scenarios
• Sketch Bay — draw a prompt… but imposters are drawing something slightly different
• Fill-in-the-Blank Pod — complete the sentence and compare with the crew
• Likely Locker — vote who's most likely to survive a zombie apocalypse

FIND THE INFILTRATORS
Imposters see each other and share a pool of neural hacks that can flip an innocent player's prompts to make them look suspicious. The crew has the mission log — every answer from every round — to hunt for the lies.

THE FINAL VOTE
After the last mission, everyone secretly ballots for the players they suspect. The most-accused go on trial, and a majority vote sends them out the airlock. Eject every infiltrator and the crew wins. Eject one innocent crewmate and the aliens take the ship.

MADE FOR GAME NIGHT
• 4–10 players, everyone plays every round — no one sits out
• Games take about 15 minutes
• Choose 3, 5, or 7 missions per game
• Sign in with Apple — no email confirmation hoops
• Completely free. No ads. No tracking. No in-app purchases.

Gather your crew. Trust no one.
```

## Keywords (100 chars max, comma-separated, no spaces needed)

```
party,imposter,social deduction,among,friends,group,deception,trivia,drawing,couch,game night,vote
```

(98 characters. Don't repeat "alien" or "game" — the app name already counts toward search.)

## URLs

| Field | Value |
|---|---|
| Support URL | `https://torna.github.io/alien-imposter/support.html` |
| Marketing URL (optional) | `https://torna.github.io/alien-imposter/` |
| Privacy Policy URL | `https://torna.github.io/alien-imposter/privacy.html` |

⚠️ These assume you host the `website/` folder on GitHub Pages under your `torna` account
(repo `alien-imposter`, Settings → Pages → deploy from branch, folder `/website` — or copy
`website/` into a separate repo). If you host elsewhere (Netlify/Vercel), update these URLs
**and** the matching constants in `src/config/links.ts`, then rebuild.

## Copyright

```
© 2026 Joe Tornari
```

(Use your legal name or company name — this is displayed on the store listing.)

## Category

- Primary: **Games → Party**
- Secondary: **Games → Word** (or Trivia)

## Age rating questionnaire

Answer "None" to everything except:
- **Unrestricted web access:** No
- **Gambling:** No
- **User-generated content:** the game has free-text answers and drawings shared *only within
  private, code-gated lobbies*. Apple's questionnaire doesn't ask about this directly, but see
  "Review notes" below for how to frame it if asked.

Expected rating: **12+** (infrequent/mild mature themes from user prompts is a safe answer) or 9+.

## App Privacy ("nutrition label") answers

Data collected — **Yes**, the following, all linked to the user's identity, **not** used for tracking:

| Data type | Purpose | Linked to user | Tracking |
|---|---|---|---|
| Email address | App functionality (account) | Yes | No |
| Name (display name/callsign) | App functionality | Yes | No |
| User content (answers, drawings) | App functionality | Yes | No |

Everything else: **Not collected**. Answer **No** to "Do you or your third-party partners use data for tracking?"

## Review notes (paste into "Notes" for the reviewer)

```
Alien Imposter is a multiplayer party game played in private lobbies. All user content
(short text answers and finger drawings) is visible only to the 4–10 players who joined
a lobby with a shared invite code — there is no public content, feed, or discovery.
Inappropriate behavior can be reported via the in-app Support link, and accounts can be
deleted in Settings → Delete Account.

Because the game requires 4 players, reviewing the full game flow solo is impractical.
You can create an account with Sign in with Apple or email (no confirmation required)
and explore the lobby system with the demo account below.

Demo account: [CREATE A TEST ACCOUNT AND PUT ITS EMAIL/PASSWORD HERE]
```

⚠️ Create a real test account (email + password) before submitting and fill in the demo
credentials — App Review requires working credentials for login-gated apps.

---

# Pre-submission checklist (do these in order)

## 1. Supabase dashboard (5 minutes)

1. **Run the new SQL** — SQL Editor → paste and run (enables in-app account deletion):
   ```sql
   create or replace function public.delete_account()
   returns void
   language sql
   security definer
   set search_path = ''
   as $$
     delete from auth.users where id = auth.uid();
   $$;

   revoke execute on function public.delete_account() from public, anon;
   grant execute on function public.delete_account() to authenticated;
   ```
2. **Disable email confirmation** — Authentication → Sign In / Providers → Email →
   turn **off** "Confirm email". (This is what makes email signup instant.)
3. **Enable Apple provider** — Authentication → Sign In / Providers → Apple → enable.
   In "Client IDs" add: `com.tornari25.alienimposter`
   (For native iOS sign-in that's all you need — no service ID or secret key required.)

## 2. Host the website (5 minutes)

Push the repo to GitHub, then: repo → Settings → Pages → Source "Deploy from a branch" →
branch `main`, folder `/website`... GitHub Pages only offers `/ (root)` or `/docs`, so either
rename `website/` to `docs/`, or create a separate `alien-imposter-site` repo containing just
these four files. Verify the three URLs load, and update `src/config/links.ts` + the URL
table above if your final URLs differ.

## 3. Rebuild and submit

```bash
npm install                      # picks up expo-apple-authentication
eas build --platform ios --profile production
eas submit --platform ios
```

The build now includes: Sign in with Apple (capability auto-synced by EAS), account deletion,
legal links in Settings, app icon, splash, and crash-proof env handling.

## 4. App Store Connect

- Fill in all metadata from this file (name, subtitle, promo text, description, keywords,
  URLs, copyright, category, age rating, privacy answers, review notes + demo account).
- Upload screenshots (1284×2778 for the 6.7"/6.5" slot — drop your captures in a
  `screenshots/` folder and I'll batch-convert them).
- External TestFlight: TestFlight tab → create an external group → add the build →
  submit for Beta App Review (external testing gets a lighter version of app review,
  but it checks the same login/deletion/privacy boxes covered above).
```
