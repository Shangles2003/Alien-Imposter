import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui';
import { PhaseSyncGate } from '@/components/game/CrewExperience';
import { formatChamberAnswer } from '@/components/game/chamberFormat';
import { DrawingPreview } from '@/components/game/DrawingPreview';
import * as engine from '@/game/engine';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

interface ProbePhaseProps {
  game: GameState;
  me: GamePlayer;
  showAlienIntel: boolean;
  onHack: (targetId: string) => void;
  onReady: () => void;
}

export function ProbePhase({ game, me, showAlienIntel, onHack, onReady }: ProbePhaseProps) {
  const { t } = useTranslation();
  const last = game.history[game.history.length - 1];
  const isLastTask = game.round >= game.totalTasks;
  const alerts = engine.getPartnerHackAlerts(game, me.uid);
  const hackTargets = game.players.filter((p) => p.isAlive);
  const canHack = showAlienIntel && game.hacksRemaining > 0;
  const isDrawingRound = last?.chamber === 'drawing_quarters';

  return (
    <View style={styles.fill}>
      <View style={styles.main}>
        {alerts.length > 0 && (
          <View style={styles.partnerAlert}>
            <Text style={styles.partnerAlertLabel}>{t('probe.partnerSignal')}</Text>
            <Text style={styles.partnerAlertText}>
              {t('probe.partnerHacked', { hacker: alerts[0]!.hackerName, target: alerts[0]!.targetName })}
            </Text>
          </View>
        )}

        {last ? (
          <View style={[styles.intelCard, canHack && styles.intelCardCompact]}>
            <Text style={styles.intelTitle}>
              {t('log.missionNum', { round: last.round })} · {t(`chambers.${last.chamber}.label`)}
            </Text>
            <View style={[styles.intelRows, isDrawingRound && styles.intelRowsGrid]}>
              {last.responses.map((r) => (
                <View key={r.playerId} style={[styles.intelRow, isDrawingRound && styles.intelRowDraw]}>
                  <Text style={styles.intelName} numberOfLines={1}>
                    {r.displayName}
                  </Text>
                  {r.drawingPaths ? (
                    <DrawingPreview paths={r.drawingPaths} height={isDrawingRound ? 52 : 40} />
                  ) : (
                    <Text style={styles.intelAnswer} numberOfLines={2}>
                      {formatChamberAnswer(r, game)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {canHack ? (
          <View style={styles.hackPanel}>
            <View style={styles.hackHeader}>
              <Text style={styles.hackTitle}>{t('hack.title')}</Text>
              <Text style={styles.hackDesc}>{t('probe.scrambleDesc')}</Text>
              <View style={styles.hackCountPill}>
                <Text style={styles.hackCount}>
                  {t('probe.remaining', { remaining: game.hacksRemaining, total: game.hacksTotal })}
                </Text>
              </View>
            </View>

            <View style={styles.hackList}>
              {hackTargets.map((p) => {
                const isSelf = p.uid === me.uid;
                return (
                  <Pressable
                    key={p.uid}
                    style={({ pressed }) => [
                      styles.hackTargetBtn,
                      p.isHacked && styles.hackTargetBtnActive,
                      pressed && styles.hackTargetBtnPressed,
                    ]}
                    onPress={() => onHack(p.uid)}
                  >
                    <Avatar name={p.displayName} color={p.avatarColor} size={40} />
                    <View style={styles.hackTargetCopy}>
                      <Text style={styles.hackTargetName} numberOfLines={1}>
                        {p.displayName}
                      </Text>
                      <Text style={styles.hackTargetMeta} numberOfLines={1}>
                        {p.isHacked
                          ? t('probe.promptsScrambled')
                          : isSelf
                            ? t('probe.scrambleYourOwn')
                            : t('probe.tapToScramble')}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : showAlienIntel && game.hacksRemaining === 0 ? (
          <Text style={styles.noHacks}>{t('hack.noHacksRemaining')}</Text>
        ) : null}
      </View>

      <PhaseSyncGate
        game={game}
        me={me}
        actionLabel={
          isLastTask
            ? t('game.finalVote')
            : t('game.nextMission', { round: game.round + 1, total: game.totalTasks })
        }
        onReady={onReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  main: { flex: 1, minHeight: 0, gap: spacing.sm },
  partnerAlert: {
    backgroundColor: colors.glowPink,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  partnerAlertLabel: { ...typography.small, color: colors.secondary, fontWeight: '800' },
  partnerAlertText: { ...typography.caption, color: colors.text, marginTop: 2 },
  intelCard: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  intelCardCompact: { flexShrink: 1 },
  intelTitle: { ...typography.caption, color: colors.accentSoft, fontWeight: '800' },
  intelRows: { gap: spacing.xs },
  intelRowsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  intelRow: { gap: 2, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  intelRowDraw: { width: '48%', borderBottomWidth: 0, paddingBottom: 0 },
  intelName: { ...typography.caption, color: colors.text, fontWeight: '700', fontSize: 12 },
  intelAnswer: { ...typography.caption, color: colors.textMuted, fontSize: 12, lineHeight: 16 },
  hackPanel: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#2a0f18',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.4)',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  hackHeader: { gap: spacing.xs, flexShrink: 0 },
  hackTitle: { ...typography.heading, color: colors.text, fontSize: 17 },
  hackDesc: { ...typography.caption, color: 'rgba(255,255,255,0.8)', lineHeight: 18, fontSize: 13 },
  hackCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251,113,133,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 2,
  },
  hackCount: { ...typography.small, color: colors.alien, fontWeight: '800', fontSize: 11 },
  hackList: { flex: 1, minHeight: 0, gap: spacing.xs, justifyContent: 'flex-start' },
  hackTargetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hackTargetBtnActive: {
    borderColor: colors.alien,
    backgroundColor: 'rgba(251,113,133,0.18)',
  },
  hackTargetBtnPressed: { opacity: 0.85 },
  hackTargetCopy: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 2 },
  hackTargetName: { ...typography.caption, color: colors.text, fontWeight: '700', fontSize: 14 },
  hackTargetMeta: { ...typography.small, color: colors.textMuted, fontSize: 11 },
  noHacks: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
});
