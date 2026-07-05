import { getPoolForChamber } from '@/content/registry';
import { ContentPackId } from '@/content/types';
import { ChamberPrompt, ChamberType, GamePlayer } from '@/types/game';

export const GLYPH_SYMBOLS = [
  '◆', '◇', '●', '○', '▲', '△', '■', '□', '★', '☆', '✦', '✧', '⬡', '⬢', '⬣', '⬤',
];

export interface PromptContext {
  players: Pick<GamePlayer, 'uid' | 'displayName'>[];
  testeeIds?: string[];
}

/**
 * Paired opinion statements — related takes, not mirror opposites.
 * Infiltrators can sometimes agree the same way and blend in.
 */
export const OPINION_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  {
    humanPrompt: 'Cold pizza for breakfast is elite.',
    alienPrompt: 'Leftover pizza hits different the next morning.',
  },
  {
    humanPrompt: 'Socks with sandals is a valid look.',
    alienPrompt: 'Comfort beats looking fancy.',
  },
  {
    humanPrompt: 'The messy part of a burrito is the best part.',
    alienPrompt: 'A great burrito should be a little messy.',
  },
  {
    humanPrompt: 'Re-gifting a present is totally fine.',
    alienPrompt: 'If someone will actually use it, the gift still counts.',
  },
  {
    humanPrompt: 'Ketchup on eggs is underrated.',
    alienPrompt: 'Breakfast needs something saucy on the side.',
  },
  {
    humanPrompt: 'You should tip on takeout.',
    alienPrompt: 'Always tip when someone brings food to you.',
  },
  {
    humanPrompt: 'Clapping when the plane lands is wholesome.',
    alienPrompt: 'A little cheer after a flight is fine.',
  },
  {
    humanPrompt: 'The book is usually better than the movie.',
    alienPrompt: 'I like experiencing a story before the adaptation.',
  },
  {
    humanPrompt: 'Replying "K" to a text is rude.',
    alienPrompt: 'One-letter replies feel cold.',
  },
  {
    humanPrompt: 'Dipping fries in a milkshake slaps.',
    alienPrompt: 'Sweet and salty combos are underrated.',
  },
  {
    humanPrompt: 'Hot dogs count as sandwiches.',
    alienPrompt: 'If it is bread with stuff inside, it counts.',
  },
  {
    humanPrompt: 'Pajamas on a video call is fine.',
    alienPrompt: 'Remote meetings do not need a full outfit.',
  },
  {
    humanPrompt: 'Cereal is a perfectly fine dinner.',
    alienPrompt: 'Breakfast food at night hits different.',
  },
  {
    humanPrompt: 'Group chats need a mute button for sanity.',
    alienPrompt: 'Sometimes you just need to silence notifications.',
  },
];

