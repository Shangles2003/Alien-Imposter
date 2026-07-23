import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionTitle,
} from '@/components/settings/SettingsList';
import { usePremium } from '@/context/PremiumContext';
import { colors, spacing, typography } from '@/theme';

export function PremiumSettingsSection() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    hasPremiumAccess,
    subscriptionActive,
    mockMode,
    devUnlock,
    grant,
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
      Alert.alert(t('premium.success'), t('premium.completed', { label }));
    } catch (e) {
      Alert.alert(
        t('premium.purchaseUnavailable'),
        e instanceof Error ? e.message : t('premium.somethingWrong')
      );
    } finally {
      setBusy(false);
    }
  };

  const manageSubscription = async () => {
    const url = await getManagementURL();
    if (url) {
      Linking.openURL(url).catch(() => {});
    } else {
      Alert.alert(t('premium.manageSubscription'), t('premium.manageSubBody'));
    }
  };

  const statusDetail = hasPremiumAccess
    ? subscriptionActive
      ? t('premium.detailMonthly')
      : grant
        ? t('premium.detailGranted')
        : devUnlock
          ? t('premium.detailDev')
          : t('premium.detailUnlocked')
    : t('premium.detailFree');

  return (
    <>
      <SettingsSectionTitle>{t('premium.title')}</SettingsSectionTitle>

      <View style={[styles.statusBanner, hasPremiumAccess ? styles.statusPremium : styles.statusFree]}>
        <Text style={[styles.statusText, { color: hasPremiumAccess ? colors.success : colors.textMuted }]}>
          {hasPremiumAccess ? t('premium.premiumBadge') : t('premium.freeBadge')}
        </Text>
        <Text style={styles.statusSub}>{statusDetail}</Text>
      </View>

      <SettingsGroup delay={30}>

        {!hasPremiumAccess && (
          <SettingsRow
            icon="✨"
            label={t('premium.unlockRow')}
            value={t('premium.upgrade')}
            showChevron
            onPress={() => router.push('/paywall' as Href)}
          />
        )}

        {subscriptionActive && (
          <SettingsRow
            icon="⚙️"
            label={t('premium.manageSubscription')}
            showChevron
            onPress={manageSubscription}
          />
        )}

        <SettingsRow
          icon="↩️"
          label={t('premium.restore')}
          showChevron
          isLast={!__DEV__}
          onPress={() => run(t('premium.restoreLabel'), restorePurchases)}
        />

        {__DEV__ && (
          <View style={styles.devRow}>
            <View style={styles.devCopy}>
              <Text style={styles.devLabel}>{t('premium.devSimulate')}</Text>
              <Text style={styles.devHint}>
                {mockMode ? t('premium.devExpoGo') : t('premium.devBuild')}
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
      <Text style={styles.footer}>{t('premium.footer')}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: 2,
  },
  statusPremium: {
    borderColor: 'rgba(52,211,153,0.5)',
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  statusFree: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusText: { ...typography.label, fontSize: 13 },
  statusSub: { ...typography.small, color: colors.textDim },
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
