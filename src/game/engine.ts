import {
  BioscannerState,
  ChamberResponse,
  ChamberType,
  ExtractionState,
  GamePhase,
  GamePlayer,
  GameState,
  HostSettings,
  LobbyPlayer,
  RoundHistoryEntry,
} from '@/types/game';
import { DEFAULT_HOST_SETTINGS } from '@/content/types';
import {
  assignRoles,
  getChamberForRound,
  getRulesForPlayerCount,
  pickRandomCaptain,
  TOTAL_TASKS,
} from '@/game/rules';
import { generateGlyphSet, getPromptForChamber, pickCaptainGlyphs } from '@/game/prompts';

export function createInitialGameState(
  gameId: string,
  lobbyId: string,
  hostId: string,
  lobbyPlayers: LobbyPlayer[],
  isDevMode = false,
  hostSettings: HostSettings = DEFAULT_HOST_SETTINGS
): GameState {
  const alivePlayers = lobbyPlayers.slice(0, 10);
  const rules = getRulesForPlayerCount(alivePlayers.length, hostSettings.missionCount);
  const roleMap = assignRoles(
    alivePlayers.map((p) => p.uid),
    rules.alienCount
  );

  const players: GamePlayer[] = alivePlayers.map((p) => ({
    uid: p.uid,
    displayName: p.displayName,
    avatarColor: p.avatarColor,
    role: roleMap[p.uid] ?? 'human',
    isAlive: true,
    hasPushedButton: false,
    isHacked: false,
    extractionVote: null,
  }));

  const captainId = pickRandomCaptain(players.map((p) => p.uid));
  const now = Date.now();

  return {
    id: gameId,
    lobbyId,
    phase: 'role_reveal',
    players,
    captainId,
    round: 1,
    totalTasks: rules.totalTasks,
    usedChambers: [],
    timerEndsAt: null,
    timerPaused: true,
    alienCount: rules.alienCount,
    hacksRemaining: rules.hacksTotal,
    hacksTotal: rules.hacksTotal,
    hacksEnabled: true,
    hackLog: [],
    selectedChamber: null,
    testeeIds: [],
    activePrompt: null,
    chamberResponses: {},
    bioscanner: {
      glyphSet: generateGlyphSet(),
      captainGlyphs: [],
      operatorIds: [],
      operatorSelections: {},
      scanTargetId: null,
      scanResult: null,
      cooldownUntil: null,
      unlocked: false,
    },
    extraction: null,
    history: [],
    winner: null,
    winReason: null,
    maxTestees: rules.maxTestees,
    updatedAt: now,
    hostId,
    isDevMode,
    contentPacks: hostSettings.contentPacks,
    phaseReady: {},
  };
}

function allCrewSynced(state: GameState): boolean {
  return getAlivePlayers(state).every((p) => state.phaseReady[p.uid]);
}

function withPhaseReady(state: GameState, playerId: string): GameState {
  return {
    ...state,
    phaseReady: { ...state.phaseReady, [playerId]: true },
    updatedAt: Date.now(),
  };
}

export function getCrewSyncProgress(state: GameState): { ready: number; total: number } {
  const alive = getAlivePlayers(state);
  const ready = alive.filter((p) => state.phaseReady[p.uid]).length;
  return { ready, total: alive.length };
}

export function getTaskProgress(state: GameState): { done: number; total: number } {
  const alive = getAlivePlayers(state);
  const done = alive.filter((p) => state.chamberResponses[p.uid]).length;
  return { done, total: alive.length };
}

/** Whole crew marks ready; advances when everyone has synced. */
export function markPhaseReady(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.uid === playerId);
  if (!player?.isAlive) throw new Error('Only active crew can sync.');

  const next = withPhaseReady(state, playerId);
  return advanceIfAllCrewSynced(next, state.phase);
}

/** Mark multiple players ready in one write (dev bots). */
export function markPhaseReadyBatch(state: GameState, playerIds: string[]): GameState {
  let next = state;
  for (const id of playerIds) {
    const player = next.players.find((p) => p.uid === id);
    if (!player?.isAlive || next.phaseReady[id]) continue;
    next = withPhaseReady(next, id);
  }
  return advanceIfAllCrewSynced(next, state.phase);
}

