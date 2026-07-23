import i18n from '@/i18n';
import {
  getPromptForPlayer,
  promptVariantForPlayer,
  type PromptVariant,
} from '@/game/prompts';
import { ChamberPrompt } from '@/types/game';

/**
 * Per-player prompt localization.
 *
 * The engine bakes the ENGLISH prompt text plus a stable `promptId` into shared
 * game state (see game/promptId.ts). Each device then renders that prompt in ITS
 * OWN language by looking the id up here — so two players in the same game can
 * read the same prompt in different languages. When no translation exists (the
 * common case today, and always for custom-deck prompts, which have no id), we
 * fall back to the English text already in state, so nothing breaks.
 *
 * Translation bundles register themselves via `registerPromptLocale`. Until they
 * do, this layer is a transparent pass-through to the existing English strings.
 */

export interface LocalizedPrompt {
  human?: string;
  alien?: string;
  scenario?: string;
  options?: string[];
}

/** locale -> promptId -> localized fields. Empty until translation packs load. */
const CATALOG: Record<string, Record<string, LocalizedPrompt>> = {};

export function registerPromptLocale(
  locale: string,
  entries: Record<string, LocalizedPrompt>
): void {
  CATALOG[locale] = { ...(CATALOG[locale] ?? {}), ...entries };
}

/** True once at least one non-English prompt pack is registered. */
export function hasPromptTranslations(): boolean {
  return Object.keys(CATALOG).length > 0;
}

function lookup(promptId: string | undefined): LocalizedPrompt | undefined {
  if (!promptId) return undefined;
  // Match the exact resolved language code (e.g. "pt-BR", "zh-Hans"), which is
  // how packs are registered. English is the source, so never look it up.
  const lng = i18n.language || 'en';
  if (lng === 'en' || lng.startsWith('en')) return undefined;
  return CATALOG[lng]?.[promptId] ?? CATALOG[lng.split('-')[0]]?.[promptId];
}

const VARIANT_FIELD: Record<PromptVariant, keyof LocalizedPrompt> = {
  human: 'human',
  alien: 'alien',
  scenario: 'scenario',
};

/** The prompt text a player sees, in their current language (English fallback). */
export function localizedPromptForPlayer(
  prompt: ChamberPrompt,
  role: 'human' | 'alien',
  isHacked: boolean
): string {
  const english = getPromptForPlayer(prompt, role, isHacked);
  const entry = lookup(prompt.promptId);
  if (!entry) return english;
  const variant = promptVariantForPlayer(prompt, role, isHacked);
  const value = entry[VARIANT_FIELD[variant]];
  // Deliberation scenario can fall back to the human line if untranslated.
  if (typeof value === 'string' && value) return value;
  if (variant === 'scenario' && typeof entry.human === 'string' && entry.human) {
    return entry.human;
  }
  return english;
}

/** Decision-deck answer options, localized (English fallback, order preserved). */
export function localizedPromptOptions(prompt: ChamberPrompt): string[] {
  const english = prompt.options ?? [];
  const entry = lookup(prompt.promptId);
  const localized = entry?.options;
  // Only use a translation that matches the option count — otherwise the index
  // mapping the engine relies on would break.
  if (Array.isArray(localized) && localized.length === english.length) {
    return localized.map((o, i) => (typeof o === 'string' && o ? o : english[i]));
  }
  return english;
}
