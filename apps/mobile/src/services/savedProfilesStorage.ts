import { SafeStorage } from './storage';

export interface SavedProfileItem {
  id: string;
  type: 'EXECUTIVE' | 'ENTERPRISE';
  title: string;
  subtitle: string;
  companyName?: string;
  corporateLineage?: string;
  industry?: string;
  location?: string;
  countryCode?: string;
  flag?: string;
  avatarUrl?: string;
  fitScore?: number;
  matchTier?: 'BEST' | 'STRONG' | 'DIRECTORY';
  seekingSummary?: string;
  offeringSummary?: string;
  savedAt: string;
  notes?: string;
  userId?: string;
  rawItem?: any;
}

const STORAGE_KEY = '@meshvi_saved_profiles';

const SEED_SAVED_PROFILES: SavedProfileItem[] = [
  {
    id: 'dm-1',
    type: 'EXECUTIVE',
    title: 'Elena Rostova',
    subtitle: 'Chief Commercial Officer & VP Alliances',
    companyName: 'Aura Logistics APAC',
    corporateLineage: 'Parent: Aura Global Holdings AG (Zurich)',
    industry: 'Logistics & Supply Chain',
    location: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    fitScore: 94,
    matchTier: 'BEST',
    seekingSummary: 'Direct cross-border duty-free concessions & cold-chain syndication.',
    offeringSummary: 'Full regional terminal footprint across Southeast Asian transit corridors.',
    savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Key partner for APAC duty-free corridor expansion.',
    userId: 'usr-elena-01',
  },
  {
    id: 'ent-1',
    type: 'ENTERPRISE',
    title: 'Apex Global Logistics Pte Ltd',
    subtitle: 'Apex Global Holdings Group',
    companyName: 'Apex Global Logistics Pte Ltd',
    corporateLineage: 'Holding: Apex International Logistics Corp',
    industry: 'Maritime & Air Freight Cargo',
    location: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    avatarUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    fitScore: 96,
    matchTier: 'BEST',
    seekingSummary: 'Bilateral bonded warehousing and technology-driven customs syndication.',
    offeringSummary: 'Multi-corridor logistics hub connecting Singapore, Dubai, and Rotterdam.',
    savedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: 'Direct corporate mandate desk verified.',
  },
  {
    id: 'dm-2',
    type: 'EXECUTIVE',
    title: 'Marcus Vance',
    subtitle: 'Managing Director & VP Alliances',
    companyName: 'Apex Logistics Group',
    corporateLineage: 'Parent: Apex Industries Corp (Delaware)',
    industry: 'Supply Chain & Freight Forwarding',
    location: 'Dubai',
    countryCode: 'AE',
    flag: '🇦🇪',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    fitScore: 89,
    matchTier: 'BEST',
    seekingSummary: 'Seeking bonded AI customs integration with Singapore transshipment terminal.',
    offeringSummary: 'Automated bonded customs clearance and UAE bonded freight syndication.',
    savedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    notes: 'Warm introduction requested through Aditi Park.',
    userId: 'usr-marcus-02',
  },
];

export async function getSavedProfiles(): Promise<SavedProfileItem[]> {
  try {
    const raw = await SafeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed initial demo items if store is pristine
    await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SAVED_PROFILES));
    return SEED_SAVED_PROFILES;
  } catch {
    return SEED_SAVED_PROFILES;
  }
}

export async function saveProfileItem(item: SavedProfileItem): Promise<SavedProfileItem[]> {
  try {
    const current = await getSavedProfiles();
    const filtered = current.filter((p) => p.id !== item.id);
    const updated = [item, ...filtered];
    await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function removeSavedProfileItem(id: string): Promise<SavedProfileItem[]> {
  try {
    const current = await getSavedProfiles();
    const updated = current.filter((p) => p.id !== id);
    await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function toggleSavedProfile(item: SavedProfileItem): Promise<{ isSaved: boolean; list: SavedProfileItem[] }> {
  try {
    const current = await getSavedProfiles();
    const exists = current.some((p) => p.id === item.id);
    if (exists) {
      const updated = current.filter((p) => p.id !== item.id);
      await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { isSaved: false, list: updated };
    } else {
      const updated = [item, ...current];
      await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { isSaved: true, list: updated };
    }
  } catch {
    return { isSaved: false, list: [] };
  }
}

export async function isProfileSaved(id: string): Promise<boolean> {
  try {
    const current = await getSavedProfiles();
    return current.some((p) => p.id === id);
  } catch {
    return false;
  }
}
