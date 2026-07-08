import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AlienIcon, Button, GlowCard, Input, ScreenShell, ScreenTopBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { joinLobbyByCode, getPostJoinPath } from '@/services/lobby';
import { mapJoinLobbyError } from '@/services/moderation';
import { errorMessage } from '@/utils/errors';
import { colors, spacing, typography } from '@/theme';

export default function JoinLobbyScreen() {
  const { code: initialCode } = useLocalSearchParams<{ code?: string }>();
  const { profile } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState(initialCode ?? '');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const joined = await joinLobbyByCode(joinCode.trim(), profile);
      router.replace(getPostJoinPath(joined));
    } catch (e) {
      Alert.alert('Join failed', mapJoinLobbyError(errorMessage(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll>
      <ScreenTopBar onBack={() => router.back()} />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.top}>
        <AlienIcon size={56} mood="happy" />
        <Text style={styles.title}>Join Lobby</Text>
        <Text style={styles.subtitle}>Enter the crew code — works for lobbies and active games</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <GlowCard accent="cyan">
          <View style={styles.form}>
            <Input
              label="Lobby Code"
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              placeholder="ABC123"
              autoCapitalize="characters"
            />
            <Button title="Board Ship" icon="🚀" fullWidth loading={loading} onPress={handleJoin} />
          </View>
        </GlowCard>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  title: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  subtitle: { ...typography.caption, color: colors.textMuted },
  form: { gap: spacing.md },
});
