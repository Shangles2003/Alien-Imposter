import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AlienIcon, Button, GlowCard, Input, ScreenShell } from '@/components/ui';
import { signUp } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

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
          <Text style={styles.subtitle}>Create your account and enter the ship</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.formWrap}>
          <GlowCard accent="pink">
            <View style={styles.form}>
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
            </View>
          </GlowCard>

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
});
