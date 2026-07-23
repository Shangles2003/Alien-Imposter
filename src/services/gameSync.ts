import { supabase } from '@/config/supabase';
import { rowToGameState } from '@/services/lobby';
import { GameState } from '@/types/game';
import * as engine from '@/game/engine';

export function subscribeToGame(
  gameId: string,
  callback: (state: GameState | null) => void
): () => void {
  const load = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();

    if (error || !data) {
      callback(null);
      return;
    }

    callback(rowToGameState({ ...data, state: data.state as GameState }));
  };

  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => {
        // Use the realtime payload directly instead of re-fetching — this cuts a
        // full network round-trip off every update, so other players see each
        // action a beat sooner and with less re-render churn. Fall back to a
        // fetch only if the row didn't come through (e.g. oversized payload).
        const row = payload.new as
          | { id?: string; lobby_id?: string; host_id?: string; state?: GameState }
          | undefined;
        if (row?.id && row.lobby_id && row.host_id && row.state) {
          callback(
            rowToGameState({
              id: row.id,
              lobby_id: row.lobby_id,
              host_id: row.host_id,
              state: row.state,
            })
          );
        } else {
          load();
        }
      }
    )
    .subscribe();

  load();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function fetchGameState(gameId: string): Promise<GameState | null> {
  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).maybeSingle();
  if (error || !data) return null;
  return rowToGameState({ ...data, state: data.state as GameState });
}

export async function updateGameState(gameId: string, state: GameState): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({
      state,
      host_id: state.hostId,
      lobby_id: state.lobbyId,
    })
    .eq('id', gameId);

  if (error) throw error;
}

export async function applyGameAction(
  gameId: string,
  _currentState: GameState,
  action: (state: GameState) => GameState
): Promise<GameState> {
  const current = (await fetchGameState(gameId)) ?? _currentState;
  let next = action(current);
  const expired = engine.checkTimerExpired(next);
  if (expired) next = expired;

  await updateGameState(gameId, next);
  return next;
}

export async function submitPlayerAction(
  gameId: string,
  _currentState: GameState,
  updater: (state: GameState) => GameState
): Promise<void> {
  const current = (await fetchGameState(gameId)) ?? _currentState;
  let next = updater(current);
  const expired = engine.checkTimerExpired(next);
  if (expired) next = expired;
  await updateGameState(gameId, next);
}
