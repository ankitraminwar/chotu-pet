# 🐾 ARCHITECTURE.md

### _System Design — Chotu Pet Extension_

---

## ◈ 1. SYSTEM TOPOLOGY

```
╔═══════════════════════════════════════════════════════════════════════╗
║                         CHROME BROWSER                                ║
║                                                                       ║
║   ┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐  ║
║   │  ⬡ BACKGROUND   │    │  ⬡ CONTENT        │    │  ⬡ POPUP       │  ║
║   │  Service Worker │◄──►│  Script Layer    │    │  React 19 App  │  ║
║   │                 │    │                  │    │                │  ║
║   │  • Domain track │    │  • WebGL renderer│    │  • 3D pet view │  ║
║   │  • XP engine    │    │  • GSAP timeline │    │  • Stat orbs   │  ║
║   │  • Alarm timers │    │  • Hybrid audio  │    │  • Skin vault  │  ║
║   │  • Badge update │    │  • Spring physics│    │  • Settings    │  ║
║   └────────┬────────┘    └────────┬─────────┘    └───────┬────────┘  ║
║            │                     │                       │           ║
║            └─────────────────────▼───────────────────────▼           ║
║                          chrome.storage.local                         ║
║                       ◈ Single Source of Truth ◈                      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## ◈ 2. LAYER CONTRACTS

### ⬡ Background Worker — `src/background/index.ts`

The **nervous system**. Always listening, never visible.

```
Owns:  Domain deduplication logic
       Hunger / XP / streak calculation
       chrome.alarms (reliable MV3 timers)
       Badge counter updates
       Midnight reset orchestration

Never: Touches DOM
       Imports React or Three.js
       Reads tab content directly
```

### ⬡ Content Script — `src/content/`

The **body**. Rendered into every page, ultralight, disposable.

```
Owns:  WebGL canvas injection + sizing
       GSAP master timeline per mood
       HybridSoundEngine (AudioBuffer + oscillator fallback)
       Web Audio API AudioContext lifecycle
       Spring physics for floating bob
       Cursor proximity magnetic effect
       Speech bubble FLIP animations
       storage.onChanged reactive loop

Never: Imports React (strict — increases bundle)
       Blocks main thread > 4ms
       Re-reads storage more than once on mount
```

### ⬡ Popup — `src/popup/`

The **mind**. React 19 concurrent app, rich UI.

```
Owns:  Three.js 3D pet preview scene
       Zustand store bridge to chrome.storage
       GSAP ScrollTrigger for card reveals
       CSS Houdini animated background
       Skin selection with physics transitions
       Settings with spring-animated toggles

Never: Runs animation loops after unmount
       Directly writes petState (goes through store actions)
```

---

## ◈ 3. DATA SCHEMA — Full Type System

```typescript
// src/shared/types.ts

// ── Pet Core ──────────────────────────────────────────────
export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export type PetMood =
  | "idle" // default floating state
  | "happy" // just fed (new domain)
  | "hungry" // hunger < 30
  | "sleep" // inactive > 10 min
  | "angry" // hunger = 0
  | "levelup" // XP threshold crossed
  | "evolve" // stage transition
  | "curious" // cursor hovering nearby
  | "scared"; // rapid scroll detected

export type SkinId =
  | "void" // Stage 1: deep black, cyan accents
  | "aurora" // Stage 2: green-purple gradient
  | "ember" // Stage 3: warm orange-red
  | "prism" // Stage 3: chromatic rainbow
  | "nebula" // Stage 4: deep space purple
  | "crystal" // Stage 4: icy blue-white
  | "obsidian" // Stage 5: mirror-black metallic
  | "solaris" // Stage 5: blazing gold
  | "phantom"; // 🔒 Secret: near-invisible ghost

export type PetState = {
  name: string;
  hunger: number; // 0–100
  happiness: number; // 0–100
  energy: number; // 0–100 (new dimension)
  level: number; // 1–50
  xp: number;
  skin: SkinId;
  evolutionStage: EvolutionStage;
  age: number; // days alive
  createdAt: number; // unix timestamp
  totalInteractions: number; // clicks, hovers
  personality: PersonalityTrait[];
};

export type PersonalityTrait =
  | "adventurous" // unlocked after 100 unique domains
  | "sleepy" // sleeps more often
  | "energetic" // bounces constantly
  | "shy"; // hides when cursor approaches

// ── Daily Tracking ────────────────────────────────────────
export type DailyStats = {
  visitedDomains: string[];
  sitesVisitedToday: number;
  totalSitesEver: number;
  streak: number;
  longestStreak: number;
  lastVisitDate: string;
  lastFedAt: number;
  lastNewDomain: string;
  feedsToday: number;
};

// ── Settings ──────────────────────────────────────────────
export type Position =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";
export type PetSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AuraStyle = "none" | "soft" | "pulse" | "chromatic" | "plasma";

