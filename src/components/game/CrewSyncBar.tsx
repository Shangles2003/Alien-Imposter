import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Avatar, Button } from '@/components/ui';
import { getCrewSyncProgress } from '@/game/engine';
import { GamePlayer, GameState } from '@/types/game';
import { colors, spacing, typography } from '@/theme';

export function CrewSyncBar({
  game,
  mode = 'sync',
}: {
  game: GameState;
  mode?: 'sync' | 'task';
}) {
  const alive = game.players.filter((p) => p.isAlive);
  const { ready, total } = getCrewSyncProgress(game);
  const taskDone = alive.filter((p) => Boolean(game.chamberResponses[p.uid])).length;
  const done = mode === 'task' ? taskDone : ready;
  const progress = total > 0 ? done / total : 0;

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
        {mode === 'task' ? 'Locked in' : 'Crew ready'} · {done}/{total}
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
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
  const synced = Boolean(game.phaseReady[me.uid]);
  const { ready, total } = getCrewSyncProgress(game);
  const allReady = ready >= total;

  return (
    <View style={styles.footer}>
      <CrewSyncBar game={game} mode="sync" />
      {synced ? (
        <Text style={styles.waitingCopy}>
          {allReady ? 'Crew synced — advancing' : `Waiting on crew (${ready}/${total})`}
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
    backgroundColor: colors.accent,
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
