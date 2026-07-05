import { MissionCount } from '@/content/types';
import { ChamberType } from '@/types/game';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 10;
export const TOTAL_TASKS = 5;

/** Core chambers used across the 5 mandatory tasks (one each). */
export const CORE_CHAMBERS: ChamberType[] = [
  'opinion_hold',
  'drawing_quarters',
  'writing_pod',
  'most_likely_to',
  'deliberation_deck',
];

export const BIOSCANNER_UNLOCK_ROUND = 3;

export interface GameRules {
  alienCount: number;
  hacksTotal: number;
  maxTestees: number;
  totalTasks: number;
}

export function getAlienCount(playerCount: number): number {
  const count = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, playerCount));
  return count <= 5 ? 1 : 2;
}

export function getHacksTotal(alienCount: number): number {
  return alienCount * 2;
}

export function getMaxTestees(playerCount: number): number {
  if (playerCount <= 5) return 2;
  if (playerCount <= 7) return 3;
  return 4;
}

export function getRulesForPlayerCount(count: number, missionCount: MissionCount = TOTAL_TASKS as MissionCount): GameRules {
  const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));
  const alienCount = getAlienCount(clamped);
  return {
    alienCount,
    hacksTotal: getHacksTotal(alienCount),
    maxTestees: getMaxTestees(clamped),
    totalTasks: missionCount,
  };
}

export function generateLobbyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function pickRandomCaptain(playerIds: string[], excludeId?: string): string {
  const pool = excludeId ? playerIds.filter((id) => id !== excludeId) : playerIds;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Fixed mission order — one chamber per round, no captain pick. */
export function getMissionChambers(totalTasks: number): ChamberType[] {
  const count = Math.max(1, Math.min(totalTasks, 10));
  if (count <= CORE_CHAMBERS.length) {
    return CORE_CHAMBERS.slice(0, count);
  }
  const extra = CORE_CHAMBERS.slice(0, count - CORE_CHAMBERS.length);
  return [...CORE_CHAMBERS, ...extra];
}

export function getChamberForRound(round: number, totalTasks = TOTAL_TASKS): ChamberType {
  const chambers = getMissionChambers(totalTasks);
  const index = Math.max(0, Math.min(round - 1, chambers.length - 1));
  return chambers[index]!;
}

export function getAvailableChambers(
  usedChambers: ChamberType[],
  round: number
): ChamberType[] {
  const remaining = CORE_CHAMBERS.filter((c) => !usedChambers.includes(c));
  if (remaining.length > 0) return remaining;

  if (round >= BIOSCANNER_UNLOCK_ROUND) {
    return ['bioscanner'];
  }

  return [...CORE_CHAMBERS];
}

export function assignRoles(
  playerIds: string[],
  alienCount: number
): Record<string, 'human' | 'alien'> {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  const roles: Record<string, 'human' | 'alien'> = {};
  shuffled.forEach((id, index) => {
    roles[id] = index < alienCount ? 'alien' : 'human';
  });
  return roles;
}

export const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
];

export function pickAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]!;
}
