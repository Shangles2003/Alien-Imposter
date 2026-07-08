const CENSOR_REPLACEMENT = '***';

/**
 * Racial slurs — listed separately and checked with evasion-resistant patterns
 * (spaced, punctuated, leetspeak) because they are the most common UGC attack vector.
 */
const SLUR_TERMS = ['niggers', 'nigger', 'niggas', 'nigga'];

/** Catches n----r / n---a with optional non-letter separators between characters. */
const SLUR_EVASION_PATTERNS = [
  /(?<![a-zA-Z])[nN][\W_]*[iI1!][\W_]*[gG9][\W_]*[gG9][\W_]*[eE3][\W_]*[rR]+(?![a-zA-Z])/gi,
  /(?<![a-zA-Z])[nN][\W_]*[iI1!][\W_]*[gG9][\W_]*[gG9][\W_]*[aA@4]+(?![a-zA-Z])/gi,
];

/** Longest first so "motherfucker" matches before "fuck". */
const TERMS = [
  ...SLUR_TERMS,
  'motherfucker',
  'motherfucking',
  'cocksucker',
  'douchebag',
  'bullshit',
  'horseshit',
  'asshole',
  'arsehole',
  'shithead',
  'dipshit',
  'goddamn',
  'god damn',
  'fucking',
  'fucker',
  'fucked',
  'fucks',
  'fuck',
  'bastard',
  'bitches',
  'bitchy',
  'bitch',
  'dumbass',
  'badass',
  'jackass',
  'shitty',
  'crappy',
  'pissed',
  'dammit',
  'damned',
  'whore',
  'whores',
  'sluts',
  'slut',
  'cunts',
  'cunt',
  'cocks',
  'cock',
  'wanker',
  'wank',
  'douche',
  'twat',
  'bollocks',
  'prick',
  'dicks',
  'dick',
  'shit',
  'damn',
  'hell',
  'crap',
  'piss',
  'arse',
  'ass',
];

const LEET: Record<string, string> = {
  a: '[aA@4]',
  b: '[bB]',
  c: '[cC]',
  d: '[dD]',
  e: '[eE3]',
  f: '[fF]',
  g: '[gG]',
  h: '[hH]',
  i: '[iI1!]',
  j: '[jJ]',
  k: '[kK]',
  l: '[lL]',
  m: '[mM]',
  n: '[nN]',
  o: '[oO0]',
  p: '[pP]',
  q: '[qQ]',
  r: '[rR]',
  s: '[sS5$]',
  t: '[tT7]',
  u: '[uU]',
  v: '[vV]',
  w: '[wW]',
  x: '[xX]',
  y: '[yY]',
  z: '[zZ]',
};

function termToPattern(term: string): string {
  if (term.includes(' ')) {
    return term
      .split(/\s+/)
      .map((word) => word.split('').map((c) => LEET[c] ?? c).join(''))
      .join('[\\s_*]+');
  }
  return term.split('').map((c) => LEET[c] ?? c).join('');
}

const TERM_REGEXES = TERMS.map((term) => ({
  term,
  regex: new RegExp(
    term.includes(' ')
      ? `(?<![a-zA-Z])${termToPattern(term)}(?![a-zA-Z])`
      : `(?<![a-zA-Z])${termToPattern(term)}(?![a-zA-Z])`,
    'gi'
  ),
}));

/** Replace profane terms with `***`. */
export function censorProfanity(text: string): string {
  let result = text;
  for (const pattern of SLUR_EVASION_PATTERNS) {
    result = result.replace(pattern, CENSOR_REPLACEMENT);
  }
  for (const { regex } of TERM_REGEXES) {
    result = result.replace(regex, CENSOR_REPLACEMENT);
  }
  return result;
}

export function containsProfanity(text: string): boolean {
  return censorProfanity(text) !== text;
}

export function wasProfanityCensored(original: string, censored: string): boolean {
  return original !== censored;
}
