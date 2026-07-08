import { GamePhase } from '@/types/game';

export const CREW_SYNC_PHASES: GamePhase[] = [
  'role_reveal',
  'chamber_results',
  'identity_debrief',
];

export function isCrewSyncPhase(phase: GamePhase): boolean {
  return CREW_SYNC_PHASES.includes(phase);
}

export function isAllCrewReady(game: {
  phase: GamePhase;
  phaseReady: Record<string, boolean>;
  players: { uid: string; isAlive: boolean }[];
}): boolean {
  const alive = game.players.filter((p) => p.isAlive);
  return alive.length > 0 && alive.every((p) => Boolean(game.phaseReady[p.uid]));
}
