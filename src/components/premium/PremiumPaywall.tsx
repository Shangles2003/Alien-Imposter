import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Badge, Button, PressableScale } from '@/components/ui';
import { usePremium } from '@/context/PremiumContext';
import { PREMIUM_COPY } from '@/premium/products';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

const FEATURES: { icon: string; title: string; body: string }[] = [
  { icon: '🗂️', title: 'Every prompt', body: 'The full question library instead of a small repeating sample.' },
  { icon: '🔪', title: 'Betrayal Pack', body: 'A whole expansion of juicy, funny friend-group prompts.' },
  { icon: '🎚️', title: '3, 5 & 7-stage games', body: 'Pick the mission length — quick rounds or long, evidence-rich games.' },
  { icon: '🛸', title: 'Covers your whole crew', body: 'Only the host needs it — everyone in your lobby plays the expanded game.' },
];

export function PremiumPaywall({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const {
    hasPremiumAccess,
    subscriptionActive,
    monthlyPrice,
    lifetimePrice,
    purchaseSubscription,
    purchaseLifetime,
    restorePurchases,
  } = usePremium();
  const [busy, setBusy] = useState<null | 'monthly' | 'lifetime' | 'restore'>(null);

  const monthly = monthlyPrice ?? PREMIUM_COPY.monthlyPriceHint;
  const lifetime = lifetimePrice ?? PREMIUM_COPY.lifetimePriceHint;

  const run = async (kind: 'monthly' | 'lifetime' | 'restore', fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
      if (kind === 'restore') Alert.alert('Restored', 'Your purchases have been restored.');
    } catch (e) {
      Alert.alert('Purchase unavailable', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.fill}>
      <Pressable style={styles.close} onPress={onClose} hitSlop={12} accessibilityLabel="Close">
        <Text style={styles.closeIcon}>✕</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <LinearGradient colors={[...gradients.hero]} style={styles.crest}>
            <Text style={styles.crestIcon}>⭐</Text>
          </LinearGradient>
          <Text style={styles.title}>{PREMIUM_COPY.title}</Text>
          <Text style={styles.tagline}>{PREMIUM_COPY.tagline}</Text>
        </Animated.View>

        {hasPremiumAccess ? (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.activeCard}>
            <Text style={styles.activeIcon}>✓</Text>
            <Text style={styles.activeTitle}>
              {subscriptionActive ? 'Expansion Pass active' : 'Unlocked'}
            </Text>
            <Text style={styles.activeBody}>
              Your whole crew is covered when you host. Thanks for supporting the game!
            </Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.features}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.title}
                  entering={FadeInUp.delay(80 * i).duration(360)}
                  style={styles.featureRow}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureBody}>{f.body}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Lifetime — highlighted as best value */}
            <PressableScale
              scaleTo={0.98}
              disabled={busy !== null}
              onPress={() => run('lifetime', purchaseLifetime)}
              style={styles.planWrap}
            >
              <LinearGradient colors={[...gradients.primary]} style={[styles.plan, styles.planPrimary]}>
                <View style={styles.planTop}>
                  <Text style={styles.planName}>{PREMIUM_COPY.lifetimeTitle}</Text>
                  <Badge label="BEST VALUE" color={colors.lime} variant="solid" />
                </View>
                <Text style={styles.planPrice}>{lifetime}</Text>
                <Text style={styles.planSub}>One-time — yours forever, nothing to cancel.</Text>
                <View style={styles.planCta}>
                  <Text style={styles.planCtaText}>
                    {busy === 'lifetime' ? 'Processing…' : 'Unlock forever'}
                  </Text>
                </View>
              </LinearGradient>
            </PressableScale>

            {/* Monthly */}
            <PressableScale
              scaleTo={0.98}
              disabled={busy !== null}
              onPress={() => run('monthly', purchaseSubscription)}
              style={styles.planWrap}
            >
              <View style={[styles.plan, styles.planSecondary]}>
                <Text style={styles.planName}>{PREMIUM_COPY.monthlyTitle}</Text>
                <Text style={[styles.planPrice, styles.planPriceAlt]}>{monthly}</Text>
                <Text style={styles.planSub}>Auto-renews monthly — cancel anytime in Settings.</Text>
                <View style={[styles.planCta, styles.planCtaAlt]}>
                  <Text style={[styles.planCtaText, styles.planCtaTextAlt]}>
                    {busy === 'monthly' ? 'Processing…' : 'Subscribe'}
                  </Text>
                </View>
              </View>
            </PressableScale>

            <Button
              title={busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
              variant="ghost"
              size="sm"
              disabled={busy !== null}
              onPress={() => run('restore', restorePurchases)}
            />
          </>
        )}

        <Text style={styles.legal}>
          {PREMIUM_COPY.freeSummary}
          {'\n\n'}
          Payment is charged to your Apple ID at purchase. The monthly plan automatically renews at
          {` ${monthly}`} unless canceled at least 24 hours before the period ends; manage or cancel
          anytime in your Apple account settings. The lifetime option is a one-time, non-subscription
          purchase.{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
            Terms
          </Text>{' '}
          ·{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
            Privacy Policy
          </Text>
        </Text>
      </ScrollView>

      {hasPremiumAccess ? (
        <Button title="Done" fullWidth onPress={onClose} style={styles.doneBtn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  close: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  closeIcon: { color: colors.textMuted, fontSize: 16, fontWeight: '800' },
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  crest: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  crestIcon: { fontSize: 34 },
  title: { ...typography.hero, color: colors.text, textAlign: 'center' },
  tagline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  features: { gap: spacing.sm, marginVertical: spacing.xs },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: { fontSize: 24 },
  featureCopy: { flex: 1 },
  featureTitle: { ...typography.heading, color: colors.text, fontSize: 16 },
  featureBody: { ...typography.small, color: colors.textMuted, marginTop: 2, letterSpacing: 0 },
  planWrap: { borderRadius: radius.xl, overflow: 'hidden' },
  plan: { padding: spacing.lg, borderRadius: radius.xl, gap: spacing.xs },
  planPrimary: { ...shadows.glow },
  planSecondary: { backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.borderBright },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { ...typography.label, color: '#fff', fontSize: 12 },
  planPrice: { ...typography.hero, color: '#fff', fontSize: 30 },
  planPriceAlt: { color: colors.text },
  planSub: { ...typography.small, color: 'rgba(255,255,255,0.85)', letterSpacing: 0 },
  planCta: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  planCtaAlt: { backgroundColor: colors.glowCyan },
  planCtaText: { ...typography.body, color: '#fff', fontWeight: '800' },
  planCtaTextAlt: { color: colors.accentSoft },
  activeCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: '#04211a',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.5)',
    ...shadows.glowCyan,
  },
  activeIcon: { fontSize: 34, color: colors.success, fontWeight: '900' },
  activeTitle: { ...typography.title, color: colors.text },
  activeBody: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  legal: {
    ...typography.small,
    color: colors.textDim,
    lineHeight: 16,
    letterSpacing: 0,
    marginTop: spacing.sm,
  },
  link: { color: colors.accentSoft, textDecorationLine: 'underline' },
  doneBtn: { marginTop: spacing.sm },
});
