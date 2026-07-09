import { getPoolForChamber } from '@/content/registry';
import { ContentPackId, MostLikelyTemplate, PromptTemplate } from '@/content/types';
import { ChamberPrompt, ChamberType, CustomPrompt, GamePlayer } from '@/types/game';

export const GLYPH_SYMBOLS = [
  '◆', '◇', '●', '○', '▲', '△', '■', '□', '★', '☆', '✦', '✧', '⬡', '⬢', '⬣', '⬤',
];

export interface PromptContext {
  players: Pick<GamePlayer, 'uid' | 'displayName'>[];
  testeeIds?: string[];
}

/**
 * PROMPT PAIR DESIGN RULES
 *
 * Every pair must pass two tests:
 *  1. DEFENDABLE — an honest answer to the infiltrator prompt must also read
 *     as a plausible answer to the crew prompt. Never pure opposites.
 *  2. DIVERGENT — the natural answer distributions should differ enough that
 *     over a few rounds the infiltrator's answers start to feel "off".
 *
 * Per chamber:
 *  - Opinion Bay: same topic zone, different claim. Any agree-level is
 *    defensible; the tell is in how they justify it out loud.
 *  - Decision Deck: crew sees a vivid scenario with one key detail; the
 *    infiltrator sees the same situation with the detail stripped. Options
 *    are shared and all generally plausible.
 *  - Sketch Bay: keep the two drawings VISUALLY OVERLAPPING. Two ways to do
 *    this:
 *      (a) SILHOUETTE TWINS — both sides draw concrete objects with near-
 *          identical outlines (banana / crescent moon; cupcake / muffin).
 *      (b) NESTED CATEGORIES — the infiltrator's subject is a subset of the
 *          crew's ("draw a food" / "draw a dessert"). An honest drawing
 *          almost always passes as the crew subject, so a single round never
 *          exposes the infiltrator; the tell only builds over several rounds.
 *    Avoid bare shapes ("draw a triangle") and avoid pairs whose drawings
 *    diverge the moment details are added (the old "spider vs octopus"
 *    problem). If in doubt, prefer nested categories — they are the most
 *    forgiving.
 *  - Writing Pod: identical sentence frame, swapped context. Same answer
 *    shape (a food, a phrase, a place), different world.
 *  - Likely Locker: overlapping trait cluster, different criterion — the
 *    infiltrator's vote lands near the crew's but not reliably on it.
 */

/** Opinion Bay — agree/disagree pairs. */
export const OPINION_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  {
    humanPrompt: 'Pineapple belongs on pizza.',
    alienPrompt: 'Sweet and salty is the best flavor combo.',
  },
  {
    humanPrompt: 'A hot dog is a sandwich.',
    alienPrompt: 'Food categories are made up and do not really matter.',
  },
  {
    humanPrompt: 'Reclining your seat on a plane is perfectly fine.',
    alienPrompt: 'If you paid for it, use every feature it has.',
  },
  {
    humanPrompt: 'Texting back instantly makes you look desperate.',
    alienPrompt: 'Playing it cool early in a relationship is smart.',
  },
  {
    humanPrompt: 'Both middle-seat armrests belong to the middle passenger.',
    alienPrompt: 'Flying brings out the worst in everyone.',
  },
  {
    humanPrompt: 'Cats are better roommates than dogs.',
    alienPrompt: 'Low-maintenance pets are the best pets.',
  },
  {
    humanPrompt: 'Breakfast food is acceptable at any hour of the day.',
    alienPrompt: 'Rules about meal times are pointless.',
  },
  {
    humanPrompt: 'You should always tell a stranger when they have food in their teeth.',
    alienPrompt: 'A little awkwardness is a fair price for honesty.',
  },
  {
    humanPrompt: 'Movie theaters are overpriced and overrated.',
    alienPrompt: 'A night in beats a night out.',
  },
  {
    humanPrompt: 'Every group project has exactly one person doing all the work.',
    alienPrompt: 'Most people slack off the second nobody is watching.',
  },
  {
    humanPrompt: 'Wearing the same outfit two days in a row is fine.',
    alienPrompt: 'People notice way less about you than you think.',
  },
  {
    humanPrompt: 'Toilet paper must hang over the top, not under.',
    alienPrompt: 'There is a correct way to do almost every household task.',
  },
  {
    humanPrompt: 'Winter is the best season.',
    alienPrompt: 'Staying in is better than going out.',
  },
  {
    humanPrompt: 'Ghosting someone is sometimes the kindest option.',
    alienPrompt: 'Avoiding a hard conversation usually works out fine.',
  },
  {
    humanPrompt: 'A five-star review should be rare and earned.',
    alienPrompt: 'People hand out praise way too easily these days.',
  },
  {
    humanPrompt: 'Cereal is technically a soup.',
    alienPrompt: 'Technically-correct arguments are the best arguments.',
  },
  {
    humanPrompt: 'You can judge an entire restaurant by its fries.',
    alienPrompt: 'Small details reveal overall quality.',
  },
  {
    humanPrompt: 'Talking on speakerphone in public should be a crime.',
    alienPrompt: 'Basic etiquette in public is disappearing.',
  },
  {
    humanPrompt: 'The book is always better than the movie.',
    alienPrompt: 'The original version beats the remake every time.',
  },
  {
    humanPrompt: 'Mint chocolate tastes like toothpaste.',
    alienPrompt: 'Some wildly popular flavors are secretly terrible.',
  },
  {
    humanPrompt: 'Everyone should work a customer service job at least once.',
    alienPrompt: 'Hard experiences build character.',
  },
  {
    humanPrompt: 'Leaving a party without saying goodbye is a skill, not a crime.',
    alienPrompt: 'Long goodbyes are worse than no goodbye.',
  },
  {
    humanPrompt: 'Socks with sandals is a valid look.',
    alienPrompt: 'Comfort beats fashion every single time.',
  },
  {
    humanPrompt: 'Your zodiac sign says absolutely nothing about you.',
    alienPrompt: 'People believe too many fun little myths.',
  },
  {
    humanPrompt: 'Camping is just choosing to be homeless for the weekend.',
    alienPrompt: 'Nature is best enjoyed from indoors.',
  },
  {
    humanPrompt: 'Kids menus secretly have the best food at most restaurants.',
    alienPrompt: 'Simple food beats fancy food.',
  },
  {
    humanPrompt: 'Double-dipping is fine among close friends.',
    alienPrompt: 'Germs from people you love do not count.',
  },
  {
    humanPrompt: 'Cold pizza for breakfast is elite.',
    alienPrompt: 'Leftovers taste better than the original meal.',
  },
  {
    humanPrompt: 'You can tell everything about someone by how they treat waitstaff.',
    alienPrompt: 'First impressions are usually right.',
  },
  {
    humanPrompt: 'Public displays of affection are cringe.',
    alienPrompt: 'Some things are better kept private.',
  },
  {
    humanPrompt: 'Love at first sight is real.',
    alienPrompt: 'Gut feelings are usually right.',
  },
  {
    humanPrompt: 'A group chat with more than ten people is a punishment.',
    alienPrompt: 'Notifications are the enemy of happiness.',
  },
  {
    humanPrompt: 'Sending voice memos instead of texting is lazy.',
    alienPrompt: 'Talking is easier than typing.',
  },
  {
    humanPrompt: 'Gas station snacks hit harder than fancy desserts.',
    alienPrompt: 'Cheap treats beat expensive ones.',
  },
  {
    humanPrompt: 'Ketchup belongs in the fridge, not the pantry.',
    alienPrompt: 'There is a right and a wrong way to store food.',
  },
  {
    humanPrompt: 'The aisle seat is always the best seat on a plane.',
    alienPrompt: 'Convenience beats the view every time.',
  },
  {
    humanPrompt: 'You should rinse the dishes before loading the dishwasher.',
    alienPrompt: 'Doing a job twice beats doing it wrong once.',
  },
  {
    humanPrompt: 'Audiobooks completely count as reading.',
    alienPrompt: 'How you learn something matters less than that you learned it.',
  },
  {
    humanPrompt: 'A phone call is more annoying than a text.',
    alienPrompt: 'The best message is the one that interrupts you the least.',
  },
  {
    humanPrompt: 'A sandwich someone else makes always tastes better.',
    alienPrompt: 'Anything is better when you did not have to make it yourself.',
  },
  {
    humanPrompt: 'The middle piece of a brownie tray is the best piece.',
    alienPrompt: 'The best part of almost anything is in the center.',
  },
  {
    humanPrompt: 'Board game night reveals who your real friends are.',
    alienPrompt: 'Competition brings out who people truly are.',
  },
  {
    humanPrompt: 'Wearing pajamas to the grocery store is totally fine.',
    alienPrompt: 'Being comfortable in public should never be embarrassing.',
  },
  {
    humanPrompt: 'New Year resolutions are basically pointless.',
    alienPrompt: 'Real change never waits for a special date.',
  },
  {
    humanPrompt: 'Sparkling water is just spicy water and it is not good.',
    alienPrompt: 'Some wildly popular drinks are completely overrated.',
  },
  {
    humanPrompt: 'You should always give up your seat for someone who needs it.',
    alienPrompt: 'Small kindnesses to strangers are always worth it.',
  },
  {
    humanPrompt: 'Milk before the cereal is pure chaos.',
    alienPrompt: 'The order you do things in genuinely matters.',
  },
  {
    humanPrompt: 'The best pizza topping is just extra cheese.',
    alienPrompt: 'Simple is almost always better than complicated.',
  },
  {
    humanPrompt: 'A messy desk is the sign of a busy mind.',
    alienPrompt: 'Being tidy is a little overrated.',
  },
  {
    humanPrompt: 'You should finish every series you start.',
    alienPrompt: 'Quitting something halfway through feels like failing.',
  },
  {
    humanPrompt: 'Fresh clean sheets are the best feeling in the world.',
    alienPrompt: 'The simplest pleasures are the best ones.',
  },
  {
    humanPrompt: 'Everyone should learn to cook one truly impressive meal.',
    alienPrompt: 'It pays to be great at one thing instead of okay at many.',
  },
  {
    humanPrompt: 'A handwritten thank-you note is always worth the effort.',
    alienPrompt: 'The old-fashioned way is often the better way.',
  },
  {
    humanPrompt: 'You can never have too many blankets.',
    alienPrompt: 'More of a good thing is always better.',
  },
  {
    humanPrompt: 'Reheated coffee is a genuine crime.',
    alienPrompt: 'Some things are only good the very first time.',
  },
  {
    humanPrompt: 'The best vacation involves doing absolutely nothing.',
    alienPrompt: 'Rest is worth more than adventure.',
  },
  {
    humanPrompt: 'You should always root for the underdog.',
    alienPrompt: 'The story matters more than who wins.',
  },
  {
    humanPrompt: 'A dog greeting you at the door fixes any bad day.',
    alienPrompt: 'Small welcomes matter more than big gestures.',
  },
  {
    humanPrompt: 'A nap after 4pm ruins your whole night.',
    alienPrompt: 'Timing matters more than most people think.',
  },
  {
    humanPrompt: 'The best gift is one the person would never buy themselves.',
    alienPrompt: 'Thoughtfulness beats being practical with a gift.',
  },
  {
    humanPrompt: 'Everyone has one song they would never admit they love.',
    alienPrompt: 'People hide their most honest tastes.',
  },
  {
    humanPrompt: 'Long showers are a completely justified use of time.',
    alienPrompt: 'Some daily little luxuries are non-negotiable.',
  },
  {
    humanPrompt: 'Whoever is closest to the light switch is in charge of it.',
    alienPrompt: 'Whoever is nearest to something gets to decide about it.',
  },
  {
    humanPrompt: 'The last slice should go to whoever wants it most.',
    alienPrompt: 'Fairness is not always about splitting things evenly.',
  },
  {
    humanPrompt: 'A window seat comes with full control of the shade.',
    alienPrompt: 'Being in charge of something comes with responsibility.',
  },
  {
    humanPrompt: 'People are secretly proud of their own handwriting.',
    alienPrompt: 'People are kinder to themselves than they let on.',
  },
];

