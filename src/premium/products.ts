/**
 * Expansion Pass — the single paid unlock.
 *
 * One RevenueCat entitlement ("premium") is granted by EITHER an auto-renewing
 * monthly subscription OR a one-time lifetime purchase. Both unlock exactly the
 * same thing: 3/5/7-stage games and the full prompt library (which, because the
 * host's entitlement drives the lobby, extends to everyone the host plays with).
 */

/** RevenueCat / App Store product identifiers. Must match App Store Connect. */
export const PRODUCT_IDS = {
  /** Auto-renewable monthly subscription — $0.99/mo. (App Store Connect Product ID) */
  monthlySubscription: '2592092',
  /** Non-consumable one-time purchase — $9.99, permanent. (App Store Connect Product ID) */
  lifetime: '259209',
} as const;

/** RevenueCat entitlement identifier configured in the dashboard. */
export const ENTITLEMENT_IDS = {
  premium: 'premium',
} as const;

export const PREMIUM_COPY = {
  title: 'Expansion Pass',
  tagline: 'Every prompt, plus 3 / 5 / 7-stage games — for you and everyone you host.',
  monthlyTitle: 'Monthly',
  monthlyPriceHint: '$0.99 / month',
  lifetimeTitle: 'Lifetime',
  lifetimePriceHint: '$9.99 once',
  freeSummary: 'Free forever: the full base game, 5-stage rounds, and a rotating sample of prompts.',
} as const;

/** Whether the premium entitlement grants access to gated features. */
export function hasPremiumFeatures(premiumActive: boolean): boolean {
  return premiumActive;
}
