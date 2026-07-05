import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { applyGameAction, fetchGameState, submitPlayerAction } from '@/services/gameSync';
import { GameState } from '@/types/game';

export function useOptimisticGameActions(
  gameId: string | undefined,
  game: GameState | null,
  setGame: (state: GameState | null) => void
) {
  const [syncPending, setSyncPending] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;

  const rollback = useCallback(async () => {
    if (!gameId) return;
    const fresh = await fetchGameState(gameId);
    if (fresh) setGame(fresh);
  }, [gameId, setGame]);

  const runAction = useCallback(
    async (action: (s: GameState) => GameState) => {
      const current = gameRef.current;
      if (!current || !gameId) return;
      let optimistic: GameState;
      try {
        optimistic = action(current);
      } catch (e) {
        Alert.alert('Action failed', e instanceof Error ? e.message : 'Unknown error');
        return;
      }
      setGame(optimistic);
      try {
        await applyGameAction(gameId, current, action);
      } catch (e) {
        await rollback();
        Alert.alert('Action failed', e instanceof Error ? e.message : 'Unknown error');
      }
    },
    [gameId, setGame, rollback]
  );

  const runPlayerAction = useCallback(
    async (updater: (s: GameState) => GameState) => {
      const current = gameRef.current;
      if (!current || !gameId) return;
      let optimistic: GameState;
      try {
        optimistic = updater(current);
      } catch (e) {
        Alert.alert('Submit failed', e instanceof Error ? e.message : 'Unknown error');
        return;
      }
      setGame(optimistic);
      try {
        await submitPlayerAction(gameId, current, updater);
      } catch (e) {
        await rollback();
        Alert.alert('Submit failed', e instanceof Error ? e.message : 'Unknown error');
      }
    },
    [gameId, setGame, rollback]
  );

  const syncPhase = useCallback(
    async (updater: (s: GameState) => GameState) => {
      setSyncPending(true);
      try {
        await runPlayerAction(updater);
      } finally {
        setSyncPending(false);
      }
    },
    [runPlayerAction]
  );

  return { runAction, runPlayerAction, syncPhase, syncPending };
}
