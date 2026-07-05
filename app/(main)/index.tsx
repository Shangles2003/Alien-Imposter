import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Button,
  FloatingAlien,
  GlowCard,
  Input,
  PressableScale,
  ScreenShell,
} from '@/components/ui';
import { GearIcon } from '@/components/ui/GearIcon';
import { useAuth } from '@/context/AuthContext';
import { isDevModeEnabled } from '@/dev/config';
import { createDevLobby, createLobby, joinLobbyByCode } from '@/services/lobby';
import { errorMessage } from '@/utils/errors';
import { SETTINGS_ROUTE } from '@/navigation/routes';
import { colors, radius, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const hostParty = async () => {
    if (!profile) return;
    setLoading('host');
    try {
      const lobby = await createLobby(profile);
      router.push(`/lobby/${lobby.id}`);
    } catch (e) {
      Alert.alert('Could not create lobby', errorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const joinParty = async () => {
    if (!profile) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;

    setLoading('join');
    try {
      const lobby = await joinLobbyByCode(code, profile);
      router.push(`/lobby/${lobby.id}`);
    } catch (e) {
      Alert.alert('Join failed', errorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const startDevLobby = async (totalPlayers: 4 | 6) => {
    if (!profile) return;
    setLoading(totalPlayers === 4 ? 'dev4' : 'dev6');
    try {
      const lobby = await createDevLobby(profile, totalPlayers);
      router.push(`/lobby/${lobby.id}`);
    } catch (e) {
      Alert.alert('Dev lobby failed', errorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScreenShell contentStyle={styles.shell}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <PressableScale
          style={styles.gearBtn}
          onPress={() => router.push(SETTINGS_ROUTE)}
          hitSlop={12}
          accessibilityLabel="Settings"
        >
          <GearIcon size={22} color={colors.textMuted} />
        </PressableScale>
      </View>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
        <FloatingAlien size={92} mood="sus" />
        <Text style={styles.kicker}>SOCIAL DEDUCTION · 4–10 PLAYERS</Text>
        <Text style={styles.title}>ALIEN IMPOSTER</Text>
        <Text style={styles.tagline}>
          Gather friends · share a code · find the infiltrators
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.actions}>
        <Button
          title="Host a Party"
          icon="🛸"
          fullWidth
          size="lg"
          loading={loading === 'host'}
          onPress={hostParty}
        />
        <Text style={styles.hostHint}>You'll get a code to text your crew</Text>

        <GlowCard accent="cyan">
          <Input
            label="Party Code"
            value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())}
            placeholder="ABC123"
            autoCapitalize="characters"
          />
          <View style={styles.joinSpacer} />
          <Button
            title="Join Party"
            icon="🚀"
            fullWidth
            loading={loading === 'join'}
            disabled={joinCode.length < 4}
            onPress={joinParty}
          />
        </GlowCard>
      </Animated.View>

      {isDevModeEnabled() ? (
        <View style={styles.dev}>
          <Text style={styles.devLabel}>Dev — solo practice</Text>
          <View style={styles.devRow}>
            <Button
              title="4 players"
              variant="outline"
              loading={loading === 'dev4'}
              onPress={() => startDevLobby(4)}
              style={styles.devBtn}
            />
            <Button
              title="6 players"
              variant="outline"
              loading={loading === 'dev6'}
              onPress={() => startDevLobby(6)}
              style={styles.devBtn}
            />
          </View>
        </View>
      ) : null}

      <Text style={styles.footer}>
        Playing as {profile?.displayName ?? 'Crew'} · 5 missions per game
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 40,
  },
  topBarSide: { width: 44 },
  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  kicker: {
    ...typography.label,
    color: colors.accentSoft,
    marginTop: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.text,
    fontSize: 30,
    letterSpacing: 3,
  },
  tagline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
  hostHint: {
    ...typography.small,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  joinSpacer: { height: spacing.sm },
  dev: {
    gap: spacing.xs,
  },
  devLabel: {
    ...typography.label,
    color: colors.textDim,
    textAlign: 'center',
  },
  devRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  devBtn: { flex: 1 },
  footer: {
    ...typography.small,
    color: colors.textDim,
    textAlign: 'center',
  },
});
