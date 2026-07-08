import React, { createContext, useContext, useMemo } from 'react';
import { colors } from '@/theme';

export interface GameAccentTokens {
  accent: string;
  accentSoft: string;
  glow: string;
  pipLive: string;
  pipDone: string;
  accentMuted: string;
}

function tokensForRole(isAlien: boolean): GameAccentTokens {
  if (isAlien) {
    return {
      accent: colors.alien,
      accentSoft: '#fda4af',
      glow: colors.glowRed,
      pipLive: colors.alien,
      pipDone: colors.alienDeep,
      accentMuted: 'rgba(251,113,133,0.35)',
    };
  }
  return {
    accent: colors.accent,
    accentSoft: colors.accentSoft,
    glow: colors.glowCyan,
    pipLive: colors.accent,
    pipDone: colors.primary,
    accentMuted: 'rgba(34,211,238,0.25)',
  };
}

const GameAccentContext = createContext<GameAccentTokens>(tokensForRole(false));

export function GameAccentProvider({
  isAlien,
  children,
}: {
  isAlien: boolean;
  children: React.ReactNode;
}) {
  const tokens = useMemo(() => tokensForRole(isAlien), [isAlien]);
  return <GameAccentContext.Provider value={tokens}>{children}</GameAccentContext.Provider>;
}

export function useGameAccent(): GameAccentTokens {
  return useContext(GameAccentContext);
}
