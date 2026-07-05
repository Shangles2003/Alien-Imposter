import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/theme';

export function SyncAdvanceOverlay({ visible }: { visible: boolean }) {
  const pulse = useSharedValue(0.25);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 0.25;
    }
  }, [visible, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.overlay}>
      <View style={styles.card}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <ActivityIndicator color={colors.accent} size="small" />
        <Text style={styles.title}>Syncing crew</Text>
        <Text style={styles.sub}>Hold tight — advancing together</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,7,18,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderBright,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glowCyan,
  },
  title: { ...typography.heading, color: colors.text, zIndex: 1 },
  sub: { ...typography.caption, color: colors.textMuted, textAlign: 'center', zIndex: 1 },
});