/** Decision Deck — crew gets the vivid detail, infiltrator gets it stripped. Options are shared. */
export const DELIBERATION_SCENARIOS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  {
    humanPrompt: "Your best friend's wedding lands on the same day as a concert you have front-row tickets for.",
    alienPrompt: 'Two events you care about land on the same day.',
    scenario: "Your best friend's wedding lands on the same day as a concert you have front-row tickets for.",
    options: ['Skip the concert, no question', 'Sell the tickets and never mention it', 'Ceremony first, sprint to the show after'],
  },
  {
    humanPrompt: 'You find $200 cash in the pocket of a jacket you just bought at a thrift store.',
    alienPrompt: 'You unexpectedly come into a little money.',
    scenario: 'You find $200 cash in the pocket of a jacket you just bought at a thrift store.',
    options: ['Keep it — fate has spoken', 'Turn it in to the store', 'Keep half, donate half'],
  },
  {
    humanPrompt: "Your roommate's alarm has been blaring for 45 minutes and they are not home.",
    alienPrompt: 'Something in your home is slowly driving you insane.',
    scenario: "Your roommate's alarm has been blaring for 45 minutes and they are not home.",
    options: ['Go in and shut it off', 'Text them a complaint', 'Suffer with headphones on principle'],
  },
  {
    humanPrompt: 'The waiter brings you the wrong dish — but it looks better than what you ordered.',
    alienPrompt: 'You end up with something you did not ask for.',
    scenario: 'The waiter brings you the wrong dish — but it looks better than what you ordered.',
    options: ['Say nothing and eat it', 'Flag it and ask for your order', 'Ask sweetly if you can keep both'],
  },
  {
    humanPrompt: 'Your boss has called you the wrong name for three months straight.',
    alienPrompt: 'Someone keeps making the same small mistake with you.',
    scenario: 'Your boss has called you the wrong name for three months straight.',
    options: ['Correct them today', 'Let it ride forever', 'Start answering only to the wrong name'],
  },
  {
    humanPrompt: 'You are on a first date and spot your ex two tables away.',
    alienPrompt: 'Someone from your past shows up at a bad moment.',
    scenario: 'You are on a first date and spot your ex two tables away.',
    options: ['Pretend you saw nothing', 'Wave like an adult and move on', 'Suggest moving somewhere else'],
  },
  {
    humanPrompt: 'A coworker microwaves fish in the office kitchen every single day.',
    alienPrompt: 'Someone near you has an annoying daily habit.',
    scenario: 'A coworker microwaves fish in the office kitchen every single day.',
    options: ['Talk to them directly', 'Leave an anonymous note', 'Escalate — microwave something worse'],
  },
  {
    humanPrompt: 'You get to the airport and realize your flight is actually tomorrow.',
    alienPrompt: 'Your plans fall apart at the last minute.',
    scenario: 'You get to the airport and realize your flight is actually tomorrow.',
    options: ['Beg for a standby seat today', 'Go home and pretend it never happened', 'Airport hotel — make it a mini vacation'],
  },
  {
    humanPrompt: 'The group chat is planning a trip you absolutely cannot afford.',
    alienPrompt: 'Friends are planning something that does not work for you.',
    scenario: 'The group chat is planning a trip you absolutely cannot afford.',
    options: ['Be honest about the budget', 'Pitch a cheaper version', 'Go anyway and eat instant noodles for months'],
  },
  {
    humanPrompt: 'You hate the haircut. The barber is standing there, smiling, waiting.',
    alienPrompt: 'You are not thrilled with something you just paid for.',
    scenario: 'You hate the haircut. The barber is standing there, smiling, waiting.',
    options: ['Say you love it and tip anyway', 'Gently ask for a fix', 'Be honest — it is your head'],
  },
  {
    humanPrompt: "Your neighbor's package lands at your door. It is very clearly a massive TV.",
    alienPrompt: 'Something that is not yours ends up in your hands.',
    scenario: "Your neighbor's package lands at your door. It is very clearly a massive TV.",
    options: ['Walk it over right away', 'Text them to come get it', 'Hold it hostage until they return your stuff'],
  },
  {
    humanPrompt: 'Your parents are coming over in two hours and the place is a disaster.',
    alienPrompt: 'Guests are arriving sooner than you would like.',
    scenario: 'Your parents are coming over in two hours and the place is a disaster.',
    options: ['Speed-clean like an athlete', 'Shove everything into one room and shut the door', 'Own the mess — this is real life'],
  },
  {
    humanPrompt: 'Mid-presentation, your laptop dies in front of the entire room.',
    alienPrompt: 'Technology fails you at an important moment.',
    scenario: 'Mid-presentation, your laptop dies in front of the entire room.',
    options: ['Wing it from memory', 'Call a five-minute break', 'Pivot to asking the room questions'],
  },
  {
    humanPrompt: "Someone's phone rings at full volume in the movie theater — and they let it ring.",
    alienPrompt: 'A stranger is being disruptive nearby.',
    scenario: "Someone's phone rings at full volume in the movie theater — and they let it ring.",
    options: ['Loud, pointed shush', 'Say something directly', 'Silently plot their downfall'],
  },
  {
    humanPrompt: 'Your friend asks you to help them move. For the fourth time in two years.',
    alienPrompt: 'A friend asks for a favor you have done many times.',
    scenario: 'Your friend asks you to help them move. For the fourth time in two years.',
    options: ['Show up — that is friendship', 'Help, but declare it the final time', 'Develop sudden mysterious plans'],
  },
  {
    humanPrompt: 'You bite into a sandwich your friend made. It is terrible. They are watching your face.',
    alienPrompt: 'You have to react to something you do not love.',
    scenario: 'You bite into a sandwich your friend made. It is terrible. They are watching your face.',
    options: ['Give the performance of a lifetime', 'A diplomatic "it is interesting!"', 'Gently tell the truth'],
  },
  {
    humanPrompt: 'The person ahead of you has 40 items in the 10-items-or-less lane.',
    alienPrompt: 'Someone bends a small public rule right in front of you.',
    scenario: 'The person ahead of you has 40 items in the 10-items-or-less lane.',
    options: ['Point at the sign', 'Deploy the death stare', 'Let it go — life is long'],
  },
  {
    humanPrompt: "Your delivery arrives and it is someone else's order — but honestly, a better one.",
    alienPrompt: 'A mix-up lands slightly in your favor.',
    scenario: "Your delivery arrives and it is someone else's order — but honestly, a better one.",
    options: ['Report it and hand it back', 'Keep it — destiny', 'Keep it AND request a refund'],
  },
  {
    humanPrompt: 'You wave back at someone who was definitely waving at the person behind you.',
    alienPrompt: 'You embarrass yourself a little in public.',
    scenario: 'You wave back at someone who was definitely waving at the person behind you.',
    options: ['Commit — turn it into a stretch', 'Laugh at yourself out loud', 'Leave the country immediately'],
  },
  {
    humanPrompt: 'Your friend keeps dropping spoilers for a show you are two seasons behind on.',
    alienPrompt: 'A friend keeps ruining something small for you.',
    scenario: 'Your friend keeps dropping spoilers for a show you are two seasons behind on.',
    options: ['Beg for a spoiler embargo', 'Mute them until you catch up', 'Cancel your weekend and binge it all'],
  },
  {
    humanPrompt: 'It is your birthday dinner and the table is deciding how to split a very uneven bill.',
    alienPrompt: 'A group needs to sort out money fairly.',
    scenario: 'It is your birthday dinner and the table is deciding how to split a very uneven bill.',
    options: ['Even split, keep the peace', 'Everyone pays for exactly what they had', 'The birthday person pays nothing, obviously'],
  },
  {
    humanPrompt: 'You spot the typo one second after texting your crush.',
    alienPrompt: 'You notice a tiny mistake right after making it.',
    scenario: 'You spot the typo one second after texting your crush.',
    options: ['Send the asterisk correction instantly', 'Double down like it was intentional', 'Never speak of it again'],
  },
  {
    humanPrompt: 'You find your middle school diary and it is devastatingly embarrassing.',
    alienPrompt: 'You stumble on something embarrassing from your past.',
    scenario: 'You find your middle school diary and it is devastatingly embarrassing.',
    options: ['Read the best parts to friends', 'Lock it away forever', 'Ceremonial bonfire'],
  },
  {
    humanPrompt: 'Your karaoke song starts and you suddenly forget every single word.',
    alienPrompt: 'You are put on the spot and your mind goes completely blank.',
    scenario: 'Your karaoke song starts and you suddenly forget every single word.',
    options: ['Commit and mumble through it', 'Turn it into a crowd singalong', 'Dramatic mic drop and walk off'],
  },
  {
    humanPrompt: 'A wasp gets into the car while you are driving on the highway.',
    alienPrompt: 'A small crisis breaks out at the worst possible time.',
    scenario: 'A wasp gets into the car while you are driving on the highway.',
    options: ['Pull over immediately', 'Stay calm and crack a window', 'Accept that the car belongs to the wasp now'],
  },
  {
    humanPrompt: 'You are halfway through a haircut when you realize the stylist is going way shorter than you asked.',
    alienPrompt: 'Something is going differently than you planned and it is hard to stop now.',
    scenario: 'You are halfway through a haircut when you realize the stylist is going way shorter than you asked.',
    options: ['Speak up right now', 'Wait and see how it ends', 'Accept that hats exist for a reason'],
  },
  {
    humanPrompt: 'You accidentally liked a photo from three years deep on someone\u2019s profile.',
    alienPrompt: 'You leave an obvious trace of something you were doing quietly.',
    scenario: 'You accidentally liked a photo from three years deep on someone\u2019s profile.',
    options: ['Unlike it and pray', 'Own it with a friendly comment', 'Delete the app and move to the woods'],
  },
  {
    humanPrompt: 'The whole restaurant goes quiet right as you laugh at your own joke.',
    alienPrompt: 'You react to something and instantly realize everyone noticed.',
    scenario: 'The whole restaurant goes quiet right as you laugh at your own joke.',
    options: ['Own the laugh proudly', 'Cough to cover it up', 'Slowly slide down in your seat'],
  },
  {
    humanPrompt: 'A coworker repeats your idea in the big meeting and everyone loves it as theirs.',
    alienPrompt: 'Someone gets the credit for something you did.',
    scenario: 'A coworker repeats your idea in the big meeting and everyone loves it as theirs.',
    options: ['Speak up in the moment', 'Talk to them privately after', 'Let it go and remember it forever'],
  },
  {
    humanPrompt: 'You arrive at the party in a full costume and realize no one else dressed up.',
    alienPrompt: 'You arrive somewhere and instantly feel out of place.',
    scenario: 'You arrive at the party in a full costume and realize no one else dressed up.',
    options: ['Own it — you look amazing', 'Ditch the costume in the car', 'Make a quiet early exit'],
  },
  {
    humanPrompt: 'You brought a dish to the potluck and, two hours in, no one has touched it.',
    alienPrompt: 'Something you contributed is being ignored by everyone.',
    scenario: 'You brought a dish to the potluck and, two hours in, no one has touched it.',
    options: ['Talk it up loudly', 'Serve yourself a big plate to start things', 'Quietly take it back home'],
  },
  {
    humanPrompt: 'You realize you have been calling your new coworker the wrong name for two weeks.',
    alienPrompt: 'You find out you have been getting a small thing wrong for a while.',
    scenario: 'You realize you have been calling your new coworker the wrong name for two weeks.',
    options: ['Apologize right away', 'Quietly start getting it right', 'Avoid using their name forever'],
  },
  {
    humanPrompt: 'The self-checkout keeps yelling "unexpected item in bagging area" and a line is forming.',
    alienPrompt: 'A simple task is publicly falling apart on you.',
    scenario: 'The self-checkout keeps yelling "unexpected item in bagging area" and a line is forming.',
    options: ['Wave down an employee', 'Restart the whole thing calmly', 'Abandon ship and leave the store'],
  },
  {
    humanPrompt: 'You wore your shirt inside out all day and nobody told you until 5pm.',
    alienPrompt: 'You realize something has been obviously off about you all day.',
    scenario: 'You wore your shirt inside out all day and nobody told you until 5pm.',
    options: ['Fix it right there', 'Claim it was intentional', 'Wonder who knew and stayed silent'],
  },
  {
    humanPrompt: 'You accidentally reply-all to the entire company.',
    alienPrompt: 'A private message goes to far more people than intended.',
    scenario: 'You accidentally reply-all to the entire company.',
    options: ['Send a quick "please ignore"', 'Say nothing and hope', 'Own it with a follow-up joke'],
  },
  {
    humanPrompt: 'You tell a great story at dinner and realize halfway through everyone has heard it before.',
    alienPrompt: 'You are mid-way through something and realize it is not landing.',
    scenario: 'You tell a great story at dinner and realize halfway through everyone has heard it before.',
    options: ['Power through to the end', 'Cut it short with a laugh', 'Pretend the good part is still coming'],
  },
  {
    humanPrompt: 'You are the designated navigator and you just completely missed the exit.',
    alienPrompt: 'You are in charge of something and just dropped the ball.',
    scenario: 'You are the designated navigator and you just completely missed the exit.',
    options: ['Confess right away', 'Reroute and say nothing', 'Blame the map app confidently'],
  },
  {
    humanPrompt: 'The waiter asks how everything is right as your mouth is completely full.',
    alienPrompt: 'You get put on the spot at the worst possible second.',
    scenario: 'The waiter asks how everything is right as your mouth is completely full.',
    options: ['Thumbs up and chew fast', 'Hold up a finger and make them wait', 'Muffle out a "great, thanks!"'],
  },
  {
    humanPrompt: 'You find out the surprise party you are walking into is actually for you.',
    alienPrompt: 'You realize something big is happening and it involves you.',
    scenario: 'You find out the surprise party you are walking into is actually for you.',
    options: ['Act completely shocked', 'Admit you kind of knew', 'Cry a little, no shame'],
  },
];

