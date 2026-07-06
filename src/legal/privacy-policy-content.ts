export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  appName: 'Alien Imposter',
  effectiveDate: 'July 6, 2026',
  intro:
    'This Privacy Policy describes how Joseph Samuel Tornari (“we,” “us,” or “our”) collects, uses, shares, and protects information when you use the Alien Imposter mobile application and related services (collectively, the “App”).\n\nBy using the App, you agree to this Privacy Policy. If you do not agree, do not use the App.',
  sections: [
    {
      title: '1. Who We Are',
      paragraphs: [
        'App name: Alien Imposter',
        'Developer: Joseph Samuel Tornari',
        'Contact: alienimpostergame@gmail.com',
      ],
    },
    {
      title: '2. Summary',
      paragraphs: [
        'Alien Imposter is a free multiplayer social deduction party game. To play online, you authenticate an account. We store your profile, lobby participation, and in-game responses on our backend so you and your friends can play together in real time.',
        'We do not sell your personal information. We do not use third-party advertising or analytics SDKs in the App. We do not have in-app purchases. We use service providers only to operate the basic functions of the App.',
      ],
    },
    {
      title: '3. Information We Collect',
      paragraphs: [
        '3.1 Information You Provide',
        'Account Authentication: We collect a unique username and password to create and authenticate your account.',
        'Profile Data: Your display name (“callsign”) and avatar color choice.',
        'In-Game Content: Answers, drawings, votes, and other gameplay actions you submit during a live session.',
        'Support Communications: Information you provide if you email us for help.',
        '3.2 Information Collected Automatically',
        'Account Identifier (UUID): A unique string that links your profile, lobbies, and game sessions.',
        'Authentication Tokens: Secure tokens stored locally on your device to keep you signed in.',
        'Session Metadata: Lobby codes, game phases, timestamps, and sync states required to make the multiplayer function work.',
        'Note: We do not collect precise GPS location, contacts, photos from your camera roll, microphone recordings, or web browsing history.',
      ],
    },
    {
      title: '4. How We Use Information',
      paragraphs: [
        'We use the collected information strictly to:',
        '• Create, authenticate, and manage your account.',
        '• Host private lobbies and sync multiplayer gameplay in real time.',
        '• Display your callsign and gameplay submissions to the other players in your specific lobby.',
        '• Maintain security, enforce game rules, and fix technical bugs.',
        '• Respond to your support inquiries.',
      ],
    },
    {
      title: '5. How We Share Information',
      paragraphs: [
        'We only share information in the following ways:',
        'With Other Players: When you join a lobby, the other participants in that specific session can see your display name, avatar color, and the content (drawings, answers, votes) you submit during that game.',
        'With Service Providers: We use trusted third-party services to operate the App. These include Supabase (for database hosting, authentication, and real-time multiplayer syncing), Apple / Google (for app distribution and native sign-in), and Expo (for app infrastructure). These providers process data on our behalf and are bound by their own strict privacy agreements.',
        'Legal Requirements: We may disclose information if required by law, court order, or to protect the safety and security of our users or the public.',
      ],
    },
    {
      title: '6. Data Retention and Deletion',
      paragraphs: [
        'We keep your account and profile data for as long as your account is active. Game state data is stored to support active and recent sessions.',
        'Account Deletion: You have the right to completely delete your data. You can do this at any time directly inside the App by navigating to Settings → Delete Account. Confirming this action will immediately remove your authentication user profile and cascade-delete your associated profile and lobby data from our active databases.',
      ],
    },
    {
      title: '7. Children’s Privacy',
      paragraphs: [
        'The App is not directed to children under the age of 13. You must be at least 13 years old to use the App. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us at alienimpostergame@gmail.com and we will delete the account and associated data immediately.',
      ],
    },
    {
      title: '8. User-Generated Content',
      paragraphs: [
        'Alien Imposter relies on user-generated text and drawings submitted during games. This content is shared exclusively with the participants in your private, code-gated lobby. We reserve the right to review reported content and remove data or suspend accounts that violate our Terms of Service (such as submitting illegal, hateful, or explicit content).',
        'If you encounter inappropriate behavior, you can report the user to alienimpostergame@gmail.com. Please include the lobby code and the user\'s callsign if possible.',
      ],
    },
    {
      title: '9. Security',
      paragraphs: [
        'We use industry-standard security measures, including encrypted connections (HTTPS/TLS) and strict Row-Level Security (RLS) on our database, to protect your data. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      title: '10. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy periodically. We will post the updated version with a new “Effective date” at the top of the document. Continuing to use the App after changes are posted means you accept the updated policy.',
      ],
    },
    {
      title: '11. Contact Us',
      paragraphs: [
        'If you have any questions about this Privacy Policy or how your data is handled, please contact us at:',
        'Email: alienimpostergame@gmail.com',
        'Developer: Joseph Samuel Tornari',
      ],
    },
  ],
} as const;