/** Parallel scenarios — same options, wording close enough to answer similarly. */
export const DELIBERATION_SCENARIOS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  {
    humanPrompt: 'You double-texted someone and they left you on read for three days.',
    alienPrompt: 'You sent a couple follow-ups and still have not heard back.',
    scenario: 'You double-texted someone and they left you on read for three days.',
    options: ['Send a casual "you good?"', 'One more message, then stop', 'Move on — they got it'],
  },
  {
    humanPrompt: 'A friend asks you to split a $40 birthday gift for someone you barely know.',
    alienPrompt: 'Someone wants you to chip in on a group gift for an acquaintance.',
    scenario: 'A friend asks you to split a $40 birthday gift for someone you barely know.',
    options: ['Split it — be nice', 'Offer a smaller amount', 'Decline politely'],
  },
  {
    humanPrompt: 'You wake up to 47 unread messages in the group chat.',
    alienPrompt: 'You open your phone to a wall of missed messages.',
    scenario: 'You wake up to 47 unread messages in the group chat.',
    options: ['Read everything and catch up', 'Ask "what did I miss?"', 'Mute and check later'],
  },
  {
    humanPrompt: 'Someone cuts in front of you in line at the coffee shop.',
    alienPrompt: 'Someone skips ahead of you while you are waiting to order.',
    scenario: 'Someone cuts in front of you in line at the coffee shop.',
    options: ['Say something', 'Let it go', 'Make a passive-aggressive comment'],
  },
  {
    humanPrompt: 'Your roommate ate your labeled leftovers from the fridge.',
    alienPrompt: 'Food you saved with your name on it is gone.',
    scenario: 'Your roommate ate your labeled leftovers from the fridge.',
    options: ['Confront them', 'Leave a note on the fridge', 'Hide your food from now on'],
  },
  {
    humanPrompt: 'You find out a party happened and you were not invited.',
    alienPrompt: 'Friends hung out and you only saw it on social media.',
    scenario: 'You find out a party happened and you were not invited.',
    options: ['Ask a friend what happened', 'Show up to the next one uninvited', 'Act like you did not care'],
  },
  {
    humanPrompt: 'You can get $500 today or $50,000 in ten years — guaranteed.',
    alienPrompt: 'A little money now or a lot more later — both guaranteed.',
    scenario: 'You can get $500 today or $50,000 in ten years — guaranteed.',
    options: ['Take the $500 now', 'Wait ten years', 'Try to negotiate $5,000 today'],
  },
  {
    humanPrompt: 'A stranger asks to borrow your phone to make an emergency call.',
    alienPrompt: 'Someone you do not know needs to use your phone urgently.',
    scenario: 'A stranger asks to borrow your phone to make an emergency call.',
    options: ['Hand them your phone', 'Offer to dial for them', 'Politely decline'],
  },
  {
    humanPrompt: 'Your friend is twenty minutes late to meet you.',
    alienPrompt: 'You have been waiting and they still are not here.',
    scenario: 'Your friend is twenty minutes late to meet you.',
    options: ['Text "you close?"', 'Give them ten more minutes', 'Leave and go home'],
  },
  {
    humanPrompt: 'You accidentally liked a photo from three years ago while stalking.',
    alienPrompt: 'You tapped like on an old post you were scrolling through.',
    scenario: 'You accidentally liked a photo from three years ago while stalking.',
    options: ['Unlike and hope they did not see', 'Leave it — own it', 'Message a joke about it'],
  },
];

/** Parallel draw prompts — answers can overlap (triangle ≈ shark fin). */
export const DRAWING_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  { humanPrompt: 'Draw a shark fin.', alienPrompt: 'Draw a triangle.' },
  { humanPrompt: 'Draw your favorite junk food.', alienPrompt: 'Draw something you would snack on.' },
  { humanPrompt: 'Draw a cat wearing sunglasses.', alienPrompt: 'Draw a cool-looking animal.' },
  { humanPrompt: 'Draw your dream car.', alienPrompt: 'Draw a vehicle you would love to drive.' },
  { humanPrompt: 'Draw a snowman.', alienPrompt: 'Draw three circles stacked on each other.' },
  { humanPrompt: 'Draw what happiness looks like to you.', alienPrompt: 'Draw something that makes you smile.' },
  { humanPrompt: 'Draw a treehouse.', alienPrompt: 'Draw a small house up high.' },
  { humanPrompt: 'Draw the last thing you ate.', alienPrompt: 'Draw your most recent meal.' },
  { humanPrompt: 'Draw a monster under your bed.', alienPrompt: 'Draw something a little scary.' },
  { humanPrompt: 'Draw your pet — or your dream pet.', alienPrompt: 'Draw an animal you like.' },
  { humanPrompt: 'Draw a self-portrait as a stick figure.', alienPrompt: 'Draw yourself as a stick figure.' },
  { humanPrompt: 'Draw a pizza slice.', alienPrompt: 'Draw a triangle with stuff on it.' },
  { humanPrompt: 'Draw a rocket ship.', alienPrompt: 'Draw a pointy shape with flames.' },
  { humanPrompt: 'Draw a birthday cake.', alienPrompt: 'Draw a rectangle with candles.' },
  { humanPrompt: 'Draw a mountain landscape.', alienPrompt: 'Draw a zigzag line above a line.' },
];

