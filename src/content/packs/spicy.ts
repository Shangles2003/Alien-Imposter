import { ContentPack, MostLikelyTemplate, PromptTemplate } from '@/content/types';

/** Juicy but age-safe — no explicit content, keep it funny and relationship-flavored. */
export const SPICY_OPINION: PromptTemplate[] = [
  {
    humanPrompt: 'You should know your partner\'s love language by date three.',
    alienPrompt: 'You can tell if someone is into you pretty early on.',
  },
  {
    humanPrompt: 'Snooping through a partner\'s phone is never okay.',
    alienPrompt: 'Privacy in a relationship is non-negotiable.',
  },
  {
    humanPrompt: 'Being "just friends" with an ex is usually a lie.',
    alienPrompt: 'Staying close to an ex rarely stays simple.',
  },
  {
    humanPrompt: 'Love at first sight is real.',
    alienPrompt: 'You can feel a spark the first time you meet someone.',
  },
  {
    humanPrompt: 'Couples who share locations are healthier.',
    alienPrompt: 'A little transparency in a relationship is fine.',
  },
  {
    humanPrompt: 'Splitting the bill on a first date is the move.',
    alienPrompt: 'First dates feel less awkward when you go Dutch.',
  },
  {
    humanPrompt: 'You should meet their friends before making it official.',
    alienPrompt: 'Meeting the friend group tells you a lot about someone.',
  },
  {
    humanPrompt: 'A good morning text matters more than a goodnight one.',
    alienPrompt: 'Small check-ins during the day mean a lot.',
  },
  {
    humanPrompt: 'Jealousy means you care — a little is normal.',
    alienPrompt: 'Feeling protective of someone you like is natural.',
  },
  {
    humanPrompt: 'Sleeping in separate beds can save a relationship.',
    alienPrompt: 'Your own space at night can actually help a couple.',
  },
  {
    humanPrompt: 'You can tell a lot about someone by how they treat waitstaff.',
    alienPrompt: 'How someone acts toward strangers says everything.',
  },
  {
    humanPrompt: 'Public displays of affection are cringe.',
    alienPrompt: 'Heavy PDA makes everyone else uncomfortable.',
  },
];

export const SPICY_DELIBERATION: PromptTemplate[] = [
  {
    humanPrompt: 'Your crush just posted a thirst trap with someone else in the comments flirting.',
    alienPrompt: 'Someone you like is getting a lot of attention online from another person.',
    scenario: 'Your crush just posted a thirst trap with someone else in the comments flirting.',
    options: ['Like the post anyway', 'Send a casual DM', 'Mute and move on'],
  },
  {
    humanPrompt: 'Your partner wants to go through your camera roll together "for fun."',
    alienPrompt: 'Someone you are dating asks to scroll through your photos right now.',
    scenario: 'Your partner wants to go through your camera roll together "for fun."',
    options: ['Hand over the phone', 'Pick a few albums to share', 'Hard pass — not today'],
  },
  {
    humanPrompt: 'A friend asks who in the group you would date if you had to pick one.',
    alienPrompt: 'The group chat starts a "who would you pick" game and tags you.',
    scenario: 'A friend asks who in the group you would date if you had to pick one.',
    options: ['Answer honestly', 'Deflect with a joke', 'Refuse to play'],
  },
  {
    humanPrompt: 'You run into your ex at a party with their new partner.',
    alienPrompt: 'Someone you used to date shows up with someone new at the same event.',
    scenario: 'You run into your ex at a party with their new partner.',
    options: ['Say hi and be polite', 'Avoid eye contact all night', 'Leave early'],
  },
  {
    humanPrompt: 'Your situationship texts "what are we?" at 2 a.m.',
    alienPrompt: 'Someone you have been talking to sends a late-night "where is this going?" text.',
    scenario: 'Your situationship texts "what are we?" at 2 a.m.',
    options: ['Answer honestly', 'Reply in the morning', 'Change the subject'],
  },
  {
    humanPrompt: 'A friend sets you up on a blind date and the person is clearly not your type.',
    alienPrompt: 'You show up to a setup and instantly know it is not going to work.',
    scenario: 'A friend sets you up on a blind date and the person is clearly not your type.',
    options: ['Stay for one drink', 'Be honest after', 'Fake an emergency exit'],
  },
  {
    humanPrompt: 'You accidentally call your partner by your ex\'s name.',
    alienPrompt: 'You slip and use the wrong name mid-conversation.',
    scenario: 'You accidentally call your partner by your ex\'s name.',
    options: ['Own it and apologize', 'Pretend you said something else', 'Make it a running joke'],
  },
  {
    humanPrompt: 'Someone in the group confesses they have a crush on you.',
    alienPrompt: 'A friend admits they have feelings for you in front of everyone.',
    scenario: 'Someone in the group confesses they have a crush on you.',
    options: ['Talk privately later', 'Let them down gently now', 'Laugh it off'],
  },
  {
    humanPrompt: 'Your partner wants to make your relationship official on social media.',
    alienPrompt: 'Someone you are seeing wants to post you on their story tonight.',
    scenario: 'Your partner wants to make your relationship official on social media.',
    options: ['Post together', 'Wait a little longer', 'Keep it offline'],
  },
  {
    humanPrompt: 'You find an old love letter you never sent.',
    alienPrompt: 'You discover a note you wrote to someone years ago.',
    scenario: 'You find an old love letter you never sent.',
    options: ['Send it now', 'Read it to a friend', 'Shred it and move on'],
  },
];

