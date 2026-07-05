import {
  ContentPackId,
  DEFAULT_HOST_SETTINGS,
  HostSettings,
  MissionCount,
} from '@/content/types';

export type { ContentPackId, HostSettings, MissionCount };
export { DEFAULT_HOST_SETTINGS };

export type PlayerRole = 'human' | 'alien';

export type GamePhase =
  | 'lobby'
  | 'starting'
  | 'role_reveal'
  | 'captain_select'
  | 'chamber_boarding'
  | 'chamber_active'
  | 'chamber_results'
  | 'probe'
  | 'extraction_nominate'
  | 'extraction_vote'
  | 'game_over';

export type ChamberType =
  | 'opinion_hold'
  | 'deliberation_deck'
  | 'bioscanner'
  | 'drawing_quarters'
  | 'writing_pod'
  | 'most_likely_to';

export type AgreementLevel =
  | 'strongly_disagree'
  | 'slightly_disagree'
  | 'slightly_agree'
  | 'strongly_agree';

export interface PlayerProfile {
  uid: string;
  displayName: string;
  avatarColor: string;
  createdAt: number;
}

export interface LobbyPlayer {
  uid: string;
  displayName: string;
  avatarColor: string;
  isHost: boolean;
  isReady: boolean;
  joinedAt: number;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  isPublic: boolean;
  status: 'waiting' | 'starting' | 'in_game' | 'finished';
  maxPlayers: number;
  minPlayers: number;
  players: LobbyPlayer[];
  gameId: string | null;
  hostSettings: HostSettings;
  createdAt: number;
}

export interface HackEntry {
  id: string;
  alienId: string;
  targetId: string;
  scheduledAt: number;
  /** Mission round when flipped prompts take effect. */
  applyAtRound: number;
  applied: boolean;
  appliedAt?: number;
}

export interface GamePlayer {
  uid: string;
  displayName: string;
  avatarColor: string;
  role: PlayerRole;
  isAlive: boolean;
  hasPushedButton: boolean;
  isHacked: boolean;
  extractionVote: 'eject' | 'keep' | null;
}

export interface ChamberPrompt {
  id: string;
  chamber: ChamberType;
  humanPrompt: string;
  alienPrompt: string;
  scenario?: string;
  options?: string[];
  mostLikelyPrompt?: string;
}

export interface ChamberResponse {
  playerId: string;
  displayName: string;
  promptShown: string;
  value: string;
  drawingPaths?: string;
  selectedPlayerId?: string;
  selectedGlyphs?: number[];
}

export interface BioscannerState {
  glyphSet: number[];
  captainGlyphs: number[];
  operatorIds: string[];
  operatorSelections: Record<string, number[]>;
  scanTargetId: string | null;
  scanResult: PlayerRole | null;
  cooldownUntil: number | null;
  unlocked: boolean;
}

export interface ExtractionState {
  initiatorId: string;
  nominatedIds: string[];
  votes: Record<string, 'eject' | 'keep'>;
  resolved: boolean;
  humansEjected: boolean;
}

export interface RoundHistoryEntry {
  round: number;
  captainId: string;
  chamber: ChamberType;
  testeeIds: string[];
  responses: ChamberResponse[];
  completedAt: number;
}

export interface GameState {
  id: string;
  lobbyId: string;
  phase: GamePhase;
  players: GamePlayer[];
  captainId: string | null;
  round: number;
  totalTasks: number;
  usedChambers: ChamberType[];
  timerEndsAt: number | null;
  timerPaused: boolean;
  alienCount: number;
  hacksRemaining: number;
  hacksTotal: number;
  hacksEnabled: boolean;
  /** Shared infiltrator hack log (scheduled + applied). */
  hackLog: HackEntry[];
  /** @deprecated Migrated to hackLog on load. */
  hacksUsed?: { alienId: string; targetId: string; usedAt: number }[];
  selectedChamber: ChamberType | null;
  testeeIds: string[];
  activePrompt: ChamberPrompt | null;
  chamberResponses: Record<string, ChamberResponse>;
  bioscanner: BioscannerState;
  extraction: ExtractionState | null;
  history: RoundHistoryEntry[];
  winner: 'humans' | 'aliens' | null;
  winReason: string | null;
  maxTestees: number;
  updatedAt: number;
  hostId: string;
  isDevMode?: boolean;
  /** Question packs enabled for this mission (always includes core). */
  contentPacks: ContentPackId[];
  /** Tracks who has synced for the current gated phase. */
  phaseReady: Record<string, boolean>;
}

export const CHAMBER_LABELS: Record<ChamberType, string> = {
  opinion_hold: 'Opinion Bay',
  deliberation_deck: 'Decision Deck',
  bioscanner: 'Bio Scanner',
  drawing_quarters: 'Sketch Bay',
  writing_pod: 'Fill-in-the-Blank Pod',
  most_likely_to: 'Likely Locker',
};

export const CHAMBER_DESCRIPTIONS: Record<ChamberType, string> = {
  opinion_hold: 'The whole crew enters the bay and takes a stand.',
  deliberation_deck: 'Everyone faces the same scenario — choose your move.',
  bioscanner: 'Operators sync glyphs while the captain scans the crew.',
  drawing_quarters: 'Every crew member draws on the shared sketch bay screens.',
  writing_pod: 'Each player fills in the blank on their own pod terminal.',
  most_likely_to: 'The entire locker room votes on who fits the prompt.',
};

export const CHAMBER_TAGLINES: Record<ChamberType, string> = {
  opinion_hold: 'Stand by your opinion',
  deliberation_deck: 'What would you do?',
  bioscanner: 'Scan the suspicious',
  drawing_quarters: 'Draw it out',
  writing_pod: 'Complete the sentence below',
  most_likely_to: 'Point at someone',
};
