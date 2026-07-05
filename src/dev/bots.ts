import { LobbyPlayer } from '@/types/game';
import { pickAvatarColor } from '@/game/rules';
import { DEV_BOT_PREFIX } from '@/dev/config';

const BOT_NAMES = ['Ripley', 'Hicks', 'Newt', 'Bishop', 'Burke', 'Gorman', 'Vasquez', 'Hudson'];

export function createDevBotPlayers(count: number): LobbyPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    uid: `${DEV_BOT_PREFIX}${i + 1}`,
    displayName: `Bot ${BOT_NAMES[i] ?? `#${i + 1}`}`,
    avatarColor: pickAvatarColor(i + 1),
    isHost: false,
    isReady: true,
    joinedAt: Date.now(),
  }));
}

/** Total crew size including the human host. */
export function devLobbySize(extraBots: number): number {
  return 1 + extraBots;
}
