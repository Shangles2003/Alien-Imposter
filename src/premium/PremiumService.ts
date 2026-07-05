import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import { ContentPackId } from '@/content/types';
import {
  ENTITLEMENT_IDS,
  packFromEntitlements,
  PRODUCT_IDS,
  hasPremiumFeatures,
} from '@/premium/products';

const DEV_UNLOCK_KEY = '@premium/devUnlock';

export interface PremiumState {
  initialized: boolean;
  loading: boolean;
  subscriptionActive: boolean;
  ownedPacks: ContentPackId[];
  /** Dev-only simulated premium for Expo Go testing. */
  devUnlock: boolean;
  /** True when running in Expo Go or Purchases failed to configure. */
  mockMode: boolean;
  offering: PurchasesOffering | null;
}

export type PremiumListener = (state: PremiumState) => void;

function readEntitlements(info: CustomerInfo | null): Pick<PremiumState, 'subscriptionActive' | 'ownedPacks'> {
  const active = info?.entitlements.active ?? {};
  const subscriptionActive = Boolean(active[ENTITLEMENT_IDS.premium]?.isActive);
  const ownedIds = Object.keys(active);
  return {
    subscriptionActive,
    ownedPacks: packFromEntitlements(subscriptionActive, ownedIds),
  };
}

class PremiumService {
  private state: PremiumState = {
    initialized: false,
    loading: true,
    subscriptionActive: false,
    ownedPacks: ['core'],
    devUnlock: false,
    mockMode: false,
    offering: null,
  };

  private listeners = new Set<PremiumListener>();

  subscribe(listener: PremiumListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): PremiumState {
    return this.state;
  }

  hasPremiumAccess(): boolean {
    return this.state.devUnlock || hasPremiumFeatures(this.state.subscriptionActive);
  }

  hasPack(packId: ContentPackId): boolean {
    if (packId === 'core') return true;
    if (this.state.devUnlock) return true;
    return this.state.ownedPacks.includes(packId);
  }

  ownedContentPacks(): ContentPackId[] {
    if (this.state.devUnlock) return ['core', 'spicy'];
    return this.state.ownedPacks;
  }

  private emit(partial: Partial<PremiumState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener(this.state);
  }

  async initialize(userId?: string): Promise<void> {
    if (this.state.initialized) return;

    const devUnlock = (await AsyncStorage.getItem(DEV_UNLOCK_KEY)) === 'true';
    const isExpoGo = Constants.appOwnership === 'expo';

    const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
    const apiKey = Platform.OS === 'ios' ? iosKey : androidKey;

    if (isExpoGo || !apiKey) {
      this.emit({
        initialized: true,
        loading: false,
        mockMode: true,
        devUnlock,
        ownedPacks: devUnlock ? (['core', 'spicy'] as ContentPackId[]) : ['core'],
        subscriptionActive: devUnlock,
      });
      return;
    }

    try {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      Purchases.configure({ apiKey, appUserID: userId });
      if (userId) await Purchases.logIn(userId);

      Purchases.addCustomerInfoUpdateListener((info) => {
        const ent = readEntitlements(info);
        this.emit({
          ...ent,
          ownedPacks: this.state.devUnlock ? (['core', 'spicy'] as ContentPackId[]) : ent.ownedPacks,
        });
      });

      const [info, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      const ent = readEntitlements(info);
      this.emit({
        initialized: true,
        loading: false,
        mockMode: false,
        devUnlock,
        offering: offerings.current,
        subscriptionActive: devUnlock || ent.subscriptionActive,
        ownedPacks: devUnlock ? (['core', 'spicy'] as ContentPackId[]) : ent.ownedPacks,
      });
    } catch {
      this.emit({
        initialized: true,
        loading: false,
        mockMode: true,
        devUnlock,
        ownedPacks: devUnlock ? (['core', 'spicy'] as ContentPackId[]) : ['core'],
        subscriptionActive: devUnlock,
      });
    }
  }

  async setDevUnlock(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(DEV_UNLOCK_KEY, enabled ? 'true' : 'false');
    this.emit({
      devUnlock: enabled,
      subscriptionActive: enabled || this.state.subscriptionActive,
      ownedPacks: enabled ? (['core', 'spicy'] as ContentPackId[]) : ['core'],
    });
  }

  async restorePurchases(): Promise<void> {
    if (this.state.mockMode) {
      throw new Error('Purchases are not available in Expo Go. Use dev unlock or a development build.');
    }
    const info = await Purchases.restorePurchases();
    this.emit(readEntitlements(info));
  }

  private findPackage(kind: 'monthly' | 'spicy'): PurchasesPackage | null {
    const offering = this.state.offering;
    if (!offering) return null;
    if (kind === 'monthly') {
      return (
        offering.monthly ??
        offering.availablePackages.find((p) => p.identifier === PRODUCT_IDS.monthlySubscription) ??
        offering.availablePackages[0] ??
        null
      );
    }
    return (
      offering.availablePackages.find(
        (p) =>
          p.identifier === PRODUCT_IDS.spicyPack ||
          p.product.identifier === PRODUCT_IDS.spicyPack
      ) ?? null
    );
  }

  async purchaseSubscription(): Promise<void> {
    if (this.state.mockMode) {
      throw new Error('In-app purchases require a development build with store products configured.');
    }
    const pkg = this.findPackage('monthly');
    if (!pkg) throw new Error('Subscription is not available yet. Check RevenueCat offerings.');
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    this.emit(readEntitlements(customerInfo));
  }

  async purchaseSpicyPack(): Promise<void> {
    if (this.state.mockMode) {
      throw new Error('In-app purchases require a development build with store products configured.');
    }
    const pkg = this.findPackage('spicy');
    if (!pkg) throw new Error('Spicy Pack is not available yet. Check RevenueCat offerings.');
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    this.emit(readEntitlements(customerInfo));
  }
}

export const premiumService = new PremiumService();
