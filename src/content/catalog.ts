import { ContentPack, ContentPackId } from '@/content/types';

export interface PackListing {
  id: ContentPackId;
  name: string;
  tagline: string;
  emoji: string;
  /** Free for everyone — base game content. */
  free: boolean;
  purchasable: boolean;
}

export const PACK_LISTINGS: PackListing[] = [
  {
    id: 'core',
    name: 'Core Crew',
    tagline: 'The full free base game — always included.',
    emoji: '🛸',
    free: true,
    purchasable: false,
  },
  {
    id: 'spicy',
    name: 'Spicy Pack',
    tagline: 'Juicy relationship prompts & absurd drawing missions.',
    emoji: '🌶️',
    free: false,
    purchasable: true,
  },
];

export function getPackListing(id: ContentPackId): PackListing {
  return PACK_LISTINGS.find((p) => p.id === id) ?? PACK_LISTINGS[0]!;
}

export function packLabel(pack: ContentPack | PackListing): string {
  return pack.name;
}
