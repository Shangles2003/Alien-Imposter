import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

const CARD_KEYS = ['gather', 'roles', 'missions', 'spot', 'trial', 'win'] as const;
const CARD_ICONS: Record<(typeof CARD_KEYS)[number], string> = {
  gather: '🛸',
  roles: '🕵️',
  missions: '🎯',
  spot: '🔍',
  trial: '⚖️',
  win: '🏆',
};

export function HowToPlay() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const last = index >= CARD_KEYS.length - 1;

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(CARD_KEYS.length - 1, i));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  };

  const onNext = () => {
    if (last) router.back();
    else goTo(index + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{t('howToPlay.kicker')}</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>{t('common.skip')}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        style={styles.pager}
      >
        {CARD_KEYS.map((key, i) => (
          <View key={key} style={[styles.page, { width }]}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
              <LinearGradient colors={[...gradients.hero]} style={styles.iconWrap}>
                <Text style={styles.icon}>{CARD_ICONS[key]}</Text>
              </LinearGradient>
              <Text style={styles.stepLabel}>
                {t('howToPlay.step', { n: i + 1, total: CARD_KEYS.length })}
              </Text>
              <Text style={styles.title}>{t(`howToPlay.cards.${key}.title`)}</Text>
              <Text style={styles.body}>{t(`howToPlay.cards.${key}.body`)}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {CARD_KEYS.map((key, i) => (
            <Pressable key={key} onPress={() => goTo(i)} hitSlop={8}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Button
          title={last ? t('howToPlay.letsPlay') : t('common.next')}
          fullWidth
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    minHeight: 44,
  },
  kicker: { ...typography.label, color: colors.accentSoft },
  close: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  closeText: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: { alignItems: 'center', gap: spacing.md, maxWidth: 420 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  icon: { fontSize: 60 },
  stepLabel: { ...typography.label, color: colors.textDim, marginTop: spacing.sm },
  title: { ...typography.hero, color: colors.text, textAlign: 'center', fontSize: 28 },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: { width: 22, backgroundColor: colors.accent },
});
