import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, fonts, spacing, typography } from '@/theme';

/** Segmented mission progress — one pip per task. */
function MissionPips({ round, total }: { round: number; total: number }) {
  return (
    <View style={styles.pipRow}>
      {Array.from({ length: total }, (_, i) => {
        const state = i + 1 < round ? 'done' : i + 1 === round ? 'live' : 'todo';
        return (
          <View
            key={i}
            style={[
              styles.pip,
              state === 'done' && styles.pipDone,
              state === 'live' && styles.pipLive,
            ]}
          />
        );
      })}
    </View>
  );
}

export function MissionHud({
  round,
  totalTasks,
  phaseTitle,
  subtitle,
  onOpenLog,
  onOpenHack,
  hacksRemaining,
  logCount = 0,
}: {
  round: number;
  totalTasks: number;
  phaseTitle: string;
  subtitle?: string;
  onOpenLog?: () => void;
  onOpenHack?: () => void;
  hacksRemaining?: number;
  logCount?: number;
}) {
  const titleOpacity = useSharedValue(1);

  useEffect(() => {
    titleOpacity.value = 0;
    titleOpacity.value = withTiming(1, { duration: 320 });
  }, [phaseTitle, subtitle, titleOpacity]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.missionLabel}>MISSION</Text>
        <Text style={styles.missionCount}>
          {String(Math.min(round, totalTasks)).padStart(2, '0')}
          <Text style={styles.missionTotal}>/{String(totalTasks).padStart(2, '0')}</Text>
        </Text>
        <MissionPips round={round} total={totalTasks} />
      </View>
      <View style={styles.divider} />
      <Animated.View style={[styles.right, titleStyle]}>
        <Text style={styles.phase}>{phaseTitle.toUpperCase()}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
      {onOpenHack ? (
        <Pressable
          onPress={onOpenHack}
          style={({ pressed }) => [styles.hackBtnWrap, pressed && styles.btnPressed]}
        >
          <Text style={styles.hackBtn}>HACK</Text>
          <Text style={styles.hackCount}>{hacksRemaining ?? 0}</Text>
        </Pressable>
      ) : null}
      {onOpenLog ? (
        <Pressable
          onPress={onOpenLog}
          style={({ pressed }) => [styles.logBtnWrap, pressed && styles.btnPressed]}
        >
          <Text style={styles.logBtn}>LOG{logCount > 0 ? ` ${logCount}` : ''}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,16,31,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  left: { alignItems: 'center', minWidth: 60, gap: 2 },
  missionLabel: { ...typography.label, color: colors.textDim, fontSize: 8 },
  missionCount: {
    fontFamily: fonts.mono,
    fontSize: 17,
    color: colors.accentSoft,
    letterSpacing: 1,
  },
  missionTotal: { color: colors.textDim, fontSize: 12 },
  pipRow: { flexDirection: 'row', gap: 3 },
  pip: {
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
  },
  pipDone: { backgroundColor: colors.primary },
  pipLive: { backgroundColor: colors.accent },
  divider: { width: 1, height: 36, backgroundColor: colors.border },
  right: { flex: 1, minWidth: 0 },
  phase: { ...typography.caption, color: colors.text, fontWeight: '800', letterSpacing: 1.2 },
  subtitle: { ...typography.small, color: colors.textDim, marginTop: 2, fontSize: 10 },
  btnPressed: { opacity: 0.7 },
  logBtnWrap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  logBtn: {
    ...typography.small,
    color: colors.accentSoft,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  hackBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(251,113,133,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
  },
  hackBtn: {
    ...typography.small,
    color: colors.alien,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  hackCount: {
    ...typography.small,
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    minWidth: 14,
    textAlign: 'center',
  },
});