function advanceIfAllCrewSynced(state: GameState, fromPhase: GamePhase): GameState {
  if (!allCrewSynced(state)) return state;

  switch (fromPhase) {
    case 'role_reveal':
      return beginMissionRound({ ...state, phaseReady: {} });
    case 'chamber_boarding':
      return { ...state, phase: 'chamber_active', phaseReady: {} };
    case 'chamber_results':
      return advanceAfterTask({ ...state, phaseReady: {} });
    case 'probe':
      return advanceAfterTask({ ...state, phaseReady: {} });
    default:
      return state;
  }
}

export function getAlivePlayers(state: GameState): GamePlayer[] {
  return state.players.filter((p) => p.isAlive);
}

export function getAliens(state: GameState): GamePlayer[] {
  return state.players.filter((p) => p.isAlive && p.role === 'alien');
}

/** Timer disabled — 5-task mode uses task count instead. */
export function checkTimerExpired(_state: GameState): GameState | null {
  return null;
}

/** Launch the fixed-order chamber for the current round (no captain pick). */
export function beginMissionRound(state: GameState): GameState {
  const chamber = getChamberForRound(state.round, state.totalTasks);
  return launchChamber(state, chamber);
}

/** @deprecated Captain routing removed — use beginMissionRound. */
export function startCaptainPhase(state: GameState): GameState {
  return beginMissionRound(state);
}

function promptContext(state: GameState) {
  return {
    players: getAlivePlayers(state).map((p) => ({
      uid: p.uid,
      displayName: p.displayName,
    })),
  };
}

export function launchChamber(
  state: GameState,
  chamber: ChamberType,
  actorId?: string
): GameState {
  if (actorId && state.captainId !== actorId) {
    throw new Error('Only the captain can launch a mission.');
  }

  const primed = applyPendingHacksForRound(state, state.round);
  const alive = getAlivePlayers(primed);
  const crewIds = alive.map((p) => p.uid);

  if (chamber === 'bioscanner') {
    if (crewIds.length < 3) {
      throw new Error('Bio Scanner needs at least 3 crew.');
    }
    const operatorIds = crewIds.slice(0, 2);
    const captainGlyphs = pickCaptainGlyphs(primed.bioscanner.glyphSet);
    return {
      ...primed,
      phase: 'chamber_boarding',
      selectedChamber: chamber,
      testeeIds: crewIds,
      activePrompt: getPromptForChamber(chamber, promptContext(primed), primed.contentPacks ?? ['core']),
      chamberResponses: {},
      phaseReady: {},
      bioscanner: {
        ...primed.bioscanner,
        captainGlyphs,
        operatorIds,
        operatorSelections: {},
        scanTargetId: null,
        scanResult: null,
      },
      updatedAt: Date.now(),
    };
  }

  return {
    ...primed,
    phase: 'chamber_boarding',
    selectedChamber: chamber,
    testeeIds: crewIds,
    activePrompt: getPromptForChamber(
      chamber,
      {
        ...promptContext(primed),
        testeeIds: crewIds,
      },
      primed.contentPacks ?? ['core']
    ),
    chamberResponses: {},
    phaseReady: {},
    updatedAt: Date.now(),
  };
}

/** @deprecated Use launchChamber — whole crew always participates. */
export function selectChamberAndTestees(
  state: GameState,
  chamber: ChamberType,
  _testeeIds: string[],
  actorId?: string
): GameState {
  return launchChamber(state, chamber, actorId);
}

function requiredResponseCount(state: GameState): number {
  if (state.selectedChamber === 'bioscanner') {
    return state.bioscanner.operatorIds.length;
  }
  return getAlivePlayers(state).length;
}

function isRespondent(state: GameState, playerId: string): boolean {
  if (!getAlivePlayers(state).some((p) => p.uid === playerId)) return false;
  if (state.selectedChamber === 'bioscanner') {
    return state.bioscanner.operatorIds.includes(playerId);
  }
  return true;
}

