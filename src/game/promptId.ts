import { ChamberType } from '@/types/game';

/**
 * Stable content IDs for catalog prompts.
 *
 * A prompt's ID is a chamber-prefixed hash of its ENGLISH source text, so it is
 * stable across array reordering/insertion (unlike a positional index) and is
 * recomputed identically on every device. Translations are keyed by this ID, so
 * editing a prompt's English text intentionally "orphans" its old translations
 * (they fall back to English) until re-translated — which is the behavior we
 * want. Custom-deck prompts get NO id (they stay in the author's own words).
 *
 * The generator in `scripts/prompt-catalog.js` uses this exact function and
 * asserts every id is unique, so a hash collision would fail the build.
 */

const PREFIX: Partial<Record<ChamberType, string>> = {
  opinion_hold: 'op',
  deliberation_deck: 'dl',
  drawing_quarters: 'dr',
  writing_pod: 'wr',
  most_likely_to: 'ml',
};

// Unit separator (U+001F) — keeps distinct part-splits from colliding once joined.
const SEP = '';

/** djb2 -> unsigned 32-bit -> base36. Deterministic across JS engines. */
export function hashText(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (((h << 5) + h) + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * Build the stable id from a chamber and its English source parts (human +
 * alien, plus scenario for the decision deck). Returns undefined for chambers
 * that carry no translatable content prompt (e.g. bioscanner).
 */
export function promptContentId(
  chamber: ChamberType,
  parts: (string | undefined)[]
): string | undefined {
  const prefix = PREFIX[chamber];
  if (!prefix) return undefined;
  const key = parts.filter((p): p is string => Boolean(p)).join(SEP);
  if (!key) return undefined;
  return `${prefix}_${hashText(key)}`;
}
