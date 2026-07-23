import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { LegalConsentNotice } from '@/components/legal/LegalConsentNotice';
import { Button, FloatingAlien, GlowCard, Input, ScreenShell } from '@/components/ui';
import { signIn } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert(t('auth.usernameRequired'), t('auth.enterUsername'));
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
      router.replace(HOME_ROUTE);
    } catch (e) {
      Alert.alert(t('auth.loginFailed'), errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll center={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.top}>
          <FloatingAlien size={84} />
          <Text style={styles.title}>{t('app.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.formWrap}>
          <GlowCard accent="purple">
            <View style={styles.form}>
              <Input
                label={t('auth.username')}
                value={username}
                onChangeText={setUsername}
                placeholder="commander_nova"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Button title={t('auth.launchIn')} icon="🚀" fullWidth loading={loading} onPress={handleLogin} />
            </View>
          </GlowCard>

          <AppleSignInButton onSignedIn={() => router.replace(HOME_ROUTE)} />

          <LegalConsentNotice />

          <Link href="/(auth)/signup" asChild>
            <Button title={t('auth.createAccountLink')} variant="ghost" fullWidth />
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
