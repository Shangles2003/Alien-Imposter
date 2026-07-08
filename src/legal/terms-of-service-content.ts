import { LegalDocument } from '@/components/legal/LegalDocumentView';

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  appName: 'Alien Imposter',
  effectiveDate: 'July 7, 2026',
  intro:
    'By creating an account or playing Alien Imposter, you agree to these terms. This document also serves as the End User License Agreement (EULA) for the app.',
  sections: [
    {
      title: '1. The service',
      paragraphs: [
        'Alien Imposter is a multiplayer social deduction game played in private lobbies with people who share a party code. The base game is free to play. We also offer an optional paid upgrade, the "Expansion Pass," described in Section 6. We may change, suspend, or discontinue features at any time.',
      ],
    },
    {
      title: '2. Your account',
      paragraphs: [
        'You must be at least 13 years old to create an account. You\'re responsible for what happens under your account. One account per person is plenty. You can delete your account at any time in Settings → Delete Account.',
      ],
    },
    {
      title: '3. Your conduct and content',
      paragraphs: [
        'During games you submit answers, drawings, and votes that other players in your lobby can see. You agree not to submit content that is unlawful, hateful, harassing, sexually explicit, or that impersonates someone else. Keep in mind you are playing with people who invited you — don\'t ruin their night.',
        'We may remove content or suspend accounts that violate these rules. If someone in your lobby is behaving inappropriately, you can report them to alienimpostergame@gmail.com — include the lobby code and callsign if you can.',
      ],
    },
    {
      title: '4. Intellectual property',
      paragraphs: [
        'The app, its prompts, artwork, and branding belong to us. You keep whatever rights you have in the content you submit, and you grant us a limited license to display it to the other players in your lobby, which is the entire point of the game.',
      ],
    },
    {
      title: '5. What the free game includes',
      paragraphs: [
        'The free tier includes the complete base game and rules, 5-stage rounds, and a rotating sample of the question prompts. You can play full games, host lobbies, and invite friends without paying anything.',
      ],
    },
    {
      title: '6. Expansion Pass (purchases and subscriptions)',
      paragraphs: [
        'The Expansion Pass unlocks the full prompt library and the ability to host 3, 5, or 7-stage games. Because a game uses the host\'s settings, when the host owns the Expansion Pass everyone in that host\'s lobby enjoys the expanded content for that session. Only the host needs the Expansion Pass.',
        'The Expansion Pass is available two ways: (a) an auto-renewable monthly subscription at $0.99 per month (USD; local pricing may vary), or (b) a one-time purchase at $9.99 (USD) that unlocks it permanently.',
        'Payment is charged to your Apple ID account at confirmation of purchase. The monthly subscription automatically renews for the same price and period unless you turn off auto-renew at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours prior to the end of the current period. You can manage or cancel your subscription at any time in your device Settings → Apple ID → Subscriptions. Canceling stops future renewals; the current paid period continues until it ends.',
        'The one-time $9.99 purchase is a permanent unlock and is not a subscription; there is nothing to cancel. Purchases (both the subscription and the one-time unlock) are generally non-refundable except where required by law or under Apple\'s App Store refund policies, which you can request through Apple. Prices may change; we will give notice of changes as required, and for subscriptions any price change applies only after you are notified and, where required, you consent.',
        'Your Expansion Pass is tied to your account and your app-store purchase, so you can restore it on another device by signing in and using "Restore Purchases" in Settings.',
      ],
    },
    {
      title: '7. Disclaimers',
      paragraphs: [
        'The app is provided "as is" without warranties of any kind. We don\'t guarantee it will be uninterrupted, error-free, or that your friends won\'t wrongly eject you into space.',
      ],
    },
    {
      title: '8. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the app. Our total liability for any claim is limited to the greater of the amount you paid us in the twelve months before the claim or five U.S. dollars.',
      ],
    },
    {
      title: '9. Changes to these terms',
      paragraphs: [
        'If we make meaningful changes, we\'ll update this page and the effective date. Continuing to use the app after changes means you accept them.',
      ],
    },
    {
      title: '10. Contact',
      paragraphs: ['alienimpostergame@gmail.com'],
    },
  ],
} as const;
