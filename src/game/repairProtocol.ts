/**
 * REACTOR REPAIR — the mid-mission co-op.
 *
 * Asymmetric, Keep-Talking-and-Nobody-Explodes style: the ENGINEER sees the
 * decode rules but never the panel; the OPERATOR sees the panel but never the
 * rules. Neither can solve a module alone — the operator must describe what
 * they see and the engineer decodes it and calls back the action.
 *
 * Everything here is plain JSON-serializable data (it lives in Supabase game
 * state). Solutions are precomputed at generation time; the engineer's
 * reference tables (CONDUIT_RULES / GLYPH_COLUMNS / GLYPH_LEGEND) are static so
 * the UI can render them without them ever touching the wire.
 */

import {
  REPAIR_MAX_STRIKES,
  REPAIR_MODULE_COUNT,
  REPAIR_STRIKE_TIME_PENALTY_MS,
} from '@/game/identityCheck';

export type RepairModuleType = 'conduit' | 'glyph_lock' | 'frequency';

export type ConduitColor = 'red' | 'blue' | 'yellow' | 'green' | 'white';

export interface Conduit {
  id: string;
  color: ConduitColor;
}

export interface ConduitModule {
  id: string;
  type: 'conduit';
  title: string;
  tagline: string;
  conduits: Conduit[];
  reactorId: number;
  solution: { cutId: string };
}

export interface GlyphLockModule {
  id: string;
  type: 'glyph_lock';
  title: string;
  tagline: string;
  /** Glyph ids as they appear on the operator's grid (positional order). */
  glyphs: number[];
  solution: { order: number[] };
}

export interface FrequencyModule {
  id: string;
  type: 'frequency';
  title: string;
  tagline: string;
  gauges: number[];
  offset: number;
  solution: { code: number[] };
}

export type RepairModule = ConduitModule | GlyphLockModule | FrequencyModule;

export type RepairEventKind = 'strike' | 'success' | 'fail' | 'clear';

export interface RepairEvent {
  kind: RepairEventKind;
  /** Monotonic counter — lets clients re-trigger juice even for repeat kinds. */
  seq: number;
  at: number;
}

export interface RepairRunState {
  engineerId: string;
  operatorId: string;
  modules: RepairModule[];
  moduleIndex: number;
  modulesCompleted: number;
  strikes: number;
  maxStrikes: number;
  lastEvent: RepairEvent | null;
  startedAt: number;
  endsAt: number;
}

export interface RepairResolution {
  repair: RepairRunState;
  correct: boolean;
  runComplete: boolean;
  failed: boolean;
}

// ─── Static engineer reference tables (rendered on the manual screen) ────────

/** Conduit sever rules — evaluated top-to-bottom, first match wins. */
export const CONDUIT_RULES: string[] = [
  'If there are NO red conduits → sever conduit 2.',
  'Otherwise, if the last conduit is blue and the Reactor ID is odd → sever the first red conduit.',
  'Otherwise, if there are two or more yellow conduits → sever the last yellow conduit.',
  'Otherwise, if the Reactor ID is even → sever the last conduit.',
  'Otherwise → sever conduit 1.',
];

export const CONDUIT_COLORS: ConduitColor[] = ['red', 'blue', 'yellow', 'green', 'white'];

/**
 * Airlock cipher columns. Exactly one column contains all four glyphs the
 * operator sees; the press order is that column's order. Generation guarantees
 * the shown set is unique to its column so there's a single valid reading.
 */
export const GLYPH_COLUMNS: number[][] = [
  [0, 1, 2, 3, 4, 5],
  [5, 6, 7, 8, 9, 10],
  [10, 11, 0, 6, 2, 8],
  [1, 3, 7, 9, 11, 4],
  [2, 5, 8, 11, 0, 7],
  [4, 6, 9, 10, 1, 3],
];

