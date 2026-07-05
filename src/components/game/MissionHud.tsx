import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, spacing, typography } from '@/theme';

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
          {String(round).padStart(2, '0')}/{String(totalTasks).padStart(2, '0')}
        </Text>
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
        <Pressable onPress={onOpenHack} style={styles.hackBtnWrap}>
          <Text style={styles.hackBtn}>Hack</Text>
          <Text style={styles.hackCount}>{hacksRemaining ?? 0}</Text>
        </Pressable>
      ) : null}
      {onOpenLog ? (
        <Pressable onPress={onOpenLog} style={styles.logBtnWrap}>
          <Text style={styles.logBtn}>
            Log{logCount > 0 ? ` · ${logCount}` : ''}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  left: { alignItems: 'center', minWidth: 56 },
  missionLabel: { ...typography.small, color: colors.textDim, fontSize: 9, letterSpacing: 2 },
  missionCount: { ...typography.mono, fontSize: 18, color: colors.accentSoft, letterSpacing: 2 },
  divider: { width: 1, height: 32, backgroundColor: colors.border },
  right: { flex: 1, minWidth: 0 },
  phase: { ...typography.caption, color: colors.text, fontWeight: '800', letterSpacing: 1.2 },
  subtitle: { ...typography.small, color: colors.textDim, marginTop: 2, fontSize: 10 },
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
    fontSize: 11,
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
    fontSize: 11,
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
