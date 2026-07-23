import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  AlienIcon,
  Avatar,
  Badge,
  Button,
  HelmetIcon,
  LoadingState,
  PressableScale,
  ScreenShell,
} from '@/components/ui';
import { ChamberInput } from '@/components/game/ChamberViews';
import {
  ChamberBoarding,
  PhaseSyncGate,
  WaitingForCrew,
} from '@/components/game/CrewExperience';
import { ExtractionNominatePhase, ExtractionVotePhase } from '@/components/game/ExtractionPhase';
import {
  CaptainScanReveal,
  IdentityDebrief,
  IdentityNominatePhase,
  RepairProtocolPhase,
} from '@/components/game/IdentityCheckPhase';
import { InfiltratorHackPanel } from '@/components/game/InfiltratorHackPanel';
import { MissionLogModal } from '@/components/game/MissionLogModal';
import { MissionHud } from '@/components/game/MissionHud';
import { PhaseTransition } from '@/components/game/PhaseTransition';
import { SyncAdvanceOverlay } from '@/components/game/SyncAdvanceOverlay';
import { TaskAnswerReveal } from '@/components/game/TaskAnswerReveal';
import { GameAccentProvider } from '@/context/GameAccentContext';
import { useAuth } from '@/context/AuthContext';
import { DevGamePanel } from '@/dev/DevGamePanel';
import { isDevGame, isDevModeEnabled } from '@/dev/config';
import { useDevBotRunner } from '@/dev/useDevBotRunner';
import * as engine from '@/game/engine';
import { isAllCrewReady, isCrewSyncPhase } from '@/game/syncPhases';
import { getPromptForPlayer } from '@/game/prompts';
import { useOptimisticGameActions } from '@/hooks/useOptimisticGameActions';
import { HOME_ROUTE } from '@/navigation/routes';
import { applyGameAction, subscribeToGame } from '@/services/gameSync';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [hackOpen, setHackOpen] = useState(false);
  const { lastBotAction } = useDevBotRunner(id, game);
  const { runAction, runPlayerAction, syncPhase, syncPending } = useOptimisticGameActions(
    id,
    game,
    setGame
  );

  useEffect(() => {
    if (!id) return;
    return subscribeToGame(id, setGame);
  }, [id]);

  useEffect(() => {
    if (!id || !game) return;
    if (game.phase === 'probe' || game.phase === 'captain_select') {
      applyGameAction(id, game, engine.advanceLegacyReviewPhase).catch(() => {});
    }
  }, [game?.phase, id]);

  useEffect(() => {
    if (!id || !game || game.phase !== 'chamber_boarding' || !game.timerEndsAt) return;
    const delay = Math.max(0, game.timerEndsAt - Date.now()) + 50;
    const timer = setTimeout(() => {
      applyGameAction(id, game, engine.advanceBoardingIfExpired).catch(() => {});
    }, delay);
    return () => clearTimeout(timer);
  }, [id, game?.phase, game?.timerEndsAt]);

  useEffect(() => {
    const endsAt = game?.identityCheck?.repair?.endsAt;
    if (!id || !game || game.phase !== 'identity_coop' || !endsAt) return;
    const delay = Math.max(0, endsAt - Date.now()) + 50;
    const timer = setTimeout(() => {
      applyGameAction(id, game, engine.advanceRepairIfExpired).catch(() => {});
    }, delay);
    return () => clearTimeout(timer);
  }, [id, game?.phase, game?.identityCheck?.repair?.endsAt]);

  const me = useMemo(
    () => game?.players.find((p) => p.uid === user?.id) ?? null,
    [game, user]
  );

  const handleLeaveMission = () => {
    Alert.alert(
      t('game.leaveMission'),
      t('game.leaveMissionBody'),
      [
        { text: t('game.stay'), style: 'cancel' },
        {
          text: t('game.leave'),
          style: 'destructive',
          onPress: () => router.replace(HOME_ROUTE),
        },
      ]
    );
  };

  if (!game || !user) {
    return <LoadingState message={t('game.loadingMission')} />;
  }

  if (!profile) {
    return <LoadingState message={t('game.loadingMission')} />;
  }

  if (!me) {
    return (
      <ScreenShell contentStyle={styles.shell}>
        <View style={styles.notOnMission}>
          <Text style={styles.notOnMissionTitle}>{t('game.notOnMission')}</Text>
          <Text style={styles.notOnMissionBody}>{t('game.notOnMissionBody')}</Text>
          <Button title={t('game.backToHome')} fullWidth onPress={() => router.replace(HOME_ROUTE)} />
        </View>
      </ScreenShell>
    );
  }

  const aliens = game.players.filter((p) => p.role === 'alien' && p.uid !== me.uid);
  const showAlienIntel = me.role === 'alien' && game.phase !== 'game_over';
  const hideDevDuringPlay =
    game.phase === 'chamber_boarding' ||
    game.phase === 'chamber_active' ||
    game.phase === 'identity_coop';
  const showDevPanel = isDevModeEnabled() && isDevGame(game) && !hideDevDuringPlay;
  const showLogButton =
    game.phase !== 'role_reveal' &&
    game.phase !== 'game_over' &&
    game.phase !== 'lobby';
  const isLastTask = game.round >= game.totalTasks;
  const showAdvanceOverlay = isCrewSyncPhase(game.phase) && isAllCrewReady(game);

  const handleSync = () => syncPhase((s) => engine.markPhaseReady(s, me.uid));

  const phaseContent = (() => {
    switch (game.phase) {
      case 'role_reveal':
        return (
          <RoleRevealPhase me={me} aliens={aliens} game={game} onReady={handleSync} syncPending={syncPending} />
        );
      case 'chamber_boarding':
        return <ChamberBoarding game={game} />;
      case 'chamber_active':
        return (
          <ChamberActivePhase
            game={game}
            me={me}
            onSubmit={(value, extra) =>
              runPlayerAction((s) =>
                engine.submitChamberResponse(s, me.uid, {
                  promptShown: getPromptForPlayer(s.activePrompt!, me.role, me.isHacked),
                  promptId: s.activePrompt!.promptId,
                  value,
                  ...extra,
                })
              )
            }
            onBioscannerUpdate={(updater) => runPlayerAction(updater)}
            onScanTarget={(targetId) => runAction((s) => engine.bioscannerSelectScanTarget(s, targetId))}
          />
        );
      case 'chamber_results':
        return (
          <View style={styles.fill}>
            <TaskAnswerReveal game={game} />
            <PhaseSyncGate
              game={game}
              me={me}
              loading={syncPending}
              actionLabel={isLastTask ? t('game.finalVote') : t('game.nextMission', { round: game.round + 1, total: game.totalTasks })}
              onReady={handleSync}
            />
          </View>
        );
      case 'probe':
      case 'captain_select':
        return (
          <View style={styles.fillCenter}>
            <Text style={styles.waitText}>{t('game.advancing')}</Text>
          </View>
        );
      case 'extraction_nominate':
        return (
          <ExtractionNominatePhase
            game={game}
            me={me}
            onSubmitBallot={(ids) =>
              runPlayerAction((s) => engine.submitExtractionBallot(s, me.uid, ids))
            }
          />
        );
      case 'identity_nominate':
        return (
          <IdentityNominatePhase
            game={game}
            me={me}
            onSubmit={(targetId) =>
              runPlayerAction((s) => engine.submitIdentityNomination(s, me.uid, targetId))
            }
          />
        );
      case 'identity_coop':
        return (
          <RepairProtocolPhase
            game={game}
            me={me}
            onCutConduit={(conduitId) =>
              runPlayerAction((s) => engine.submitConduitCut(s, me.uid, conduitId))
            }
            onLockGlyphs={(order) =>
              runPlayerAction((s) => engine.submitGlyphOrder(s, me.uid, order))
            }
            onLockCode={(code) =>
              runPlayerAction((s) => engine.submitFrequencyCode(s, me.uid, code))
            }
          />
        );
      case 'identity_scan':
        return (
          <CaptainScanReveal
            game={game}
            me={me}
            syncPending={syncPending}
            onAcknowledge={() =>
              runPlayerAction((s) => engine.captainAcknowledgeScan(s, me.uid))
            }
          />
        );
      case 'identity_debrief':
        return (
          <IdentityDebrief
            game={game}
            me={me}
            syncPending={syncPending}
            onReady={handleSync}
          />
        );
      case 'extraction_vote':
        return (
          <ExtractionVotePhase
            game={game}
            me={me}
            onVote={(vote) => runPlayerAction((s) => engine.castExtractionVote(s, me.uid, vote))}
          />
        );
      case 'game_over':
        return <GameOverPhase game={game} me={me} onExit={() => router.replace(HOME_ROUTE)} />;
      default:
        return null;
    }
  })();

  return (
    <GameAccentProvider isAlien={me.role === 'alien'}>
    <ScreenShell contentStyle={styles.shell}>
      <MissionHud
        round={game.round}
        totalTasks={game.totalTasks}
        logCount={game.history.length}
        onOpenLog={showLogButton ? () => setLogOpen(true) : undefined}
        onOpenHack={showAlienIntel ? () => setHackOpen(true) : undefined}
        onLeave={game.phase !== 'game_over' ? handleLeaveMission : undefined}
        hacksRemaining={game.hacksRemaining}
      />

      {showDevPanel && <DevGamePanel game={game} lastBotAction={lastBotAction} />}

      <View style={styles.body}>
        <PhaseTransition phase={game.phase} round={game.round}>
          {phaseContent}
        </PhaseTransition>
        <SyncAdvanceOverlay visible={showAdvanceOverlay} />
      </View>

      {showLogButton ? (
        <MissionLogModal
          visible={logOpen}
          game={game}
          me={me}
          onClose={() => setLogOpen(false)}
        />
      ) : null}

      {showAlienIntel ? (
        <InfiltratorHackPanel
          visible={hackOpen}
          game={game}
          me={me}
          onClose={() => setHackOpen(false)}
          onHack={(targetId) =>
            runPlayerAction((s) => engine.scheduleHack(s, me.uid, targetId))
          }
        />
      ) : null}
    </ScreenShell>
    </GameAccentProvider>
  );
}

