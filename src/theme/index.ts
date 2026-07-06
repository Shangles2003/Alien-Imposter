/**
 * Alien Imposter design system — "deep space terminal".
 * Near-black indigo space, electric violet + cyan signal colors,
 * SpaceMono for numeric/code readouts.
 */

export const fonts = {
  mono: 'SpaceMono',
};

export const colors = {
  // Space
  background: '#04050d',
  backgroundMid: '#0a0918',
  backgroundGlow: '#1b1038',
  // Surfaces
  surface: 'rgba(255,255,255,0.045)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceSolid: '#12101f',
  surfaceElevated: '#1a172e',
  // Lines
  border: 'rgba(148,163,255,0.14)',
  borderBright: 'rgba(167,139,250,0.45)',
  borderFocus: '#a78bfa',
  // Signals
  primary: '#8b5cf6',
  primaryDark: '#6d28d9',
  primaryLight: '#c4b5fd',
  secondary: '#ec4899',
  accent: '#22d3ee',
  accentSoft: '#7dd3fc',
  lime: '#a3e635',
  danger: '#fb4d6d',
  dangerDark: '#e11d48',
  success: '#34d399',
  warning: '#fbbf24',
  // Text
  text: '#f4f4f8',
  textMuted: '#9d9cb3',
  textDim: '#63627a',
  // Roles
  alien: '#fb7185',
  alienDeep: '#881337',
  human: '#34d399',
  humanDeep: '#065f46',
  // FX
  overlay: 'rgba(4,5,13,0.88)',
  glowPurple: 'rgba(139,92,246,0.22)',
  glowCyan: 'rgba(34,211,238,0.16)',
  glowPink: 'rgba(236,72,153,0.18)',
  glowRed: 'rgba(251,113,133,0.16)',
  glowGreen: 'rgba(52,211,153,0.16)',
};

export const gradients = {
  screen: ['#04050d', '#0d0722', '#04050d'] as const,
  hero: ['#4c1d95', '#8b5cf6', '#d946ef'] as const,
  primary: ['#6d28d9', '#8b5cf6'] as const,
  danger: ['#9f1239', '#fb4d6d'] as const,
  success: ['#065f46', '#34d399'] as const,
  card: ['rgba(255,255,255,0.075)', 'rgba(255,255,255,0.02)'] as const,
  alien: ['#3f0d1d', '#881337'] as const,
  human: ['#042f22', '#065f46'] as const,
  timer: ['#155e75', '#0891b2'] as const,
  cyan: ['#0e7490', '#22d3ee'] as const,
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
  title: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
  /** Terminal-style numeric readout. */
  mono: { fontSize: 28, fontWeight: '800' as const, letterSpacing: 6, fontFamily: fonts.mono },
  /** Tiny uppercase label — section headers, HUD chrome. */
  label: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2.4,
    textTransform: 'uppercase' as const,
  },
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  glowRed: {
    shadowColor: colors.alien,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 26,
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

/** Flat accent color per chamber — used for borders / labels. */
export const chamberAccents: Record<string, string> = {
  opinion_hold: '#c084fc',
  deliberation_deck: '#fb923c',
  bioscanner: '#2dd4bf',
  drawing_quarters: '#5eead4',
  writing_pod: '#60a5fa',
  most_likely_to: '#f472b6',
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
  extraction_nominate: { title: 'Accusation', subtitle: 'Secret ballots' },
  extraction_vote: { title: 'The Trial', subtitle: 'Majority decides' },
  game_over: { title: 'Complete', subtitle: 'Mission ended' },
};
