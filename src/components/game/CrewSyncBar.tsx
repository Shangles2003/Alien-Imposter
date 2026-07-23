import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Avatar, Button } from '@/components/ui';
import { useGameAccent } from '@/context/GameAccentContext';
import { CHAMBER_BOARDING_DURATION_MS, getCrewSyncProgress } from '@/game/engine';
import { GamePlayer, GameState } from '@/types/game';
import { colors, spacing, typography } from '@/theme';

export function CrewSyncBar({
  game,
  mode = 'sync',
}: {
  game: GameState;
  mode?: 'sync' | 'task' | 'countdown';
}) {
  const { t } = useTranslation();
  const { accent } = useGameAccent();
  const alive = game.players.filter((p) => p.isAlive);
  const { ready, total } = getCrewSyncProgress(game);
  const taskDone = alive.filter((p) => Boolean(game.chamberResponses[p.uid])).length;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (mode !== 'countdown' || !game.timerEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, [mode, game.timerEndsAt]);

  let done = mode === 'task' ? taskDone : ready;
  let progress = total > 0 ? done / total : 0;
  let label = mode === 'task' ? t('sync.lockedIn') : t('sync.crewReady');

  if (mode === 'countdown') {
    const endsAt = game.timerEndsAt ?? now;
    const remaining = Math.max(0, endsAt - now);
    progress = 1 - remaining / CHAMBER_BOARDING_DURATION_MS;
    const seconds = Math.ceil(remaining / 1000);
    label = seconds > 0 ? t('sync.enteringChamber', { seconds }) : t('sync.enteringChamberNoTime');
  }

  const width = useSharedValue(progress);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [progress, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(width.value * 100, 4)}%`,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {mode === 'countdown' ? label : t('sync.progress', { label, done, total })}
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: accent }, barStyle]} />
      </View>
      {mode !== 'countdown' ? (
        <View style={styles.dotsRow}>
          {alive.map((p) => {
            const isDone =
              mode === 'task'
                ? Boolean(game.chamberResponses[p.uid])
                : Boolean(game.phaseReady[p.uid]);
            return (
              <AnimatedDot key={p.uid} name={p.displayName} color={p.avatarColor} ready={isDone} />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function AnimatedDot({
  name,
  color,
  ready,
}: {
  name: string;
  color: string;
  ready: boolean;
}) {
  const opacity = useSharedValue(ready ? 1 : 0.45);

  useEffect(() => {
    opacity.value = withTiming(ready ? 1 : 0.45, { duration: 220 });
  }, [ready, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <Avatar name={name} color={color} size={24} ring={ready} />
    </Animated.View>
  );
}

export function PhaseSyncGate({
  game,
  me,
  actionLabel,
  onReady,
  loading = false,
}: {
  game: GameState;
  me: GamePlayer;
  actionLabel: string;
  onReady: () => void | Promise<void>;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const synced = Boolean(game.phaseReady[me.uid]);
  const { ready, total } = getCrewSyncProgress(game);
  const allReady = ready >= total;

  return (
    <View style={styles.footer}>
      <CrewSyncBar game={game} mode="sync" />
      {synced ? (
        <Text style={styles.waitingCopy}>
          {allReady ? t('sync.crewSynced') : t('sync.waitingOnCrew', { ready, total })}
        </Text>
      ) : (
        <Button
          title={actionLabel}
          fullWidth
          size="md"
          loading={loading}
          onPress={() => onReady()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.small, color: colors.textDim, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 2,
  },
  footer: { gap: spacing.sm, paddingTop: spacing.sm },
  waitingCopy: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