/**
 * Sketch Bay — keep the drawings visually overlapping.
 * Two flavors below: NESTED CATEGORIES (crew subject is broad, infiltrator's
 * is a subset of it) and tight SILHOUETTE TWINS. Both are safe; the nested
 * ones are the most forgiving in a single round.
 */
export const DRAWING_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  // --- Nested categories (infiltrator draws a subset of the crew subject) ---
  { humanPrompt: 'Draw your favorite food.', alienPrompt: 'Draw your favorite dessert.' },
  { humanPrompt: 'Draw an animal.', alienPrompt: 'Draw a pet.' },
  { humanPrompt: 'Draw a fruit.', alienPrompt: 'Draw a berry.' },
  { humanPrompt: 'Draw a drink.', alienPrompt: 'Draw a hot drink.' },
  { humanPrompt: 'Draw a plant.', alienPrompt: 'Draw a flower.' },
  { humanPrompt: 'Draw a vehicle.', alienPrompt: 'Draw something with two wheels.' },
  { humanPrompt: 'Draw something in the sky.', alienPrompt: 'Draw something that flies.' },
  { humanPrompt: 'Draw something you would find in a kitchen.', alienPrompt: 'Draw something you would find in the fridge.' },
  { humanPrompt: 'Draw something you wear.', alienPrompt: 'Draw something you wear on your head.' },
  { humanPrompt: 'Draw a type of weather.', alienPrompt: 'Draw a rainy day.' },
  { humanPrompt: 'Draw a sea creature.', alienPrompt: 'Draw a fish.' },
  { humanPrompt: 'Draw a sea creature with tentacles.', alienPrompt: 'Draw an octopus.' },
  { humanPrompt: 'Draw a piece of furniture.', alienPrompt: 'Draw something you sit on.' },
  { humanPrompt: 'Draw a breakfast food.', alienPrompt: 'Draw something with syrup on it.' },
  { humanPrompt: 'Draw a sport.', alienPrompt: 'Draw a ball used in a sport.' },
  { humanPrompt: 'Draw something on a beach.', alienPrompt: 'Draw something you build in the sand.' },
  { humanPrompt: 'Draw an insect.', alienPrompt: 'Draw a bug with wings.' },
  { humanPrompt: 'Draw a musical instrument.', alienPrompt: 'Draw an instrument you blow into.' },
  { humanPrompt: 'Draw a vegetable.', alienPrompt: 'Draw a green vegetable.' },
  { humanPrompt: 'Draw a building.', alienPrompt: 'Draw a house.' },
  { humanPrompt: 'Draw a snack.', alienPrompt: 'Draw something salty.' },
  { humanPrompt: 'Draw something in a bathroom.', alienPrompt: 'Draw something you brush with.' },
  { humanPrompt: 'Draw a dessert.', alienPrompt: 'Draw something with chocolate.' },
  { humanPrompt: 'Draw something you would see on a farm.', alienPrompt: 'Draw a farm animal.' },
  { humanPrompt: 'Draw something with a handle.', alienPrompt: 'Draw a mug.' },
  { humanPrompt: 'Draw something in a classroom.', alienPrompt: 'Draw something you write with.' },
  { humanPrompt: 'Draw a hat.', alienPrompt: 'Draw a hat you wear in winter.' },
  { humanPrompt: 'Draw a tree.', alienPrompt: 'Draw a tree with fruit on it.' },
  { humanPrompt: 'Draw a toy.', alienPrompt: 'Draw a stuffed animal.' },
  { humanPrompt: 'Draw a fast food item.', alienPrompt: 'Draw a burger.' },
  { humanPrompt: 'Draw something at a birthday party.', alienPrompt: 'Draw a birthday cake.' },
  { humanPrompt: 'Draw something warm.', alienPrompt: 'Draw the sun.' },
  { humanPrompt: 'Draw a tool.', alienPrompt: 'Draw a hammer.' },
  { humanPrompt: 'Draw something you would pack for a trip.', alienPrompt: 'Draw something you would pack for the beach.' },
  { humanPrompt: 'Draw an item of clothing.', alienPrompt: 'Draw a shoe.' },
  { humanPrompt: 'Draw something in a garden.', alienPrompt: 'Draw a flower in a garden.' },
  { humanPrompt: 'Draw something round.', alienPrompt: 'Draw a ball.' },
  { humanPrompt: 'Draw something cold.', alienPrompt: 'Draw something frozen.' },
  { humanPrompt: 'Draw something in a park.', alienPrompt: 'Draw something on a playground.' },

  // --- Tight silhouette twins (near-identical outlines) ---
  { humanPrompt: 'Draw a campfire.', alienPrompt: 'Draw a lit torch.' },
  { humanPrompt: 'Draw a snowman.', alienPrompt: 'Draw three scoops of ice cream stacked in a cone.' },
  { humanPrompt: 'Draw a slice of pizza.', alienPrompt: 'Draw a slice of watermelon.' },
  { humanPrompt: 'Draw a rocket ship.', alienPrompt: 'Draw a lighthouse.' },
  { humanPrompt: 'Draw a birthday cake.', alienPrompt: 'Draw a stack of pancakes with a topping.' },
  { humanPrompt: 'Draw a shark.', alienPrompt: 'Draw a dolphin.' },
  { humanPrompt: 'Draw a cactus in the desert.', alienPrompt: 'Draw a hand waving hello.' },
  { humanPrompt: 'Draw a UFO.', alienPrompt: 'Draw a sombrero.' },
  { humanPrompt: 'Draw the sun.', alienPrompt: 'Draw a sunflower.' },
  { humanPrompt: 'Draw a Christmas tree.', alienPrompt: 'Draw a party hat.' },
  { humanPrompt: 'Draw a snake.', alienPrompt: 'Draw a winding river.' },
  { humanPrompt: 'Draw a donut.', alienPrompt: 'Draw a pool floatie ring.' },
  { humanPrompt: 'Draw a fancy mustache.', alienPrompt: 'Draw a bird flying far away.' },
  { humanPrompt: 'Draw a taco.', alienPrompt: 'Draw a fortune cookie.' },
  { humanPrompt: 'Draw a ghost.', alienPrompt: 'Draw a squid.' },
  { humanPrompt: 'Draw a royal crown.', alienPrompt: 'Draw a mountain range.' },
  { humanPrompt: 'Draw a pair of glasses.', alienPrompt: 'Draw a bicycle.' },
  { humanPrompt: 'Draw a hot air balloon.', alienPrompt: 'Draw a light bulb.' },
  { humanPrompt: 'Draw a ladybug.', alienPrompt: 'Draw a chocolate chip cookie.' },
  { humanPrompt: 'Draw a soccer ball.', alienPrompt: 'Draw a disco ball.' },
  { humanPrompt: 'Draw a palm tree.', alienPrompt: 'Draw fireworks exploding.' },
  { humanPrompt: 'Draw a hedgehog.', alienPrompt: 'Draw a pinecone.' },
  { humanPrompt: 'Draw a sailboat.', alienPrompt: 'Draw a shark fin above the water.' },
  { humanPrompt: 'Draw a caterpillar.', alienPrompt: 'Draw a train with cars.' },
  { humanPrompt: 'Draw a jellyfish.', alienPrompt: 'Draw a fancy chandelier.' },
  { humanPrompt: 'Draw a beehive.', alienPrompt: 'Draw a soft-serve ice cream.' },
  { humanPrompt: 'Draw a banana.', alienPrompt: 'Draw a crescent moon.' },
  { humanPrompt: 'Draw a wall clock.', alienPrompt: 'Draw a whole pizza cut into slices.' },
  { humanPrompt: 'Draw an umbrella.', alienPrompt: 'Draw a mushroom.' },
  { humanPrompt: 'Draw a heart.', alienPrompt: 'Draw a strawberry.' },
  { humanPrompt: 'Draw a rose.', alienPrompt: 'Draw a lollipop.' },
  { humanPrompt: 'Draw a penguin.', alienPrompt: 'Draw a bowling pin.' },
  { humanPrompt: 'Draw an apple.', alienPrompt: 'Draw a tomato.' },
  { humanPrompt: 'Draw a cupcake.', alienPrompt: 'Draw a muffin.' },
  { humanPrompt: 'Draw a butterfly.', alienPrompt: 'Draw a bow tie.' },
  { humanPrompt: 'Draw a leaf.', alienPrompt: 'Draw a feather.' },
  { humanPrompt: 'Draw a carrot.', alienPrompt: 'Draw an ice cream cone.' },
  { humanPrompt: 'Draw a slice of cake.', alienPrompt: 'Draw a wedge of cheese.' },
  { humanPrompt: 'Draw a wine glass.', alienPrompt: 'Draw a tulip.' },
  { humanPrompt: 'Draw a cherry.', alienPrompt: 'Draw a balloon on a string.' },
  { humanPrompt: 'Draw a cloud.', alienPrompt: 'Draw a fluffy sheep.' },
  { humanPrompt: 'Draw a traffic cone.', alienPrompt: 'Draw a party hat.' },
  { humanPrompt: 'Draw an egg.', alienPrompt: 'Draw a balloon.' },
  { humanPrompt: 'Draw a pear.', alienPrompt: 'Draw a light bulb.' },
  { humanPrompt: 'Draw a raindrop.', alienPrompt: 'Draw a flame.' },
  { humanPrompt: 'Draw a mop.', alienPrompt: 'Draw an octopus.' },
];

