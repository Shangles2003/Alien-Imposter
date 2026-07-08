/** Tunables for the mid-game Identity Check mission (round 3, 6+ players, 2 aliens). */

export const IDENTITY_CHECK_ROUND = 3;

/** Total time on the meltdown clock for the whole repair run. */
export const REPAIR_DURATION_MS = 80_000;

/** Reactor systems the pair must stabilize (one of each module type). */
export const REPAIR_MODULE_COUNT = 3;

/** Wrong lock-ins allowed before the reactor breaches (run fails). */
export const REPAIR_MAX_STRIKES = 3;

/** Time burned off the clock for each strike — makes fumbling cost real. */
export const REPAIR_STRIKE_TIME_PENALTY_MS = 4_000;

export function shouldRunIdentityCheck(
  nextRound: number,
  aliveCount: number,
  alienCount: number
): boolean {
  return nextRound === IDENTITY_CHECK_ROUND && aliveCount >= 6 && alienCount === 2;
}