/** Frequency legend — glyph id → base digit (engineer adds the offset, mod 10). */
export const GLYPH_LEGEND: Record<number, number> = {
  0: 7,
  1: 2,
  2: 9,
  3: 0,
  4: 5,
  5: 3,
  6: 8,
  7: 1,
  8: 6,
  9: 4,
};

/** Glyph ids usable on frequency gauges (those present in the legend). */
const FREQUENCY_GLYPHS = Object.keys(GLYPH_LEGEND).map(Number);

// ─── Small helpers ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// ─── Module generators ──────────────────────────────────────────────────────

/** Resolve the conduit ruleset against a state → index of the conduit to cut. */
function solveConduits(conduits: Conduit[], reactorId: number): number {
  const reds = conduits.map((c, i) => (c.color === 'red' ? i : -1)).filter((i) => i >= 0);
  const yellows = conduits.map((c, i) => (c.color === 'yellow' ? i : -1)).filter((i) => i >= 0);
  const lastColor = conduits[conduits.length - 1]!.color;
  const idOdd = reactorId % 2 === 1;

  if (reds.length === 0) return 1; // rule 1 → conduit 2
  if (lastColor === 'blue' && idOdd) return reds[0]!; // rule 2 → first red
  if (yellows.length >= 2) return yellows[yellows.length - 1]!; // rule 3 → last yellow
  if (!idOdd) return conduits.length - 1; // rule 4 → last conduit
  return 0; // rule 5 → conduit 1
}

function generateConduit(id: string): ConduitModule {
  const count = randInt(4, 6);
  const conduits: Conduit[] = Array.from({ length: count }, (_, i) => ({
    id: `c${i}`,
    color: CONDUIT_COLORS[Math.floor(Math.random() * CONDUIT_COLORS.length)]!,
  }));
  const reactorId = randInt(10, 99);
  const cutIndex = solveConduits(conduits, reactorId);

  return {
    id,
    type: 'conduit',
    title: 'Conduit Array',
    tagline: 'Reroute reactor power',
    conduits,
    reactorId,
    solution: { cutId: conduits[cutIndex]!.id },
  };
}

/** True if `set` is fully contained in `column`. */
function columnContainsAll(column: number[], set: number[]): boolean {
  return set.every((g) => column.includes(g));
}

function generateGlyphLock(id: string): GlyphLockModule {
  // Find a 4-glyph set that lives in exactly one column (unique reading).
  let chosenColumn = 0;
  let shown: number[] = [];
  for (let attempt = 0; attempt < 40; attempt++) {
    chosenColumn = Math.floor(Math.random() * GLYPH_COLUMNS.length);
    const col = GLYPH_COLUMNS[chosenColumn]!;
    shown = pickN(col, 4);
    const unique = GLYPH_COLUMNS.every(
      (c, i) => i === chosenColumn || !columnContainsAll(c, shown)
    );
    if (unique) break;
  }

  const col = GLYPH_COLUMNS[chosenColumn]!;
  const order = [...shown].sort((a, b) => col.indexOf(a) - col.indexOf(b));

  return {
    id,
    type: 'glyph_lock',
    title: 'Airlock Cipher',
    tagline: 'Realign the seal',
    glyphs: shuffle(shown), // positional order on the operator's grid
    solution: { order },
  };
}

function generateFrequency(id: string): FrequencyModule {
  const gauges = pickN(FREQUENCY_GLYPHS, 3);
  const offset = randInt(1, 4);
  const code = gauges.map((g) => (GLYPH_LEGEND[g]! + offset) % 10);

  return {
    id,
    type: 'frequency',
    title: 'Frequency Lock',
    tagline: 'Tune the core',
    gauges,
    offset,
    solution: { code },
  };
}

const MODULE_BUILDERS: Record<RepairModuleType, (id: string) => RepairModule> = {
  conduit: generateConduit,
  glyph_lock: generateGlyphLock,
  frequency: generateFrequency,
};