/** Writing Pod — same sentence frame, swapped context. */
export const WRITING_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  {
    humanPrompt: 'The worst thing to hear from your dentist is ___.',
    alienPrompt: 'The worst thing to hear from your mechanic is ___.',
  },
  {
    humanPrompt: '___ is an instant deal-breaker on a first date.',
    alienPrompt: '___ is an instant red flag in a new coworker.',
  },
  {
    humanPrompt: 'The best part of a road trip is ___.',
    alienPrompt: 'The best part of a lazy Sunday is ___.',
  },
  {
    humanPrompt: 'I would never trust someone who ___.',
    alienPrompt: 'I secretly judge people who ___.',
  },
  {
    humanPrompt: 'The most useless thing I learned in school was ___.',
    alienPrompt: 'The most useless skill I have is ___.',
  },
  {
    humanPrompt: 'My villain origin story would begin with ___.',
    alienPrompt: 'The pettiest thing that can ruin my whole day is ___.',
  },
  {
    humanPrompt: 'The last photo in my camera roll is ___.',
    alienPrompt: 'The most random thing saved on my phone is ___.',
  },
  {
    humanPrompt: 'If animals could talk, the rudest one would be ___.',
    alienPrompt: 'The animal I trust the least is ___.',
  },
  {
    humanPrompt: 'A word that should be banned forever is ___.',
    alienPrompt: 'A word people use way too much is ___.',
  },
  {
    humanPrompt: 'My most controversial food opinion is ___.',
    alienPrompt: 'A food combination I secretly enjoy is ___.',
  },
  {
    humanPrompt: 'The fastest way to make me angry is ___.',
    alienPrompt: 'The fastest way to lose my respect is ___.',
  },
  {
    humanPrompt: 'In a horror movie, I would die first because ___.',
    alienPrompt: 'My friends would say my fatal flaw is ___.',
  },
  {
    humanPrompt: '___ should be an Olympic sport.',
    alienPrompt: '___ deserves way more respect as a skill.',
  },
  {
    humanPrompt: 'The strangest thing I have ever eaten is ___.',
    alienPrompt: 'A food I tried once and will never try again is ___.',
  },
  {
    humanPrompt: 'My guilty pleasure show is ___.',
    alienPrompt: 'A show I would defend with my life is ___.',
  },
  {
    humanPrompt: 'The first thing I would buy after winning the lottery is ___.',
    alienPrompt: 'My dream completely unnecessary purchase is ___.',
  },
  {
    humanPrompt: 'If my pet could talk, the first thing they would expose about me is ___.',
    alienPrompt: 'If my search history leaked, the worst part would be ___.',
  },
  {
    humanPrompt: 'The worst text to get from your boss is ___.',
    alienPrompt: 'The worst text to get from your landlord is ___.',
  },
  {
    humanPrompt: 'My most irrational fear is ___.',
    alienPrompt: 'As a kid, I was inexplicably terrified of ___.',
  },
  {
    humanPrompt: 'The smell of ___ takes me straight back to childhood.',
    alienPrompt: 'The sound of ___ instantly relaxes me.',
  },
  {
    humanPrompt: 'I refuse to apologize for loving ___.',
    alienPrompt: 'I will never understand the hate for ___.',
  },
  {
    humanPrompt: 'My autobiography would be titled ___.',
    alienPrompt: 'My personal warning label would read ___.',
  },
  {
    humanPrompt: 'The worst advice I ever received was ___.',
    alienPrompt: 'The worst advice I ever gave someone was ___.',
  },
  {
    humanPrompt: '___ is always worth the extra money.',
    alienPrompt: '___ is always worth waking up early for.',
  },
  {
    humanPrompt: 'If I were a ghost, I would haunt ___.',
    alienPrompt: 'If I could teleport once a day, I would go straight to ___.',
  },
  {
    humanPrompt: 'The most chaotic item in my fridge right now is ___.',
    alienPrompt: 'The most chaotic item in my bag or car right now is ___.',
  },
  {
    humanPrompt: 'Aliens visiting Earth would be most confused by ___.',
    alienPrompt: 'Aliens visiting Earth would be most impressed by ___.',
  },
  {
    humanPrompt: 'The one chore I would pay anything to never do again is ___.',
    alienPrompt: 'The one errand I will always put off is ___.',
  },
  {
    humanPrompt: 'My biggest red flag is ___.',
    alienPrompt: 'My biggest green flag is ___.',
  },
  {
    humanPrompt: 'Nothing ruins a party faster than ___.',
    alienPrompt: 'Nothing ruins a group chat faster than ___.',
  },
  {
    humanPrompt: 'The pettiest reason I have ever disliked someone is ___.',
    alienPrompt: 'The pettiest hill I will die on is ___.',
  },
  {
    humanPrompt: 'My friends would roast me for still liking ___.',
    alienPrompt: 'A childhood favorite I never grew out of is ___.',
  },
  {
    humanPrompt: 'The weirdest compliment I have ever received is ___.',
    alienPrompt: 'The weirdest thing I am lowkey proud of is ___.',
  },
  {
    humanPrompt: 'If procrastination were a sport, my event would be ___.',
    alienPrompt: 'The task I have been avoiding the longest is ___.',
  },
  {
    humanPrompt: 'The worst thing to find in your hotel room is ___.',
    alienPrompt: 'The worst thing to find in your rental car is ___.',
  },
  {
    humanPrompt: 'A superpower that sounds cool but would ruin your life is ___.',
    alienPrompt: 'A superpower everyone forgets to ask for is ___.',
  },
  {
    humanPrompt: 'The most overrated tourist attraction is ___.',
    alienPrompt: 'The most overrated holiday is ___.',
  },
  {
    humanPrompt: 'The best snack to sneak into a movie theater is ___.',
    alienPrompt: 'The best snack for a long car ride is ___.',
  },
  {
    humanPrompt: 'The worst possible theme for a wedding is ___.',
    alienPrompt: 'The worst possible theme for a birthday party is ___.',
  },
  {
    humanPrompt: 'If I ran the world for a day, my first new rule would be ___.',
    alienPrompt: 'The rule I wish everyone already followed is ___.',
  },
  {
    humanPrompt: 'The item I always lose is ___.',
    alienPrompt: 'The item I somehow own way too many of is ___.',
  },
  {
    humanPrompt: 'My go-to karaoke song is ___.',
    alienPrompt: 'The song stuck in my head right now is ___.',
  },
  {
    humanPrompt: 'The weirdest thing in my kitchen drawer is ___.',
    alienPrompt: 'The weirdest thing in my glove compartment is ___.',
  },
  {
    humanPrompt: 'A trend I hope never comes back is ___.',
    alienPrompt: 'A trend I secretly miss is ___.',
  },
  {
    humanPrompt: 'The worst gift you can give someone is ___.',
    alienPrompt: 'The most confusing gift I have ever received is ___.',
  },
  {
    humanPrompt: 'My dream job as a kid was ___.',
    alienPrompt: 'The job I would be surprisingly bad at is ___.',
  },
  {
    humanPrompt: 'The best place to take a nap is ___.',
    alienPrompt: 'The worst place I have ever fallen asleep is ___.',
  },
  {
    humanPrompt: 'The one app I could never delete is ___.',
    alienPrompt: 'The app I open the most without meaning to is ___.',
  },
  {
    humanPrompt: 'The best thing about being an adult is ___.',
    alienPrompt: 'The most disappointing thing about being an adult is ___.',
  },
  {
    humanPrompt: 'If I opened a restaurant, it would only serve ___.',
    alienPrompt: 'If I had a food truck, it would sell ___.',
  },
  {
    humanPrompt: 'The most unnecessary thing I spend money on is ___.',
    alienPrompt: 'The one thing I refuse to spend money on is ___.',
  },
  {
    humanPrompt: 'A skill that looks easy but absolutely is not is ___.',
    alienPrompt: 'A skill I wish they taught in school is ___.',
  },
  {
    humanPrompt: 'The best excuse to leave a party early is ___.',
    alienPrompt: 'The best excuse to cancel plans is ___.',
  },
  {
    humanPrompt: 'My comfort movie is ___.',
    alienPrompt: 'The movie I have seen way too many times is ___.',
  },
  {
    humanPrompt: 'The worst thing to say in a job interview is ___.',
    alienPrompt: 'The worst thing to say on a first date is ___.',
  },
  {
    humanPrompt: 'The most magical smell in the world is ___.',
    alienPrompt: 'A smell that instantly makes me hungry is ___.',
  },
  {
    humanPrompt: 'The animal I would most want as a giant-sized pet is ___.',
    alienPrompt: 'The animal I would least want to meet in the dark is ___.',
  },
  {
    humanPrompt: 'If I hosted a talk show, my first guest would be ___.',
    alienPrompt: 'The most interesting person I have ever met is ___.',
  },
  {
    humanPrompt: 'The best way to spend a rainy day is ___.',
    alienPrompt: 'The best way to spend a snow day is ___.',
  },
  {
    humanPrompt: 'The one food I could eat every day forever is ___.',
    alienPrompt: 'The one food I never get tired of is ___.',
  },
  {
    humanPrompt: 'The weirdest thing I believed as a kid was ___.',
    alienPrompt: 'The weirdest thing I have googled recently is ___.',
  },
  {
    humanPrompt: 'My signature dance move is ___.',
    alienPrompt: 'The move I bust out when nobody is watching is ___.',
  },
  {
    humanPrompt: 'The best sound in the world is ___.',
    alienPrompt: 'A sound that instantly annoys me is ___.',
  },
  {
    humanPrompt: 'If my life had a theme song, it would be ___.',
    alienPrompt: 'The song that always gets me hyped is ___.',
  },
  {
    humanPrompt: 'The strangest house rule I grew up with was ___.',
    alienPrompt: 'The strangest rule at my first job was ___.',
  },
  {
    humanPrompt: 'The most useless item in my house is ___.',
    alienPrompt: 'The item in my house with the best story is ___.',
  },
];

