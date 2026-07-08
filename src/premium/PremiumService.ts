import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import { ContentPackId, ownedPacksForPremium } from '@/content/types';
import { ENTITLEMENT_IDS, hasPremiumFeatures, PRODUCT_IDS } from '@/premium/products';

const DEV_UNLOCK_KEY = '@premium/devUnlock';

/**
 * Load the native purchases SDK lazily. Types are imported with `import type`
 * (fully erased at build time), so the native module is never touched until we
 * actually call into it — which only happens on real store builds, never in
 * Expo Go. This keeps dev/Expo-Go from loading native code that isn't there.
 */
type PurchasesModule = typeof import('react-native-purchases').default;
type LogLevelEnum = typeof import('react-native-purchases').LOG_LEVEL;
let purchasesRef: PurchasesModule | null = null;
let logLevelRef: LogLevelEnum | null = null;
function loadPurchases(): PurchasesModule {
  if (!purchasesRef) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    purchasesRef = mod.default;
    logLevelRef = mod.LOG_LEVEL;
  }
  return purchasesRef!;
}

export interface PremiumState {
  initialized: boolean;
  loading: boolean;
  /** True when the "premium" entitlement is active (via subscription OR lifetime). */
  subscriptionActive: boolean;
  ownedPacks: ContentPackId[];
  /** Dev-only simulated premium for Expo Go testing. */
  devUnlock: boolean;
  /** True when running in Expo Go or Purchases failed to configure. */
  mockMode: boolean;
  /** Running in Expo Go (dev). Kept separate from mockMode so production builds
   *  on a platform without a store key can grant full access instead of gating. */
  isExpoGo: boolean;
  /** No store configured for this platform on a real build (e.g. Android while
   *  the paywall is iOS-only) — grant everything rather than show a dead paywall. */
  storeUnavailable: boolean;
  offering: PurchasesOffering | null;
}

export type PremiumListener = (state: PremiumState) => void;

function readEntitlements(info: CustomerInfo | null): boolean {
  const active = info?.entitlements.active ?? {};
  return Boolean(active[ENTITLEMENT_IDS.premium]?.isActive);
}

class PremiumService {
  private state: PremiumState = {
    initialized: false,
    loading: true,
    subscriptionActive: false,
    ownedPacks: ['core'],
    devUnlock: false,
    mockMode: false,
    isExpoGo: false,
    storeUnavailable: false,
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
    if (this.state.devUnlock) return true;
    // A real build with no store configured for this platform gets everything —
    // we can't sell to them yet, so we don't cripple them.
    if (this.state.storeUnavailable) return true;
    return hasPremiumFeatures(this.state.subscriptionActive);
  }

  hasPack(packId: ContentPackId): boolean {
    return packId === 'core' || this.hasPremiumAccess();
  }

  ownedContentPacks(): ContentPackId[] {
    return ownedPacksForPremium(this.hasPremiumAccess());
  }

  private emit(partial: Partial<PremiumState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener(this.state);
  }

  async initialize(userId?: string): Promise<void> {
    if (this.state.initialized) {
      if (userId) await this.identify(userId);
      return;
    }

    const devUnlock = (await AsyncStorage.getItem(DEV_UNLOCK_KEY)) === 'true';
    const isExpoGo = Constants.appOwnership === 'expo';

    const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
    const apiKey = Platform.OS === 'ios' ? iosKey : androidKey;

    // Expo Go: no native purchases. Default free; the dev toggle simulates premium.
    if (isExpoGo) {
      this.emit({
        initialized: true,
        loading: false,
        mockMode: true,
        isExpoGo: true,
        storeUnavailable: false,
        devUnlock,
        subscriptionActive: false,
      });
      return;
    }

    // Real build but no store key for this platform (iOS-only release on Android):
    // grant full access rather than show a paywall nobody can complete.
    if (!apiKey) {
      this.emit({
        initialized: true,
        loading: false,
        mockMode: true,
        isExpoGo: false,
        storeUnavailable: true,
        devUnlock,
        subscriptionActive: false,
      });
      return;
    }

    try {
      const Purchases = loadPurchases();
      if (logLevelRef) Purchases.setLogLevel(__DEV__ ? logLevelRef.DEBUG : logLevelRef.INFO);
      Purchases.configure({ apiKey, appUserID: userId });
      if (userId) await Purchases.logIn(userId);

      Purchases.addCustomerInfoUpdateListener((info) => {
        this.emit({ subscriptionActive: readEntitlements(info) });
      });

      const [info, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      this.emit({
        initialized: true,
        loading: false,
        mockMode: false,
        isExpoGo: false,
        storeUnavailable: false,
        devUnlock,
        offering: offerings.current,
        subscriptionActive: readEntitlements(info),
      });
    } catch {
      // Configuration failed — fail open to free tier (never block the game).
      this.emit({
        initialized: true,
        loading: false,
        mockMode: true,
        isExpoGo: false,
        storeUnavailable: false,
        devUnlock,
        subscriptionActive: false,
      });
    }
  }

  /** Attach the store customer to a logged-in account so premium follows them. */
  async identify(userId: string): Promise<void> {
    if (this.state.mockMode) return;
    try {
      const { customerInfo } = await loadPurchases().logIn(userId);
      this.emit({ subscriptionActive: readEntitlements(customerInfo) });
    } catch {
      // ignore — entitlements will refresh on next customer-info update
    }
  }

  async setDevUnlock(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(DEV_UNLOCK_KEY, enabled ? 'true' : 'false');
    this.emit({ devUnlock: enabled });
  }

  async restorePurchases(): Promise<void> {
    if (this.state.mockMode) {
      throw new Error('Purchases are only available in a TestFlight or App Store build.');
    }
    const info = await loadPurchases().restorePurchases();
    this.emit({ subscriptionActive: readEntitlements(info) });
  }

  /** Deep link the user to Apple's subscription management (to cancel). */
  async getManagementURL(): Promise<string | null> {
    if (this.state.mockMode) return null;
    try {
      const info = await loadPurchases().getCustomerInfo();
      return info.managementURL ?? null;
    } catch {
      return null;
    }
  }

  private findPackage(kind: 'monthly' | 'lifetime'): PurchasesPackage | null {
    const offering = this.state.offering;
    if (!offering) return null;
    if (kind === 'monthly') {
      return (
        offering.monthly ??
        offering.availablePackages.find(
          (p) => p.product.identifier === PRODUCT_IDS.monthlySubscription
        ) ??
        null
      );
    }
    return (
      offering.lifetime ??
      offering.availablePackages.find(
        (p) => p.product.identifier === PRODUCT_IDS.lifetime
      ) ??
      null
    );
  }

  private async purchase(kind: 'monthly' | 'lifetime'): Promise<void> {
    if (this.state.mockMode) {
      throw new Error('In-app purchases require a TestFlight or App Store build.');
    }
    const pkg = this.findPackage(kind);
    if (!pkg) {
      throw new Error('This option is not available yet. Check your RevenueCat offering.');
    }
    const { customerInfo } = await loadPurchases().purchasePackage(pkg);
    this.emit({ subscriptionActive: readEntitlements(customerInfo) });
  }

  async purchaseSubscription(): Promise<void> {
    return this.purchase('monthly');
  }

  async purchaseLifetime(): Promise<void> {
    return this.purchase('lifetime');
  }

  /** Localized store price (e.g. "$0.99") for display, or null if unavailable. */
  priceString(kind: 'monthly' | 'lifetime'): string | null {
    return this.findPackage(kind)?.product.priceString ?? null;
  }
}

export const premiumService = new PremiumService();
