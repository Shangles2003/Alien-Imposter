import * as engine from '@/game/engine';
import { getPromptForPlayer } from '@/game/prompts';
import { isDevBot } from '@/dev/config';
import { getCurrentModule } from '@/game/repairProtocol';
import { AgreementLevel, GamePlayer, GameState } from '@/types/game';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function aliveBots(state: GameState): GamePlayer[] {
  return state.players.filter((p) => p.isAlive && isDevBot(p.uid));
}

function pendingSyncBotIds(state: GameState): string[] {
  return aliveBots(state).filter((p) => !state.phaseReady[p.uid]).map((p) => p.uid);
}

function botRespondentIds(state: GameState): string[] {
  const alive = state.players.filter((p) => p.isAlive && isDevBot(p.uid));
  if (state.selectedChamber === 'bioscanner') {
    return state.bioscanner.operatorIds.filter((id) => isDevBot(id));
  }
  return alive.map((p) => p.uid);
}

function buildChamberResponse(
  state: GameState,
  player: GamePlayer
): Omit<import('@/types/game').ChamberResponse, 'playerId' | 'displayName'> {
  const chamber = state.selectedChamber!;
  const prompt = state.activePrompt!;
  const promptShown = getPromptForPlayer(prompt, player.role, player.isHacked);
  const effectiveAlien = player.role === 'alien' && !player.isHacked;

  switch (chamber) {
    case 'opinion_hold': {
      const humanPick: AgreementLevel = pickRandom(['strongly_agree', 'slightly_agree', 'slightly_disagree']);
      const alienPick: AgreementLevel = effectiveAlien
        ? pickRandom(['strongly_agree', 'slightly_agree', 'slightly_disagree', 'strongly_disagree'])
        : humanPick;
      return { promptShown, value: alienPick };
    }
    case 'deliberation_deck': {
      const options = prompt.options ?? ['Option A', 'Option B'];
      const i = Math.floor(Math.random() * options.length);
      // Store the English option + its index so each viewer can see it in their
      // own language (see chamberFormat / localizedDeliberationOption).
      return { promptShown, value: options[i], optionIndex: i, promptId: prompt.promptId };
    }
    case 'writing_pod': {
      const answers = [
        'pizza',
        'tacos',
        'sushi',
        'mac and cheese',
        'sleeping in',
        'teleportation',
        'invisibility',
        'Mr. Brightside',
        'Bohemian Rhapsody',
        'coffee',
        'Wi-Fi',
        'my phone',
        'pineapple on pizza',
        'doing my own taxes',
        'a nap',
        'chocolate',
      ];
      return { promptShown, value: pickRandom(answers) };
    }
    case 'drawing_quarters':
      return {
        promptShown,
        value: 'drawing',
        drawingPaths: JSON.stringify(
          effectiveAlien
            ? pickRandom([
                ['M30,10 L70,10 L50,70 Z'],
                ['M20,20 L60,20 L60,60 L20,60 Z'],
                ['M10,60 Q40,10 70,60 T130,60'],
              ])
            : ['M10,60 Q40,10 70,60 T130,60', 'M30,10 L70,10 L50,70 Z']
        ),
      };
    case 'most_likely_to': {
      const candidates = state.players.filter((p) => p.isAlive);
      const target = pickRandom(candidates);
      return {
        promptShown,
        value: target.displayName,
        selectedPlayerId: target.uid,
      };
    }
    default:
      return { promptShown, value: 'ok' };
  }
}

function botSubmitAllChamberResponses(state: GameState): GameState {
  let next = state;
  const pending = botRespondentIds(next).filter((id) => !next.chamberResponses[id]);
  for (const botId of pending) {
    const player = next.players.find((p) => p.uid === botId);
    if (!player) continue;
    next = engine.submitChamberResponse(next, botId, buildChamberResponse(next, player));
  }
  return next;
}

function botSubmitBioscannerGlyphs(state: GameState, botId: string): GameState {
  const player = state.players.find((p) => p.uid === botId);
  if (!player) return state;

  const glyphs = [...state.bioscanner.captainGlyphs];
  return {
    ...state,
    bioscanner: {
      ...state.bioscanner,
      operatorSelections: { ...state.bioscanner.operatorSelections, [botId]: glyphs },
    },
    chamberResponses: {
      ...state.chamberResponses,
      [botId]: {
        playerId: botId,
        displayName: player.displayName,
        promptShown: 'Bio Scanner glyphs',
        value: 'matched',
        selectedGlyphs: glyphs,
      },
    },
    updatedAt: Date.now(),
  };
}

