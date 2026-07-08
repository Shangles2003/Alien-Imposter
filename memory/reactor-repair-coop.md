---
name: reactor-repair-coop
description: Design intent behind the mid-mission Reactor Repair co-op (identity check phase)
metadata:
  type: project
---

The mid-mission co-op ("Reactor Repair", `identity_coop` phase) is modeled on Push the Button + Keep Talking and Nobody Explodes. Two random alive crew are pulled in: an ENGINEER (`repair.engineerId`, sees decode rules) and an OPERATOR (`repair.operatorId`, sees the panel). It is **asymmetric on purpose** — neither screen alone can solve a module; the operator must describe what they see and the engineer decodes it.

**Core design goal:** the puzzle must be hard enough that a saboteur can *throw* it with plausible deniability (misreport a colour, "fail to find" the cipher column, fumble the offset math) while still being *detectably* failed by the table (strikes on shared Hull Integrity + a visible fail at debrief). This enables high-level deduction plays. Bias tuning HARD over easy.

**Assumes co-located voice play** (6+ players in one room, each on their own phone) — the "describe to your engineer" loop only works out loud, and the table overhearing the exchange is a feature, not a bug.

Three module types (`src/game/repairProtocol.ts`): `conduit` (wire-cut rules), `glyph_lock` (keypad column ordering with custom SVG glyphs in [[../src/components/game/AlienGlyph]]), `frequency` (legend + offset math). Operator input is **local component state**; only the decisive lock-in hits the engine/Supabase (avoids input lag + sync races). Wrong lock-in = strike + time penalty, broadcast via `repair.lastEvent` so all devices shake/flash in sync.

**Phase order:** repair FIRST, then vote. `identity_coop` (repair) → on success `identity_nominate` (secret vote who to scan) → `identity_scan` (dramatic 3s bioscan countdown for everyone, then captain-only reveal; non-captains get a "RESULT CLASSIFIED" explainer) → `identity_debrief`. Repair failure skips straight to debrief. `scanResult` is computed at nomination tally (the nominee's role), not during repair.

Tunables live in `src/game/identityCheck.ts` (`REPAIR_DURATION_MS`, `REPAIR_MAX_STRIKES`, `REPAIR_STRIKE_TIME_PENALTY_MS`). Trigger gate: round 3, 6+ alive, exactly 2 aliens.

UI is intentionally minimal (no instructional prose on operator panels — a friend explains the game); each repair screen shows a role/partner chip so players know their job and who to talk to.