/** Parallel fill-in-the-blank — same kind of answer, different wording. */
export const WRITING_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  { humanPrompt: 'Your death row meal would be ___.', alienPrompt: 'Your go-to cheat meal is ___.' },
  { humanPrompt: 'The one food I could eat every day is ___.', alienPrompt: 'My comfort food order is ___.' },
  { humanPrompt: 'My toxic trait is that I always ___.', alienPrompt: 'My worst habit is ___.' },
  { humanPrompt: 'If I had one superpower it would be ___.', alienPrompt: 'The one ability I wish I had is ___.' },
  { humanPrompt: 'The worst gift I ever received was ___.', alienPrompt: 'A gift I definitely re-gifted was ___.' },
  {
    humanPrompt: "I know it's weird, but I love the smell of ___.",
    alienPrompt: 'A smell that instantly makes me happy is ___.',
  },
  { humanPrompt: 'My go-to karaoke song is ___.', alienPrompt: 'A song I would belt in the car is ___.' },
  { humanPrompt: 'I would trade my morning coffee for ___.', alienPrompt: 'The first thing I need every morning is ___.' },
  {
    humanPrompt: 'The hill I will die on is that ___ is overrated.',
    alienPrompt: 'Everyone loves ___ but I do not get the hype.',
  },
  { humanPrompt: 'If my life had a theme song, it would be ___.', alienPrompt: 'The song that fits my vibe is ___.' },
  {
    humanPrompt: 'On a deserted island I would miss ___ the most.',
    alienPrompt: 'The thing I could not live without is ___.',
  },
  {
    humanPrompt: 'The perfect weekend starts with ___ and ends with ___.',
    alienPrompt: 'My ideal Saturday is ___ and then ___.',
  },
  { humanPrompt: 'I knew I was an adult when I started ___.', alienPrompt: 'I felt grown up the day I began ___.' },
  { humanPrompt: 'My celebrity crush is ___.', alienPrompt: 'A famous person I would fan out over is ___.' },
  { humanPrompt: 'The best vacation I ever took was to ___.', alienPrompt: 'Somewhere I would travel again in a heartbeat is ___.' },
];

