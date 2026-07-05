import { ContentPackId } from '@/content/types';

/** RevenueCat / App Store / Play Store product identifiers. */
export const PRODUCT_IDS = {
  /** Monthly subscription — unlocks host settings + all premium packs. */
  monthlySubscription: 'premium_monthly',
  /** One-time purchase for the Spicy question pack. */
  spicyPack: 'pack_spicy',
} as const;

/** RevenueCat entitlement identifiers configured in the dashboard. */
export const ENTITLEMENT_IDS = {
  premium: 'premium',
  spicyPack: 'pack_spicy',
} as const;

export const PREMIUM_COPY = {
  subscriptionTitle: 'Captain\'s Pass',
  subscriptionTagline: 'Monthly access to host settings and every question pack.',
  spicyTitle: 'Spicy Pack',
  spicyTagline: 'Juicy relationship prompts & absurd drawing missions — funny, not explicit.',
  spicyPriceHint: 'One-time purchase or included with Captain\'s Pass.',
} as const;

export function packFromEntitlements(
  subscriptionActive: boolean,
  ownedPackIds: string[]
): ContentPackId[] {
  const packs: ContentPackId[] = ['core'];
  if (subscriptionActive || ownedPackIds.includes(ENTITLEMENT_IDS.spicyPack)) {
    packs.push('spicy');
  }
  return packs;
}

export function hasPremiumFeatures(subscriptionActive: boolean): boolean {
  return subscriptionActive;
}

export function ownsSpicyPack(subscriptionActive: boolean, ownedPackIds: string[]): boolean {
  return subscriptionActive || ownedPackIds.includes(ENTITLEMENT_IDS.spicyPack);
}
