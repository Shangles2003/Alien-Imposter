import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, GlowCard, Input, ScreenShell } from '@/components/ui';
import { GearIcon } from '@/components/ui/GearIcon';
import { useAuth } from '@/context/AuthContext';
import { isDevModeEnabled } from '@/dev/config';
import { createDevLobby, createLobby, joinLobbyByCode } from '@/services/lobby';
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
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create lobby');
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
      Alert.alert('Join failed', e instanceof Error ? e.message : 'Could not join lobby');
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
      Alert.alert('Dev lobby failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScreenShell contentStyle={styles.shell}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <Pressable
          style={({ pressed }) => [styles.gearBtn, pressed && styles.gearBtnPressed]}
          onPress={() => router.push(SETTINGS_ROUTE)}
          hitSlop={12}
          accessibilityLabel="Settings"
        >
          <GearIcon size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>👽</Text>
        <Text style={styles.title}>Alien Imposter</Text>
        <Text style={styles.tagline}>Gather friends · share a code · find the infiltrators</Text>
      </View>

      <View style={styles.actions}>
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
          <Button
            title="Join Party"
            icon="🚀"
            fullWidth
            loading={loading === 'join'}
            disabled={joinCode.length < 4}
            onPress={joinParty}
          />
        </GlowCard>
      </View>

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
        Playing as {profile?.displayName ?? 'Crew'} · 4–10 players · 5 missions
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
  gearBtnPressed: { opacity: 0.75, backgroundColor: colors.surfaceElevated },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  emoji: { fontSize: 48 },
  title: { ...typography.display, color: colors.text, fontSize: 28 },
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
  dev: {
    gap: spacing.xs,
  },
  devLabel: {
    ...typography.small,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
