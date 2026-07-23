import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGameAccent } from '@/context/GameAccentContext';
import { colors, fonts, spacing, typography } from '@/theme';

/** Segmented mission progress — one pip per task. */
function MissionPips({ round, total }: { round: number; total: number }) {
  const { pipDone, pipLive } = useGameAccent();

  return (
    <View style={styles.pipRow}>
      {Array.from({ length: total }, (_, i) => {
        const state = i + 1 < round ? 'done' : i + 1 === round ? 'live' : 'todo';
        return (
          <View
            key={i}
            style={[
              styles.pip,
              state === 'done' && { backgroundColor: pipDone },
              state === 'live' && { backgroundColor: pipLive },
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
  onOpenLog,
  onOpenHack,
  onLeave,
  hacksRemaining,
  logCount = 0,
}: {
  round: number;
  totalTasks: number;
  onOpenLog?: () => void;
  onOpenHack?: () => void;
  onLeave?: () => void;
  hacksRemaining?: number;
  logCount?: number;
}) {
  const { accent, accentSoft } = useGameAccent();
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, { borderLeftColor: accent }]}>
      <View style={styles.left}>
        <Text style={styles.missionLabel}>{t('game.hudMission')}</Text>
        <Text style={[styles.missionCount, { color: accentSoft }]}>
          {String(Math.min(round, totalTasks)).padStart(2, '0')}
          <Text style={styles.missionTotal}>/{String(totalTasks).padStart(2, '0')}</Text>
        </Text>
        <MissionPips round={round} total={totalTasks} />
      </View>
      <View style={styles.actions}>
        {onOpenHack ? (
          <Pressable
            onPress={onOpenHack}
            style={({ pressed }) => [styles.hackBtnWrap, pressed && styles.btnPressed]}
          >
            <Text style={styles.hackBtn}>{t('game.hudHack')}</Text>
            <Text style={styles.hackCount}>{hacksRemaining ?? 0}</Text>
          </Pressable>
        ) : null}
        {onOpenLog ? (
          <Pressable
            onPress={onOpenLog}
            style={({ pressed }) => [styles.logBtnWrap, pressed && styles.btnPressed]}
          >
            <Text style={[styles.logBtn, { color: accentSoft }]}>
              {t('game.hudLog')}{logCount > 0 ? ` ${logCount}` : ''}
            </Text>
          </Pressable>
        ) : null}
        {onLeave ? (
          <Pressable
            onPress={onLeave}
            style={({ pressed }) => [styles.leaveBtnWrap, pressed && styles.btnPressed]}
            hitSlop={4}
          >
            <Text style={styles.leaveBtn}>{t('game.hudLeave')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18,16,31,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  left: { alignItems: 'center', gap: 2 },
  missionLabel: { ...typography.label, color: colors.textDim, fontSize: 8 },
  missionCount: {
    fontFamily: fonts.mono,
    fontSize: 17,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
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
  leaveBtnWrap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaveBtn: {
    ...typography.small,
    color: colors.textDim,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
});
