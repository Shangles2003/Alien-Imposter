import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, GlowCard, Input, ScreenHeader, ScreenShell } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { joinLobbyByCode } from '@/services/lobby';
import { spacing } from '@/theme';

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
      router.replace(`/lobby/${joined.id}`);
    } catch (e) {
      Alert.alert('Join failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll>
      <ScreenHeader title="Join Lobby" subtitle="Enter the 6-character crew code" icon="🔑" />
      <GlowCard accent="cyan">
        <Input
          label="Lobby Code"
          value={joinCode}
          onChangeText={(t) => setJoinCode(t.toUpperCase())}
          placeholder="ABC123"
          autoCapitalize="characters"
        />
        <Button title="Board Ship" icon="🚀" fullWidth loading={loading} onPress={handleJoin} />
      </GlowCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({});
