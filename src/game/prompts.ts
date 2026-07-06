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
 *  - Sketch Bay: both sides draw CONCRETE objects that are silhouette twins.
 *    Never bare shapes ("draw a triangle") — the drawing must be defendable
 *    as the crew subject at a squint.
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
];

/** Sketch Bay — silhouette twins. Both sides always draw a real, concrete thing. */
export const DRAWING_PROMPTS: Omit<ChamberPrompt, 'id' | 'chamber'>[] = [
  { humanPrompt: 'Draw a campfire.', alienPrompt: 'Draw a lit torch.' },
  { humanPrompt: 'Draw a snowman.', alienPrompt: 'Draw three scoops of ice cream stacked in a cone.' },
  { humanPrompt: 'Draw a slice of pizza.', alienPrompt: 'Draw a slice of watermelon.' },
  { humanPrompt: 'Draw a rocket ship.', alienPrompt: 'Draw a lighthouse.' },
  { humanPrompt: 'Draw a birthday cake.', alienPrompt: 'Draw a stack of pancakes with a topping.' },
  { humanPrompt: 'Draw a shark.', alienPrompt: 'Draw a dolphin.' },
  { humanPrompt: 'Draw a cactus in the desert.', alienPrompt: 'Draw a hand waving hello.' },
  { humanPrompt: 'Draw an octopus.', alienPrompt: 'Draw a spider.' },
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
