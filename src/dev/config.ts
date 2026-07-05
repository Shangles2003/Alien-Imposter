import { GameState } from '@/types/game';

export const DEV_BOT_PREFIX = 'dev-bot-';

/** Dev tools only run in development builds. */
export function isDevModeEnabled(): boolean {
  return __DEV__;
}

export function isDevBot(uid: string): boolean {
  return uid.startsWith(DEV_BOT_PREFIX);
}

export function isDevGame(state: GameState): boolean {
  return (
    state.isDevMode === true || state.players.some((p) => isDevBot(p.uid))
  );
}

export function isHumanPlayer(uid: string): boolean {
  return !isDevBot(uid);
}
