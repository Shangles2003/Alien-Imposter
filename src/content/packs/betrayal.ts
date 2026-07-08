import { ContentPack, MostLikelyTemplate, PromptTemplate } from '@/content/types';

/**
 * Betrayal Pack — a premium expansion of funny, friend-group "who would do you
 * dirty" prompts. Kept family-friendly (4+): playful betrayals, loyalty, petty
 * grudges, and hypotheticals. Deliberately avoids anything that assumes a player
 * is in a romantic relationship, drinks, etc. — it works for any friend group.
 *
 * Every entry is still an asymmetric PAIR (crew prompt + infiltrator prompt) so
 * the deduction mechanic holds: an honest answer to the alien prompt should also
 * read as a plausible answer to the human prompt, but the distributions drift.
 */

const OPINION: PromptTemplate[] = [
  { humanPrompt: 'Leaving a friend on read for a whole day is totally fine.', alienPrompt: 'You never owe anyone an instant reply.' },
  { humanPrompt: 'If a friend is 20 minutes late with no text, you start without them.', alienPrompt: 'Being on time is a basic sign of respect.' },
  { humanPrompt: 'Splitting the bill evenly is fair even if you only got water.', alienPrompt: 'Nitpicking a group bill is not worth the trouble.' },
  { humanPrompt: 'Borrowing money from friends always ends badly.', alienPrompt: 'Money and friendship do not mix.' },
  { humanPrompt: 'Eating a friend’s labeled leftovers is an unforgivable crime.', alienPrompt: 'Food boundaries should be sacred.' },
  { humanPrompt: 'It is okay to have a secret favorite friend.', alienPrompt: 'People pretend they like everyone equally, but they don’t.' },
  { humanPrompt: 'Canceling plans an hour before should cost you a strike.', alienPrompt: 'Flaky people quietly ruin every group.' },
  { humanPrompt: 'You should always take a friend’s side, even when they’re wrong.', alienPrompt: 'Loyalty matters more than being right.' },
  { humanPrompt: 'Reading someone’s texts over their shoulder is a betrayal.', alienPrompt: 'Some tiny habits are secretly infuriating.' },
  { humanPrompt: 'Showing up to a hangout empty-handed is a little rude.', alienPrompt: 'Small gestures matter more than people admit.' },
  { humanPrompt: 'Telling one group secret should get you kicked out of the group chat.', alienPrompt: 'Trust is the most important thing in a friend group.' },
  { humanPrompt: 'Keeping a hoodie you borrowed for over a year makes it yours now.', alienPrompt: 'Possession is basically nine-tenths of the law.' },
  { humanPrompt: 'It is fair to rank your friends from best to worst.', alienPrompt: 'Everyone secretly has a ranking in their head.' },
  { humanPrompt: 'Snitching on a friend to save yourself is sometimes justified.', alienPrompt: 'Self-preservation comes before loyalty.' },
  { humanPrompt: 'Skipping a friend’s big event because you’re tired is acceptable.', alienPrompt: 'Rest is worth more than showing up to everything.' },
  { humanPrompt: 'Returning something you borrowed within a week is the bare minimum.', alienPrompt: 'People are way too casual about giving stuff back.' },
];

const DRAWING: PromptTemplate[] = [
  { humanPrompt: 'Draw the best gift you’ve ever gotten.', alienPrompt: 'Draw something you’d love to be given.' },
  { humanPrompt: 'Draw the first thing you’d buy with a million dollars.', alienPrompt: 'Draw something you really want but can’t afford.' },
  { humanPrompt: 'Draw your dream house.', alienPrompt: 'Draw a giant mansion.' },
  { humanPrompt: 'Draw your dream vacation spot.', alienPrompt: 'Draw a tropical beach.' },
  { humanPrompt: 'Draw the ultimate birthday cake.', alienPrompt: 'Draw a fancy tiered dessert.' },
  { humanPrompt: 'Draw your dream car.', alienPrompt: 'Draw a fast sports car.' },
  { humanPrompt: 'Draw the one snack you’d never share.', alienPrompt: 'Draw your favorite junk food.' },
  { humanPrompt: 'Draw your dream pet.', alienPrompt: 'Draw an exotic animal.' },
  { humanPrompt: 'Draw the trophy for winning game night forever.', alienPrompt: 'Draw a shiny golden award.' },
  { humanPrompt: 'Draw your ideal secret hideout.', alienPrompt: 'Draw a small wooden cabin.' },
  { humanPrompt: 'Draw the perfect pillow fort.', alienPrompt: 'Draw a fort made of blankets.' },
  { humanPrompt: 'Draw the ultimate road-trip snack haul.', alienPrompt: 'Draw a bag stuffed with snacks.' },
  { humanPrompt: 'Draw your dream birthday party.', alienPrompt: 'Draw a party covered in balloons.' },
  { humanPrompt: 'Draw the prize you’d betray a friend to win.', alienPrompt: 'Draw a treasure chest full of gold.' },
  { humanPrompt: 'Draw the fanciest meal you can imagine.', alienPrompt: 'Draw a plate at a fancy restaurant.' },
];

