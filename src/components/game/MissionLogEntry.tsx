import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui';
import { formatChamberAnswer } from '@/components/game/chamberFormat';
import { DrawingPreview } from '@/components/game/DrawingPreview';
import { CHAMBER_LABELS, GameState, RoundHistoryEntry } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

export function MissionLogEntry({
  entry,
  game,
  compact = false,
}: {
  entry: RoundHistoryEntry;
  game: GameState;
  compact?: boolean;
}) {
  const isDrawing = entry.chamber === 'drawing_quarters';

  return (
    <View style={[styles.block, compact && styles.blockCompact]}>
      <View style={styles.blockHeader}>
        <Text style={styles.missionNum}>Mission {entry.round}</Text>
        <Text style={styles.chamberName}>{CHAMBER_LABELS[entry.chamber]}</Text>
      </View>
      <View style={[styles.grid, isDrawing && styles.gridDraw]}>
        {entry.responses.map((r) => (
          <View key={r.playerId} style={[styles.card, isDrawing && styles.cardDraw]}>
            <View style={styles.cardTop}>
              <Avatar name={r.displayName} color={game.players.find((p) => p.uid === r.playerId)?.avatarColor ?? colors.primary} size={compact ? 28 : 36} />
              <Text style={styles.playerName} numberOfLines={1}>
                {r.displayName}
              </Text>
            </View>
            {r.drawingPaths ? (
              <DrawingPreview paths={r.drawingPaths} height={compact ? 52 : 72} />
            ) : (
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{formatChamberAnswer(r, game)}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  blockCompact: { padding: spacing.sm, gap: spacing.xs },
  blockHeader: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  missionNum: { ...typography.caption, color: colors.accent, fontWeight: '800' },
  chamberName: { ...typography.caption, color: colors.textMuted, flex: 1 },
  grid: { gap: spacing.sm },
  gridDraw: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDraw: { width: '47%', flexGrow: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playerName: { ...typography.caption, color: colors.text, fontWeight: '700', flex: 1 },
  answerBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  answerText: { ...typography.body, color: colors.accentSoft, fontSize: 15, lineHeight: 22 },
});
