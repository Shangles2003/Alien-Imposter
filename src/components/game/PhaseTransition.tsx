import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GamePhase } from '@/types/game';

interface PhaseTransitionProps {
  phase: GamePhase;
  round: number;
  children: React.ReactNode;
}

export function PhaseTransition({ phase, round, children }: PhaseTransitionProps) {
  return (
    <Animated.View key={`${phase}-${round}`} entering={FadeIn.duration(220)} style={styles.fill}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
});
