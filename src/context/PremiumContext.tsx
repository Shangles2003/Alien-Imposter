import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ContentPackId } from '@/content/types';
import { useAuth } from '@/context/AuthContext';
import { premiumService, PremiumState } from '@/premium/PremiumService';

/**
 * Live entitlement state, backed by RevenueCat (see src/premium/).
 *
 * `hasPremiumAccess` is the single gate the rest of the app reads. It is true
 * when the user owns the Expansion (subscription or lifetime), has the dev
 * unlock on, or is on a build where the store isn't available (so we never
 * show a paywall nobody can complete). Entitlements are attached to the signed
 * in account, so premium restores on any device after login.
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
  /** Localized store prices for display; null until offerings load. */
  monthlyPrice: string | null;
  lifetimePrice: string | null;
  purchaseSubscription: () => Promise<void>;
  purchaseLifetime: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  getManagementURL: () => Promise<string | null>;
  setDevUnlock: (enabled: boolean) => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PremiumState>(() => premiumService.getState());

  useEffect(() => premiumService.subscribe(setState), []);

  useEffect(() => {
    premiumService.initialize(user?.id).catch(() => {});
  }, [user?.id]);

  const value = useMemo<PremiumContextValue>(
    () => ({
      initialized: state.initialized,
      loading: state.loading,
      subscriptionActive: state.subscriptionActive,
      ownedPacks: state.ownedPacks,
      devUnlock: state.devUnlock,
      mockMode: state.mockMode,
      hasPremiumAccess: premiumService.hasPremiumAccess(),
      hasPack: (packId) => premiumService.hasPack(packId),
      ownedContentPacks: premiumService.ownedContentPacks(),
      monthlyPrice: premiumService.priceString('monthly'),
      lifetimePrice: premiumService.priceString('lifetime'),
      purchaseSubscription: () => premiumService.purchaseSubscription(),
      purchaseLifetime: () => premiumService.purchaseLifetime(),
      restorePurchases: () => premiumService.restorePurchases(),
      getManagementURL: () => premiumService.getManagementURL(),
      setDevUnlock: (enabled) => premiumService.setDevUnlock(enabled),
    }),
    [state]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