/** Likely Locker — overlapping trait, different criterion. No name slots (they roll differently per role). */
export const MOST_LIKELY_TEMPLATES: {
  humanTemplate: string;
  alienTemplate: string;
}[] = [
  {
    humanTemplate: 'Who is most likely to survive a zombie apocalypse?',
    alienTemplate: 'Who is most likely to win a fight against a goose?',
  },
  {
    humanTemplate: 'Who is most likely to become famous by accident?',
    alienTemplate: 'Who is most likely to go viral for a terrible take?',
  },
  {
    humanTemplate: 'Who is most likely to cry during a movie?',
    alienTemplate: 'Who is most likely to get emotional over an animal video?',
  },
  {
    humanTemplate: 'Who is most likely to blow a paycheck on something dumb?',
    alienTemplate: 'Who is most likely to fall for an obvious scam?',
  },
  {
    humanTemplate: 'Who is most likely to become a millionaire?',
    alienTemplate: 'Who is most likely to start three businesses in one year?',
  },
  {
    humanTemplate: 'Who is most likely to get lost with the GPS on?',
    alienTemplate: 'Who is most likely to run out of gas on the highway?',
  },
  {
    humanTemplate: 'Who is most likely to talk their way out of a ticket?',
    alienTemplate: 'Who is most likely to talk their way into a VIP section?',
  },
  {
    humanTemplate: 'Who is most likely to adopt five pets without telling anyone?',
    alienTemplate: 'Who is most likely to feed every stray in the neighborhood?',
  },
  {
    humanTemplate: 'Who is most likely to sleep through their alarm?',
    alienTemplate: 'Who is most likely to be late to their own wedding?',
  },
  {
    humanTemplate: 'Who is most likely to win a reality TV show?',
    alienTemplate: 'Who is most likely to get eliminated first from a reality TV show?',
  },
  {
    humanTemplate: 'Who is most likely to start a conspiracy theory?',
    alienTemplate: 'Who is most likely to believe a conspiracy theory?',
  },
  {
    humanTemplate: 'Who is most likely to eat something off the floor?',
    alienTemplate: 'Who is most likely to ignore an expiration date?',
  },
  {
    humanTemplate: 'Who is most likely to accidentally start a cult?',
    alienTemplate: 'Who is most likely to accidentally join a cult?',
  },
  {
    humanTemplate: 'Who is most likely to text an ex at 2am?',
    alienTemplate: "Who is most likely to deep-stalk an ex's new partner online?",
  },
  {
    humanTemplate: 'Who is most likely to survive alone on a deserted island?',
    alienTemplate: 'Who is most likely to befriend a wild animal?',
  },
  {
    humanTemplate: 'Who is most likely to laugh at a funeral?',
    alienTemplate: 'Who is most likely to laugh when someone falls down?',
  },
  {
    humanTemplate: "Who is most likely to forget a friend's birthday?",
    alienTemplate: 'Who is most likely to forget where they parked?',
  },
  {
    humanTemplate: 'Who is most likely to become president?',
    alienTemplate: 'Who is most likely to get banned from a city council meeting?',
  },
  {
    humanTemplate: 'Who is most likely to have 47 unread voicemails?',
    alienTemplate: 'Who is most likely to leave everyone on read for days?',
  },
  {
    humanTemplate: 'Who is most likely to win an argument with pure confidence and zero facts?',
    alienTemplate: 'Who is most likely to double down after being proven wrong?',
  },
  {
    humanTemplate: 'Who is most likely to spend a whole paycheck on concert tickets?',
    alienTemplate: 'Who is most likely to camp overnight for a product launch?',
  },
  {
    humanTemplate: 'Who is most likely to trip walking on stage to accept an award?',
    alienTemplate: 'Who is most likely to knock over a display in a store?',
  },
  {
    humanTemplate: 'Who is most likely to get kicked out of a library for laughing?',
    alienTemplate: 'Who is most likely to get shushed at a movie theater?',
  },
  {
    humanTemplate: 'Who is most likely to marry someone they met a month ago?',
    alienTemplate: 'Who is most likely to get a tattoo on a whim?',
  },
  {
    humanTemplate: 'Who is most likely to disappear into the mountains and become a hermit?',
    alienTemplate: 'Who is most likely to not answer their phone for a week?',
  },
  {
    humanTemplate: 'Who is most likely to steal fries off your plate?',
    alienTemplate: 'Who is most likely to order "nothing" and then eat half your meal?',
  },
  {
    humanTemplate: 'Who is most likely to vanish from the group chat and return like nothing happened?',
    alienTemplate: 'Who is most likely to reply to a text three weeks later?',
  },
  {
    humanTemplate: 'Who is most likely to type a whole paragraph and then delete it?',
    alienTemplate: 'Who is most likely to rehearse a phone call before making it?',
  },
  {
    humanTemplate: "Who is most likely to be the group's unofficial therapist?",
    alienTemplate: "Who is most likely to know everyone's secrets?",
  },
  {
    humanTemplate: 'Who is most likely to overshare with a total stranger?',
    alienTemplate: 'Who is most likely to make a friend in a waiting room?',
  },
  {
    humanTemplate: 'Who is most likely to plan an entire party around one theme?',
    alienTemplate: 'Who is most likely to stress-clean before guests arrive?',
  },
  {
    humanTemplate: "Who is most likely to find anyone's entire life story online in ten minutes?",
    alienTemplate: 'Who is most likely to remember a tiny detail you mentioned once?',
  },
  {
    humanTemplate: 'Who is most likely to end up as a game show contestant?',
    alienTemplate: 'Who is most likely to yell answers at the TV?',
  },
  {
    humanTemplate: 'Who is most likely to become a professional athlete?',
    alienTemplate: 'Who is most likely to injure themselves doing nothing?',
  },
  {
    humanTemplate: 'Who is most likely to win the lottery and lose the ticket?',
    alienTemplate: 'Who is most likely to forget their own PIN?',
  },
  {
    humanTemplate: 'Who is most likely to become a famous chef?',
    alienTemplate: 'Who is most likely to burn water?',
  },
  {
    humanTemplate: 'Who is most likely to move to another country on a whim?',
    alienTemplate: 'Who is most likely to book a trip and forget about it?',
  },
  {
    humanTemplate: 'Who is most likely to know every word to a song from 20 years ago?',
    alienTemplate: 'Who is most likely to sing the wrong lyrics with full confidence?',
  },
  {
    humanTemplate: 'Who is most likely to survive a week with no phone?',
    alienTemplate: 'Who is most likely to not notice their phone is dead for hours?',
  },
  {
    humanTemplate: 'Who is most likely to befriend the waiter?',
    alienTemplate: 'Who is most likely to know the barista by name?',
  },
  {
    humanTemplate: 'Who is most likely to become a teacher?',
    alienTemplate: 'Who is most likely to explain something nobody asked about?',
  },
  {
    humanTemplate: 'Who is most likely to win a staring contest?',
    alienTemplate: 'Who is most likely to blink first in any standoff?',
  },
  {
    humanTemplate: 'Who is most likely to name a pet something ridiculous?',
    alienTemplate: 'Who is most likely to talk to animals like they understand?',
  },
  {
    humanTemplate: 'Who is most likely to accidentally become internet famous?',
    alienTemplate: 'Who is most likely to have a secret second account?',
  },
  {
    humanTemplate: 'Who is most likely to fall asleep during a movie?',
    alienTemplate: 'Who is most likely to fall asleep mid-sentence?',
  },
  {
    humanTemplate: 'Who is most likely to plan the perfect vacation for everyone?',
    alienTemplate: 'Who is most likely to massively overpack for a weekend trip?',
  },
  {
    humanTemplate: 'Who is most likely to win at trivia night?',
    alienTemplate: 'Who is most likely to have a useless fact for every situation?',
  },
  {
    humanTemplate: 'Who is most likely to get famous for a dance?',
    alienTemplate: 'Who is most likely to start dancing when no music is playing?',
  },
  {
    humanTemplate: 'Who is most likely to cry at a wedding?',
    alienTemplate: 'Who is most likely to cry at a commercial?',
  },
  {
    humanTemplate: 'Who is most likely to become a detective?',
    alienTemplate: 'Who is most likely to figure out the plot twist way too early?',
  },
  {
    humanTemplate: 'Who is most likely to keep a plant alive for ten years?',
    alienTemplate: 'Who is most likely to name all of their houseplants?',
  },
  {
    humanTemplate: 'Who is most likely to win an eating contest?',
    alienTemplate: 'Who is most likely to always be hungry?',
  },
  {
    humanTemplate: 'Who is most likely to give the best advice?',
    alienTemplate: 'Who is most likely to never take their own advice?',
  },
  {
    humanTemplate: 'Who is most likely to get lost in their own neighborhood?',
    alienTemplate: 'Who is most likely to trust a shortcut that adds an hour?',
  },
  {
    humanTemplate: 'Who is most likely to start a band?',
    alienTemplate: 'Who is most likely to be the loudest singer in the car?',
  },
  {
    humanTemplate: 'Who is most likely to become a millionaire and still clip coupons?',
    alienTemplate: 'Who is most likely to save every single receipt?',
  },
  {
    humanTemplate: 'Who is most likely to host the holidays every year?',
    alienTemplate: 'Who is most likely to bring an uninvited plus-one?',
  },
  {
    humanTemplate: 'Who is most likely to win a costume contest?',
    alienTemplate: 'Who is most likely to go all-out for a theme?',
  },
  {
    humanTemplate: 'Who is most likely to become a tour guide?',
    alienTemplate: 'Who is most likely to make friends on vacation?',
  },
  {
    humanTemplate: 'Who is most likely to remember everyone from high school?',
    alienTemplate: 'Who is most likely to run into someone they know anywhere?',
  },
  {
    humanTemplate: 'Who is most likely to fix anything with duct tape?',
    alienTemplate: 'Who is most likely to say "I can build that myself"?',
  },
  {
    humanTemplate: 'Who is most likely to fall for every April Fools joke?',
    alienTemplate: 'Who is most likely to believe an obvious lie?',
  },
  {
    humanTemplate: 'Who is most likely to become a night owl forever?',
    alienTemplate: 'Who is most likely to send a text at 3am?',
  },
  {
    humanTemplate: 'Who is most likely to win an award for being the nicest?',
    alienTemplate: 'Who is most likely to apologize to a chair they bumped into?',
  },
  {
    humanTemplate: 'Who is most likely to set off the smoke alarm making toast?',
    alienTemplate: 'Who is most likely to burn popcorn every single time?',
  },
];

