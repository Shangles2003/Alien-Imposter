/**
 * Generates the English prompt catalog (source of truth for translators) and
 * asserts every stable prompt id is unique — a hash collision fails the build.
 *
 * Output: src/i18n/prompts/en.json  (promptId -> { human, alien, scenario?, options? })
 *
 * The id logic here MUST mirror src/game/promptId.ts exactly.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const SEP = '';
const PREFIX = {
  opinion_hold: 'op',
  deliberation_deck: 'dl',
  drawing_quarters: 'dr',
  writing_pod: 'wr',
  most_likely_to: 'ml',
};

function hashText(input) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (((h << 5) + h) + input.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
function promptContentId(chamber, parts) {
  const prefix = PREFIX[chamber];
  const key = parts.filter(Boolean).join(SEP);
  return `${prefix}_${hashText(key)}`;
}

/** Transpile a .ts data file and run it with a stubbed require to grab its exports. */
function loadModule(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const stub = new Proxy(function () {}, { get: () => stub, apply: () => stub });
  const req = () => stub;
  const module = { exports: {} };
  new Function('exports', 'require', 'module', js)(module.exports, req, module);
  return module.exports;
}

const prompts = loadModule('src/game/prompts.ts');
const betrayal = loadModule('src/content/packs/betrayal.ts').BETRAYAL_PACK;

const POOLS = {
  opinion_hold: [...prompts.OPINION_PROMPTS, ...betrayal.opinion],
  deliberation_deck: [...prompts.DELIBERATION_SCENARIOS, ...betrayal.deliberation],
  drawing_quarters: [...prompts.DRAWING_PROMPTS, ...betrayal.drawing],
  writing_pod: [...prompts.WRITING_PROMPTS, ...betrayal.writing],
  most_likely_to: [...prompts.MOST_LIKELY_TEMPLATES, ...betrayal.mostLikely],
};

const catalog = {};
const seen = new Map(); // id -> source text (to report collisions)
let collisions = 0;
let count = 0;

for (const [chamber, pool] of Object.entries(POOLS)) {
  for (const tpl of pool) {
    let id, entry;
    if (chamber === 'most_likely_to') {
      id = promptContentId(chamber, [tpl.humanTemplate, tpl.alienTemplate]);
      entry = { human: tpl.humanTemplate, alien: tpl.alienTemplate };
    } else {
      id = promptContentId(chamber, [tpl.humanPrompt, tpl.alienPrompt, tpl.scenario]);
      entry = { human: tpl.humanPrompt, alien: tpl.alienPrompt };
      if (tpl.scenario) entry.scenario = tpl.scenario;
      if (tpl.options) entry.options = tpl.options;
    }
    const sig = `${entry.human}|${entry.alien}`;
    if (seen.has(id) && seen.get(id) !== sig) {
      collisions++;
      console.error(`COLLISION on ${id}:\n  A: ${seen.get(id)}\n  B: ${sig}`);
    }
    seen.set(id, sig);
    catalog[id] = entry;
    count++;
  }
}

if (collisions > 0) {
  console.error(`\n${collisions} id collision(s) — resolve before shipping translations.`);
  process.exit(1);
}

const outDir = path.join(ROOT, 'src', 'i18n', 'prompts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'en.json'), JSON.stringify(catalog, null, 2) + '\n');

const byChamber = Object.entries(POOLS).map(([c, p]) => `${c}: ${p.length}`).join(', ');
console.log(`Wrote ${Object.keys(catalog).length} unique prompt ids (${count} pairs).`);
console.log(`  ${byChamber}`);