function botSubmitAllBioscannerGlyphs(state: GameState): GameState {
  let next = state;
  const pending = state.bioscanner.operatorIds.filter(
    (id) => isDevBot(id) && !next.chamberResponses[id]
  );
  for (const botId of pending) {
    next = botSubmitBioscannerGlyphs(next, botId);
  }
  return next;
}

export type BotActionKind =
  | 'phase_sync'
  | 'chamber_response'
  | 'bioscanner_glyphs'
  | 'bioscanner_scan'
  | 'identity_nomination'
  | 'identity_repair'
  | 'identity_scan_ack'
  | 'extraction_ballot'
  | 'extraction_vote'
  | 'hack';

export interface BotActionPlan {
  botId: string;
  botName: string;
  kind: BotActionKind;
  description: string;
  run: (state: GameState) => GameState;
}

const SYNC_PHASES: GameState['phase'][] = ['role_reveal', 'chamber_results', 'identity_debrief'];

function botExecuteRepairStep(state: GameState, operatorId: string): GameState {
  const repair = state.identityCheck?.repair;
  if (!repair || repair.operatorId !== operatorId) return state;

  const module = getCurrentModule(repair);
  if (!module) return state;

  const player = state.players.find((p) => p.uid === operatorId);
  // A saboteur operator occasionally "misreads" and locks in a wrong answer,
  // burning a strike — deniable, just like a human throw.
  const sabotage = player?.role === 'alien' && Math.random() < 0.25;

  if (module.type === 'conduit') {
    if (sabotage) {
      const wrong = module.conduits.find((c) => c.id !== module.solution.cutId);
      if (wrong) return engine.submitConduitCut(state, operatorId, wrong.id);
    }
    return engine.submitConduitCut(state, operatorId, module.solution.cutId);
  }

  if (module.type === 'glyph_lock') {
    const order = [...module.solution.order];
    if (sabotage && order.length >= 2) {
      [order[0], order[1]] = [order[1]!, order[0]!]; // swap first two
    }
    return engine.submitGlyphOrder(state, operatorId, order);
  }

  if (module.type === 'frequency') {
    const code = [...module.solution.code];
    if (sabotage) code[0] = (code[0]! + 1) % 10;
    return engine.submitFrequencyCode(state, operatorId, code);
  }

  return state;
}

function botAlienIds(state: GameState): Set<string> {
  return new Set(
    state.players
      .filter((p) => p.isAlive && isDevBot(p.uid) && p.role === 'alien')
      .map((p) => p.uid)
  );
}

/** Bot aliens share the pool — at most one bot hack per mission round. */
function botAlreadyHackedThisRound(state: GameState): boolean {
  const aliens = botAlienIds(state);
  return state.hackLog.some((h) => aliens.has(h.alienId) && h.applyAtRound === state.round);
}

function shouldBotScheduleHack(state: GameState): boolean {
  if (state.phase !== 'chamber_boarding') return false;
  if (state.hacksRemaining <= 0) return false;
  if (botAlreadyHackedThisRound(state)) return false;
  return true;
}

