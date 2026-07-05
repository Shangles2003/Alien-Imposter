import React, { useEffect } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, gradients, spacing, typography } from '@/theme';
import { AlienIcon } from './AlienIcon';
import { Starfield } from './Starfield';

/** Slow-breathing nebula blob — pure ambience behind every screen. */
function NebulaGlow({
  color,
  size,
  top,
  left,
  duration = 9000,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  duration?: number;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse, duration]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.92 + pulse.value * 0.16 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

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
      <NebulaGlow color={colors.glowPurple} size={340} top={-120} left={-100} duration={11000} />
      <NebulaGlow color={colors.glowCyan} size={280} top={220} left={220} duration={9000} />
      <NebulaGlow color={colors.glowPink} size={240} top={560} left={-90} duration={13000} />
      <Starfield />
      <SafeAreaView style={styles.fill} edges={edges}>
        {content}
      </SafeAreaView>
    </View>
  );
}

/** Loading screen — hovering alien beats a plain spinner. */
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [bob]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (bob.value - 0.5) * 14 }],
  }));

  return (
    <ScreenShell center>
      <Animated.View style={bobStyle}>
        <AlienIcon size={56} />
      </Animated.View>
      <Text style={styles.loadingText}>{message}</Text>
    </ScreenShell>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
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
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textDim,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
