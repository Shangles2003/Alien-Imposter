import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type StarConfig = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  glow?: boolean;
  twinkle?: boolean;
  twinkleDuration?: number;
  twinkleDelay?: number;
};

function buildStars(count: number, seed: number, twinkleEvery: number): StarConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const n = (i * seed + 13) % 97;
    const baseOpacity = 0.1 + (i % 7) * 0.08;
    return {
      left: (n * 19 + 3) % 100,
      top: (n * 29 + 7) % 100,
      size: i % 9 === 0 ? 4 : i % 4 === 0 ? 2.5 : 1.5,
      opacity: Math.min(baseOpacity, 0.72),
      glow: i % 9 === 0,
      twinkle: i % twinkleEvery === 0,
      twinkleDuration: 2200 + (i % 6) * 700,
      twinkleDelay: (i * 310) % 4200,
    };
  });
}

function Star({ star }: { star: StarConfig }) {
  const twinkle = useSharedValue(star.opacity);

  useEffect(() => {
    if (!star.twinkle) return;
    twinkle.value = withDelay(
      star.twinkleDelay ?? 0,
      withRepeat(
        withTiming(star.opacity * 0.25, {
          duration: (star.twinkleDuration ?? 2400) / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [star, twinkle]);

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  const staticStyle = {
    position: 'absolute' as const,
    left: `${star.left}%` as `${number}%`,
    top: `${star.top}%` as `${number}%`,
    width: star.size,
    height: star.size,
    borderRadius: star.size / 2,
    backgroundColor: '#fff',
    ...(star.glow
      ? {
          shadowColor: '#e0e7ff',
          shadowOpacity: 0.9,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }
      : null),
  };

  if (star.twinkle) {
    return <Animated.View style={[staticStyle, twinkleStyle]} />;
  }

  return <View style={[staticStyle, { opacity: star.opacity }]} />;
}

function StarLayer({
  stars,
  driftX,
  driftY,
  duration,
}: {
  stars: StarConfig[];
  driftX: number;
  driftY: number;
  duration: number;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [drift, duration]);

  const layerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (drift.value - 0.5) * 2 * driftX },
      { translateY: (drift.value - 0.5) * 2 * driftY },
    ],
  }));

  return (
    <Animated.View style={[styles.layer, layerStyle]}>
      {stars.map((star, i) => (
        <Star key={`${star.left}-${star.top}-${i}`} star={star} />
      ))}
    </Animated.View>
  );
}

/** Ambient parallax starfield — slow drift + soft twinkle, Among Us–style. */
export function Starfield() {
  const layers = useMemo(
    () => [
      { stars: buildStars(28, 5, 5), driftX: 10, driftY: 16, duration: 52000 },
      { stars: buildStars(22, 11, 4), driftX: 18, driftY: 28, duration: 38000 },
      { stars: buildStars(14, 17, 3), driftX: 26, driftY: 42, duration: 26000 },
    ],
    []
  );

  return (
    <View style={styles.wrap} pointerEvents="none">
      {layers.map((layer, i) => (
        <StarLayer key={i} {...layer} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    // Overscan so drifting stars don't pop at edges.
    top: -24,
    left: -24,
    right: -24,
    bottom: -24,
  },
});
