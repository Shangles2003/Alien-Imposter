import { ChamberPrompt } from '@/types/game';

export type ContentPackId = 'core' | 'spicy' | 'betrayal';

/** Packs a host owns given their entitlement. Premium unlocks every pack. */
export function ownedPacksForPremium(hasPremium: boolean): ContentPackId[] {
  return hasPremium ? ['core', 'betrayal'] : ['core'];
}

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
  /**
   * Whether this host's games draw from the full prompt library. Free hosts
   * get a small fixed sample (see FREE_SAMPLE_* in prompts); premium hosts get
   * everything. Derived from the host's entitlement at settings-save / launch.
   */
  fullLibrary: boolean;
  /** Premium host wants their personal custom deck mixed into this game. */
  useCustomDeck: boolean;
}

export const CORE_PACK_ID: ContentPackId = 'core';

/** Free-tier default: 5 stages, core pack, sampled prompt library. */
export const DEFAULT_HOST_SETTINGS: HostSettings = {
  contentPacks: ['core'],
  missionCount: 5,
  fullLibrary: false,
  useCustomDeck: false,
};

/** Mission length free hosts are locked to. */
export const FREE_MISSION_COUNT: MissionCount = 5;

const KNOWN_PACK_IDS: ContentPackId[] = ['core', 'spicy', 'betrayal'];

export function normalizeHostSettings(raw?: Partial<HostSettings> | null): HostSettings {
  const provided = raw?.contentPacks;
  // An explicit (even empty) list is respected — the base pack is toggleable now.
  // Only a missing list defaults to core.
  const packs: ContentPackId[] =
    provided == null
      ? ['core']
      : ([...new Set(provided)].filter((id) =>
          KNOWN_PACK_IDS.includes(id as ContentPackId)
        ) as ContentPackId[]);
  const missionCount = raw?.missionCount;
  const validMission: MissionCount =
    missionCount === 3 || missionCount === 7 ? missionCount : 5;
  return {
    contentPacks: packs,
    missionCount: validMission,
    fullLibrary: Boolean(raw?.fullLibrary),
    useCustomDeck: Boolean(raw?.useCustomDeck),
  };
}

export function sanitizeHostSettingsForEntitlements(
  settings: HostSettings,
  ownedPacks: ContentPackId[],
  hasPremium: boolean
): HostSettings {
  const allowed = new Set<ContentPackId>(['core', ...ownedPacks.filter((id) => id !== 'core')]);
  const contentPacks = settings.contentPacks.filter((id) => allowed.has(id));
  const useCustomDeck = hasPremium && settings.useCustomDeck;

  // Never leave a host with zero prompt sources. Free hosts always keep core;
  // a premium host can drop core only if another source (a pack or their custom
  // deck) is on.
  if (contentPacks.length === 0 && !useCustomDeck) {
    contentPacks.push('core');
  }

  return {
    contentPacks,
    // Premium unlocks 3/5/7 stages; free hosts are pinned to 5.
    missionCount: hasPremium ? settings.missionCount : FREE_MISSION_COUNT,
    // Premium unlocks the full prompt library for everyone in the host's game.
    fullLibrary: hasPremium,
    useCustomDeck,
  };
}