export const SPICY_DRAWING: PromptTemplate[] = [
  { humanPrompt: 'Draw a pickle.', alienPrompt: 'Draw a bumpy green vegetable.' },
  {
    humanPrompt: 'Draw something you want someone to find.',
    alienPrompt: 'Draw a hidden object you would leave as a clue.',
  },
  {
    humanPrompt: 'Draw your type on paper.',
    alienPrompt: 'Draw a person you would swipe right on.',
  },
  {
    humanPrompt: 'Draw the red flags you ignore.',
    alienPrompt: 'Draw warning signs you pretend not to see.',
  },
  {
    humanPrompt: 'Draw your ideal first date.',
    alienPrompt: 'Draw a perfect evening with someone you like.',
  },
  {
    humanPrompt: 'Draw what "talking stage" looks like.',
    alienPrompt: 'Draw two people texting with question marks everywhere.',
  },
  {
    humanPrompt: 'Draw a couple\'s argument as a cartoon.',
    alienPrompt: 'Draw two stick figures having a silly fight.',
  },
  {
    humanPrompt: 'Draw your wingman/wingwoman in action.',
    alienPrompt: 'Draw a friend hyping you up at a party.',
  },
  {
    humanPrompt: 'Draw the outfit you wear when you want to impress someone.',
    alienPrompt: 'Draw your "going out" look.',
  },
  {
    humanPrompt: 'Draw a heart with something weird inside it.',
    alienPrompt: 'Draw a heart-shaped container with a random object in it.',
  },
  {
    humanPrompt: 'Draw your celebrity crush as a stick figure.',
    alienPrompt: 'Draw a famous person you would fan out over.',
  },
  {
    humanPrompt: 'Draw the text you would send your crush at 1 a.m.',
    alienPrompt: 'Draw a phone screen with a risky late-night message.',
  },
  {
    humanPrompt: 'Draw a rose… but make it chaotic.',
    alienPrompt: 'Draw a flower that looks a little unhinged.',
  },
  {
    humanPrompt: 'Draw your love language as a symbol.',
    alienPrompt: 'Draw how you show someone you care.',
  },
  {
    humanPrompt: 'Draw a sock on the floor (the universal red flag).',
    alienPrompt: 'Draw one piece of laundry in the wrong place.',
  },
];

