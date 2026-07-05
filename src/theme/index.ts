export const colors = {
  background: '#030712',
  backgroundMid: '#0c0a1a',
  backgroundGlow: '#1e1035',
  surface: 'rgba(255,255,255,0.05)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceSolid: '#141022',
  surfaceElevated: '#1a1630',
  border: 'rgba(255,255,255,0.1)',
  borderBright: 'rgba(167,139,250,0.35)',
  borderFocus: '#a78bfa',
  primary: '#a855f7',
  primaryDark: '#7c3aed',
  primaryLight: '#c084fc',
  secondary: '#ec4899',
  accent: '#22d3ee',
  accentSoft: '#67e8f9',
  lime: '#a3e635',
  danger: '#f43f5e',
  dangerDark: '#e11d48',
  success: '#4ade80',
  warning: '#fbbf24',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  alien: '#fb7185',
  human: '#4ade80',
  overlay: 'rgba(3,7,18,0.85)',
  glowPurple: 'rgba(168,85,247,0.25)',
  glowCyan: 'rgba(34,211,238,0.2)',
  glowPink: 'rgba(236,72,153,0.2)',
};

export const gradients = {
  screen: ['#030712', '#0f0720', '#030712'] as const,
  hero: ['#581c87', '#a855f7', '#ec4899'] as const,
  primary: ['#7c3aed', '#a855f7'] as const,
  danger: ['#be123c', '#f43f5e'] as const,
  success: ['#15803d', '#4ade80'] as const,
  card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as const,
  alien: ['#450a0a', '#881337'] as const,
  human: ['#052e16', '#14532d'] as const,
  timer: ['#164e63', '#0891b2'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
};

export const typography = {
  display: { fontSize: 40, fontWeight: '900' as const, letterSpacing: -1.2 },
  hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
  mono: { fontSize: 28, fontWeight: '800' as const, letterSpacing: 6 },
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
};

export const chamberIcons: Record<string, string> = {
  opinion_hold: '⚖️',
  deliberation_deck: '🎲',
  bioscanner: '🛸',
  drawing_quarters: '🎨',
  writing_pod: '✍️',
  most_likely_to: '👆',
};

export const chamberGradients: Record<string, readonly [string, string, string]> = {
  opinion_hold: ['#1e1b4b', '#5b21b6', '#a855f7'],
  deliberation_deck: ['#431407', '#9a3412', '#f97316'],
  bioscanner: ['#042f2e', '#0f766e', '#2dd4bf'],
  drawing_quarters: ['#134e4a', '#0d9488', '#5eead4'],
  writing_pod: ['#172554', '#1d4ed8', '#60a5fa'],
  most_likely_to: ['#500724', '#9d174d', '#f472b6'],
};

export const chamberCodes: Record<string, string> = {
  opinion_hold: 'OPIN',
  deliberation_deck: 'DCSN',
  bioscanner: 'SCAN',
  drawing_quarters: 'SKCH',
  writing_pod: 'FILL',
  most_likely_to: 'PICK',
};

export const phaseLabels: Record<string, { title: string; subtitle: string }> = {
  role_reveal: { title: 'Clearance', subtitle: 'Confirm identity' },
  captain_select: { title: 'Routing', subtitle: 'Select chamber' },
  chamber_boarding: { title: 'Boarding', subtitle: 'Crew entering chamber' },
  chamber_active: { title: 'Live Task', subtitle: 'All crew responding' },
  chamber_results: { title: 'Answers', subtitle: 'What everyone said' },
  extraction_nominate: { title: 'Extraction', subtitle: 'Nominate suspects' },
  extraction_vote: { title: 'Final Vote', subtitle: 'Unanimous required' },
  game_over: { title: 'Complete', subtitle: 'Mission ended' },
};
