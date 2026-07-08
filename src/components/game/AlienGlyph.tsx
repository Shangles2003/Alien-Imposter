import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

/**
 * Abstract "alien" glyphs used by the Airlock Cipher / Frequency Lock repair
 * modules. They're intentionally geometric and hard to name — that's what
 * forces the operator to actually describe them to the engineer instead of
 * saying "press the star". Rendered from SVG so every device shows the exact
 * same shape (no font/emoji drift).
 */

const VB = 100;
const SW = 7;

function glyphPaths(id: number, color: string): React.ReactNode {
  const stroke = {
    stroke: color,
    strokeWidth: SW,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  switch (((id % 12) + 12) % 12) {
    case 0: // triangle cradling a dot
      return (
        <>
          <Polygon points="50,16 84,78 16,78" {...stroke} />
          <Circle cx={50} cy={58} r={7} fill={color} />
        </>
      );
    case 1: // ringed cross
      return (
        <>
          <Circle cx={50} cy={50} r={30} {...stroke} />
          <Line x1={50} y1={14} x2={50} y2={86} {...stroke} />
          <Line x1={14} y1={50} x2={86} y2={50} {...stroke} />
        </>
      );
    case 2: // stacked chevrons
      return (
        <>
          <Polyline points="22,34 50,20 78,34" {...stroke} />
          <Polyline points="22,54 50,40 78,54" {...stroke} />
          <Polyline points="22,74 50,60 78,74" {...stroke} />
        </>
      );
    case 3: // hexagon with bar
      return (
        <>
          <Polygon points="50,14 84,32 84,68 50,86 16,68 16,32" {...stroke} />
          <Line x1={34} y1={50} x2={66} y2={50} {...stroke} />
        </>
      );
    case 4: // bolt
      return <Polyline points="58,14 32,50 50,50 42,86 72,44 52,44" {...stroke} />;
    case 5: // spiral hook
      return (
        <Path
          d="M70 30 A26 26 0 1 0 76 56 A16 16 0 1 1 50 66"
          {...stroke}
        />
      );
    case 6: // crossed diagonals with nodes
      return (
        <>
          <Line x1={20} y1={20} x2={80} y2={80} {...stroke} />
          <Line x1={80} y1={20} x2={20} y2={80} {...stroke} />
          <Circle cx={50} cy={50} r={9} fill={color} />
          <Circle cx={20} cy={20} r={5} fill={color} />
          <Circle cx={80} cy={80} r={5} fill={color} />
        </>
      );
    case 7: // nested squares
      return (
        <>
          <Rect x={18} y={18} width={64} height={64} rx={6} {...stroke} />
          <Rect x={38} y={38} width={24} height={24} rx={3} {...stroke} />
        </>
      );
    case 8: // trident
      return (
        <>
          <Line x1={50} y1={22} x2={50} y2={84} {...stroke} />
          <Polyline points="26,34 26,20" {...stroke} />
          <Polyline points="74,34 74,20" {...stroke} />
          <Path d="M26 34 Q26 54 50 54 Q74 54 74 34" {...stroke} />
        </>
      );
    case 9: // crescent + dot
      return (
        <>
          <Path d="M66 20 A34 34 0 1 0 66 80 A26 26 0 1 1 66 20 Z" {...stroke} />
          <Circle cx={72} cy={50} r={6} fill={color} />
        </>
      );
    case 10: // burst / asterisk
      return (
        <>
          <Line x1={50} y1={16} x2={50} y2={84} {...stroke} />
          <Line x1={22} y1={32} x2={78} y2={68} {...stroke} />
          <Line x1={78} y1={32} x2={22} y2={68} {...stroke} />
        </>
      );
    case 11: // twin wave
      return (
        <>
          <Path d="M16 40 Q33 22 50 40 T84 40" {...stroke} />
          <Path d="M16 66 Q33 48 50 66 T84 66" {...stroke} />
        </>
      );
    default:
      return null;
  }
}

export function AlienGlyph({
  id,
  size = 44,
  color = '#f4f4f8',
}: {
  id: number;
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {glyphPaths(id, color)}
    </Svg>
  );
}

export const GLYPH_COUNT = 12;
