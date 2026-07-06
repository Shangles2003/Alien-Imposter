import { ContentPack, MostLikelyTemplate, PromptTemplate } from '@/content/types';

/**
 * RETIRED — everything is free now.
 *
 * The best universally-relatable prompts from this pack were reworked to the
 * paired-divergence standard and folded into the core pool (src/game/prompts.ts).
 * The relationship-specific content was dropped.
 *
 * The empty shell stays so that old lobbies saved with `contentPacks:
 * ['core','spicy']` keep working (empty pools merge to nothing). If an 18+
 * "After Dark" pack ships later, it should be a NEW pack id with its own
 * age gating — do not resurrect this one.
 */
export const SPICY_OPINION: PromptTemplate[] = [];
export const SPICY_DELIBERATION: PromptTemplate[] = [];
export const SPICY_DRAWING: PromptTemplate[] = [];
export const SPICY_WRITING: PromptTemplate[] = [];
export const SPICY_MOST_LIKELY: MostLikelyTemplate[] = [];

export const SPICY_PACK: ContentPack = {
  id: 'spicy',
  name: 'Spicy Pack (retired)',
  tagline: 'Retired — its best prompts are now part of the free game.',
  purchasable: false,
  opinion: SPICY_OPINION,
  deliberation: SPICY_DELIBERATION,
  drawing: SPICY_DRAWING,
  writing: SPICY_WRITING,
  mostLikely: SPICY_MOST_LIKELY,
};
