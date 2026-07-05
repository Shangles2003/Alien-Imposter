import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, gradients, spacing, typography } from '@/theme';
import { Starfield } from './Starfield';

interface ScreenShellProps {
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  edges?: Edge[];
  center?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenShell({
  children,
  scroll,
  scrollProps,
  edges = ['top', 'bottom'],
  center,
  style,
  contentStyle,
}: ScreenShellProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        center && styles.centered,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, center && styles.centered, styles.screenPad, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={[...gradients.screen]} style={StyleSheet.absoluteFill} />
      <Starfield />
      <SafeAreaView style={styles.fill} edges={edges}>
        {content}
      </SafeAreaView>
    </View>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <ScreenShell center>
      <ActivityIndicator size="large" color={colors.primaryLight} />
      <Text style={styles.loadingText}>{message}</Text>
    </ScreenShell>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  screenPad: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    ...typography.small,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
