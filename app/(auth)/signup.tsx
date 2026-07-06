import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LegalConsentNotice } from '@/components/legal/LegalConsentNotice';
import { AlienIcon, Button, GlowCard, Input, ScreenShell } from '@/components/ui';
import { isUsernameAvailable, signUp } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { validateUsername } from '@/utils/username';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimmed = username.trim();
    const validationError = validateUsername(trimmed);
    if (validationError) {
      Alert.alert('Invalid username', validationError);
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const available = await isUsernameAvailable(trimmed);
      if (!available) {
        Alert.alert('Username taken', 'That username is already in use. Try another.');
        return;
      }
      await signUp(trimmed, password);
      router.replace(HOME_ROUTE);
    } catch (e) {
      Alert.alert('Signup failed', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.top}>
          <AlienIcon size={64} mood="happy" />
          <Text style={styles.title}>Join the Crew</Text>
          <Text style={styles.subtitle}>Pick a unique username and password</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.formWrap}>
          <GlowCard accent="pink">
            <View style={styles.form}>
              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="commander_nova"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>3–20 characters · letters, numbers, underscores</Text>
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters"
                secureTextEntry
              />
              <Button title="Create Account" icon="✨" fullWidth loading={loading} onPress={handleSignup} />
            </View>
          </GlowCard>

          <LegalConsentNotice />

          <Link href="/(auth)/login" asChild>
            <Button title="Already aboard? Sign in" variant="ghost" fullWidth />
          </Link>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { gap: spacing.lg, paddingVertical: spacing.lg },
  top: { alignItems: 'center', gap: spacing.xs },
  title: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  subtitle: { ...typography.caption, color: colors.textMuted },
  formWrap: { gap: spacing.sm },
  form: { gap: spacing.md },
  hint: { ...typography.small, color: colors.textDim, marginTop: -spacing.xs },
});
