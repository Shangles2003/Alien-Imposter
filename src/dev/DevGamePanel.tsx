import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BotActionPlan } from '@/dev/botBrain';
import { GameState } from '@/types/game';
import { colors, spacing, typography } from '@/theme';

interface DevGamePanelProps {
  game: GameState;
  lastBotAction: BotActionPlan | null;
}

export function DevGamePanel({ game, lastBotAction }: DevGamePanelProps) {
  const roles = game.players
    .map((p) => `${p.displayName.split(' ').pop()?.slice(0, 4)}:${p.role === 'alien' ? 'A' : 'H'}`)
    .join(' ');

  return (
    <View style={styles.strip}>
      <Text style={styles.label}>SIM</Text>
      <Text style={styles.roles} numberOfLines={1}>{roles}</Text>
      {lastBotAction ? (
        <Text style={styles.action} numberOfLines={1}>{lastBotAction.kind}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.small, color: colors.warning, fontSize: 9, letterSpacing: 1 },
  roles: { ...typography.small, color: colors.textDim, flex: 1, fontSize: 9, fontFamily: 'monospace' },
  action: { ...typography.small, color: colors.accentSoft, fontSize: 9 },
});
