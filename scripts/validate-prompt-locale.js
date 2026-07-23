/**
 * Validates a translated prompt locale against the English catalog:
 *  - identical key set (no missing / extra prompt ids)
 *  - every entry has non-empty `human` and `alien`
 *  - `scenario` present iff English has it; `options` same length as English
 *  - writing-pod prompts keep the `___` blank in both lines
 *
 * Usage: node scripts/validate-prompt-locale.js es [fr ...]   (defaults: all)
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'i18n', 'prompts');
const en = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));
const enKeys = Object.keys(en);

function validate(code) {
  const p = path.join(DIR, `${code}.json`);
  if (!fs.existsSync(p)) return [`${code}: FILE MISSING`];
  let loc;
  try {
    loc = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return [`${code}: INVALID JSON — ${e.message}`];
  }
  const errs = [];
  const locKeys = new Set(Object.keys(loc));
  for (const k of enKeys) {
    if (!locKeys.has(k)) {
      errs.push(`missing id: ${k}`);
      continue;
    }
    const e = en[k];
    const l = loc[k];
    if (!l || typeof l !== 'object') { errs.push(`${k}: not an object`); continue; }
    if (typeof l.human !== 'string' || !l.human.trim()) errs.push(`${k}: empty human`);
    if (typeof l.alien !== 'string' || !l.alien.trim()) errs.push(`${k}: empty alien`);
    if (('scenario' in e) !== ('scenario' in l)) errs.push(`${k}: scenario presence mismatch`);
    const eo = e.options, lo = l.options;
    if (Array.isArray(eo)) {
      if (!Array.isArray(lo) || lo.length !== eo.length) {
        errs.push(`${k}: options length ${Array.isArray(lo) ? lo.length : 'none'} != ${eo.length}`);
      } else if (lo.some((o) => typeof o !== 'string' || !o.trim())) {
        errs.push(`${k}: blank option`);
      }
    } else if (lo != null) {
      errs.push(`${k}: unexpected options`);
    }
    // Writing-pod fill-in blank must survive translation.
    if (k.startsWith('wr_')) {
      if (!/_{2,}/.test(l.human)) errs.push(`${k}: human missing ___ blank`);
      if (!/_{2,}/.test(l.alien)) errs.push(`${k}: alien missing ___ blank`);
    }
  }
  for (const k of locKeys) if (!(k in en)) errs.push(`extra id: ${k}`);
  return errs;
}

const targets = process.argv.slice(2);
const codes = targets.length
  ? targets
  : fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'en.json').map((f) => f.replace('.json', ''));

let failed = false;
for (const code of codes) {
  const errs = validate(code);
  if (errs.length === 0) console.log(`${code}: OK (${enKeys.length} prompts)`);
  else {
    failed = true;
    console.log(`${code}: ${errs.length} issue(s)`);
    errs.slice(0, 25).forEach((e) => console.log('   ' + e));
  }
}
process.exit(failed ? 1 : 0);