/** Fraction of each prompt pool free hosts draw from. */
export const FREE_SAMPLE_RATIO = 0.1;
/** Never sample fewer than this many per chamber, so play still works. */
export const FREE_SAMPLE_MIN = 4;

/**
 * Free hosts draw from a small, FIXED slice of each pool (the same prompts every
 * game) so repetition sets in after a few sessions and nudges the upgrade. A
 * premium host's games use the whole library for everyone at the table.
 */
function limitPool<T>(pool: T[], fullLibrary: boolean): T[] {
  if (fullLibrary || pool.length === 0) return pool;
  const count = Math.min(pool.length, Math.max(FREE_SAMPLE_MIN, Math.ceil(pool.length * FREE_SAMPLE_RATIO)));
  return pool.slice(0, count);
}

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

function customTemplatesFor(chamber: ChamberType, custom: CustomPrompt[]): PromptTemplate[] {
  return custom
    .filter((c) => c.chamber === chamber)
    .map((c) => ({
      humanPrompt: c.humanPrompt,
      alienPrompt: c.alienPrompt,
      scenario: c.scenario,
      options: c.options,
    }));
}

function customMostLikelyFor(custom: CustomPrompt[]): MostLikelyTemplate[] {
  return custom
    .filter((c) => c.chamber === 'most_likely_to')
    .map((c) => ({ humanTemplate: c.humanPrompt, alienTemplate: c.alienPrompt }));
}

