import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
import {
  chamberAccents,
  chamberCodes,
  chamberGradients,
  chamberIcons,
  colors,
  fonts,
  radius,
  spacing,
  typography,
} from '@/theme';

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

/** Full-bleed chamber door — gradient hero shown while the crew boards. */
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
  const gradient = chamberGradients[chamber] ?? chamberGradients.opinion_hold!;
  const accent = chamberAccents[chamber] ?? colors.accent;

  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.heroWrap}>
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.boardingHero}
        >
          <View style={styles.chamberCodeChip}>
            <Text style={styles.chamberCode}>
              {chamberCodes[chamber] ?? 'TASK'} · M{String(game.round).padStart(2, '0')}
            </Text>
          </View>
          <Text style={styles.chamberIcon}>{chamberIcons[chamber]}</Text>
          <Text style={styles.chamberName}>{CHAMBER_LABELS[chamber]}</Text>
          <Text style={styles.chamberAction}>{CHAMBER_TAGLINES[chamber]}</Text>
          <Text style={styles.chamberDesc}>{CHAMBER_DESCRIPTIONS[chamber]}</Text>
          <Text style={styles.boardingNote}>WHOLE CREW ENTERS TOGETHER</Text>
        </LinearGradient>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(120).duration(400)} style={styles.footer}>
        <CrewSyncBar game={game} mode="sync" />
        {boarded ? (
          <Text style={styles.waitingCopy}>Waiting for crew...</Text>
        ) : (
          <Button title="Enter chamber" fullWidth loading={boardingPending} onPress={onBoard} />
        )}
      </Animated.View>
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
  const accent = chamberAccents[chamber] ?? colors.accent;

  return (
    <View style={styles.fill}>
      <View
        style={[
          styles.promptHero,
          { borderTopColor: accent },
          isCanvas && styles.promptHeroCompact,
        ]}
      >
        <View style={styles.promptHeader}>
          <Text style={[styles.chamberNameSmall, { color: accent }]}>
            {CHAMBER_LABELS[chamber]}
          </Text>
          <Text style={styles.chamberTagline}>{CHAMBER_TAGLINES[chamber]}</Text>
        </View>
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
  const remaining = progress.total - progress.done;
  return (
    <View style={styles.fillCenter}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.lockedBadge}>
        <Text style={styles.lockedCheck}>✓</Text>
      </Animated.View>
      <Text style={styles.waitingTitle}>Answer locked</Text>
      <Text style={styles.waitingCopy}>
        {remaining === 0 ? 'Everyone is in' : `${remaining} crew still responding`}
      </Text>
      <CrewDots game={game} mode="task" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  heroWrap: { flex: 1, minHeight: 0 },
  footer: { gap: spacing.sm, paddingTop: spacing.sm },
  waitingCopy: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  boardingHero: {
    flex: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  chamberCodeChip: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  chamberCode: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 2,
  },
  chamberIcon: { fontSize: 52 },
  chamberName: {
    ...typography.hero,
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
  },
  chamberAction: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '800',
    textAlign: 'center',
  },
  chamberDesc: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  boardingNote: {
    ...typography.label,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
  promptHero: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    padding: spacing.md,
    gap: 6,
  },
  promptHeroCompact: { padding: spacing.sm, gap: 2 },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chamberNameSmall: { ...typography.label, fontSize: 11 },
  chamberTagline: { ...typography.small, color: colors.textDim, fontSize: 10 },
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
  lockedBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(163,230,53,0.14)',
    borderWidth: 1.5,
    borderColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCheck: { fontSize: 26, color: colors.lime, fontWeight: '800' },
  waitingTitle: { ...typography.heading, color: colors.lime },
});