export const SPICY_WRITING: PromptTemplate[] = [
  { humanPrompt: 'My biggest green flag in a person is ___.', alienPrompt: 'The first thing I notice about someone I like is ___.' },
  { humanPrompt: 'The pettiest reason I stopped talking to someone was ___.', alienPrompt: 'A small thing that made me lose interest was ___.' },
  { humanPrompt: 'My go-to flirting move is ___.', alienPrompt: 'When I like someone I usually ___.' },
  { humanPrompt: 'The most embarrassing thing I did on a date was ___.', alienPrompt: 'A date story I still cringe about involves ___.' },
  { humanPrompt: 'My love language is definitely ___.', alienPrompt: 'I show affection by ___.' },
  { humanPrompt: 'The song I would put on a mixtape for a crush is ___.', alienPrompt: 'A song that screams "I like you" is ___.' },
  { humanPrompt: 'My type is basically someone who ___.', alienPrompt: 'I always fall for people who ___.' },
  { humanPrompt: 'The worst pickup line I have ever used was ___.', alienPrompt: 'Something cheesy I once said to impress someone was ___.' },
  { humanPrompt: 'If my ex wrote a headline about me it would say ___.', alienPrompt: 'An ex would describe me as ___.' },
  { humanPrompt: 'The hill I die on in dating is that ___ is a dealbreaker.', alienPrompt: 'I cannot date someone who ___.' },
  { humanPrompt: 'My friends would roast me for still liking ___.', alienPrompt: 'Everyone knows I have a weakness for ___.' },
  { humanPrompt: 'The most romantic thing I have ever done was ___.', alienPrompt: 'A sweet gesture I once made was ___.' },
];

export const SPICY_MOST_LIKELY: MostLikelyTemplate[] = [
  {
    humanTemplate: 'Who is most likely to catch feelings from a situationship?',
    alienTemplate: 'Who is most likely to catch feelings faster than they planned?',
  },
  {
    humanTemplate: 'Who is most likely to stalk someone\'s Instagram before a first date?',
    alienTemplate: 'Who is most likely to deep-dive someone\'s profile before meeting them?',
  },
  {
    humanTemplate: 'Who is most likely to text their ex after a few drinks?',
    alienTemplate: 'Who is most likely to send a risky text late at night?',
  },
  {
    humanTemplate: 'Who is most likely to fall for a friend in this group?',
    alienTemplate: 'Who is most likely to develop a crush on someone here?',
  },
  {
    humanTemplate: 'Who is most likely to overshare on a first date?',
    alienTemplate: 'Who is most likely to tell their whole life story too soon?',
  },
  {
    humanTemplate: 'Who is most likely to ghost and then come back with "hey stranger"?',
    alienTemplate: 'Who is most likely to disappear and pop up months later?',
  },
  {
    humanTemplate: 'Who is most likely to write a love letter and never send it?',
    alienTemplate: 'Who is most likely to draft a message and delete it ten times?',
  },
  {
    humanTemplate: 'Who is most likely to have a secret TikTok crush list?',
    alienTemplate: 'Who is most likely to have a private list of people they like?',
  },
  {
    humanTemplate: 'Who is most likely to plan the perfect date and then panic?',
    alienTemplate: 'Who is most likely to overthink a date until the last minute?',
  },
  {
    humanTemplate: 'Who is most likely to say "I love you" first?',
    alienTemplate: 'Who is most likely to drop the L-word before anyone else?',
  },
  {
    humanTemplate: 'Who is most likely to get jealous over a like on a photo?',
    alienTemplate: 'Who is most likely to notice who liked someone\'s post?',
  },
  {
    humanTemplate: 'Who is most likely to be the group\'s unofficial therapist?',
    alienTemplate: 'Who is most likely to give relationship advice to everyone?',
  },
];

export const SPICY_PACK: ContentPack = {
  id: 'spicy',
  name: 'Spicy Pack',
  tagline: 'Juicy relationship prompts & absurd drawing missions.',
  purchasable: true,
  opinion: SPICY_OPINION,
  deliberation: SPICY_DELIBERATION,
  drawing: SPICY_DRAWING,
  writing: SPICY_WRITING,
  mostLikely: SPICY_MOST_LIKELY,
};