export function getPromptForChamber(
  chamber: ChamberType,
  ctx: PromptContext,
  contentPacks: ContentPackId[] = ['core'],
  fullLibrary = true,
  customPrompts: CustomPrompt[] = []
): ChamberPrompt {
  const id = `${chamber}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const packs = contentPacks.length ? contentPacks : (['core'] as ContentPackId[]);

  // Merge every enabled source for this chamber: the host's custom prompts PLUS
  // whichever packs are on (core/betrayal). If the merge is somehow empty (e.g.
  // custom-only for a chamber they wrote nothing in), fall back to core so a
  // round can always be generated.
  const custom = customTemplatesFor(chamber, customPrompts);
  const pool = <T,>(): T[] => {
    const packPool = packs.length
      ? (limitPool(getPoolForChamber(chamber, packs) as T[], fullLibrary))
      : [];
    const merged = [...(custom as unknown as T[]), ...packPool];
    return merged.length ? merged : (getPoolForChamber(chamber, ['core']) as T[]);
  };

  switch (chamber) {
    case 'opinion_hold':
      return { id, chamber, ...pickRandom(pool<(typeof OPINION_PROMPTS)[number]>()) };
    case 'deliberation_deck':
      return {
        id,
        chamber,
        ...pickRandom(pool<(typeof DELIBERATION_SCENARIOS)[number]>()),
      };
    case 'drawing_quarters':
      return { id, chamber, ...pickRandom(pool<(typeof DRAWING_PROMPTS)[number]>()) };
    case 'writing_pod':
      return { id, chamber, ...pickRandom(pool<(typeof WRITING_PROMPTS)[number]>()) };
    case 'most_likely_to': {
      const customML = customMostLikelyFor(customPrompts);
      const packML = packs.length
        ? limitPool(getPoolForChamber(chamber, packs) as typeof MOST_LIKELY_TEMPLATES, fullLibrary)
        : [];
      let templatePool: MostLikelyTemplate[] = [...customML, ...packML];
      if (!templatePool.length) {
        templatePool = getPoolForChamber(chamber, ['core']) as typeof MOST_LIKELY_TEMPLATES;
      }
      const template = pickRandom(templatePool);
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

