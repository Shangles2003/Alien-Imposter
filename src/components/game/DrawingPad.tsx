import React, { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, typography } from '@/theme';

interface DrawingPadProps {
  onChange: (paths: string) => void;
  expand?: boolean;
}

export function DrawingPad({ onChange, expand = false }: DrawingPadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef('');
  const pathsRef = useRef<string[]>([]);

  const syncPaths = (next: string[]) => {
    pathsRef.current = next;
    setPaths(next);
    onChange(JSON.stringify(next));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        syncPaths([...pathsRef.current, currentPath.current]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        syncPaths([...pathsRef.current.slice(0, -1), currentPath.current]);
      },
      onPanResponderRelease: () => {
        currentPath.current = '';
      },
    })
  ).current;

  return (
    <View style={[styles.wrap, expand && styles.wrapExpand]}>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {paths.length === 0 ? (
          <Text style={styles.placeholder}>Draw here with your finger</Text>
        ) : null}
        <Svg style={StyleSheet.absoluteFillObject}>
          {paths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={colors.accentSoft}
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {paths.length > 0 ? (
          <Pressable onPress={() => syncPaths([])} style={styles.clearOverlay}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 160 },
  wrapExpand: { flex: 1, minHeight: 200, height: undefined },
  canvas: {
    flex: 1,
    backgroundColor: '#0a1628',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderBright,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  placeholder: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: 'center',
    zIndex: 1,
  },
  clearOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    zIndex: 2,
  },
  clearText: { ...typography.small, color: colors.textMuted, fontSize: 11 },
});