const WRITING: PromptTemplate[] = [
  { humanPrompt: 'The fastest way to lose my trust is ___.', alienPrompt: 'The fastest way to get on my nerves is ___.' },
  { humanPrompt: 'A true friend would never ___.', alienPrompt: 'A good roommate would never ___.' },
  { humanPrompt: 'The most unforgivable group-chat crime is ___.', alienPrompt: 'The most annoying group-chat habit is ___.' },
  { humanPrompt: 'I would end a whole friendship over ___.', alienPrompt: 'I would side-eye someone forever for ___.' },
  { humanPrompt: 'The pettiest reason I’ve ever held a grudge is ___.', alienPrompt: 'The pettiest hill I will die on is ___.' },
  { humanPrompt: 'If my best friend planned my birthday, it would involve ___.', alienPrompt: 'My dream low-effort birthday is ___.' },
  { humanPrompt: 'The most suspicious thing a friend can say is ___.', alienPrompt: 'The biggest little lie people tell their friends is ___.' },
  { humanPrompt: 'The ultimate betrayal at a sleepover is ___.', alienPrompt: 'The worst thing to do while someone is asleep is ___.' },
  { humanPrompt: 'The one thing I’d never lend a friend is ___.', alienPrompt: 'The one thing I refuse to share is ___.' },
  { humanPrompt: 'The snack I would absolutely betray a friend for is ___.', alienPrompt: 'The food I will never share is ___.' },
  { humanPrompt: 'The quickest way to get voted out of our friend group is ___.', alienPrompt: 'The fastest way to get muted in the chat is ___.' },
  { humanPrompt: 'If I had a warning label as a friend, it would say ___.', alienPrompt: 'My biggest red flag in a group is ___.' },
  { humanPrompt: 'The worst possible gift to give a close friend is ___.', alienPrompt: 'The most confusing gift I’ve ever received is ___.' },
  { humanPrompt: 'The most chaotic thing about our friend group is ___.', alienPrompt: 'The reason our plans always fall apart is ___.' },
  { humanPrompt: 'The move that instantly makes you the group villain is ___.', alienPrompt: 'The thing that ruins game night the fastest is ___.' },
];

const MOST_LIKELY: MostLikelyTemplate[] = [
  { humanTemplate: 'Who is most likely to no-show your birthday?', alienTemplate: 'Who is most likely to forget what day it is?' },
  { humanTemplate: 'Who is most likely to read the group chat and never reply?', alienTemplate: 'Who is most likely to leave everyone on read?' },
  { humanTemplate: 'Who is most likely to throw you under the bus in a group project?', alienTemplate: 'Who is most likely to take credit for someone else’s work?' },
  { humanTemplate: 'Who is most likely to spill a secret completely by accident?', alienTemplate: 'Who is most likely to say the wrong thing at the wrong time?' },
  { humanTemplate: 'Who is most likely to eat your fries the second you look away?', alienTemplate: 'Who is most likely to “just have a bite” of your whole meal?' },
  { humanTemplate: 'Who is most likely to cancel plans an hour before?', alienTemplate: 'Who is most likely to bail and blame their pet?' },
  { humanTemplate: 'Who is most likely to “forget” their wallet at dinner?', alienTemplate: 'Who is most likely to vanish when the bill arrives?' },
  { humanTemplate: 'Who is most likely to show up an hour late and act totally normal?', alienTemplate: 'Who is most likely to say “five minutes away” from their couch?' },
  { humanTemplate: 'Who is most likely to ghost a plan they made themselves?', alienTemplate: 'Who is most likely to organize an event and then not come?' },
  { humanTemplate: 'Who is most likely to borrow a hoodie and keep it forever?', alienTemplate: 'Who is most likely to slowly steal your whole wardrobe?' },
  { humanTemplate: 'Who is most likely to start drama and then leave?', alienTemplate: 'Who is most likely to stir the pot just for fun?' },
  { humanTemplate: 'Who is most likely to sell out the group for a free meal?', alienTemplate: 'Who is most likely to switch sides for snacks?' },
  { humanTemplate: 'Who is most likely to snitch on the group to get out of trouble?', alienTemplate: 'Who is most likely to know everyone’s business?' },
  { humanTemplate: 'Who is most likely to fake being sick to skip a hangout?', alienTemplate: 'Who is most likely to invent an emergency to leave early?' },
  { humanTemplate: 'Who is most likely to vote against you in a game to win?', alienTemplate: 'Who is most likely to betray an ally the second it helps them?' },
  { humanTemplate: 'Who is most likely to “accidentally” grab the last slice every time?', alienTemplate: 'Who is most likely to always snag the best seat first?' },
];

