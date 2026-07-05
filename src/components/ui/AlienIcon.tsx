import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Vector alien head — replaces the old 👽 emoji everywhere.
 * `mood` controls the eye shape; `float` adds an idle hover animation.
 */
export function AlienIcon({
  size = 64,
  color = '#b7f7d8',
  eyeColor = '#04050d',
  mood = 'neutral',
}: {
  size?: number;
  color?: string;
  eyeColor?: string;
  mood?: 'neutral' | 'sus' | 'happy';
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Head */}
      <Path
        d="M32 6C18 6 9 17 9 30c0 12 10 24 23 28 13-4 23-16 23-28C55 17 46 6 32 6z"
        fill={color}
      />
      {/* Sheen */}
      <Ellipse cx="24" cy="16" rx="7" ry="4" fill="rgba(255,255,255,0.35)" transform="rotate(-18 24 16)" />
      {/* Eyes */}
      {mood === 'happy' ? (
        <>
          <Path d="M15 30c2-6 9-8 12-3 1 2 0 5-2 6-4 2-9 1-10-3z" fill={eyeColor} />
          <Path d="M49 30c-2-6-9-8-12-3-1 2 0 5 2 6 4 2 9 1 10-3z" fill={eyeColor} />
          <Circle cx="22" cy="28" r="1.8" fill="#7dfcc3" />
          <Circle cx="42" cy="28" r="1.8" fill="#7dfcc3" />
        </>
      ) : mood === 'sus' ? (
        <>
          <Path d="M14 27l14 3c1 4-2 8-7 8s-9-5-7-11z" fill={eyeColor} />
          <Path d="M50 27l-14 3c-1 4 2 8 7 8s9-5 7-11z" fill={eyeColor} />
          <Circle cx="21" cy="33" r="1.6" fill="#ff7d9c" />
          <Circle cx="43" cy="33" r="1.6" fill="#ff7d9c" />
        </>
      ) : (
        <>
          <Ellipse cx="21.5" cy="31" rx="7.5" ry="9.5" fill={eyeColor} transform="rotate(14 21.5 31)" />
          <Ellipse cx="42.5" cy="31" rx="7.5" ry="9.5" fill={eyeColor} transform="rotate(-14 42.5 31)" />
          <Circle cx="19" cy="27.5" r="2" fill="#7df3fc" />
          <Circle cx="40" cy="27.5" r="2" fill="#7df3fc" />
        </>
      )}
      {/* Mouth */}
      <Path
        d="M28 46c2.5 2 5.5 2 8 0"
        stroke={eyeColor}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Alien with a slow idle hover + glow — hero mascot for menus. */
export function FloatingAlien({
  size = 96,
  mood = 'neutral',
}: {
  size?: number;
  mood?: 'neutral' | 'sus' | 'happy';
}) {
  const float = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    tilt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 3400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [float, tilt]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * 12 },
      { rotate: `${tilt.value * 3}deg` },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.45 - float.value * 0.25,
    transform: [{ scaleX: 1 + float.value * 0.25 }],
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={style}>
        <View
          style={{
            shadowColor: '#34d399',
            shadowOpacity: 0.55,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
          }}
        >
          <AlienIcon size={size} mood={mood} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          {
            marginTop: 8,
            width: size * 0.5,
            height: 8,
            borderRadius: 5,
            backgroundColor: colors.glowGreen,
          },
          shadowStyle,
        ]}
      />
    </View>
  );
}

/** Crew helmet — vector astronaut for the human role. */
export function HelmetIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="30" r="22" fill="#e8ecf7" />
      <Path
        d="M14 30a18 18 0 0136 0v3a6 6 0 01-6 6H20a6 6 0 01-6-6v-3z"
        fill="#1b2a4a"
      />
      <Ellipse cx="24" cy="26" rx="6" ry="3.4" fill="rgba(125,211,252,0.5)" transform="rotate(-16 24 26)" />
      <Path d="M20 50h24l-2 8H22l-2-8z" fill="#cdd6ea" />
      <Path d="M26 52h12" stroke="#8fa0c4" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
