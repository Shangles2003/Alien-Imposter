import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { signInWithApple } from '@/services/auth';
import { errorMessage } from '@/utils/errors';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * "Sign in with Apple" button. Renders only on iOS where it's available; on
 * every other platform it returns null so callers can drop it in unconditionally.
 */
export function AppleSignInButton({
  onSignedIn,
  mode = 'signIn',
}: {
  onSignedIn: () => void;
  mode?: 'signIn' | 'signUp';
}) {
  const { refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then((v) => active && setAvailable(v))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, []);

  if (Platform.OS !== 'ios' || !available) return null;

  const handle = async () => {
    try {
      await signInWithApple();
      await refreshProfile();
      onSignedIn();
    } catch (e) {
      // The user backing out of the native sheet isn't an error.
      if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert(t('auth.appleFailed'), errorMessage(e));
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>{t('auth.or')}</Text>
        <View style={styles.line} />
      </View>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          mode === 'signUp'
            ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
        }
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={radius.lg}
        style={styles.button}
        onPress={handle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  orText: { ...typography.small, color: colors.textDim },
  button: { width: '100%', height: 52 },
});
