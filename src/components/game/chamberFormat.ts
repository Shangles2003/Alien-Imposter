import { ChamberResponse, GameState } from '@/types/game';

const AGREEMENT_LABELS: Record<string, string> = {
  strongly_disagree: 'Strong no',
  slightly_disagree: 'No',
  slightly_agree: 'Yes',
  strongly_agree: 'Strong yes',
};

export function formatChamberAnswer(r: ChamberResponse, game: GameState): string {
  if (r.drawingPaths) return 'Submitted a drawing';
  if (r.selectedPlayerId) {
    return game.players.find((p) => p.uid === r.selectedPlayerId)?.displayName ?? 'Someone';
  }
  return AGREEMENT_LABELS[r.value] ?? r.value.replace(/_/g, ' ');
}
