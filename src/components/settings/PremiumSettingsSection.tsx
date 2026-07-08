import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionTitle,
} from '@/components/settings/SettingsList';
import { PREMIUM_COPY } from '@/premium/products';
import { usePremium } from '@/context/PremiumContext';
import { colors, spacing, typography } from '@/theme';

export function PremiumSettingsSection() {
  const router = useRouter();
  const {
    hasPremiumAccess,
    subscriptionActive,
    mockMode,
    devUnlock,
    loading,
    restorePurchases,
    getManagementURL,
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

  const manageSubscription = async () => {
    const url = await getManagementURL();
    if (url) {
      Linking.openURL(url).catch(() => {});
    } else {
      Alert.alert(
        'Manage subscription',
        'Open the Settings app → your Apple ID → Subscriptions to change or cancel.'
      );
    }
  };

  const statusLabel = hasPremiumAccess
    ? subscriptionActive
      ? 'Expansion active'
      : devUnlock
        ? 'Dev unlock on'
        : 'Unlocked'
    : 'Free tier';

  return (
    <>
      <SettingsSectionTitle>{PREMIUM_COPY.title}</SettingsSectionTitle>
      <SettingsGroup delay={30}>
        <SettingsRow icon="⭐" label="Your tier" value={statusLabel} />

        {!hasPremiumAccess && (
          <SettingsRow
            icon="✨"
            label={`Unlock ${PREMIUM_COPY.title}`}
            value="Upgrade"
            showChevron
            onPress={() => router.push('/paywall' as Href)}
          />
        )}

        {subscriptionActive && (
          <SettingsRow
            icon="⚙️"
            label="Manage subscription"
            showChevron
            onPress={manageSubscription}
          />
        )}

        <SettingsRow
          icon="↩️"
          label="Restore purchases"
          showChevron
          isLast={!__DEV__}
          onPress={() => run('Restore', restorePurchases)}
        />

        {__DEV__ && (
          <View style={styles.devRow}>
            <View style={styles.devCopy}>
              <Text style={styles.devLabel}>Dev: simulate premium</Text>
              <Text style={styles.devHint}>
                {mockMode ? 'Expo Go — toggles the Expansion for testing.' : 'Development build'}
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
        {PREMIUM_COPY.freeSummary} {PREMIUM_COPY.tagline} Only the host needs the Expansion — it
        covers everyone in their game. Subscriptions renew monthly until canceled in your Apple
        account settings; the one-time unlock is permanent.
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
    lineHeight: 17,
  },
});
