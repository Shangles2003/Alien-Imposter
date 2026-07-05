import { useEffect } from 'react';
import { isDevBot, isDevModeEnabled } from '@/dev/config';
import { isDevLobby, readyAllDevBots } from '@/services/lobby';
import { Lobby } from '@/types/game';

export function useDevBotLobbyRunner(lobbyId: string | undefined, lobby: Lobby | null): void {
  const readyKey = lobby
    ? lobby.players.map((p) => `${p.uid}:${p.isReady ? 1 : 0}`).join(',')
    : '';

  useEffect(() => {
    if (!lobbyId || !lobby || !isDevModeEnabled() || !isDevLobby(lobby)) return;
    if (lobby.status !== 'waiting') return;

    const unreadyBots = lobby.players.some((p) => isDevBot(p.uid) && !p.isReady);
    if (!unreadyBots) return;

    const timer = setTimeout(() => {
      readyAllDevBots(lobbyId).catch((e) => console.warn('[dev] bot ready failed:', e));
    }, 300);

    return () => clearTimeout(timer);
  }, [lobbyId, lobby?.status, readyKey]);
}