export function getNextBotAction(state: GameState): BotActionPlan | null {
  if (state.phase === 'game_over') return null;

  if (SYNC_PHASES.includes(state.phase)) {
    const pending = pendingSyncBotIds(state);
    if (pending.length) {
      return {
        botId: pending[0]!,
        botName: 'Crew bots',
        kind: 'phase_sync',
        description: 'crew sync',
        run: (s) => engine.markPhaseReadyBatch(s, pendingSyncBotIds(s)),
      };
    }
  }

  if (state.phase === 'chamber_active' && state.selectedChamber === 'bioscanner') {
    const pendingOperators = state.bioscanner.operatorIds.filter(
      (id) => isDevBot(id) && !state.chamberResponses[id]
    );
    if (pendingOperators.length) {
      return {
        botId: pendingOperators[0]!,
        botName: 'Operators',
        kind: 'bioscanner_glyphs',
        description: 'glyph match',
        run: botSubmitAllBioscannerGlyphs,
      };
    }

    const captainId = state.captainId;
    if (
      captainId &&
      isDevBot(captainId) &&
      engine.allOperatorsMatched(state) &&
      !state.bioscanner.scanTargetId
    ) {
      const captain = state.players.find((p) => p.uid === captainId);
      const target = pickRandom(state.players.filter((p) => p.isAlive));
      return {
        botId: captainId,
        botName: captain?.displayName ?? 'Bot',
        kind: 'bioscanner_scan',
        description: 'bio scan',
        run: (s) => engine.bioscannerSelectScanTarget(s, target.uid),
      };
    }
  }

  if (state.phase === 'chamber_active') {
    const pending = botRespondentIds(state).filter((id) => !state.chamberResponses[id]);
    if (pending.length) {
      return {
        botId: pending[0]!,
        botName: 'Crew bots',
        kind: 'chamber_response',
        description: 'task responses',
        run: botSubmitAllChamberResponses,
      };
    }
  }

  if (state.phase === 'identity_nominate') {
    const pending = aliveBots(state).filter(
      (p) => !state.identityCheck?.nominations[p.uid]
    );
    if (pending.length) {
      const ids = pending.map((p) => p.uid);
      return {
        botId: ids[0]!,
        botName: 'Crew bots',
        kind: 'identity_nomination',
        description: 'identity nomination',
        run: (s) => {
          let next = s;
          for (const id of ids) {
            if (next.phase !== 'identity_nominate') break;
            if (next.identityCheck?.nominations[id]) continue;
            const candidates = next.players.filter((p) => p.isAlive && p.uid !== id);
            const target = pickRandom(candidates);
            next = engine.submitIdentityNomination(next, id, target.uid);
          }
          return next;
        },
      };
    }
  }

  if (state.phase === 'identity_coop') {
    const repair = state.identityCheck?.repair;
    const operatorId = repair?.operatorId;
    if (operatorId && isDevBot(operatorId)) {
      const operator = state.players.find((p) => p.uid === operatorId);
      return {
        botId: operatorId,
        botName: operator?.displayName ?? 'Operator',
        kind: 'identity_repair',
        description: 'repair protocol',
        run: (s) => botExecuteRepairStep(s, operatorId),
      };
    }
  }

  if (state.phase === 'identity_scan') {
    const captainId = state.captainId;
    if (captainId && isDevBot(captainId)) {
      const captain = state.players.find((p) => p.uid === captainId);
      return {
        botId: captainId,
        botName: captain?.displayName ?? 'Captain',
        kind: 'identity_scan_ack',
        description: 'acknowledge scan',
        run: (s) => engine.captainAcknowledgeScan(s, captainId),
      };
    }
  }

  if (state.phase === 'extraction_nominate') {
    const pendingBallots = aliveBots(state).filter(
      (p) => !Array.isArray(state.extraction?.ballots?.[p.uid])
    );
    if (pendingBallots.length) {
      const ids = pendingBallots.map((p) => p.uid);
      return {
        botId: ids[0]!,
        botName: 'Crew bots',
        kind: 'extraction_ballot',
        description: 'accusation ballots',
        run: (s) => {
          let next = s;
          for (const id of ids) {
            if (next.phase !== 'extraction_nominate') break;
            if (Array.isArray(next.extraction?.ballots?.[id])) continue;
            const candidates = next.players.filter((p) => p.isAlive && p.uid !== id);
            const picks = [...candidates]
              .sort(() => Math.random() - 0.5)
              .slice(0, next.alienCount)
              .map((p) => p.uid);
            next = engine.submitExtractionBallot(next, id, picks);
          }
          return next;
        },
      };
    }
  }

  if (state.phase === 'extraction_vote') {
    const pendingVoters = aliveBots(state).filter((p) => !state.extraction?.votes[p.uid]);
    if (pendingVoters.length) {
      const ids = pendingVoters.map((p) => p.uid);
      return {
        botId: ids[0]!,
        botName: 'Crew bots',
        kind: 'extraction_vote',
        description: 'eject vote',
        run: (s) => {
          let next = s;
          for (const id of ids) {
            if (next.phase !== 'extraction_vote') break;
            if (!next.extraction?.votes[id]) {
              next = engine.castExtractionVote(next, id, 'eject');
            }
          }
          return next;
        },
      };
    }
  }

  if (shouldBotScheduleHack(state)) {
    const alienBots = aliveBots(state).filter((p) => p.role === 'alien');
    const hacker = alienBots[0];
    if (hacker) {
      return {
        botId: hacker.uid,
        botName: hacker.displayName,
        kind: 'hack',
        description: 'schedule hack',
        run: (s) => {
          const hackSelf = Math.random() < 0.35;
          if (hackSelf) {
            return engine.scheduleHack(s, hacker.uid, hacker.uid);
          }
          const targets = s.players.filter(
            (p) => p.isAlive && p.uid !== hacker.uid && p.role === 'human'
          );
          if (!targets.length) {
            return engine.scheduleHack(s, hacker.uid, hacker.uid);
          }
          return engine.scheduleHack(s, hacker.uid, pickRandom(targets).uid);
        },
      };
    }
  }

  return null;
}