export function submitChamberResponse(
  state: GameState,
  playerId: string,
  response: Omit<ChamberResponse, 'playerId' | 'displayName'>
): GameState {
  const player = state.players.find((p) => p.uid === playerId);
  if (!player) throw new Error('Player not found.');
  if (!isRespondent(state, playerId)) {
    throw new Error('You are not part of this test.');
  }

  const chamberResponses = {
    ...state.chamberResponses,
    [playerId]: {
      playerId,
      displayName: player.displayName,
      ...response,
    },
  };

  const requiredCount = requiredResponseCount(state);
  const submittedCount = Object.keys(chamberResponses).filter((id) =>
    isRespondent(state, id)
  ).length;

  if (state.selectedChamber === 'bioscanner') {
    if (submittedCount < requiredCount) {
      return { ...state, chamberResponses, updatedAt: Date.now() };
    }
    const matched = allOperatorsMatched({ ...state, chamberResponses });
    if (!matched || !state.bioscanner.scanTargetId) {
      return { ...state, chamberResponses, updatedAt: Date.now() };
    }
    return finalizeChamberRound({ ...state, chamberResponses });
  }

  if (submittedCount < requiredCount) {
    return { ...state, chamberResponses, updatedAt: Date.now() };
  }

  return finalizeChamberRound({ ...state, chamberResponses });
}

export function finalizeChamberRound(state: GameState): GameState {
  const responses = Object.values(state.chamberResponses);
  const chamber = state.selectedChamber!;

  const entry: RoundHistoryEntry = {
    round: state.round,
    captainId: state.captainId!,
    chamber,
    testeeIds: [...state.testeeIds],
    responses,
    completedAt: Date.now(),
  };

  const usedChambers =
    chamber !== 'bioscanner' ? [...state.usedChambers, chamber] : state.usedChambers;

  return {
    ...state,
    phase: 'chamber_results',
    history: [...state.history, entry],
    usedChambers,
    chamberResponses: {},
    phaseReady: {},
    updatedAt: Date.now(),
  };
}

/** Skip removed debrief/probe/captain-select phases for games saved mid-review. */
export function advanceLegacyReviewPhase(state: GameState): GameState {
  if (state.phase === 'probe') {
    return advanceAfterTask({ ...state, phaseReady: {} });
  }
  if (state.phase === 'captain_select') {
    return beginMissionRound({ ...state, phaseReady: {} });
  }
  return state;
}

/** After a task finishes, auto-launch the next fixed-order mission or final vote. */
function advanceAfterTask(state: GameState): GameState {
  if (state.round >= state.totalTasks) {
    return startFinalExtraction(state);
  }

  const aliveIds = getAlivePlayers(state).map((p) => p.uid);
  const nextCaptain = pickRandomCaptain(aliveIds, state.captainId ?? undefined);

  return beginMissionRound({
    ...state,
    round: state.round + 1,
    captainId: nextCaptain,
    phaseReady: {},
  });
}

export function advanceToProbe(state: GameState): GameState {
  return { ...state, phase: 'probe', phaseReady: {}, updatedAt: Date.now() };
}

function hackApplyRound(state: GameState): number {
  if (state.phase === 'chamber_boarding' || state.phase === 'role_reveal') {
    return state.round;
  }
  return state.round + 1;
}

function applyPendingHacksForRound(state: GameState, round: number): GameState {
  let players = state.players.map((p) => ({ ...p, isHacked: false }));
  const hackLog = state.hackLog.map((entry) => {
    if (entry.applied || entry.applyAtRound !== round) return entry;
    players = players.map((p) =>
      p.uid === entry.targetId ? { ...p, isHacked: true } : p
    );
    return { ...entry, applied: true, appliedAt: Date.now() };
  });

  return { ...state, players, hackLog, updatedAt: Date.now() };
}