export type Settings = {
  position: Position;
  size: PetSize;
  soundEnabled: boolean;
  soundVolume: number; // 0–1
  auraStyle: AuraStyle;
  showOnAllSites: boolean;
  blacklist: string[];
  reducedMotion: boolean; // respects prefers-reduced-motion
  showSpeechBubble: boolean;
  magneticCursor: boolean; // pet is drawn toward cursor
  particleEffects: boolean;
};
```

---

## ◈ 4. DATA FLOW PIPELINE

```
USER VISITS NEW SITE
         │
         ▼
   chrome.tabs.onUpdated
   [background/index.ts]
         │
   ┌─────▼──────┐
   │ URL valid? │ NO → exit
   └─────┬──────┘
         │ YES
   ┌─────▼──────────────────┐
   │ domainTracker.check()  │
   │ Is new domain today?   │
   └─────┬──────────────────┘
         │
   ┌─────▼─────┐      ┌─────────────────────────┐
   │  NEW ✓    │      │  NOT NEW                │
   │           │      │  • decay hunger -2      │
   │ feedPet() │      │  • decay happiness -1   │
   │ +hunger   │      │  • write to storage     │
   │ +xp +10   │      └─────────────────────────┘
   │ +happy    │
   └─────┬─────┘
         │
   levelUp check → new level? → send runtime message
         │
   streak update → new milestone? → bonus XP
         │
   chrome.storage.local.set({ petState, dailyStats })
         │
         ▼
   storage.onChanged fires in content.js
         │
   ┌─────▼──────────────────────────────────────┐
   │  CONTENT SCRIPT REACTS                     │
   │                                            │
   │  1. Update local state ref                 │
   │  2. GSAP: switch to HAPPY timeline         │
   │  3. tsParticles: burst emit (10 particles) │
   │  4. Tone.js: play 'feed' synth             │
   │  5. Show speech bubble with FLIP animation │
   │  6. Aura: increase glow intensity 2s       │
   └────────────────────────────────────────────┘
```

---

## ◈ 5. ZUSTAND STORE — Popup State

```typescript
// src/shared/store.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PetStore {
  petState: PetState | null;
  dailyStats: DailyStats | null;
  settings: Settings | null;
  isLoading: boolean;

  // Actions
  hydrate: () => Promise<void>;
  renamePet: (name: string) => Promise<void>;
  changeSkin: (skin: SkinId) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

export const usePetStore = create<PetStore>()(
  subscribeWithSelector((set, get) => ({
    petState: null,
    dailyStats: null,
    settings: null,
    isLoading: true,

    hydrate: async () => {
      const data = await chrome.storage.local.get([
        "petState",
        "dailyStats",
        "settings",
      ]);
      set({ ...data, isLoading: false });

      // Subscribe to external changes (from background worker)
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.petState) set({ petState: changes.petState.newValue });
        if (changes.dailyStats)
          set({ dailyStats: changes.dailyStats.newValue });
      });
    },

    renamePet: async (name) => {
      const petState = { ...get().petState!, name };
      await chrome.storage.local.set({ petState });
      set({ petState });
    },

    changeSkin: async (skin) => {
      const petState = { ...get().petState!, skin };
      await chrome.storage.local.set({ petState });
      set({ petState });
    },

    updateSettings: async (patch) => {
      const settings = { ...get().settings!, ...patch };
      await chrome.storage.local.set({ settings });
      set({ settings });
    },
  })),
);
```

---

## ◈ 6. CHROME ALARMS — MV3 RELIABLE TIMERS

```typescript
// background/alarms.ts
// ⚠️ CRITICAL: Never use setTimeout/setInterval in MV3 service workers
// They die when the worker suspends. Alarms survive.

export function registerAlarms() {
  // Hunger decay every 5 minutes
  chrome.alarms.create("hunger-decay", { periodInMinutes: 5 });

  // Midnight domain reset
  chrome.alarms.create("midnight-reset", {
    when: getNextMidnight(),
    periodInMinutes: 1440,
  });

  // Daily streak check (morning)
  chrome.alarms.create("streak-check", {
    when: getNextMorning(8), // 8 AM
    periodInMinutes: 1440,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case "hunger-decay":
      handleDecay();
      break;
    case "midnight-reset":
      handleMidnightReset();
      break;
    case "streak-check":
      handleStreakCheck();
      break;
  }
});
```

---

## ◈ 7. CONTENT SCRIPT INJECTION GUARD

```typescript
// content/index.ts
// Prevent double injection on SPA route changes

const MOUNT_ID = "website-pet-◈";

if (document.getElementById(MOUNT_ID)) {
  // Already mounted — send state refresh only
  chrome.runtime.sendMessage({ type: "REQUEST_STATE" });
} else {
  // Defer until browser idle to never impact page LCP
  const mount = () => initPet();

  "requestIdleCallback" in window
    ? requestIdleCallback(mount, { timeout: 2000 })
    : setTimeout(mount, 300);
}
```

---

## ◈ 8. MESSAGE PASSING CONTRACT

```typescript
// All messages typed — no stringly typed events

type BackgroundMessage =
  | { type: "PET_FED"; domain: string; xpGained: number; newStreak: number }
  | { type: "LEVEL_UP"; newLevel: number; bonusEffect: string }
  | { type: "EVOLVED"; newStage: EvolutionStage }
  | { type: "STATE_SYNC"; petState: PetState };

type ContentMessage =
  | { type: "REQUEST_STATE" }
  | { type: "PET_CLICKED" }
  | { type: "CURSOR_PROXIMITY"; distance: number };

type PopupMessage =
  | { type: "REFRESH_STATS" }
  | { type: "PREVIEW_SKIN"; skin: SkinId };
```

---

## ◈ 9. VITE CONFIG — CRXJS V3

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import glsl from "vite-plugin-glsl"; // import .glsl shaders
import { visualizer } from "rollup-plugin-visualizer";
import manifest from "./public/manifest.json";

export default defineConfig({
  plugins: [
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    crx({ manifest }),
    glsl(), // GLSL shader imports
    visualizer({ filename: "bundle-report.html" }),
  ],
  build: {
    target: "chrome120",
    minify: "oxc", // Fastest minifier 2025
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          gsap: ["gsap"],
          motion: ["motion"],
          tone: ["tone"],
        },
      },
    },
  },
  resolve: {
    alias: { "@": "/src", "@shared": "/src/shared" },
  },
});
```