/** Classified dossier — hidden until tapped so nobody can shoulder-surf your role. */
function RoleRevealPhase({
  me,
  aliens,
  game,
  onReady,
  syncPending,
}: {
  me: GamePlayer;
  aliens: GamePlayer[];
  game: GameState;
  onReady: () => void;
  syncPending: boolean;
}) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const isAlien = me.role === 'alien';

  return (
    <View style={styles.fill}>
      {revealed ? (
        <Animated.View entering={ZoomIn.duration(320)} style={styles.roleWrap}>
          <View
            style={[
              styles.roleCard,
              isAlien ? styles.roleCardAlien : styles.roleCardHuman,
              isAlien ? shadows.glowRed : shadows.glowCyan,
            ]}
          >
            {isAlien ? <AlienIcon size={72} mood="sus" /> : <HelmetIcon size={72} />}
            <Badge
              label={isAlien ? t('game.roleInfiltrator') : t('game.roleCrew')}
              color={isAlien ? colors.alien : colors.human}
              variant="solid"
            />
            <Text style={styles.roleDesc}>
              {isAlien ? t('game.roleDescAlien') : t('game.roleDescHuman')}
            </Text>
            {isAlien && aliens.length > 0 && (
              <Text style={styles.roleAlly} numberOfLines={1}>
                {t('game.partner', { names: aliens.map((a) => a.displayName).join(', ') })}
              </Text>
            )}
            <Pressable onPress={() => setRevealed(false)} hitSlop={8}>
              <Text style={styles.hideLink}>{t('game.hideIdentity')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        <PressableScale onPress={() => setRevealed(true)} style={styles.roleWrap} scaleTo={0.97}>
          <View style={[styles.roleCard, styles.roleCardHidden]}>
            <Animated.Text entering={FadeIn.duration(600)} style={styles.classifiedIcon}>
              🔒
            </Animated.Text>
            <Text style={styles.classifiedTitle}>{t('game.classifiedDossier')}</Text>
            <Text style={styles.classifiedName}>{me.displayName}</Text>
            <Text style={styles.classifiedHint}>{t('game.revealHint')}</Text>
            <View style={styles.tapChip}>
              <Text style={styles.tapChipText}>{t('game.tapToReveal')}</Text>
            </View>
          </View>
        </PressableScale>
      )}
      <PhaseSyncGate
        game={game}
        me={me}
        actionLabel={revealed ? t('game.readyUp') : t('game.revealFirst')}
        loading={syncPending}
        onReady={() => {
          if (revealed) onReady();
        }}
      />
    </View>
  );
}

