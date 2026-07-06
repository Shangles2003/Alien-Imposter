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
  // The spicy pack was retired — its best prompts were reworked and folded
  // into the free core pool. A separate "After Dark" pack may return later.
];

export function getPackListing(id: ContentPackId): PackListing {
  return PACK_LISTINGS.find((p) => p.id === id) ?? PACK_LISTINGS[0]!;
}

export function packLabel(pack: ContentPack | PackListing): string {
  return pack.name;
}
