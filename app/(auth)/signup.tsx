import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, GlowCard, Input, ScreenHeader, ScreenShell } from '@/components/ui';
import { signUp } from '@/services/auth';
import { HOME_ROUTE } from '@/navigation/routes';
import { spacing } from '@/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name required', 'Pick a callsign for the crew roster.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace(HOME_ROUTE);
    } catch (e) {
      Alert.alert('Signup failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScreenHeader title="Join the Crew" subtitle="Create your account and enter the ship" icon="🛸" />

        <GlowCard accent="pink">
          <Input
            label="Callsign"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Commander Nova"
            autoCapitalize="words"
          />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@ship.com" />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            secureTextEntry
          />
          <Button title="Create Account" icon="✨" fullWidth loading={loading} onPress={handleSignup} />
        </GlowCard>

        <Link href="/(auth)/login" asChild>
          <Button title="Already aboard? Sign in" variant="ghost" fullWidth />
        </Link>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { gap: spacing.lg, paddingVertical: spacing.lg },
});
