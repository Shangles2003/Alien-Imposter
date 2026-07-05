import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ContentPackId } from '@/content/types';
import { useAuth } from '@/context/AuthContext';
import { PremiumState, premiumService } from '@/premium/PremiumService';

interface PremiumContextValue extends PremiumState {
  hasPremiumAccess: boolean;
  hasPack: (packId: ContentPackId) => boolean;
  ownedContentPacks: ContentPackId[];
  purchaseSubscription: () => Promise<void>;
  purchaseSpicyPack: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  setDevUnlock: (enabled: boolean) => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PremiumState>(premiumService.getState());

  useEffect(() => premiumService.subscribe(setState), []);

  useEffect(() => {
    premiumService.initialize(user?.id);
  }, [user?.id]);

  const value = useMemo<PremiumContextValue>(
    () => ({
      ...state,
      hasPremiumAccess: premiumService.hasPremiumAccess(),
      hasPack: (packId) => premiumService.hasPack(packId),
      ownedContentPacks: premiumService.ownedContentPacks(),
      purchaseSubscription: () => premiumService.purchaseSubscription(),
      purchaseSpicyPack: () => premiumService.purchaseSpicyPack(),
      restorePurchases: () => premiumService.restorePurchases(),
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
