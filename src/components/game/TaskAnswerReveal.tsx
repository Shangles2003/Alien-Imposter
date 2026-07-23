import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { MissionLogEntry } from '@/components/game/MissionLogEntry';
import { GameState } from '@/types/game';
import { chamberAccents, colors, spacing, typography } from '@/theme';

/** Main-screen reveal right after a task — shows only the latest round. */
export function TaskAnswerReveal({ game }: { game: GameState }) {
  const { t } = useTranslation();
  const entry = game.history[game.history.length - 1];
  if (!entry) return null;

  const accent = chamberAccents[entry.chamber] ?? colors.accentSoft;

  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.hero}>
        <Text style={styles.heroKicker}>{t('probe.answersIn')}</Text>
        <Text style={styles.heroTitle}>{t('probe.compareCrew')}</Text>
        <Text style={[styles.heroSub, { color: accent }]}>
          {t('log.missionNum', { round: entry.round })} · {t(`chambers.${entry.chamber}.label`)}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.scrollWrap}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <MissionLogEntry entry={entry} game={game} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0, gap: spacing.sm },
  hero: { gap: 2 },
  heroKicker: { ...typography.label, color: colors.textDim },
  heroTitle: { ...typography.heading, color: colors.text, fontSize: 20 },
  heroSub: { ...typography.caption, fontWeight: '700' },
  scrollWrap: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.sm },
});
