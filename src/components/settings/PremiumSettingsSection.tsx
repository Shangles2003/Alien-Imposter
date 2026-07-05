import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionTitle,
} from '@/components/settings/SettingsList';
import { PREMIUM_COPY } from '@/premium/products';
import { usePremium } from '@/context/PremiumContext';
import { colors, spacing, typography } from '@/theme';

export function PremiumSettingsSection() {
  const {
    hasPremiumAccess,
    hasPack,
    subscriptionActive,
    mockMode,
    devUnlock,
    loading,
    purchaseSubscription,
    purchaseSpicyPack,
    restorePurchases,
    setDevUnlock,
  } = usePremium();
  const [busy, setBusy] = useState(false);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      Alert.alert('Success', `${label} completed.`);
    } catch (e) {
      Alert.alert('Purchase unavailable', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = hasPremiumAccess
    ? subscriptionActive
      ? 'Captain\'s Pass active'
      : devUnlock
        ? 'Dev unlock on'
        : 'Premium unlocked'
    : 'Free tier';

  const spicyStatus = hasPack('spicy') ? 'Owned' : 'Not owned';

  return (
    <>
      <SettingsSectionTitle>Premium</SettingsSectionTitle>
      <SettingsGroup delay={30}>
        <SettingsRow icon="⭐" label="Your tier" value={statusLabel} />
        <SettingsRow icon="🌶️" label={PREMIUM_COPY.spicyTitle} value={spicyStatus} />
        {!hasPremiumAccess && (
          <SettingsRow
            icon="🎫"
            label={PREMIUM_COPY.subscriptionTitle}
            value="Subscribe"
            showChevron
            onPress={() => run('Subscription', purchaseSubscription)}
          />
        )}
        {!hasPack('spicy') && (
          <SettingsRow
            icon="🔥"
            label="Buy Spicy Pack"
            value="One-time"
            showChevron
            onPress={() => run('Spicy Pack', purchaseSpicyPack)}
          />
        )}
        <SettingsRow
          icon="↩️"
          label="Restore Purchases"
          showChevron
          isLast={!__DEV__}
          onPress={() => run('Restore', restorePurchases)}
        />
        {__DEV__ && (
          <View style={styles.devRow}>
            <View style={styles.devCopy}>
              <Text style={styles.devLabel}>Dev: simulate premium</Text>
              <Text style={styles.devHint}>
                {mockMode ? 'Expo Go — toggles packs & host settings for testing.' : 'Development build'}
              </Text>
            </View>
            <Switch
              value={devUnlock}
              disabled={loading || busy}
              onValueChange={(v) => setDevUnlock(v).catch(() => {})}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>
        )}
      </SettingsGroup>
      <Text style={styles.footer}>
        Core Crew is always free — the full base game. Captain&apos;s Pass unlocks host settings and all packs.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  devCopy: { flex: 1 },
  devLabel: { ...typography.body, color: colors.text },
  devHint: { ...typography.small, color: colors.textDim, marginTop: 2 },
  footer: {
    ...typography.small,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