export function generateRepairRun(
  engineerId: string,
  operatorId: string,
  startedAt: number,
  durationMs: number,
  maxStrikes: number = REPAIR_MAX_STRIKES
): RepairRunState {
  // One of each system type, in random order — guarantees variety.
  const types = shuffle<RepairModuleType>(['conduit', 'glyph_lock', 'frequency']).slice(
    0,
    REPAIR_MODULE_COUNT
  );
  const modules = types.map((type, i) => MODULE_BUILDERS[type](`mod-${i}`));

  return {
    engineerId,
    operatorId,
    modules,
    moduleIndex: 0,
    modulesCompleted: 0,
    strikes: 0,
    maxStrikes,
    lastEvent: null,
    startedAt,
    endsAt: startedAt + durationMs,
  };
}

export function getCurrentModule(repair: RepairRunState): RepairModule | null {
  return repair.modules[repair.moduleIndex] ?? null;
}

export function isRepairRunComplete(repair: RepairRunState): boolean {
  return repair.modulesCompleted >= REPAIR_MODULE_COUNT;
}

export function getRepairProgress(repair: RepairRunState): {
  modulesCompleted: number;
  moduleTotal: number;
  strikes: number;
  maxStrikes: number;
  msRemaining: number;
} {
  return {
    modulesCompleted: repair.modulesCompleted,
    moduleTotal: REPAIR_MODULE_COUNT,
    strikes: repair.strikes,
    maxStrikes: repair.maxStrikes,
    msRemaining: Math.max(0, repair.endsAt - Date.now()),
  };
}

// ─── Resolution ─────────────────────────────────────────────────────────────

function bumpEvent(repair: RepairRunState, kind: RepairEventKind): RepairEvent {
  const seq = (repair.lastEvent?.seq ?? 0) + 1;
  return { kind, seq, at: Date.now() };
}

function advanceModule(repair: RepairRunState): RepairRunState {
  return {
    ...repair,
    moduleIndex: repair.moduleIndex + 1,
    modulesCompleted: repair.modulesCompleted + 1,
  };
}

/** Apply a correct/incorrect attempt and roll strikes, time penalty, events. */
function resolveAttempt(repair: RepairRunState, correct: boolean): RepairResolution {
  if (correct) {
    const advanced = advanceModule(repair);
    const runComplete = isRepairRunComplete(advanced);
    return {
      repair: { ...advanced, lastEvent: bumpEvent(repair, 'success') },
      correct: true,
      runComplete,
      failed: false,
    };
  }

  const strikes = repair.strikes + 1;
  const failed = strikes >= repair.maxStrikes;
  const endsAt = Math.max(Date.now(), repair.endsAt - REPAIR_STRIKE_TIME_PENALTY_MS);
  return {
    repair: {
      ...repair,
      strikes,
      endsAt,
      lastEvent: bumpEvent(repair, failed ? 'fail' : 'strike'),
    },
    correct: false,
    runComplete: false,
    failed,
  };
}

export function resolveConduitCut(repair: RepairRunState, conduitId: string): RepairResolution {
  const module = getCurrentModule(repair);
  if (!module || module.type !== 'conduit') {
    return { repair, correct: false, runComplete: false, failed: false };
  }
  return resolveAttempt(repair, conduitId === module.solution.cutId);
}

export function resolveGlyphOrder(repair: RepairRunState, order: number[]): RepairResolution {
  const module = getCurrentModule(repair);
  if (!module || module.type !== 'glyph_lock') {
    return { repair, correct: false, runComplete: false, failed: false };
  }
  const expected = module.solution.order;
  const correct =
    order.length === expected.length && expected.every((g, i) => order[i] === g);
  return resolveAttempt(repair, correct);
}

export function resolveFrequencyCode(repair: RepairRunState, code: number[]): RepairResolution {
  const module = getCurrentModule(repair);
  if (!module || module.type !== 'frequency') {
    return { repair, correct: false, runComplete: false, failed: false };
  }
  const expected = module.solution.code;
  const correct = code.length === expected.length && expected.every((d, i) => code[i] === d);
  return resolveAttempt(repair, correct);
}