function ChamberActivePhase({
  game,
  me,
  onSubmit,
  onBioscannerUpdate,
  onScanTarget,
}: {
  game: GameState;
  me: GamePlayer;
  onSubmit: (value: string, extra?: object) => void;
  onBioscannerUpdate: (fn: (s: GameState) => GameState) => void;
  onScanTarget: (id: string) => void;
}) {
  const { t } = useTranslation();
  const submitted = Boolean(game.chamberResponses[me.uid]);
  const bioscannerMatched = engine.allOperatorsMatched(game);
  const isCaptain = game.captainId === me.uid;
  const isOperator = game.bioscanner.operatorIds.includes(me.uid);
  const mustRespond = game.selectedChamber === 'bioscanner' ? isOperator : true;

  if (game.selectedChamber === 'bioscanner' && isCaptain && bioscannerMatched && !game.bioscanner.scanTargetId) {
    const alive = game.players.filter((p) => p.isAlive);
    return (
      <View style={styles.fill}>
        <Text style={styles.waitText}>{t('game.selectScanTarget')}</Text>
        <View style={styles.scanGrid}>
          {alive.map((p) => (
            <Pressable key={p.uid} style={styles.scanTile} onPress={() => onScanTarget(p.uid)}>
              <Avatar name={p.displayName} color={p.avatarColor} size={36} />
              <Text style={styles.scanName} numberOfLines={1}>{p.displayName.split(' ').pop()}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  if (submitted || !mustRespond) return <WaitingForCrew game={game} />;

  return (
    <ChamberInput
      game={game}
      player={me}
      submitted={false}
      onSubmit={(value, extra) => {
        if (extra?.selectedGlyphs) {
          onBioscannerUpdate((s) => ({
            ...s,
            bioscanner: {
              ...s.bioscanner,
              operatorSelections: { ...s.bioscanner.operatorSelections, [me.uid]: extra.selectedGlyphs! },
            },
            chamberResponses: {
              ...s.chamberResponses,
              [me.uid]: {
                playerId: me.uid,
                displayName: me.displayName,
                promptShown: 'Bio Scanner glyphs',
                value: 'matched',
                selectedGlyphs: extra.selectedGlyphs,
              },
            },
          }));
        } else {
          onSubmit(value, extra);
        }
      }}
    />
  );
}

/** Mission debrief — verdict plus the full cast reveal. */
function GameOverPhase({
  game,
  me,
  onExit,
}: {
  game: GameState;
  me: GamePlayer;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const won =
    (game.winner === 'humans' && me.role === 'human') ||
    (game.winner === 'aliens' && me.role === 'alien');
  const crewWon = game.winner === 'humans';

  return (
    <View style={styles.fill}>
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.overScroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.duration(450)} style={styles.overHero}>
          {crewWon ? <HelmetIcon size={72} /> : <AlienIcon size={72} mood={won ? 'happy' : 'sus'} />}
          <Text style={[styles.overTitle, { color: won ? colors.success : colors.danger }]}>
            {won ? t('game.missionSuccess') : t('game.missionFailed')}
          </Text>
          <Badge
            label={crewWon ? t('game.crewWins') : t('game.infiltratorsWin')}
            color={crewWon ? colors.human : colors.alien}
            variant="solid"
          />
          <Text style={styles.overReason}>
            {game.winReasonKey
              ? t(`game.${game.winReasonKey}`, { defaultValue: game.winReason ?? '' })
              : game.winReason}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={styles.castLabel}>{t('game.identityReveal')}</Text>
        </Animated.View>
        <View style={styles.castList}>
          {[...game.players]
            .sort((a, b) => (a.role === 'alien' ? -1 : 1) - (b.role === 'alien' ? -1 : 1))
            .map((p, i) => {
              const alien = p.role === 'alien';
              return (
                <Animated.View
                  key={p.uid}
                  entering={FadeInUp.delay(450 + i * 90).duration(350)}
                  style={[styles.castRow, alien && styles.castRowAlien]}
                >
                  <Avatar name={p.displayName} color={p.avatarColor} size={36} />
                  <Text style={styles.castName} numberOfLines={1}>
                    {p.displayName}
                    {p.uid === me.uid ? t('game.youCap') : ''}
                  </Text>
                  {alien ? <AlienIcon size={24} mood="sus" /> : <HelmetIcon size={24} />}
                  <Text style={[styles.castRole, { color: alien ? colors.alien : colors.human }]}>
                    {alien ? t('game.roleInfiltrator') : t('game.roleCrew')}
                  </Text>
                </Animated.View>
              );
            })}
        </View>
      </ScrollView>
      <Button title={t('game.returnToBase')} fullWidth onPress={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  body: { flex: 1, minHeight: 0, position: 'relative' },
  fill: { flex: 1, minHeight: 0, justifyContent: 'space-between' },
  scrollFill: { flex: 1, minHeight: 0 },
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  notOnMission: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  notOnMissionTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  notOnMissionBody: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  waitText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  scanGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  scanTile: { alignItems: 'center', width: 64, gap: 2 },
  scanName: { ...typography.small, color: colors.textDim, fontSize: 9 },
  // Role reveal
  roleWrap: { flex: 1, minHeight: 0 },
  roleCard: {
    flex: 1,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  roleCardHidden: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderBright,
    borderStyle: 'dashed',
  },
  roleCardAlien: {
    backgroundColor: '#2a0a14',
    borderColor: 'rgba(251,113,133,0.55)',
  },
  roleCardHuman: {
    backgroundColor: '#04211a',
    borderColor: 'rgba(52,211,153,0.5)',
  },
  classifiedIcon: { fontSize: 40 },
  classifiedTitle: { ...typography.label, color: colors.primaryLight, fontSize: 12 },
  classifiedName: { ...typography.title, color: colors.text },
  classifiedHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  tapChip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glowPurple,
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  tapChipText: { ...typography.label, color: colors.primaryLight },
  roleDesc: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  roleAlly: { ...typography.caption, color: colors.alien, fontWeight: '800' },
  hideLink: { ...typography.small, color: colors.textDim, textDecorationLine: 'underline' },
  // Game over
  overScroll: { gap: spacing.md, paddingBottom: spacing.md },
  overHero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  overTitle: { ...typography.title, letterSpacing: 2, textAlign: 'center' },
  overReason: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  castLabel: { ...typography.label, color: colors.textDim, textAlign: 'center' },
  castList: { gap: spacing.sm },
  castRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  castRowAlien: {
    borderColor: 'rgba(251,113,133,0.4)',
    backgroundColor: 'rgba(251,113,133,0.07)',
  },
  castName: { ...typography.caption, color: colors.text, fontWeight: '700', flex: 1 },
  castRole: { ...typography.small, fontWeight: '800', fontSize: 10, letterSpacing: 1 },
});
