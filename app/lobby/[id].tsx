import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  CrewRow,
  GlowCard,
  LoadingState,
  LobbyCodeDisplay,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import { HostSettingsPanel } from '@/components/settings/HostSettingsPanel';
import { isDevModeEnabled } from '@/dev/config';
import { useDevBotLobbyRunner } from '@/dev/useDevBotLobbyRunner';
import { MIN_PLAYERS } from '@/game/rules';
import { isDevLobby, leaveLobby, setPlayerReady, startGame, subscribeToLobby, updateLobbyHostSettings } from '@/services/lobby';
import { Lobby } from '@/types/game';
import { colors, spacing, typography } from '@/theme';

export default function LobbyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { hasPremiumAccess, ownedContentPacks } = usePremium();
  const router = useRouter();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(false);

  useDevBotLobbyRunner(id, lobby);

  useEffect(() => {
    if (!id || id === 'join') return;
    return subscribeToLobby(id, (l) => {
      setLobby(l);
      if (l?.status === 'in_game' && l.gameId) {
        router.replace(`/game/${l.gameId}`);
      }
    });
  }, [id, router]);

  if (!id || id === 'join') return null;
  if (!lobby) return <LoadingState message="Docking at lobby..." />;

  const me = lobby.players.find((p) => p.uid === user?.id);
  const isHost = lobby.hostId === user?.id;
  const allReady = lobby.players.every((p) => p.isReady);
  const canStart = lobby.players.length >= MIN_PLAYERS && allReady;
  const devLobby = isDevLobby(lobby);

  const handleReady = async () => {
    if (!lobby || !user) return;
    await setPlayerReady(lobby.id, user.id, !me?.isReady);
  };

  const handleStart = async () => {
    if (!lobby || !user) return;
    setLoading(true);
    try {
      const gameId = await startGame(lobby.id, user.id);
      router.replace(`/game/${gameId}`);
    } catch (e) {
      Alert.alert('Launch failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (lobby && user) await leaveLobby(lobby.id, user.id);
    router.back();
  };

  const missionLabel = `${lobby.hostSettings.missionCount} missions`;
  const packLabel =
    lobby.hostSettings.contentPacks.length > 1
      ? `${lobby.hostSettings.contentPacks.length} packs`
      : 'Core Crew';

  const handleHostSettingsChange = async (next: typeof lobby.hostSettings) => {
    if (!lobby || !user || !isHost) return;
    try {
      await updateLobbyHostSettings(
        lobby.id,
        user.id,
        next,
        ownedContentPacks,
        hasPremiumAccess
      );
    } catch (e) {
      Alert.alert('Settings error', e instanceof Error ? e.message : 'Could not save settings');
    }
  };

  return (
    <ScreenShell scroll>
      <ScreenHeader title="Mission Lobby" subtitle="Get ready before launch" icon="🛸" />

      <LobbyCodeDisplay code={lobby.code} />

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {lobby.players.length}/{lobby.maxPlayers} crew aboard
        </Text>
        <Text style={styles.metaNeed}>Need {MIN_PLAYERS}+ to launch</Text>
      </View>

      <Text style={styles.rulesBrief}>
        {missionLabel} · {packLabel} · 4–5 = 1 infiltrator · 6–10 = 2
      </Text>

      {isHost && (
        <HostSettingsPanel
          settings={lobby.hostSettings}
          onChange={handleHostSettingsChange}
          disabled={loading}
        />
      )}

      {devLobby && isDevModeEnabled() && (
        <GlowCard accent="cyan">
          <Text style={styles.devBanner}>
            🧪 Dev lobby — bots are ready. Launch and play the full mission solo.
          </Text>
        </GlowCard>
      )}

      <SectionLabel>Crew Roster</SectionLabel>
      {lobby.players.map((p) => (
        <CrewRow
          key={p.uid}
          name={p.displayName}
          color={p.avatarColor}
          isHost={p.isHost}
          isReady={p.isReady}
          isMe={p.uid === user?.id}
        />
      ))}

      <View style={styles.actions}>
        <Button
          title={me?.isReady ? '✓ Ready — Tap to Unready' : '🎯 Ready Up!'}
          variant={me?.isReady ? 'success' : 'primary'}
          fullWidth
          onPress={handleReady}
        />
        {isHost && (
          <Button
            title={canStart ? '🚀 Launch Mission' : `Waiting (${lobby.players.length}/${MIN_PLAYERS} crew)`}
            fullWidth
            loading={loading}
            disabled={!canStart}
            onPress={handleStart}
          />
        )}
        <Button title="Leave Lobby" variant="ghost" fullWidth onPress={handleLeave} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  meta: { ...typography.caption, color: colors.textMuted },
  metaNeed: { ...typography.small, color: colors.accentSoft },
  rulesBrief: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  devBanner: {
    ...typography.caption,
    color: colors.accentSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
