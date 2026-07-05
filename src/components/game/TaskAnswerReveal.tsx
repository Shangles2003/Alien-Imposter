import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MissionLogEntry } from '@/components/game/MissionLogEntry';
import { CHAMBER_LABELS, GameState } from '@/types/game';
import { colors, spacing, typography } from '@/theme';

/** Main-screen reveal right after a task — shows only the latest round. */
export function TaskAnswerReveal({ game }: { game: GameState }) {
  const entry = game.history[game.history.length - 1];
  if (!entry) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Everyone answered</Text>
        <Text style={styles.heroSub}>
          Mission {entry.round} · {CHAMBER_LABELS[entry.chamber]}
        </Text>
      </View>
      <MissionLogEntry entry={entry} game={game} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0, gap: spacing.sm },
  hero: { gap: 4 },
  heroTitle: { ...typography.heading, color: colors.text, fontSize: 20 },
  heroSub: { ...typography.caption, color: colors.accentSoft, fontWeight: '600' },
});
