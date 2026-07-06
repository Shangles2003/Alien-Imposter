import React, { createContext, useContext, useMemo } from 'react';

import { ContentPackId } from '@/content/types';

/**
 * Everything is free right now — there is no paid tier.
 *
 * This context used to talk to RevenueCat (see src/premium/ for the dormant
 * plumbing). It now grants full access unconditionally, so host settings and
 * all content are available to every player. If a paid "After Dark" pack
 * ships later, swap this stub back to the PremiumService-backed provider.
 */
interface PremiumContextValue {
  initialized: boolean;
  loading: boolean;
  subscriptionActive: boolean;
  ownedPacks: ContentPackId[];
  devUnlock: boolean;
  mockMode: boolean;
  hasPremiumAccess: boolean;
  hasPack: (packId: ContentPackId) => boolean;
  ownedContentPacks: ContentPackId[];
  purchaseSubscription: () => Promise<void>;
  purchaseSpicyPack: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  setDevUnlock: (enabled: boolean) => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

const noop = async () => {};

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<PremiumContextValue>(
    () => ({
      initialized: true,
      loading: false,
      subscriptionActive: false,
      ownedPacks: ['core'],
      devUnlock: false,
      mockMode: false,
      hasPremiumAccess: true,
      hasPack: () => true,
      ownedContentPacks: ['core'],
      purchaseSubscription: noop,
      purchaseSpicyPack: noop,
      restorePurchases: noop,
      setDevUnlock: noop,
    }),
    []
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
