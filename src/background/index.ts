import type { PetState, PetMood, EvolutionStage } from "../shared/types";
import { STAGE_THRESHOLDS } from "../shared/types";

const HUNGER_DECAY_INTERVAL = 10 * 60 * 1000; // 10 minutes
const ENERGY_DECAY_INTERVAL = 15 * 60 * 1000; // 15 minutes
const IDLE_SLEEP_THRESHOLD = 10 * 60 * 1000; // 10 min inactive → sleep

const XP_PER_FEED = 15;
const XP_PER_LEVEL_BASE = 100;
const XP_LEVEL_SCALE = 1.3;
const MAX_LEVEL = 50;

function xpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_SCALE, level - 1));
}

// SOUND UPGRADE: compute evolution stage from level
function computeStage(level: number): EvolutionStage {
  if (level >= STAGE_THRESHOLDS[5]) return 5;
  if (level >= STAGE_THRESHOLDS[4]) return 4;
  if (level >= STAGE_THRESHOLDS[3]) return 3;
  if (level >= STAGE_THRESHOLDS[2]) return 2;
  return 1;
}

function computeMood(state: PetState): PetMood {
  if (state.energy < 15) return "sleep";
  if (state.hunger < 20) return "hungry";
  if (state.happiness > 80 && state.hunger > 60) return "happy";
  return "idle";
}

async function getState(): Promise<{
  petState: PetState;
  visitedDomains: string[];
  lastVisitDate: string;
}> {
  const data = await chrome.storage.local.get([
    "petState",
    "settings",
    "visitedDomains",
    "lastVisitDate",
  ]);
  return {
    petState: (data.petState as PetState | undefined) ?? {
      type: "dog",
      name: "Buddy",
      hunger: 100,
      happiness: 100,
      energy: 100,
      level: 1,
      xp: 0,
      xpToNext: 100,
      mood: "idle" as PetMood,
      evolutionStage: 1 as EvolutionStage,
      totalFeeds: 0,
      totalClicks: 0,
      streak: 0,
      lastFedAt: Date.now(),
      lastActiveAt: Date.now(),
      createdAt: Date.now(),
    },
    visitedDomains: (data.visitedDomains as string[] | undefined) ?? [],
    lastVisitDate:
      (data.lastVisitDate as string | undefined) ?? new Date().toDateString(),
  };
}

// ── DOMAIN TRACKING ─────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  let hostname: string;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return;
  }

  if (!hostname || hostname.startsWith("chrome") || hostname.startsWith("edge"))
    return;

  const { petState, visitedDomains, lastVisitDate } = await getState();
  const today = new Date().toDateString();

  // Reset daily tracking if new day
  let domains = visitedDomains;
  let streak = petState.streak;
  if (lastVisitDate !== today) {
    if (lastVisitDate === new Date(Date.now() - 86400000).toDateString()) {
      streak += 1;
    } else if (lastVisitDate !== today) {
      streak = 1;
    }
    domains = [];
  }

  // Check if new domain
  if (domains.includes(hostname)) return;

  domains.push(hostname);

  // Feed the pet
  let { xp, level, xpToNext } = petState;
  xp += XP_PER_FEED;

  // Level up check
  while (xp >= xpToNext && level < MAX_LEVEL) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level);
  }

  const hunger = Math.min(100, petState.hunger + 8);
  const happiness = Math.min(100, petState.happiness + 5);

  const newState: PetState = {
    ...petState,
    hunger,
    happiness,
    xp,
    level,
    xpToNext,
    evolutionStage: computeStage(level),
    totalFeeds: petState.totalFeeds + 1,
    streak,
    lastFedAt: Date.now(),
    lastActiveAt: Date.now(),
    mood: "idle",
  };
  newState.mood = computeMood(newState);

  await chrome.storage.local.set({
    petState: newState,
    visitedDomains: domains,
    lastVisitDate: today,
  });

  // Update badge
  chrome.action.setBadgeText({ text: `${level}` });
  chrome.action.setBadgeBackgroundColor({ color: "#00E5FF" });
});

// ── STAT DECAY ALARMS ───────────────────────────────────────
chrome.alarms.create("hungerDecay", { periodInMinutes: 10 });
chrome.alarms.create("energyDecay", { periodInMinutes: 15 });
chrome.alarms.create("moodCheck", { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const { petState } = await getState();
  const updates: Partial<PetState> = {};

  if (alarm.name === "hungerDecay") {
    updates.hunger = Math.max(0, petState.hunger - 3);
    updates.happiness = Math.max(0, petState.happiness - 2);
  }

  if (alarm.name === "energyDecay") {
    updates.energy = Math.max(0, petState.energy - 2);
  }

  if (alarm.name === "moodCheck") {
    const now = Date.now();
    const timeSinceActive = now - (petState.lastActiveAt ?? now);

    if (timeSinceActive > IDLE_SLEEP_THRESHOLD) {
      updates.energy = Math.max(0, (petState.energy ?? 100) - 5);
    } else {
      updates.energy = Math.min(100, (petState.energy ?? 100) + 1);
    }
  }

  const newState = { ...petState, ...updates };
  newState.mood = computeMood(newState);

  await chrome.storage.local.set({ petState: newState });
});

// ── INSTALL EVENT ───────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const defaultState: PetState = {
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

    await chrome.storage.local.set({
      petState: defaultState,
      settings: {
        soundEnabled: true,
        volume: 0.6,
        petSize: "md",
        position: "bottom-right",
        showBubbles: true,
      },
      visitedDomains: [],
      lastVisitDate: new Date().toDateString(),
    });

    chrome.action.setBadgeText({ text: "1" });
    chrome.action.setBadgeBackgroundColor({ color: "#00E5FF" });
  }
});

// ── MESSAGE HANDLING ────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PET_CLICKED") {
    getState().then(async ({ petState }) => {
      const happiness = Math.min(100, petState.happiness + 2);
      const newState: PetState = {
        ...petState,
        happiness,
        totalClicks: petState.totalClicks + 1,
        lastActiveAt: Date.now(),
      };
      newState.mood = computeMood(newState);
      await chrome.storage.local.set({ petState: newState });
      sendResponse({ success: true });
    });
    return true;
  }
});

// Keep-alive: unused variables suppressed
void HUNGER_DECAY_INTERVAL;
void ENERGY_DECAY_INTERVAL;
