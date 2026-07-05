import {
  DELIBERATION_SCENARIOS,
  DRAWING_PROMPTS,
  MOST_LIKELY_TEMPLATES,
  OPINION_PROMPTS,
  WRITING_PROMPTS,
} from '@/game/prompts';
import { ContentPack } from '@/content/types';

/**
 * Free tier — the base game shipped with the app.
 *
 * IMPORTANT: the pools use getters instead of direct references because of a
 * module cycle (prompts.ts → registry.ts → core.ts → prompts.ts). If this file
 * is evaluated while prompts.ts is still initializing, direct references would
 * capture `undefined` and every mission launch would crash. Getters defer the
 * lookup to call time, after all modules have finished loading.
 */
export const CORE_PACK: ContentPack = {
  id: 'core',
  name: 'Core Crew',
  tagline: 'The full free base game.',
  purchasable: false,
  get opinion() {
    return OPINION_PROMPTS;
  },
  get deliberation() {
    return DELIBERATION_SCENARIOS;
  },
  get drawing() {
    return DRAWING_PROMPTS;
  },
  get writing() {
    return WRITING_PROMPTS;
  },
  get mostLikely() {
    return MOST_LIKELY_TEMPLATES;
  },
};
