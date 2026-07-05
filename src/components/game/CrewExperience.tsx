import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { CrewSyncBar, PhaseSyncGate } from '@/components/game/CrewSyncBar';
import { getTaskProgress } from '@/game/engine';
import {
  CHAMBER_DESCRIPTIONS,
  CHAMBER_LABELS,
  CHAMBER_TAGLINES,
  GamePlayer,
  GameState,
} from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

export { PhaseSyncGate } from '@/components/game/CrewSyncBar';

export function CrewDots({
  game,
  mode = 'sync',
}: {
  game: GameState;
  mode?: 'sync' | 'task';
}) {
  return <CrewSyncBar game={game} mode={mode} />;
}

export function ChamberBoarding({
  game,
  me,
  onBoard,
  boardingPending = false,
}: {
  game: GameState;
  me: GamePlayer;
  onBoard: () => void;
  boardingPending?: boolean;
}) {
  const chamber = game.selectedChamber!;
  const boarded = Boolean(game.phaseReady[me.uid]);

  return (
    <View style={styles.fill}>
      <View style={styles.boardingHero}>
        <Text style={styles.chamberName}>{CHAMBER_LABELS[chamber]}</Text>
        <Text style={styles.chamberAction}>{CHAMBER_TAGLINES[chamber]}</Text>
        <Text style={styles.chamberDesc}>{CHAMBER_DESCRIPTIONS[chamber]}</Text>
        <Text style={styles.boardingNote}>Whole crew enters together</Text>
      </View>
      <View style={styles.footer}>
        <CrewSyncBar game={game} mode="sync" />
        {boarded ? (
          <Text style={styles.waitingCopy}>Waiting for crew...</Text>
        ) : (
          <Button title="Enter chamber" fullWidth loading={boardingPending} onPress={onBoard} />
        )}
      </View>
    </View>
  );
}

export function ActiveTaskFrame({
  game,
  prompt,
  footer,
  children,
  layout = 'default',
}: {
  game: GameState;
  prompt: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  layout?: 'default' | 'canvas';
}) {
  const chamber = game.selectedChamber!;
  const isCanvas = layout === 'canvas';

  return (
    <View style={styles.fill}>
      <View style={[styles.promptHero, isCanvas && styles.promptHeroCompact]}>
        <Text style={styles.chamberName}>{CHAMBER_LABELS[chamber]}</Text>
        <Text style={styles.chamberAction}>{CHAMBER_TAGLINES[chamber]}</Text>
        <Text style={[styles.promptText, isCanvas && styles.promptTextCompact]}>{prompt}</Text>
      </View>

      <CrewDots game={game} mode="task" />

      <View style={[styles.actionZone, isCanvas && styles.actionZoneCanvas]}>{children}</View>

      {footer ? <View style={styles.taskFooter}>{footer}</View> : null}
    </View>
  );
}

export function WaitingForCrew({ game }: { game: GameState }) {
  const progress = getTaskProgress(game);
  return (
    <View style={styles.fillCenter}>
      <Text style={styles.waitingTitle}>Answer locked</Text>
      <Text style={styles.waitingCopy}>
        {progress.total - progress.done} crew still responding
      </Text>
      <CrewDots game={game} mode="task" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  footer: { gap: spacing.sm, paddingTop: spacing.sm },
  waitingCopy: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  boardingHero: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chamberName: { ...typography.heading, color: colors.accentSoft, textAlign: 'center' },
  chamberAction: { ...typography.caption, color: colors.text, fontWeight: '700', textAlign: 'center' },
  chamberDesc: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  boardingNote: { ...typography.small, color: colors.accent, marginTop: spacing.sm },
  promptHero: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.accent,
    padding: spacing.md,
    gap: 4,
  },
  promptHeroCompact: { padding: spacing.sm, gap: 2 },
  promptText: {
    ...typography.body,
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  promptTextCompact: { fontSize: 17, lineHeight: 24, marginTop: 2 },
  actionZone: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  actionZoneCanvas: { justifyContent: 'flex-start' },
  taskFooter: { paddingTop: spacing.xs },
  waitingTitle: { ...typography.heading, color: colors.lime },
});
