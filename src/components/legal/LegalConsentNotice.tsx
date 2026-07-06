import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';

export function LegalConsentNotice() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        By continuing, you agree to our{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.sm },
  text: { ...typography.caption, color: colors.textDim, textAlign: 'center', lineHeight: 20 },
  link: { color: colors.accentSoft, fontWeight: '700', textDecorationLine: 'underline' },
});