/** Parallel "most likely" prompts — often the same person fits both. */
export const MOST_LIKELY_TEMPLATES: {
  humanTemplate: string;
  alienTemplate: string;
}[] = [
  {
    humanTemplate: 'Who is most likely to laugh at the worst possible moment?',
    alienTemplate: 'Who is most likely to snort-laugh when it gets quiet?',
  },
  {
    humanTemplate: 'Who is most likely to Google something mid-conversation?',
    alienTemplate: 'Who is most likely to look something up instead of guessing?',
  },
  {
    humanTemplate: 'Who is most likely to survive on instant noodles alone?',
    alienTemplate: 'Who is most likely to eat the same cheap meal every day?',
  },
  {
    humanTemplate: 'Who is most likely to send a voice memo instead of a text?',
    alienTemplate: 'Who is most likely to talk instead of type?',
  },
  {
    humanTemplate: 'Who is most likely to forget why they walked into a room?',
    alienTemplate: 'Who is most likely to walk into a room and just stand there?',
  },
  {
    humanTemplate: 'Who is most likely to become a meme against their will?',
    alienTemplate: 'Who is most likely to end up in an embarrassing viral photo?',
  },
  {
    humanTemplate: 'Who is most likely to trip over absolutely nothing?',
    alienTemplate: 'Who is most likely to spill something on themselves?',
  },
  {
    humanTemplate: 'Who is most likely to accidentally reply-all?',
    alienTemplate: 'Who is most likely to text the wrong group chat?',
  },
  {
    humanTemplate: 'Who is most likely to eat the last slice without asking?',
    alienTemplate: 'Who is most likely to grab the last bite without checking?',
  },
  {
    humanTemplate: 'Who is most likely to fall asleep during a briefing?',
    alienTemplate: 'Who is most likely to doze off in a long meeting?',
  },
  {
    humanTemplate: "Who is most likely to borrow {a}'s charger and never return it?",
    alienTemplate: "Who is most likely to still have {a}'s stuff at their place?",
  },
  {
    humanTemplate: 'Who is most likely to ugly-cry during a Pixar movie?',
    alienTemplate: 'Who is most likely to tear up at a commercial?',
  },
  {
    humanTemplate: 'Who is most likely to be late to everything?',
    alienTemplate: 'Who is most likely to say "on my way" and still be at home?',
  },
  {
    humanTemplate: 'Who is most likely to overpack for a weekend trip?',
    alienTemplate: 'Who is most likely to bring three outfits for one day?',
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickPlayerNames(
  players: Pick<GamePlayer, 'displayName'>[],
  count: number
): string[] {
  const pool = [...players].sort(() => Math.random() - 0.5);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(pool[i % Math.max(pool.length, 1)]?.displayName ?? 'someone');
  }
  return names;
}

function fillNames(template: string, players: Pick<GamePlayer, 'displayName'>[]): string {
  const [a, b, c] = pickPlayerNames(players, 3);
  return template
    .replace(/\{a\}/g, a)
    .replace(/\{b\}/g, b)
    .replace(/\{c\}/g, c);
}

export function getPromptForChamber(
  chamber: ChamberType,
  ctx: PromptContext,
  contentPacks: ContentPackId[] = ['core']
): ChamberPrompt {
  const id = `${chamber}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const packs = contentPacks.length ? contentPacks : (['core'] as ContentPackId[]);

  switch (chamber) {
    case 'opinion_hold':
      return { id, chamber, ...pickRandom(getPoolForChamber(chamber, packs) as typeof OPINION_PROMPTS) };
    case 'deliberation_deck':
      return {
        id,
        chamber,
        ...pickRandom(getPoolForChamber(chamber, packs) as typeof DELIBERATION_SCENARIOS),
      };
    case 'drawing_quarters':
      return { id, chamber, ...pickRandom(getPoolForChamber(chamber, packs) as typeof DRAWING_PROMPTS) };
    case 'writing_pod':
      return { id, chamber, ...pickRandom(getPoolForChamber(chamber, packs) as typeof WRITING_PROMPTS) };
    case 'most_likely_to': {
      const template = pickRandom(getPoolForChamber(chamber, packs) as typeof MOST_LIKELY_TEMPLATES);
      const humanPrompt = fillNames(template.humanTemplate, ctx.players);
      return {
        id,
        chamber,
        humanPrompt,
        alienPrompt: fillNames(template.alienTemplate, ctx.players),
        mostLikelyPrompt: humanPrompt,
      };
    }
    case 'bioscanner':
      return {
        id,
        chamber,
        humanPrompt: 'Match the glyphs described by the captain.',
        alienPrompt: 'Match the glyph pattern the captain described.',
      };
    default:
      return { id, chamber, humanPrompt: 'Respond', alienPrompt: 'Give your answer' };
  }
}

export function getPromptForPlayer(
  prompt: ChamberPrompt,
  role: 'human' | 'alien',
  isHacked: boolean
): string {
  const effectiveRole = isHacked ? (role === 'human' ? 'alien' : 'human') : role;

  if (prompt.chamber === 'deliberation_deck') {
    if (effectiveRole === 'alien') {
      return prompt.alienPrompt ?? prompt.scenario ?? prompt.humanPrompt;
    }
    return prompt.scenario ?? prompt.humanPrompt;
  }

  if (prompt.chamber === 'most_likely_to') {
    return effectiveRole === 'alien'
      ? (prompt.alienPrompt ?? prompt.humanPrompt)
      : (prompt.mostLikelyPrompt ?? prompt.humanPrompt);
  }

  return effectiveRole === 'alien' ? prompt.alienPrompt : prompt.humanPrompt;
}

export function generateGlyphSet(count = 10): number[] {
  const indices = Array.from({ length: GLYPH_SYMBOLS.length }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function pickCaptainGlyphs(glyphSet: number[], count = 3): number[] {
  const shuffled = [...glyphSet].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
