import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, FloatingAlien, GlowCard, Input, ScreenShell } from '@/components/ui';
import { signIn } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace(HOME_ROUTE);
    } catch (e) {
      Alert.alert('Login failed', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll center={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.top}>
          <FloatingAlien size={84} />
          <Text style={styles.title}>ALIEN IMPOSTER</Text>
          <Text style={styles.subtitle}>Board the ship. Trust no one.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.formWrap}>
          <GlowCard accent="purple">
            <View style={styles.form}>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@ship.com" />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Button title="Launch In" icon="🚀" fullWidth loading={loading} onPress={handleLogin} />
            </View>
          </GlowCard>

          <Link href="/(auth)/signup" asChild>
            <Button title="New crew member? Create account" variant="ghost" fullWidth />
          </Link>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  top: { alignItems: 'center', marginBottom: spacing.md, gap: spacing.xs },
  title: {
    ...typography.title,
    color: colors.text,
    letterSpacing: 3,
    marginTop: spacing.md,
  },
  subtitle: { ...typography.caption, color: colors.textMuted },
  formWrap: { gap: spacing.sm },
  form: { gap: spacing.md },
});
