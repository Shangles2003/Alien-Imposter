import * as Crypto from 'expo-crypto';
import { supabase } from '@/config/supabase';
import {
  ContentPackId,
  DEFAULT_HOST_SETTINGS,
  HostSettings,
  normalizeHostSettings,
  ownedPacksForPremium,
  sanitizeHostSettingsForEntitlements,
} from '@/content/types';
import { CustomPrompt, Lobby, LobbyPlayer, PlayerProfile, GameState } from '@/types/game';
import { createInitialGameState } from '@/game/engine';
import { fetchMyCustomPrompts } from '@/services/customDecks';
import { generateLobbyCode, MAX_PLAYERS, MIN_PLAYERS } from '@/game/rules';
import { createDevBotPlayers } from '@/dev/bots';
import { isDevBot, isDevModeEnabled } from '@/dev/config';

function rowToLobby(row: {
  id: string;
  code: string;
  host_id: string;
  is_public: boolean;
  status: string;
  max_players: number;
  min_players: number;
  players: LobbyPlayer[];
  game_id: string | null;
  host_settings?: HostSettings | null;
  created_at: string;
}): Lobby {
  return {
    id: row.id,
    code: row.code,
    hostId: row.host_id,
    isPublic: row.is_public,
    status: row.status as Lobby['status'],
    maxPlayers: row.max_players,
    minPlayers: row.min_players,
    players: row.players ?? [],
    gameId: row.game_id,
    hostSettings: normalizeHostSettings(row.host_settings),
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function createLobby(host: PlayerProfile): Promise<Lobby> {
  const code = generateLobbyCode();

  const hostPlayer: LobbyPlayer = {
    uid: host.uid,
    displayName: host.displayName,
    avatarColor: host.avatarColor,
    isHost: true,
    isReady: true,
    joinedAt: Date.now(),
  };

  const { data, error } = await supabase
    .from('lobbies')
    .insert({
      code,
      host_id: host.uid,
      is_public: false,
      status: 'waiting',
      max_players: MAX_PLAYERS,
      min_players: MIN_PLAYERS,
      players: [hostPlayer],
      host_settings: DEFAULT_HOST_SETTINGS,
    })
    .select('*')
    .single();

  if (error) throw error;
  return rowToLobby({ ...data, players: data.players as LobbyPlayer[] });
}

/** Dev-only: creates a lobby pre-filled with bot crew for solo testing. */
export async function createDevLobby(
  host: PlayerProfile,
  totalPlayers: 4 | 6 = 4
): Promise<Lobby> {
  if (!isDevModeEnabled()) {
    throw new Error('Dev mode is only available in development builds.');
  }

  const botCount = totalPlayers - 1;
  const bots = createDevBotPlayers(botCount);
  const code = generateLobbyCode();

  const hostPlayer: LobbyPlayer = {
    uid: host.uid,
    displayName: host.displayName,
    avatarColor: host.avatarColor,
    isHost: true,
    isReady: true,
    joinedAt: Date.now(),
  };

  const players = [hostPlayer, ...bots];

  const { data, error } = await supabase
    .from('lobbies')
    .insert({
      code,
      host_id: host.uid,
      is_public: false,
      status: 'waiting',
      max_players: MAX_PLAYERS,
      min_players: MIN_PLAYERS,
      players,
      host_settings: DEFAULT_HOST_SETTINGS,
    })
    .select('*')
    .single();

  if (error) throw error;
  return rowToLobby({ ...data, players: data.players as LobbyPlayer[] });
}

export function isDevLobby(lobby: Lobby): boolean {
  return lobby.players.some((p) => isDevBot(p.uid));
}

export async function joinLobbyByCode(
  code: string,
  profile: PlayerProfile
): Promise<Lobby> {
  const { data, error } = await supabase.rpc('join_lobby_by_code', {
    p_code: code.toUpperCase(),
    p_display_name: profile.displayName,
    p_avatar_color: profile.avatarColor,
  });

  if (error) {
    const msg = error.message ?? 'Could not join lobby.';
    throw new Error(msg);
  }

  if (!data) throw new Error('Lobby not found. Check the code and try again.');

  const row = data as {
    id: string;
    code: string;
    host_id: string;
    is_public: boolean;
    status: string;
    max_players: number;
    min_players: number;
    players: LobbyPlayer[];
    game_id: string | null;
    host_settings?: HostSettings | null;
    created_at: string;
  };

  return rowToLobby({ ...row, players: row.players ?? [] });
}

/** Navigate to lobby or active game after joining by code. */
export function getPostJoinPath(lobby: Lobby): `/lobby/${string}` | `/game/${string}` {
  if (lobby.status === 'in_game' && lobby.gameId) {
    return `/game/${lobby.gameId}`;
  }
  return `/lobby/${lobby.id}`;
}

export async function leaveLobby(lobbyId: string, uid: string): Promise<void> {
  const { data: row, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (error) throw error;
  if (!row) return;

  const lobby = rowToLobby({ ...row, players: row.players as LobbyPlayer[] });
  const remaining = lobby.players.filter((p) => p.uid !== uid);

  if (remaining.length === 0) {
    await supabase.from('lobbies').delete().eq('id', lobbyId);
    return;
  }

  const wasHost = lobby.hostId === uid;
  const updated = remaining.map((p, i) => ({
    ...p,
    isHost: wasHost && i === 0 ? true : p.isHost,
  }));

  if (wasHost) {
    updated[0]!.isHost = true;
  }

  await supabase
    .from('lobbies')
    .update({
      players: updated,
      host_id: wasHost ? updated[0]!.uid : lobby.hostId,
    })
    .eq('id', lobbyId);
}

export async function setPlayerReady(lobbyId: string, uid: string, ready: boolean): Promise<void> {
  const { data: row, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (error) throw error;
  if (!row) throw new Error('Lobby not found.');

  const lobby = rowToLobby({ ...row, players: row.players as LobbyPlayer[] });
  const players = lobby.players.map((p) =>
    p.uid === uid ? { ...p, isReady: ready } : p
  );

  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ players })
    .eq('id', lobbyId);

  if (updateError) throw updateError;
}

/** Mark every dev bot ready in the lobby (solo practice). */
export async function readyAllDevBots(lobbyId: string): Promise<void> {
  const { data: row, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (error) throw error;
  if (!row) throw new Error('Lobby not found.');

  const lobby = rowToLobby({ ...row, players: row.players as LobbyPlayer[] });
  const needsUpdate = lobby.players.some((p) => isDevBot(p.uid) && !p.isReady);
  if (!needsUpdate) return;

  const players = lobby.players.map((p) =>
    isDevBot(p.uid) ? { ...p, isReady: true } : p
  );

  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ players })
    .eq('id', lobbyId);

  if (updateError) throw updateError;
}

export async function startGame(
  lobbyId: string,
  hostId: string,
  hasPremium: boolean
): Promise<string> {
  const { data: row, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (error) throw error;
  if (!row) throw new Error('Lobby not found.');

  const lobby = rowToLobby({ ...row, players: row.players as LobbyPlayer[] });

  if (lobby.hostId !== hostId) throw new Error('Only the host can start the game.');
  if (lobby.players.length < lobby.minPlayers) {
    throw new Error(`Need at least ${lobby.minPlayers} players.`);
  }
  if (!lobby.players.every((p) => p.isReady)) {
    throw new Error('All players must be ready.');
  }

  const gameId = Crypto.randomUUID();
  const devMode = lobby.players.some((p) => isDevBot(p.uid));
  // The host's live entitlement is authoritative at launch — this covers hosts
  // who never opened settings, and re-clamps stages/library to what they own.
  const effectiveSettings = sanitizeHostSettingsForEntitlements(
    normalizeHostSettings(lobby.hostSettings),
    ownedPacksForPremium(hasPremium),
    hasPremium
  );
  // Bake the host's personal deck into the shared game state so any client can
  // draw from it during selection (the captain — not always the host — picks).
  let customPrompts: CustomPrompt[] = [];
  if (effectiveSettings.useCustomDeck) {
    try {
      customPrompts = await fetchMyCustomPrompts();
    } catch {
      customPrompts = [];
    }
  }
  // Backstop: a custom-only game needs a real deck. If they turned off every
  // pack but don't have enough custom prompts, keep the base pack on.
  if (effectiveSettings.contentPacks.length === 0 && customPrompts.length < 7) {
    effectiveSettings.contentPacks = ['core'];
  }
  const gameState = createInitialGameState(
    gameId,
    lobbyId,
    hostId,
    lobby.players,
    devMode,
    effectiveSettings,
    customPrompts
  );

  const { error: gameError } = await supabase.from('games').insert({
    id: gameId,
    lobby_id: lobbyId,
    host_id: hostId,
    state: gameState,
  });

  if (gameError) throw gameError;

  const { error: lobbyError } = await supabase
    .from('lobbies')
    .update({ status: 'in_game', game_id: gameId })
    .eq('id', lobbyId);

  if (lobbyError) throw lobbyError;
  return gameId;
}

export function subscribeToLobby(
  lobbyId: string,
  callback: (lobby: Lobby | null) => void
): () => void {
  const channel = supabase
    .channel(`lobby:${lobbyId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      async () => {
        const { data } = await supabase.from('lobbies').select('*').eq('id', lobbyId).maybeSingle();
        if (!data) {
          callback(null);
          return;
        }
        callback(rowToLobby({ ...data, players: data.players as LobbyPlayer[] }));
      }
    )
    .subscribe();

  supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .maybeSingle()
    .then(({ data }) => {
      if (!data) callback(null);
      else callback(rowToLobby({ ...data, players: data.players as LobbyPlayer[] }));
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getLobbyByCode(code: string): Promise<Lobby | null> {
  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToLobby({ ...data, players: data.players as LobbyPlayer[] });
}

export async function deleteLobby(lobbyId: string): Promise<void> {
  const { error } = await supabase.from('lobbies').delete().eq('id', lobbyId);
  if (error) throw error;
}

export async function updateLobbyHostSettings(
  lobbyId: string,
  hostId: string,
  settings: HostSettings,
  ownedPacks: ContentPackId[],
  hasPremium: boolean
): Promise<Lobby> {
  const sanitized = sanitizeHostSettingsForEntitlements(
    normalizeHostSettings(settings),
    ownedPacks,
    hasPremium
  );

  const { data, error } = await supabase
    .from('lobbies')
    .update({ host_settings: sanitized })
    .eq('id', lobbyId)
    .eq('host_id', hostId)
    .select('*')
    .single();

  if (error) throw error;
  return rowToLobby({ ...data, players: data.players as LobbyPlayer[] });
}

export function rowToGameState(row: {
  id: string;
  lobby_id: string;
  host_id: string;
  state: GameState;
}): GameState {
  const state = row.state as GameState;
  return {
    ...state,
    id: row.id,
    lobbyId: row.lobby_id,
    hostId: row.host_id,
    totalTasks: state.totalTasks ?? 5,
    contentPacks: state.contentPacks ?? ['core'],
    fullLibrary: state.fullLibrary ?? true,
    customPrompts: state.customPrompts ?? [],
    winReasonKey: state.winReasonKey ?? null,
    usedChambers: state.usedChambers ?? [],
    timerEndsAt: state.timerEndsAt ?? null,
    isDevMode: state.isDevMode ?? state.players?.some((p) => p.uid.startsWith('dev-bot-')),
    phaseReady: state.phaseReady ?? {},
    identityCheck: state.identityCheck ?? null,
    hackLog:
      state.hackLog ??
      (state as GameState & { hacksUsed?: { alienId: string; targetId: string; usedAt: number }[] }).hacksUsed?.map(
        (h, i) => ({
          id: `legacy-${i}`,
          alienId: h.alienId,
          targetId: h.targetId,
          scheduledAt: h.usedAt,
          applyAtRound: 0,
          applied: true,
          appliedAt: h.usedAt,
        })
      ) ??
      [],
  };
}
