export interface PlayerProfile {
  name: string;
  totalTimeMs: number;
  totalTrials: number;
  levelTrials: Record<number, number>;
}

export interface BillboardEntry {
  id: string;
  player: string;
  levelId: number;
  levelName: string;
  timeMs: number;
  recordedAt: number;
}

const STORAGE_KEYS = {
  profile: 'blockly-maze.profile.v1',
  billboard: 'blockly-maze.billboard.v1'
} as const;

let inMemoryProfile: PlayerProfile | null = null;
let inMemoryBillboard: BillboardEntry[] | null = null;

const storageAvailable = isLocalStorageAvailable();

export function loadPlayerProfile(): { profile: PlayerProfile; needsName: boolean } {
  if (!storageAvailable) {
    if (!inMemoryProfile) {
      inMemoryProfile = createDefaultProfile();
      return { profile: inMemoryProfile, needsName: true };
    }
    const needsName = inMemoryProfile.name.trim().length === 0;
    return { profile: inMemoryProfile, needsName };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) {
      const profile = createDefaultProfile();
      inMemoryProfile = profile;
      return { profile, needsName: true };
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const normalized = normalizeProfile(parsed);
    inMemoryProfile = normalized;
    const needsName = normalized.name.trim().length === 0;
    if (needsName) {
      const fallback = { ...normalized, name: generateGuestName() };
      inMemoryProfile = fallback;
      return { profile: fallback, needsName: true };
    }
    return { profile: normalized, needsName };
  } catch {
    const profile = createDefaultProfile();
    inMemoryProfile = profile;
    return { profile, needsName: true };
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  inMemoryProfile = { ...profile, levelTrials: { ...profile.levelTrials } };
  if (!storageAvailable) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(inMemoryProfile));
  } catch {
    // Ignore storage failures, rely on in-memory backup.
  }
}

export function loadBillboardEntries(): BillboardEntry[] {
  if (!storageAvailable) {
    if (!inMemoryBillboard) {
      inMemoryBillboard = [];
    }
    return inMemoryBillboard;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.billboard);
    if (!raw) {
      inMemoryBillboard = [];
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      inMemoryBillboard = [];
      return [];
    }
    const normalized: BillboardEntry[] = parsed
      .map((entry) => normalizeBillboardEntry(entry))
      .filter((entry): entry is BillboardEntry => entry !== null);
    inMemoryBillboard = normalized;
    return normalized;
  } catch {
    inMemoryBillboard = [];
    return [];
  }
}

export function saveBillboardEntries(entries: BillboardEntry[]): void {
  inMemoryBillboard = [...entries];
  if (!storageAvailable) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.billboard, JSON.stringify(entries));
  } catch {
    // Ignore storage failures, rely on in-memory backup.
  }
}

export function generateGuestName(): string {
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `Guest ${suffix}`;
}

function createDefaultProfile(): PlayerProfile {
  return {
    name: generateGuestName(),
    totalTimeMs: 0,
    totalTrials: 0,
    levelTrials: {}
  };
}

function normalizeProfile(raw: Partial<PlayerProfile> | null | undefined): PlayerProfile {
  const levelTrials: Record<number, number> = {};
  if (raw?.levelTrials && typeof raw.levelTrials === 'object') {
    Object.entries(raw.levelTrials).forEach(([key, value]) => {
      const id = Number(key);
      const trials = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      if (!Number.isNaN(id)) {
        levelTrials[id] = trials;
      }
    });
  }

  return {
    name: typeof raw?.name === 'string' ? raw.name : '',
    totalTimeMs: typeof raw?.totalTimeMs === 'number' && Number.isFinite(raw.totalTimeMs) ? Math.max(0, raw.totalTimeMs) : 0,
    totalTrials: typeof raw?.totalTrials === 'number' && Number.isFinite(raw.totalTrials) ? Math.max(0, Math.floor(raw.totalTrials)) : 0,
    levelTrials
  };
}

function normalizeBillboardEntry(raw: unknown): BillboardEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const candidate = raw as Partial<BillboardEntry>;
  const levelId = typeof candidate.levelId === 'number' ? candidate.levelId : Number(candidate.levelId);
  const timeMs = typeof candidate.timeMs === 'number' ? candidate.timeMs : Number(candidate.timeMs);
  const recordedAt = typeof candidate.recordedAt === 'number' ? candidate.recordedAt : Number(candidate.recordedAt);
  if (!Number.isFinite(levelId) || !Number.isFinite(timeMs) || timeMs <= 0 || !Number.isFinite(recordedAt)) {
    return null;
  }
  return {
    id: typeof candidate.id === 'string' && candidate.id.length > 0 ? candidate.id : `${recordedAt}-${Math.random().toString(16).slice(2)}`,
    player: typeof candidate.player === 'string' && candidate.player.length > 0 ? candidate.player : 'Unknown',
    levelId: Math.max(1, Math.round(levelId)),
    levelName: typeof candidate.levelName === 'string' ? candidate.levelName : `Level ${Math.max(1, Math.round(levelId))}`,
    timeMs,
    recordedAt
  };
}

function isLocalStorageAvailable(): boolean {
  try {
    const key = '__maze_game_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
