import { LegalDocument } from '@/components/legal/LegalDocumentView';

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  appName: 'Alien Imposter',
  effectiveDate: 'July 6, 2026',
  intro:
    'By creating an account or playing Alien Imposter, you agree to these terms.',
  sections: [
    {
      title: '1. The service',
      paragraphs: [
        'Alien Imposter is a multiplayer social deduction game played in private lobbies with people who share a party code. The app is provided free of charge. We may change, suspend, or discontinue features at any time.',
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
        'We may remove content or suspend accounts that violate these rules. If someone in your lobby is behaving inappropriately, you can report them to shangles2003@gmail.com — include the lobby code and callsign if you can.',
      ],
    },
    {
      title: '4. Intellectual property',
      paragraphs: [
        'The app, its prompts, artwork, and branding belong to us. You keep whatever rights you have in the content you submit, and you grant us a limited license to display it to the other players in your lobby, which is the entire point of the game.',
      ],
    },
    {
      title: '5. Disclaimers',
      paragraphs: [
        'The app is provided "as is" without warranties of any kind. We don\'t guarantee it will be uninterrupted, error-free, or that your friends won\'t wrongly eject you into space.',
      ],
    },
    {
      title: '6. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the app. Our total liability for any claim is limited to the amount you paid for the app — which is zero.',
      ],
    },
    {
      title: '7. Changes to these terms',
      paragraphs: [
        'If we make meaningful changes, we\'ll update this page and the effective date. Continuing to use the app after changes means you accept them.',
      ],
    },
    {
      title: '8. Contact',
      paragraphs: ['alienimpostergame@gmail.com'],
    },
  ],
} as const;
