import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { LegalConsentNotice } from '@/components/legal/LegalConsentNotice';
import { AlienIcon, Button, GlowCard, Input, ScreenShell } from '@/components/ui';
import { isUsernameAvailable, signUp } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { censorProfanity, wasProfanityCensored } from '@/utils/profanityFilter';
import { validateUsername } from '@/utils/username';
import { HOME_ROUTE } from '@/navigation/routes';
import { colors, spacing, typography } from '@/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimmed = username.trim();
    const validationError = validateUsername(trimmed);
    if (validationError) {
      Alert.alert(t('auth.invalidUsername'), validationError);
      return;
    }
    if (wasProfanityCensored(trimmed, censorProfanity(trimmed))) {
      Alert.alert(t('auth.invalidUsername'), 'Username contains inappropriate language. Please choose another.');
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('auth.passwordTooShort'), t('auth.passwordTooShortBody'));
      return;
    }

    setLoading(true);
    try {
      const available = await isUsernameAvailable(trimmed);
      if (!available) {
        Alert.alert(t('auth.usernameTakenTitle'), t('auth.usernameTakenBody'));
        return;
      }
      await signUp(trimmed, password);
      router.replace(HOME_ROUTE);
    } catch (e) {
      Alert.alert(t('auth.signupFailed'), errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.top}>
          <AlienIcon size={64} mood="happy" />
          <Text style={styles.title}>{t('auth.signupTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.formWrap}>
          <GlowCard accent="pink">
            <View style={styles.form}>
              <Input
                label={t('auth.username')}
                value={username}
                onChangeText={setUsername}
                placeholder="commander_nova"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>{t('auth.usernameHint')}</Text>
              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.passwordMinPlaceholder')}
                secureTextEntry
              />
              <Button title={t('auth.createAccount')} icon="✨" fullWidth loading={loading} onPress={handleSignup} />
            </View>
          </GlowCard>

          <AppleSignInButton mode="signUp" onSignedIn={() => router.replace(HOME_ROUTE)} />

          <LegalConsentNotice />

          <Link href="/(auth)/login" asChild>
            <Button title={t('auth.signInLink')} variant="ghost" fullWidth />
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
