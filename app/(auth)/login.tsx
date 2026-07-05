import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Button, GlowCard, Input, ScreenHeader, ScreenShell } from '@/components/ui';
import { signIn } from '@/services/auth';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, gradients, radius, spacing, typography } from '@/theme';

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
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll center={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.top}>
          <LinearGradient colors={[...gradients.hero]} style={styles.logoWrap}>
            <Text style={styles.logo}>👽</Text>
          </LinearGradient>
          <ScreenHeader
            title="Alien Imposter"
            subtitle="Board the ship. Trust no one."
            align="center"
          />
        </View>

        <GlowCard accent="purple">
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@ship.com" />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Button title="Launch In" icon="🚀" fullWidth loading={loading} onPress={handleLogin} />
        </GlowCard>

        <Link href="/(auth)/signup" asChild>
          <Button title="New crew member? Create account" variant="ghost" fullWidth />
        </Link>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  top: { alignItems: 'center', marginBottom: spacing.md },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: { fontSize: 44 },
});
