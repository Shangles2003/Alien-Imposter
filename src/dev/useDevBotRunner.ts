import { useEffect, useRef, useState } from 'react';
import { applyGameAction } from '@/services/gameSync';
import { isDevGame, isDevModeEnabled } from '@/dev/config';
import { getNextBotAction, BotActionPlan } from '@/dev/botBrain';
import { GameState } from '@/types/game';

const BOT_ACTION_DELAY_MS = 350;

export function useDevBotRunner(
  gameId: string | undefined,
  game: GameState | null
): { lastBotAction: BotActionPlan | null; botRunnerActive: boolean } {
  const [lastBotAction, setLastBotAction] = useState<BotActionPlan | null>(null);
  const actionGenRef = useRef(0);

  const botRunnerActive =
    isDevModeEnabled() && !!game && isDevGame(game) && game.phase !== 'game_over';

  const phaseReadyKey = game ? JSON.stringify(game.phaseReady) : '';

  useEffect(() => {
    if (!gameId || !game || !botRunnerActive) return;

    const plan = getNextBotAction(game);
    if (!plan) return;

    const generation = ++actionGenRef.current;
    const timer = setTimeout(async () => {
      if (generation !== actionGenRef.current) return;
      try {
        await applyGameAction(gameId, game, plan.run);
        if (generation === actionGenRef.current) {
          setLastBotAction(plan);
        }
      } catch (e) {
        console.warn('[dev] bot action failed:', e);
      }
    }, BOT_ACTION_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [
    gameId,
    game,
    botRunnerActive,
    game?.phase,
    game?.updatedAt,
    game?.round,
    game?.captainId,
    phaseReadyKey,
    game?.extraction?.votes,
    game?.hackLog?.length ?? 0,
    game?.hacksRemaining,
    Object.keys(game?.chamberResponses ?? {}).length,
  ]);

  return { lastBotAction, botRunnerActive };
}
