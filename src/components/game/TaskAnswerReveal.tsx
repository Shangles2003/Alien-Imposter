import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MissionLogEntry } from '@/components/game/MissionLogEntry';
import { CHAMBER_LABELS, GameState } from '@/types/game';
import { chamberAccents, colors, spacing, typography } from '@/theme';

/** Main-screen reveal right after a task — shows only the latest round. */
export function TaskAnswerReveal({ game }: { game: GameState }) {
  const entry = game.history[game.history.length - 1];
  if (!entry) return null;

  const accent = chamberAccents[entry.chamber] ?? colors.accentSoft;

  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.hero}>
        <Text style={styles.heroKicker}>ANSWERS IN</Text>
        <Text style={styles.heroTitle}>Compare the crew</Text>
        <Text style={[styles.heroSub, { color: accent }]}>
          Mission {entry.round} · {CHAMBER_LABELS[entry.chamber]}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.entryWrap}>
        <MissionLogEntry entry={entry} game={game} />
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
  entryWrap: { flex: 1, minHeight: 0 },
});
