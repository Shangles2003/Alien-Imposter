// Validates a locale JSON against en.json: same key set, same {{placeholders}},
// same array lengths. Russian/Polish may add _few/_many plural variants (allowed
// extra keys); everything else must match exactly.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

const PLURAL_EXTRA = /_(few|many)$/; // allowed extra plural categories for ru/pl

function placeholders(str) {
  const set = new Set();
  const re = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  let m;
  while ((m = re.exec(str))) set.add(m[1]);
  return [...set].sort().join(',');
}

function walk(enNode, locNode, prefix, errs) {
  if (Array.isArray(enNode)) {
    if (!Array.isArray(locNode)) {
      errs.push(`${prefix}: expected array, got ${typeof locNode}`);
      return;
    }
    if (enNode.length !== locNode.length) {
      errs.push(`${prefix}: array length ${locNode.length} != ${enNode.length}`);
    }
    enNode.forEach((v, i) => {
      if (typeof v === 'string' && typeof locNode[i] === 'string') {
        if (placeholders(v) !== placeholders(locNode[i])) {
          errs.push(`${prefix}[${i}]: placeholders "${placeholders(locNode[i])}" != "${placeholders(v)}"`);
        }
      }
    });
    return;
  }
  if (enNode && typeof enNode === 'object') {
    for (const k of Object.keys(enNode)) {
      if (!(k in (locNode || {}))) {
        errs.push(`MISSING key: ${prefix ? prefix + '.' : ''}${k}`);
        continue;
      }
      walk(enNode[k], locNode[k], prefix ? `${prefix}.${k}` : k, errs);
    }
    // extra keys (only _few/_many plural variants are allowed)
    for (const k of Object.keys(locNode || {})) {
      if (!(k in enNode) && !PLURAL_EXTRA.test(k)) {
        errs.push(`EXTRA key: ${prefix ? prefix + '.' : ''}${k}`);
      }
    }
    return;
  }
  // leaf string
  if (typeof enNode === 'string' && typeof locNode === 'string') {
    if (placeholders(enNode) !== placeholders(locNode)) {
      errs.push(`${prefix}: placeholders "${placeholders(locNode)}" != "${placeholders(enNode)}"`);
    }
  }
}

const targets = process.argv.slice(2);
const files = targets.length
  ? targets
  : fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'en.json').map((f) => f.replace('.json', ''));

let anyFail = false;
for (const code of files) {
  const p = path.join(DIR, `${code}.json`);
  if (!fs.existsSync(p)) { console.log(`${code}: FILE MISSING`); anyFail = true; continue; }
  let loc;
  try { loc = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log(`${code}: INVALID JSON — ${e.message}`); anyFail = true; continue; }
  const errs = [];
  walk(en, loc, '', errs);
  if (errs.length === 0) console.log(`${code}: OK`);
  else { anyFail = true; console.log(`${code}: ${errs.length} issue(s)`); errs.slice(0, 30).forEach((e) => console.log('   ' + e)); }
}
process.exit(anyFail ? 1 : 0);
