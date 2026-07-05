import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Badge, Button, LoadingState, RoleCard, ScreenShell } from '@/components/ui';
import { ChamberInput } from '@/components/game/ChamberViews';
import {
  ChamberBoarding,
  PhaseSyncGate,
  WaitingForCrew,
} from '@/components/game/CrewExperience';
import { ExtractionNominatePhase, ExtractionVotePhase } from '@/components/game/ExtractionPhase';
import { InfiltratorHackPanel } from '@/components/game/InfiltratorHackPanel';
import { MissionLogModal } from '@/components/game/MissionLogModal';
import { MissionHud } from '@/components/game/MissionHud';
import { PhaseTransition } from '@/components/game/PhaseTransition';
import { SyncAdvanceOverlay } from '@/components/game/SyncAdvanceOverlay';
import { TaskAnswerReveal } from '@/components/game/TaskAnswerReveal';
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
import { colors, phaseLabels, spacing, typography } from '@/theme';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
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

  const me = useMemo(
    () => game?.players.find((p) => p.uid === user?.id) ?? null,
    [game, user]
  );

  if (!game || !me || !profile) {
    return <LoadingState message="Loading mission..." />;
  }

  const aliens = game.players.filter((p) => p.role === 'alien' && p.uid !== me.uid);
  const showAlienIntel = me.role === 'alien' && game.phase !== 'game_over';
  const hideDevDuringPlay =
    game.phase === 'chamber_boarding' || game.phase === 'chamber_active';
  const showDevPanel = isDevModeEnabled() && isDevGame(game) && !hideDevDuringPlay;
  const phaseInfo = phaseLabels[game.phase] ?? { title: 'Mission', subtitle: '' };
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
        return (
          <ChamberBoarding
            game={game}
            me={me}
            onBoard={handleSync}
            boardingPending={syncPending}
          />
        );
      case 'chamber_active':
        return (
          <ChamberActivePhase
            game={game}
            me={me}
            onSubmit={(value, extra) =>
              runPlayerAction((s) =>
                engine.submitChamberResponse(s, me.uid, {
                  promptShown: getPromptForPlayer(s.activePrompt!, me.role, me.isHacked),
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
              actionLabel={isLastTask ? 'Final vote' : `Next mission (${game.round + 1}/${game.totalTasks})`}
              onReady={handleSync}
            />
          </View>
        );
      case 'probe':
      case 'captain_select':
        return (
          <View style={styles.fillCenter}>
            <Text style={styles.waitText}>Advancing…</Text>
          </View>
        );
      case 'extraction_nominate':
        return (
          <ExtractionNominatePhase
            game={game}
            onNominate={(ids) => runAction((s) => engine.nominateForExtraction(s, ids, me.uid))}
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
    <ScreenShell contentStyle={styles.shell}>
      <MissionHud
        round={game.round}
        totalTasks={game.totalTasks}
        phaseTitle={phaseInfo.title}
        subtitle={phaseInfo.subtitle}
        logCount={game.history.length}
        onOpenLog={showLogButton ? () => setLogOpen(true) : undefined}
        onOpenHack={showAlienIntel ? () => setHackOpen(true) : undefined}
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
  );
}

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
  return (
    <View style={styles.fill}>
      <RoleCard
        compact
        gameMode
        role={me.role}
        description={
          me.role === 'alien'
            ? 'You see different prompts than the crew. Tap Hack anytime — pool is shared with your partner.'
            : 'Watch the mission log for answers that do not add up.'
        }
        allies={me.role === 'alien' ? aliens.map((a) => a.displayName) : undefined}
      />
      <PhaseSyncGate
        game={game}
        me={me}
        actionLabel="Ready up"
        loading={syncPending}
        onReady={onReady}
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
  const submitted = Boolean(game.chamberResponses[me.uid]);
  const bioscannerMatched = engine.allOperatorsMatched(game);
  const isCaptain = game.captainId === me.uid;
  const isOperator = game.bioscanner.operatorIds.includes(me.uid);
  const mustRespond = game.selectedChamber === 'bioscanner' ? isOperator : true;

  if (game.selectedChamber === 'bioscanner' && isCaptain && bioscannerMatched && !game.bioscanner.scanTargetId) {
    const alive = game.players.filter((p) => p.isAlive);
    return (
      <View style={styles.fill}>
        <Text style={styles.waitText}>SELECT SCAN TARGET</Text>
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

function GameOverPhase({
  game,
  me,
  onExit,
}: {
  game: GameState;
  me: GamePlayer;
  onExit: () => void;
}) {
  const won =
    (game.winner === 'humans' && me.role === 'human') ||
    (game.winner === 'aliens' && me.role === 'alien');

  return (
    <View style={styles.fillCenter}>
      <Text style={styles.overTitle}>{won ? 'MISSION SUCCESS' : 'MISSION FAILED'}</Text>
      <Badge
        label={game.winner === 'humans' ? 'CREW WINS' : 'INFILTRATORS WIN'}
        color={game.winner === 'humans' ? colors.human : colors.alien}
      />
      <Text style={styles.muted}>{game.winReason}</Text>
      <Button title="RETURN" fullWidth onPress={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  body: { flex: 1, minHeight: 0, position: 'relative' },
  fill: { flex: 1, minHeight: 0, justifyContent: 'space-between' },
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  waitText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  scanGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  scanTile: { alignItems: 'center', width: 64, gap: 2 },
  scanName: { ...typography.small, color: colors.textDim, fontSize: 9 },
  overTitle: { ...typography.title, color: colors.text, letterSpacing: 1 },
  muted: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
