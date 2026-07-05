import {
  DELIBERATION_SCENARIOS,
  DRAWING_PROMPTS,
  MOST_LIKELY_TEMPLATES,
  OPINION_PROMPTS,
  WRITING_PROMPTS,
} from '@/game/prompts';
import { ContentPack } from '@/content/types';

/** Free tier — the base game shipped with the app. */
export const CORE_PACK: ContentPack = {
  id: 'core',
  name: 'Core Crew',
  tagline: 'The full free base game.',
  purchasable: false,
  opinion: OPINION_PROMPTS,
  deliberation: DELIBERATION_SCENARIOS,
  drawing: DRAWING_PROMPTS,
  writing: WRITING_PROMPTS,
  mostLikely: MOST_LIKELY_TEMPLATES,
};