/** Queue a shared infiltrator hack — applies now during boarding, otherwise at next task start. */
export function scheduleHack(state: GameState, alienId: string, targetId: string): GameState {
  if (state.phase === 'game_over') throw new Error('Mission is over.');
  if (state.hacksRemaining <= 0) throw new Error('No hacks remaining.');

  const alien = state.players.find((p) => p.uid === alienId);
  if (!alien?.isAlive || alien.role !== 'alien') {
    throw new Error('Only infiltrators can hack.');
  }

  const target = state.players.find((p) => p.uid === targetId);
  if (!target?.isAlive) throw new Error('Target is not active.');

  if (targetId === alienId) {
    // Self-hack: infiltrator sees crew prompts this task / next task.
  } else if (target.role === 'alien') {
    throw new Error('Cannot hack another infiltrator.');
  }

  const alreadyQueued = state.hackLog.some((h) => !h.applied && h.targetId === targetId);
  if (alreadyQueued) throw new Error('That crew member already has a hack queued.');

  const applyAtRound = hackApplyRound(state);
  const applyNow = applyAtRound === state.round;
  const entry: import('@/types/game').HackEntry = {
    id: `hack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    alienId,
    targetId,
    scheduledAt: Date.now(),
    applyAtRound,
    applied: applyNow,
    appliedAt: applyNow ? Date.now() : undefined,
  };

  let players = state.players;
  if (applyNow) {
    players = players.map((p) => (p.uid === targetId ? { ...p, isHacked: true } : p));
  }

  return {
    ...state,
    players,
    hacksRemaining: state.hacksRemaining - 1,
    hackLog: [...state.hackLog, entry],
    updatedAt: Date.now(),
  };
}

/** @deprecated Use scheduleHack. */
export function useHack(state: GameState, alienId: string, targetId: string): GameState {
  return scheduleHack(state, alienId, targetId);
}

export function startNextRound(state: GameState): GameState {
  if (state.round >= state.totalTasks) {
    return startFinalExtraction(state);
  }

  const aliveIds = getAlivePlayers(state).map((p) => p.uid);
  const nextCaptain = pickRandomCaptain(aliveIds, state.captainId ?? undefined);

  return startCaptainPhase({
    ...state,
    round: state.round + 1,
    captainId: nextCaptain,
  });
}

/**
 * FINAL EXTRACTION — ballot → majority loop.
 *
 * 1. Every living player secretly ballots for `alienCount` suspects.
 * 2. The top `alienCount` vote-getters become "the accused" (ties at the
 *    cutoff are broken randomly).
 * 3. Everyone votes keep/eject on the accused as a group. A strict majority
 *    ejects them; a tie or majority-keep starts a fresh ballot round.
 * 4. Ejection resolves the game: all infiltrators ejected → crew wins,
 *    any innocent ejected → infiltrators win.
 */
function freshBallotRound(round: number): import('@/types/game').ExtractionState {
  return {
    initiatorId: '',
    round,
    ballots: {},
    voteTally: {},
    nominatedIds: [],
    votes: {},
    resolved: false,
    humansEjected: false,
  };
}

export function startFinalExtraction(state: GameState): GameState {
  return {
    ...state,
    phase: 'extraction_nominate',
    extraction: freshBallotRound(1),
    players: state.players.map((p) => ({ ...p, extractionVote: null })),
    updatedAt: Date.now(),
  };
}

export function getExtractionBallotProgress(state: GameState): { done: number; total: number } {
  const alive = getAlivePlayers(state);
  const ballots = state.extraction?.ballots ?? {};
  const done = alive.filter((p) => Array.isArray(ballots[p.uid])).length;
  return { done, total: alive.length };
}

/** Submit one player's secret ballot; tallies and advances when everyone is in. */
export function submitExtractionBallot(
  state: GameState,
  voterId: string,
  suspectIds: string[]
): GameState {
  if (state.phase !== 'extraction_nominate') {
    throw new Error('Not in the accusation phase.');
  }
  const extraction = state.extraction ?? freshBallotRound(1);

  const alive = getAlivePlayers(state);
  const aliveIds = new Set(alive.map((p) => p.uid));
  if (!aliveIds.has(voterId)) throw new Error('Only active crew can vote.');

  const unique = [...new Set(suspectIds)].filter((id) => aliveIds.has(id));
  if (unique.length !== state.alienCount) {
    throw new Error(`Pick exactly ${state.alienCount} suspect${state.alienCount > 1 ? 's' : ''}.`);
  }

  const ballots = { ...(extraction.ballots ?? {}), [voterId]: unique };
  const allIn = alive.every((p) => Array.isArray(ballots[p.uid]));

  if (!allIn) {
    return {
      ...state,
      extraction: { ...extraction, ballots },
      updatedAt: Date.now(),
    };
  }

  // Tally all ballots.
  const tally: Record<string, number> = {};
  for (const picks of Object.values(ballots)) {
    for (const id of picks) {
      tally[id] = (tally[id] ?? 0) + 1;
    }
  }

  const accused = pickTopAccused(tally, state.alienCount);

  return {
    ...state,
    phase: 'extraction_vote',
    extraction: {
      ...extraction,
      ballots,
      voteTally: tally,
      nominatedIds: accused,
      votes: {},
    },
    players: state.players.map((p) => ({ ...p, extractionVote: null })),
    updatedAt: Date.now(),
  };
}

/** Top-N vote-getters; ties at the cutoff are broken by random draw. */
function pickTopAccused(tally: Record<string, number>, count: number): string[] {
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (entries.length <= count) return entries.map(([id]) => id);

  const cutoff = entries[count - 1]![1];
  const locked = entries.filter(([, votes]) => votes > cutoff).map(([id]) => id);
  const tied = entries.filter(([, votes]) => votes === cutoff).map(([id]) => id);

  const shuffled = [...tied].sort(() => Math.random() - 0.5);
  return [...locked, ...shuffled.slice(0, count - locked.length)];
}

export function castExtractionVote(
  state: GameState,
  voterId: string,
  vote: 'eject' | 'keep'
): GameState {
  if (state.phase !== 'extraction_vote') throw new Error('Not in the keep/eject vote.');
  if (!state.extraction) throw new Error('No extraction in progress.');

  const alive = getAlivePlayers(state);
  if (!alive.some((p) => p.uid === voterId)) throw new Error('Only active crew can vote.');

  const votes = { ...state.extraction.votes, [voterId]: vote };

  const players = state.players.map((p) =>
    p.uid === voterId ? { ...p, extractionVote: vote } : p
  );

  if (Object.keys(votes).filter((id) => alive.some((p) => p.uid === id)).length < alive.length) {
    return {
      ...state,
      players,
      extraction: { ...state.extraction, votes },
      updatedAt: Date.now(),
    };
  }

  return resolveFinalExtraction({ ...state, players, extraction: { ...state.extraction, votes } });
}

export function resolveFinalExtraction(state: GameState): GameState {
  const extraction = state.extraction!;
  const alive = getAlivePlayers(state);

  const ejectCount = alive.filter((p) => extraction.votes[p.uid] === 'eject').length;
  const keepCount = alive.filter((p) => extraction.votes[p.uid] === 'keep').length;

  // Majority ejects. A tie (or majority keep) spares them — back to the ballot.
  if (ejectCount <= keepCount) {
    return {
      ...state,
      phase: 'extraction_nominate',
      extraction: freshBallotRound((extraction.round ?? 1) + 1),
      players: state.players.map((p) => ({ ...p, extractionVote: null })),
      updatedAt: Date.now(),
    };
  }

  const allAccusedAreAliens = extraction.nominatedIds.every((id) => {
    const p = state.players.find((pl) => pl.uid === id);
    return p?.role === 'alien';
  });

  if (!allAccusedAreAliens) {
    return endGame(
      { ...state, extraction: { ...extraction, resolved: true, humansEjected: true } },
      'aliens',
      'The crew ejected an innocent crew member. Infiltrators win.'
    );
  }

  return endGame(
    { ...state, extraction: { ...extraction, resolved: true, humansEjected: false } },
    'humans',
    'Every infiltrator was ejected into space. Crew wins!'
  );
}

export function bioscannerSelectScanTarget(state: GameState, targetId: string): GameState {
  const target = state.players.find((p) => p.uid === targetId);
  if (!target) throw new Error('Target not found.');
  if (!allOperatorsMatched(state)) throw new Error('Operators must match glyphs first.');

  const next = {
    ...state,
    bioscanner: {
      ...state.bioscanner,
      scanTargetId: targetId,
      scanResult: target.role,
    },
    updatedAt: Date.now(),
  };

  return finalizeChamberRound(next);
}

function endGame(
  state: GameState,
  winner: 'humans' | 'aliens',
  winReason: string
): GameState {
  return {
    ...state,
    phase: 'game_over',
    winner,
    winReason,
    timerPaused: true,
    updatedAt: Date.now(),
  };
}

export function finishRoleReveal(state: GameState): GameState {
  return startCaptainPhase(state);
}

export function allOperatorsMatched(state: GameState): boolean {
  const { operatorIds, operatorSelections, captainGlyphs } = state.bioscanner;
  if (operatorIds.length !== 2) return false;

  return operatorIds.every((id) => {
    const selection = operatorSelections[id];
    if (!selection || selection.length !== captainGlyphs.length) return false;
    const sortedSel = [...selection].sort();
    const sortedCap = [...captainGlyphs].sort();
    return sortedSel.every((g, i) => g === sortedCap[i]);
  });
}

export interface AlienHackIntelRow {
  id: string;
  hackerName: string;
  targetName: string;
  targetId: string;
  applyAtRound: number;
  scheduledAt: number;
  applied: boolean;
  appliedAt?: number;
  effectLabel: string;
}

export interface AlienHackIntel {
  remaining: number;
  total: number;
  activeNow: AlienHackIntelRow[];
  queued: AlienHackIntelRow[];
  history: AlienHackIntelRow[];
}

function hackEffectLabel(state: GameState, targetId: string): string {
  const target = state.players.find((p) => p.uid === targetId);
  if (!target) return 'Prompts flipped';
  if (target.role === 'human') return 'Will see infiltrator prompts';
  return 'Will see crew prompts';
}

function mapHackRow(state: GameState, entry: import('@/types/game').HackEntry): AlienHackIntelRow {
  const target = state.players.find((p) => p.uid === entry.targetId);
  return {
    id: entry.id,
    hackerName: state.players.find((p) => p.uid === entry.alienId)?.displayName ?? 'Infiltrator',
    targetName: target?.displayName ?? 'Unknown',
    targetId: entry.targetId,
    applyAtRound: entry.applyAtRound,
    scheduledAt: entry.scheduledAt,
    applied: entry.applied,
    appliedAt: entry.appliedAt,
    effectLabel: entry.applied
      ? target?.role === 'human'
        ? 'Seeing infiltrator prompts'
        : 'Seeing crew prompts'
      : hackEffectLabel(state, entry.targetId),
  };
}

/** Full shared hack intel — visible to every infiltrator. */
export function getAlienHackIntel(state: GameState): AlienHackIntel {
  const rows = state.hackLog.map((h) => mapHackRow(state, h));
  return {
    remaining: state.hacksRemaining,
    total: state.hacksTotal,
    activeNow: rows.filter((r) => r.applied && state.players.find((p) => p.uid === r.targetId)?.isHacked),
    queued: rows.filter((r) => !r.applied),
    history: rows.filter((r) => r.applied),
  };
}

/** @deprecated Use getAlienHackIntel. */
export function getPartnerHackAlerts(
  state: GameState,
  viewerId: string
): { targetName: string; hackerName: string }[] {
  const viewer = state.players.find((p) => p.uid === viewerId);
  if (!viewer || viewer.role !== 'alien') return [];

  return state.hackLog.map((h) => ({
    targetName: state.players.find((p) => p.uid === h.targetId)?.displayName ?? 'Unknown',
    hackerName: state.players.find((p) => p.uid === h.alienId)?.displayName ?? 'Infiltrator',
  }));
}

export { TOTAL_TASKS };
