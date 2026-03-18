import type { PetState, Settings, StorageData, EvolutionStage } from "./types";
import { STAGE_THRESHOLDS } from "./types";

/** Compute evolution stage from level */
export function computeEvolutionStage(level: number): EvolutionStage {
  if (level >= STAGE_THRESHOLDS[5]) return 5;
  if (level >= STAGE_THRESHOLDS[4]) return 4;
  if (level >= STAGE_THRESHOLDS[3]) return 3;
  if (level >= STAGE_THRESHOLDS[2]) return 2;
  return 1;
}

const DEFAULT_PET_STATE: PetState = {
  type: "dog",
  name: "Buddy",
  hunger: 100,
  happiness: 100,
  energy: 100,
  level: 1,
  xp: 0,
  xpToNext: 100,
  mood: "idle",
  evolutionStage: 1,
  totalFeeds: 0,
  totalClicks: 0,
  streak: 0,
  lastFedAt: Date.now(),
  lastActiveAt: Date.now(),
  createdAt: Date.now(),
};

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  volume: 0.6,
  petSize: "md",
  position: "bottom-right",
  showBubbles: true,
};

function isExtensionContext(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage;
}

export async function getStorageData(): Promise<StorageData> {
  let petState: PetState;
  let settings: Settings;
  let visitedDomains: string[];
  let lastVisitDate: string;

  if (!isExtensionContext()) {
    const raw = localStorage.getItem("petExtData");
    const data: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    petState = {
      ...DEFAULT_PET_STATE,
      ...((data.petState ?? {}) as Partial<PetState>),
    };
    settings = {
      ...DEFAULT_SETTINGS,
      ...((data.settings ?? {}) as Partial<Settings>),
    };
    visitedDomains = (data.visitedDomains as string[] | undefined) ?? [];
    lastVisitDate =
      (data.lastVisitDate as string | undefined) ?? new Date().toDateString();
  } else {
    const data = await chrome.storage.local.get([
      "petState",
      "settings",
      "visitedDomains",
      "lastVisitDate",
    ]);
    petState = {
      ...DEFAULT_PET_STATE,
      ...((data.petState ?? {}) as Partial<PetState>),
    };
    settings = {
      ...DEFAULT_SETTINGS,
      ...((data.settings ?? {}) as Partial<Settings>),
    };
    visitedDomains = (data.visitedDomains as string[] | undefined) ?? [];
    lastVisitDate =
      (data.lastVisitDate as string | undefined) ?? new Date().toDateString();
  }

  // SOUND UPGRADE: migrate evolutionStage from level if missing
  if (!petState.evolutionStage) {
    petState.evolutionStage = computeEvolutionStage(petState.level);
  }

  return { petState, settings, visitedDomains, lastVisitDate };
}

export async function updatePetState(
  updates: Partial<PetState>,
): Promise<PetState> {
  const { petState } = await getStorageData();
  const newState = { ...petState, ...updates };

  if (isExtensionContext()) {
    await chrome.storage.local.set({ petState: newState });
  } else {
    const raw = localStorage.getItem("petExtData");
    const data = raw ? JSON.parse(raw) : {};
    data.petState = newState;
    localStorage.setItem("petExtData", JSON.stringify(data));
  }
  return newState;
}

export async function updateSettings(
  updates: Partial<Settings>,
): Promise<Settings> {
  const { settings } = await getStorageData();
  const newSettings = { ...settings, ...updates };

  if (isExtensionContext()) {
    await chrome.storage.local.set({ settings: newSettings });
  } else {
    const raw = localStorage.getItem("petExtData");
    const data = raw ? JSON.parse(raw) : {};
    data.settings = newSettings;
    localStorage.setItem("petExtData", JSON.stringify(data));
  }
  return newSettings;
}

export function onStorageChange(
  callback: (
    changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
  ) => void,
): () => void {
  if (!isExtensionContext()) return () => {};
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === "local") callback(changes);
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}

export function getDefaultPetState(): PetState {
  return { ...DEFAULT_PET_STATE };
}

export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}
