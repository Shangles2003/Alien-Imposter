import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useGameAccent } from '@/context/GameAccentContext';
import { radius } from '@/theme';

/** Human pads store JSON arrays; legacy/bot paths may be a single SVG path string. */
export function parseDrawingPaths(raw: string): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((p) => typeof p === 'string' && p.length > 0);
    if (typeof parsed === 'string' && parsed.trim()) return [parsed];
  } catch {
    // fall through — treat as one path
  }
  return [raw];
}

/** Compute a tight viewBox so strokes fill the preview frame. */
function getViewBox(paths: string[]): string {
  const nums = paths.join(' ').match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i]!;
    const y = nums[i + 1]!;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!Number.isFinite(minX)) return '0 0 400 220';

  const pad = 12;
  const w = Math.max(maxX - minX + pad * 2, 40);
  const h = Math.max(maxY - minY + pad * 2, 40);
  return `${minX - pad} ${minY - pad} ${w} ${h}`;
}

interface DrawingPreviewProps {
  paths: string;
  height?: number;
}

export function DrawingPreview({ paths, height = 72 }: DrawingPreviewProps) {
  const { accentSoft, accentMuted } = useGameAccent();
  const [width, setWidth] = useState(0);
  const parsed = parseDrawingPaths(paths);
  if (parsed.length === 0) return null;
  const viewBox = getViewBox(parsed);

  return (
    <View
      style={[styles.frame, { height, borderColor: accentMuted }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
          {parsed.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={accentSoft}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    backgroundColor: '#0a1628',
    borderRadius: radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