const DELIBERATION: PromptTemplate[] = [
  {
    humanPrompt: 'A friend asks you to cover for them with a pretty big lie.',
    alienPrompt: 'A friend asks you for a favor you’re not comfortable with.',
    scenario: 'A friend asks you to cover for them with a pretty big lie.',
    options: ['Cover for them — that’s what friends do', 'Refuse and tell the truth', 'Cover this once, but never again'],
  },
  {
    humanPrompt: 'You catch a friend quietly copying your entire style.',
    alienPrompt: 'Someone close is imitating you a little too much.',
    scenario: 'You catch a friend quietly copying your entire style.',
    options: ['Say something directly', 'Take it as a compliment', 'Switch it up to mess with them'],
  },
  {
    humanPrompt: 'You catch a friend voting against you in a game to win.',
    alienPrompt: 'Someone betrays you in a game for the win.',
    scenario: 'You catch a friend voting against you in a game to win.',
    options: ['Respect the ruthless move', 'Plot your revenge', 'Refuse to team with them again'],
  },
  {
    humanPrompt: 'A friend “forgets” to invite you to a hangout you clearly heard about.',
    alienPrompt: 'You get left out of something on purpose.',
    scenario: 'A friend “forgets” to invite you to a hangout you clearly heard about.',
    options: ['Bring it up casually', 'Say nothing and stew', 'Show up anyway'],
  },
  {
    humanPrompt: 'A friend eats the leftovers you’d been saving all week.',
    alienPrompt: 'Someone takes the one thing you were looking forward to.',
    scenario: 'A friend eats the leftovers you’d been saving all week.',
    options: ['Let it go', 'Make them replace it', 'Eat something of theirs, no warning'],
  },
  {
    humanPrompt: 'A friend spills your secret to the whole group as a “joke.”',
    alienPrompt: 'Something you told one person becomes public.',
    scenario: 'A friend spills your secret to the whole group as a “joke.”',
    options: ['Laugh it off', 'Confront them privately', 'Never trust them again'],
  },
  {
    humanPrompt: 'A friend borrowed money months ago and acts like it never happened.',
    alienPrompt: 'Someone owes you and conveniently forgot.',
    scenario: 'A friend borrowed money months ago and acts like it never happened.',
    options: ['Remind them directly', 'Write it off', 'Bring it up as a “joke” every time'],
  },
  {
    humanPrompt: 'You get blamed in the group chat for something a friend actually did.',
    alienPrompt: 'You take the fall for someone else’s mistake.',
    scenario: 'You get blamed in the group chat for something a friend actually did.',
    options: ['Defend yourself with receipts', 'Take the hit to keep the peace', 'Expose the real culprit'],
  },
  {
    humanPrompt: 'A friend promised to keep the surprise party secret and nearly blew it twice.',
    alienPrompt: 'Someone keeps proving they can’t hold a secret.',
    scenario: 'A friend promised to keep the surprise party secret and nearly blew it twice.',
    options: ['Keep them out of the loop next time', 'Give them a fake secret to test them', 'Trust them one more time'],
  },
  {
    humanPrompt: 'You realize a friend has been reading your texts over your shoulder for weeks.',
    alienPrompt: 'Someone’s been snooping on your private stuff.',
    scenario: 'You realize a friend has been reading your texts over your shoulder for weeks.',
    options: ['Call it out', 'Start typing fake decoy texts', 'Let them keep guessing'],
  },
  {
    humanPrompt: 'A friend keeps beating you to the last slice of everything, every time.',
    alienPrompt: 'Someone always grabs the best part before you can.',
    scenario: 'A friend keeps beating you to the last slice of everything, every time.',
    options: ['Call out the pattern', 'Start guarding your plate', 'Out-snag them next time'],
  },
  {
    humanPrompt: 'A friend enters the same contest as you and it’s down to you two.',
    alienPrompt: 'You end up competing head-to-head with someone close.',
    scenario: 'A friend enters the same contest as you and it’s down to you two.',
    options: ['Play to win, no mercy', 'Secretly hope they win', 'Suggest you split the prize'],
  },
];

export const BETRAYAL_PACK: ContentPack = {
  id: 'betrayal',
  name: 'Betrayal Pack',
  tagline: 'Juicy friend-group prompts — who would really do you dirty?',
  purchasable: true,
  opinion: OPINION,
  deliberation: DELIBERATION,
  drawing: DRAWING,
  writing: WRITING,
  mostLikely: MOST_LIKELY,
};
