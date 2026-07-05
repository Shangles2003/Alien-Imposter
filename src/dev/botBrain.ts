import * as engine from '@/game/engine';
import { getPromptForPlayer } from '@/game/prompts';
import { isDevBot } from '@/dev/config';
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
      return { promptShown, value: pickRandom(options) };
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
  | 'extraction_vote'
  | 'hack';

export interface BotActionPlan {
  botId: string;
  botName: string;
  kind: BotActionKind;
  description: string;
  run: (state: GameState) => GameState;
}

const SYNC_PHASES: GameState['phase'][] = ['role_reveal', 'chamber_boarding', 'chamber_results'];

const HACK_PHASES: GameState['phase'][] = [
  'chamber_boarding',
  'chamber_active',
  'chamber_results',
];

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
            if (!next.extraction?.votes[id]) {
              next = engine.castExtractionVote(next, id, 'eject');
            }
          }
          return next;
        },
      };
    }
  }

  if (HACK_PHASES.includes(state.phase) && state.hacksRemaining > 0) {
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
