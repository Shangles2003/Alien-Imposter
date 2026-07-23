import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Button,
  CrewRow,
  GlowCard,
  LoadingState,
  LobbyCodeDisplay,
  ScreenShell,
  ScreenTopBar,
  SectionLabel,
} from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import { HostSettingsPanel } from '@/components/settings/HostSettingsPanel';
import { PlayerModerationSheet, ModerationPlayer } from '@/components/moderation/PlayerModerationSheet';
import { isDevBot, isDevModeEnabled } from '@/dev/config';
import { useDevBotLobbyRunner } from '@/dev/useDevBotLobbyRunner';
import { MIN_PLAYERS } from '@/game/rules';
import {
  isDevLobby,
  leaveLobby,
  setPlayerReady,
  startGame,
  subscribeToLobby,
  updateLobbyHostSettings,
} from '@/services/lobby';
import { fetchMyCustomPrompts } from '@/services/customDecks';
import { Lobby } from '@/types/game';
import { errorMessage } from '@/utils/errors';
import { colors, radius, spacing, typography } from '@/theme';

export default function LobbyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { hasPremiumAccess, ownedContentPacks } = usePremium();
  const router = useRouter();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(false);
  const [moderatePlayer, setModeratePlayer] = useState<ModerationPlayer | null>(null);
  const [customCount, setCustomCount] = useState(0);

  useDevBotLobbyRunner(id, lobby);

  useEffect(() => {
    if (!hasPremiumAccess) {
      setCustomCount(0);
      return;
    }
    let active = true;
    fetchMyCustomPrompts()
      .then((p) => active && setCustomCount(p.length))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hasPremiumAccess]);

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
  if (!lobby) return <LoadingState message={t('lobby.docking')} />;

  const me = lobby.players.find((p) => p.uid === user?.id);
  const isHost = lobby.hostId === user?.id;
  const allReady = lobby.players.every((p) => p.isReady);
  const readyCount = lobby.players.filter((p) => p.isReady).length;
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
      const gameId = await startGame(lobby.id, user.id, hasPremiumAccess);
      router.replace(`/game/${gameId}`);
    } catch (e) {
      Alert.alert(t('lobby.launchFailed'), errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (lobby && user) await leaveLobby(lobby.id, user.id);
    router.back();
  };

  const missionLabel = t('lobby.missions', { count: lobby.hostSettings.missionCount });
  const packLabel =
    lobby.hostSettings.contentPacks.length > 1
      ? t('lobby.packs', { count: lobby.hostSettings.contentPacks.length })
      : t('lobby.corePack');

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
      Alert.alert(t('lobby.settingsError'), errorMessage(e));
    }
  };

  return (
    <ScreenShell scroll>
      <ScreenTopBar onBack={handleLeave} />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
        <Text style={styles.kicker}>{t('lobby.kicker')}</Text>
        <Text style={styles.title}>{t('lobby.title')}</Text>
        <Text style={styles.subtitle}>{t('lobby.subtitle')}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(400)}>
        <LobbyCodeDisplay code={lobby.code} />
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {lobby.players.length}
            <Text style={styles.statTotal}>/{lobby.maxPlayers}</Text>
          </Text>
          <Text style={styles.statLabel}>{t('lobby.aboard')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {readyCount}
            <Text style={styles.statTotal}>/{lobby.players.length}</Text>
          </Text>
          <Text style={styles.statLabel}>{t('lobby.ready')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{MIN_PLAYERS}+</Text>
          <Text style={styles.statLabel}>{t('lobby.toLaunch')}</Text>
        </View>
      </View>

      <Text style={styles.rulesBrief}>
        {t('lobby.rulesBrief', { missions: missionLabel, packs: packLabel })}
      </Text>

      {isHost && (
        <HostSettingsPanel
          settings={lobby.hostSettings}
          onChange={handleHostSettingsChange}
          disabled={loading}
          hasPremium={hasPremiumAccess}
          customCount={customCount}
          onRequestUpgrade={() => router.push('/paywall' as Href)}
          onEditCustomDeck={() => router.push('/deck' as Href)}
        />
      )}

      {devLobby && isDevModeEnabled() && (
        <GlowCard accent="cyan">
          <Text style={styles.devBanner}>
            🧪 Dev lobby — bots are ready. Launch and play the full mission solo.
          </Text>
        </GlowCard>
      )}

      <SectionLabel>{t('lobby.crewRoster')}</SectionLabel>
      {lobby.players.map((p, i) => (
        <Animated.View key={p.uid} entering={FadeInUp.delay(60 * i).duration(320)}>
          <CrewRow
            name={p.displayName}
            color={p.avatarColor}
            isHost={p.isHost}
            isReady={p.isReady}
            isMe={p.uid === user?.id}
            onModerate={
              p.uid !== user?.id && !isDevBot(p.uid)
                ? () => setModeratePlayer({ uid: p.uid, displayName: p.displayName })
                : undefined
            }
          />
        </Animated.View>
      ))}

      <PlayerModerationSheet
        visible={moderatePlayer !== null}
        player={moderatePlayer}
        context={`lobby:${lobby.code}`}
        onClose={() => setModeratePlayer(null)}
      />

      <View style={styles.actions}>
        <Button
          title={me?.isReady ? t('lobby.unready') : t('lobby.readyUp')}
          variant={me?.isReady ? 'success' : 'primary'}
          fullWidth
          onPress={handleReady}
        />
        {isHost && (
          <Button
            title={
              canStart
                ? t('lobby.launchMission')
                : lobby.players.length < MIN_PLAYERS
                  ? t('lobby.waitingForCrew', { count: lobby.players.length, min: MIN_PLAYERS })
                  : t('lobby.waitingOnReady', { ready: readyCount, total: lobby.players.length })
            }
            fullWidth
            loading={loading}
            disabled={!canStart}
            onPress={handleStart}
          />
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 2, marginBottom: spacing.xs },
  kicker: { ...typography.label, color: colors.accentSoft },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { ...typography.heading, color: colors.text, fontSize: 20 },
  statTotal: { color: colors.textDim, fontSize: 14 },
  statLabel: { ...typography.label, color: colors.textDim, fontSize: 9 },
  rulesBrief: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
  },
  devBanner: {
    ...typography.caption,
    color: colors.accentSoft,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
