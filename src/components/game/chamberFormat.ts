import { ChamberResponse, GameState } from '@/types/game';
import { localizedDeliberationOption } from '@/i18n/prompts';

/** Agreement scale is stored as a stable token; resolve it to the localized label. */
const AGREEMENT_KEYS: Record<string, string> = {
  strongly_disagree: 'game.agreeStrongNo',
  slightly_disagree: 'game.agreeNo',
  slightly_agree: 'game.agreeYes',
  strongly_agree: 'game.agreeStrongYes',
};

/**
 * The crew answer as shown in the mission log / reveal, in the VIEWER's language.
 * `t` comes from the calling component's useTranslation so it re-renders on a
 * language switch. Free-text and deliberation answers are returned as authored.
 */
export function formatChamberAnswer(
  r: ChamberResponse,
  game: GameState,
  t: (key: string) => string
): string {
  if (r.drawingPaths) return t('log.submittedDrawing');
  if (r.selectedPlayerId) {
    return game.players.find((p) => p.uid === r.selectedPlayerId)?.displayName ?? t('game.someone');
  }
  // Deliberation deck: re-localize the chosen option for THIS viewer; the stored
  // `value` is the English option text, used when no translation is available.
  if (r.optionIndex != null) {
    return localizedDeliberationOption(r.promptId, r.optionIndex) ?? r.value;
  }
  const key = AGREEMENT_KEYS[r.value];
  return key ? t(key) : r.value.replace(/_/g, ' ');
}
