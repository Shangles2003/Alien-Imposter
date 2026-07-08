import { BETRAYAL_PACK } from '@/content/packs/betrayal';
import { CORE_PACK } from '@/content/packs/core';
import { SPICY_PACK } from '@/content/packs/spicy';
import {
  ContentPack,
  ContentPackId,
  MostLikelyTemplate,
  PromptTemplate,
} from '@/content/types';
import { ChamberType } from '@/types/game';

const PACKS: Record<ContentPackId, ContentPack> = {
  core: CORE_PACK,
  spicy: SPICY_PACK,
  betrayal: BETRAYAL_PACK,
};

export function getContentPack(id: ContentPackId): ContentPack {
  return PACKS[id];
}

export function getAllContentPacks(): ContentPack[] {
  return Object.values(PACKS);
}

function mergePools<T>(packIds: ContentPackId[], pick: (pack: ContentPack) => T[]): T[] {
  const seen = new Set<ContentPackId>();
  const merged: T[] = [];
  for (const id of packIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const pack = PACKS[id];
    if (!pack) continue; // unknown pack id in saved state — skip rather than crash
    const pool = pick(pack);
    if (Array.isArray(pool)) merged.push(...pool);
  }
  return merged;
}

export function getOpinionPool(packIds: ContentPackId[]): PromptTemplate[] {
  return mergePools(packIds, (p) => p.opinion);
}

export function getDeliberationPool(packIds: ContentPackId[]): PromptTemplate[] {
  return mergePools(packIds, (p) => p.deliberation);
}

export function getDrawingPool(packIds: ContentPackId[]): PromptTemplate[] {
  return mergePools(packIds, (p) => p.drawing);
}

export function getWritingPool(packIds: ContentPackId[]): PromptTemplate[] {
  return mergePools(packIds, (p) => p.writing);
}

export function getMostLikelyPool(packIds: ContentPackId[]): MostLikelyTemplate[] {
  return mergePools(packIds, (p) => p.mostLikely);
}

export function getPoolForChamber(
  chamber: ChamberType,
  packIds: ContentPackId[]
): PromptTemplate[] | MostLikelyTemplate[] {
  const ids = packIds.length ? packIds : (['core'] as ContentPackId[]);
  switch (chamber) {
    case 'opinion_hold':
      return getOpinionPool(ids);
    case 'deliberation_deck':
      return getDeliberationPool(ids);
    case 'drawing_quarters':
      return getDrawingPool(ids);
    case 'writing_pod':
      return getWritingPool(ids);
    case 'most_likely_to':
      return getMostLikelyPool(ids);
    default:
      return [];
  }
}
