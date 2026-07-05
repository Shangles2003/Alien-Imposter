import { ChamberPrompt } from '@/types/game';

export type ContentPackId = 'core' | 'spicy';

export type MissionCount = 3 | 5 | 7;

export type PromptTemplate = Omit<ChamberPrompt, 'id' | 'chamber'>;

export type MostLikelyTemplate = {
  humanTemplate: string;
  alienTemplate: string;
};

export interface ContentPack {
  id: ContentPackId;
  name: string;
  tagline: string;
  /** Included with monthly subscription or sold separately. */
  purchasable: boolean;
  opinion: PromptTemplate[];
  deliberation: PromptTemplate[];
  drawing: PromptTemplate[];
  writing: PromptTemplate[];
  mostLikely: MostLikelyTemplate[];
}

export interface HostSettings {
  /** Always includes `core`; premium hosts can add packs they own. */
  contentPacks: ContentPackId[];
  missionCount: MissionCount;
}

export const CORE_PACK_ID: ContentPackId = 'core';

export const DEFAULT_HOST_SETTINGS: HostSettings = {
  contentPacks: ['core'],
  missionCount: 5,
};

export function normalizeHostSettings(raw?: Partial<HostSettings> | null): HostSettings {
  const packs = raw?.contentPacks?.length ? [...raw.contentPacks] : ['core'];
  if (!packs.includes('core')) packs.unshift('core');
  const missionCount = raw?.missionCount;
  const validMission: MissionCount =
    missionCount === 3 || missionCount === 7 ? missionCount : 5;
  return {
    contentPacks: [...new Set(packs)] as ContentPackId[],
    missionCount: validMission,
  };
}

export function sanitizeHostSettingsForEntitlements(
  settings: HostSettings,
  ownedPacks: ContentPackId[],
  hasPremium: boolean
): HostSettings {
  const allowed = new Set<ContentPackId>(['core', ...ownedPacks.filter((id) => id !== 'core')]);
  const contentPacks = settings.contentPacks.filter((id) => allowed.has(id));
  if (!contentPacks.includes('core')) contentPacks.unshift('core');

  return {
    contentPacks,
    missionCount: hasPremium ? settings.missionCount : DEFAULT_HOST_SETTINGS.missionCount,
  };
}
