import type { PetType, PetDefinition, PetSoundSet, PetColors } from "./types";

// ── DOG ─────────────────────────────────────────────────────
const dogColors: PetColors = {
  body: "#C68642",
  bodyLight: "#DBA05E",
  outline: "#8B5E3C",
  ear: "#A06B3A",
  earInner: "#E8C9A0",
  eye: "#2C1810",
  pupil: "#000000",
  nose: "#1A1A1A",
  blush: "#FFB3BA",
  belly: "#E8D5B5",
  tail: "#A0703C",
  special: "#D4A574",
  glow: "rgba(198, 134, 66, 0.4)",
};

const dogSounds: PetSoundSet = {
  feed: [
    { freq: 400, duration: 0.08, type: "square", gain: 0.3 },
    { freq: 600, duration: 0.1, type: "square", gain: 0.35, delay: 0.06 },
    { freq: 800, duration: 0.12, type: "square", gain: 0.25, delay: 0.12 },
  ],
  click: [
    { freq: 500, duration: 0.06, type: "sawtooth", gain: 0.25 },
    { freq: 650, duration: 0.08, type: "sawtooth", gain: 0.2, delay: 0.05 },
  ],
  happy: [
    { freq: 350, duration: 0.07, type: "square", gain: 0.2 },
    { freq: 400, duration: 0.07, type: "square", gain: 0.2, delay: 0.08 },
    { freq: 350, duration: 0.07, type: "square", gain: 0.2, delay: 0.16 },
    { freq: 400, duration: 0.07, type: "square", gain: 0.2, delay: 0.24 },
  ],
  hungry: [
    { freq: 400, duration: 0.2, type: "triangle", gain: 0.3 },
    { freq: 300, duration: 0.25, type: "triangle", gain: 0.25, delay: 0.18 },
    { freq: 220, duration: 0.3, type: "triangle", gain: 0.2, delay: 0.38 },
  ],
  sleep: [
    { freq: 120, duration: 0.6, type: "sine", gain: 0.08 },
    { freq: 100, duration: 0.8, type: "sine", gain: 0.05, delay: 0.8 },
  ],
  levelup: [
    { freq: 523, duration: 0.12, type: "square", gain: 0.3 },
    { freq: 659, duration: 0.12, type: "square", gain: 0.3, delay: 0.1 },
    { freq: 784, duration: 0.12, type: "square", gain: 0.3, delay: 0.2 },
    { freq: 1047, duration: 0.25, type: "square", gain: 0.35, delay: 0.3 },
  ],
};

// ── CAT ─────────────────────────────────────────────────────
const catColors: PetColors = {
  body: "#F4A460",
  bodyLight: "#FFDAB9",
  outline: "#CC7832",
  ear: "#E8944A",
  earInner: "#FFD4B0",
  eye: "#2E8B57",
  pupil: "#000000",
  nose: "#FF9999",
  blush: "#FFCCE0",
  belly: "#FFF0DD",
  tail: "#E8944A",
  special: "#CC7832",
  glow: "rgba(244, 164, 96, 0.4)",
};

const catSounds: PetSoundSet = {
  feed: [
    { freq: 600, duration: 0.15, type: "sine", gain: 0.3 },
    { freq: 450, duration: 0.12, type: "sine", gain: 0.25, delay: 0.12 },
    { freq: 550, duration: 0.18, type: "sine", gain: 0.2, delay: 0.22 },
  ],
  click: [
    { freq: 800, duration: 0.04, type: "triangle", gain: 0.2 },
    { freq: 1000, duration: 0.05, type: "triangle", gain: 0.15, delay: 0.03 },
    { freq: 700, duration: 0.06, type: "triangle", gain: 0.12, delay: 0.06 },
  ],
  happy: [
    { freq: 60, duration: 0.4, type: "sine", gain: 0.15 },
    { freq: 62, duration: 0.4, type: "sine", gain: 0.15, delay: 0.35 },
    { freq: 58, duration: 0.4, type: "sine", gain: 0.12, delay: 0.7 },
  ],
  hungry: [
    { freq: 500, duration: 0.25, type: "sine", gain: 0.3 },
    { freq: 350, duration: 0.3, type: "sine", gain: 0.25, delay: 0.2 },
  ],
  sleep: [
    { freq: 55, duration: 1.0, type: "sine", gain: 0.05 },
    { freq: 52, duration: 1.0, type: "sine", gain: 0.04, delay: 1.2 },
  ],
  levelup: [
    { freq: 660, duration: 0.1, type: "triangle", gain: 0.3 },
    { freq: 880, duration: 0.1, type: "triangle", gain: 0.3, delay: 0.08 },
    { freq: 1100, duration: 0.1, type: "triangle", gain: 0.3, delay: 0.16 },
    { freq: 1320, duration: 0.2, type: "triangle", gain: 0.35, delay: 0.24 },
  ],
};

// ── LION ────────────────────────────────────────────────────
const lionColors: PetColors = {
  body: "#DAA520",
  bodyLight: "#F0D060",
  outline: "#B8860B",
  ear: "#C89520",
  earInner: "#E8C860",
  eye: "#CC6600",
  pupil: "#1A0A00",
  nose: "#2A1A0A",
  blush: "#FFCC99",
  belly: "#F5E6A8",
  tail: "#B8860B",
  special: "#A0722A",
  glow: "rgba(218, 165, 32, 0.5)",
};

const lionSounds: PetSoundSet = {
  feed: [
    { freq: 120, duration: 0.2, type: "sawtooth", gain: 0.25 },
    { freq: 150, duration: 0.15, type: "sawtooth", gain: 0.3, delay: 0.15 },
  ],
  click: [{ freq: 100, duration: 0.1, type: "sawtooth", gain: 0.2 }],
  happy: [
    { freq: 100, duration: 0.3, type: "sawtooth", gain: 0.2 },
    { freq: 140, duration: 0.25, type: "sawtooth", gain: 0.22, delay: 0.25 },
    { freq: 120, duration: 0.35, type: "sawtooth", gain: 0.18, delay: 0.45 },
  ],
  hungry: [
    { freq: 80, duration: 0.4, type: "sawtooth", gain: 0.3 },
    { freq: 70, duration: 0.5, type: "sawtooth", gain: 0.25, delay: 0.35 },
  ],
  sleep: [
    { freq: 45, duration: 1.2, type: "sine", gain: 0.06 },
    { freq: 40, duration: 1.5, type: "sine", gain: 0.04, delay: 1.4 },
  ],
  levelup: [
    { freq: 80, duration: 0.15, type: "sawtooth", gain: 0.3 },
    { freq: 120, duration: 0.15, type: "sawtooth", gain: 0.35, delay: 0.12 },
    { freq: 180, duration: 0.15, type: "sawtooth", gain: 0.35, delay: 0.24 },
    { freq: 250, duration: 0.35, type: "sawtooth", gain: 0.4, delay: 0.36 },
  ],
};

// ── TIGER ───────────────────────────────────────────────────
const tigerColors: PetColors = {
  body: "#FF8C00",
  bodyLight: "#FFA840",
  outline: "#CC6600",
  ear: "#E87800",
  earInner: "#FFC080",
  eye: "#FFD700",
  pupil: "#1A1A00",
  nose: "#1A1A1A",
  blush: "#FFD4A0",
  belly: "#FFE8C0",
  tail: "#CC6600",
  special: "#1A1A1A",
  glow: "rgba(255, 140, 0, 0.5)",
};

const tigerSounds: PetSoundSet = {
  feed: [
    { freq: 150, duration: 0.12, type: "sawtooth", gain: 0.25 },
    { freq: 180, duration: 0.1, type: "sawtooth", gain: 0.2, delay: 0.1 },
  ],
  click: [
    { freq: 120, duration: 0.08, type: "sawtooth", gain: 0.2 },
    { freq: 140, duration: 0.06, type: "sawtooth", gain: 0.15, delay: 0.06 },
  ],
  happy: [
    { freq: 120, duration: 0.08, type: "sawtooth", gain: 0.15 },
    { freq: 140, duration: 0.08, type: "sawtooth", gain: 0.15, delay: 0.1 },
    { freq: 120, duration: 0.08, type: "sawtooth", gain: 0.15, delay: 0.2 },
    { freq: 140, duration: 0.08, type: "sawtooth", gain: 0.15, delay: 0.3 },
  ],
  hungry: [
    { freq: 70, duration: 0.5, type: "sawtooth", gain: 0.3 },
    { freq: 65, duration: 0.6, type: "sawtooth", gain: 0.25, delay: 0.45 },
  ],
  sleep: [
    { freq: 50, duration: 1.0, type: "sine", gain: 0.06 },
    { freq: 55, duration: 0.8, type: "sine", gain: 0.05, delay: 1.2 },
  ],
  levelup: [
    { freq: 60, duration: 0.15, type: "sawtooth", gain: 0.3 },
    { freq: 100, duration: 0.15, type: "sawtooth", gain: 0.35, delay: 0.12 },
    { freq: 160, duration: 0.15, type: "sawtooth", gain: 0.35, delay: 0.24 },
    { freq: 280, duration: 0.15, type: "sawtooth", gain: 0.35, delay: 0.36 },
    { freq: 400, duration: 0.3, type: "sawtooth", gain: 0.4, delay: 0.48 },
  ],
};

// ── FOX ─────────────────────────────────────────────────────
const foxColors: PetColors = {
  body: "#FF6347",
  bodyLight: "#FF8A70",
  outline: "#CC4030",
  ear: "#E85540",
  earInner: "#1A1A1A",
  eye: "#CC8800",
  pupil: "#1A0A00",
  nose: "#1A1A1A",
  blush: "#FFCCBB",
  belly: "#FFFFFF",
  tail: "#FF6347",
  special: "#FFFFFF",
  glow: "rgba(255, 99, 71, 0.4)",
};

const foxSounds: PetSoundSet = {
  feed: [
    { freq: 800, duration: 0.06, type: "square", gain: 0.2 },
    { freq: 700, duration: 0.08, type: "square", gain: 0.25, delay: 0.05 },
    { freq: 900, duration: 0.06, type: "square", gain: 0.2, delay: 0.1 },
  ],
  click: [{ freq: 700, duration: 0.04, type: "square", gain: 0.2 }],
  happy: [
    { freq: 600, duration: 0.06, type: "square", gain: 0.2 },
    { freq: 700, duration: 0.06, type: "square", gain: 0.2, delay: 0.07 },
    { freq: 800, duration: 0.06, type: "square", gain: 0.2, delay: 0.14 },
  ],
  hungry: [
    { freq: 500, duration: 0.2, type: "triangle", gain: 0.25 },
    { freq: 380, duration: 0.25, type: "triangle", gain: 0.2, delay: 0.18 },
  ],
  sleep: [
    { freq: 200, duration: 0.5, type: "sine", gain: 0.06 },
    { freq: 190, duration: 0.5, type: "sine", gain: 0.04, delay: 0.7 },
  ],
  levelup: [
    { freq: 400, duration: 0.08, type: "square", gain: 0.3 },
    { freq: 600, duration: 0.08, type: "square", gain: 0.3, delay: 0.07 },
    { freq: 800, duration: 0.08, type: "square", gain: 0.3, delay: 0.14 },
    { freq: 1000, duration: 0.08, type: "square", gain: 0.3, delay: 0.21 },
    { freq: 1200, duration: 0.15, type: "square", gain: 0.35, delay: 0.28 },
  ],
};

// ── BUNNY ───────────────────────────────────────────────────
const bunnyColors: PetColors = {
  body: "#F5E6E0",
  bodyLight: "#FFF5F0",
  outline: "#D4B5A8",
  ear: "#F0DDD5",
  earInner: "#FFB8C6",
  eye: "#CC3366",
  pupil: "#330011",
  nose: "#FF8FAA",
  blush: "#FFD4E0",
  belly: "#FFFFFF",
  tail: "#FFFFFF",
  special: "#FFB8C6",
  glow: "rgba(255, 184, 198, 0.4)",
};

const bunnySounds: PetSoundSet = {
  feed: [
    { freq: 1000, duration: 0.05, type: "sine", gain: 0.2 },
    { freq: 900, duration: 0.06, type: "sine", gain: 0.18, delay: 0.04 },
    { freq: 1100, duration: 0.05, type: "sine", gain: 0.15, delay: 0.08 },
  ],
  click: [{ freq: 100, duration: 0.04, type: "sine", gain: 0.4 }],
  happy: [
    { freq: 900, duration: 0.04, type: "sine", gain: 0.15 },
    { freq: 1000, duration: 0.04, type: "sine", gain: 0.15, delay: 0.05 },
    { freq: 900, duration: 0.04, type: "sine", gain: 0.15, delay: 0.1 },
    { freq: 1000, duration: 0.04, type: "sine", gain: 0.15, delay: 0.15 },
  ],
  hungry: [
    { freq: 700, duration: 0.2, type: "sine", gain: 0.2 },
    { freq: 550, duration: 0.25, type: "sine", gain: 0.15, delay: 0.18 },
  ],
  sleep: [
    { freq: 400, duration: 0.4, type: "sine", gain: 0.03 },
    { freq: 380, duration: 0.4, type: "sine", gain: 0.02, delay: 0.6 },
  ],
  levelup: [
    { freq: 600, duration: 0.06, type: "sine", gain: 0.25 },
    { freq: 800, duration: 0.06, type: "sine", gain: 0.25, delay: 0.05 },
    { freq: 1000, duration: 0.06, type: "sine", gain: 0.25, delay: 0.1 },
    { freq: 1200, duration: 0.1, type: "sine", gain: 0.3, delay: 0.15 },
  ],
};

// ── PANDA ───────────────────────────────────────────────────
const pandaColors: PetColors = {
  body: "#F5F5F5",
  bodyLight: "#FFFFFF",
  outline: "#CCCCCC",
  ear: "#1A1A1A",
  earInner: "#333333",
  eye: "#1A1A1A",
  pupil: "#FFFFFF",
  nose: "#1A1A1A",
  blush: "#FFE0E0",
  belly: "#FFFFFF",
  tail: "#1A1A1A",
  special: "#1A1A1A",
  glow: "rgba(100, 100, 100, 0.3)",
};

const pandaSounds: PetSoundSet = {
  feed: [
    { freq: 250, duration: 0.06, type: "sine", gain: 0.2 },
    { freq: 230, duration: 0.06, type: "sine", gain: 0.2, delay: 0.08 },
    { freq: 260, duration: 0.06, type: "sine", gain: 0.2, delay: 0.16 },
    { freq: 240, duration: 0.06, type: "sine", gain: 0.2, delay: 0.24 },
  ],
  click: [
    { freq: 250, duration: 0.1, type: "sine", gain: 0.25 },
    { freq: 300, duration: 0.08, type: "sine", gain: 0.2, delay: 0.08 },
  ],
  happy: [
    { freq: 300, duration: 0.12, type: "sine", gain: 0.2 },
    { freq: 400, duration: 0.1, type: "sine", gain: 0.2, delay: 0.1 },
    { freq: 300, duration: 0.12, type: "sine", gain: 0.18, delay: 0.2 },
  ],
  hungry: [
    { freq: 300, duration: 0.25, type: "sine", gain: 0.25 },
    { freq: 220, duration: 0.3, type: "sine", gain: 0.2, delay: 0.2 },
  ],
  sleep: [
    { freq: 80, duration: 0.6, type: "sine", gain: 0.06 },
    { freq: 100, duration: 0.4, type: "sine", gain: 0.06, delay: 0.8 },
    { freq: 80, duration: 0.6, type: "sine", gain: 0.05, delay: 1.4 },
  ],
  levelup: [
    { freq: 300, duration: 0.1, type: "sine", gain: 0.3 },
    { freq: 400, duration: 0.1, type: "sine", gain: 0.3, delay: 0.08 },
    { freq: 500, duration: 0.1, type: "sine", gain: 0.3, delay: 0.16 },
    { freq: 600, duration: 0.15, type: "sine", gain: 0.35, delay: 0.24 },
  ],
};

// ── PET REGISTRY ────────────────────────────────────────────
export const PET_REGISTRY: Record<PetType, PetDefinition> = {
  dog: {
    id: "dog",
    name: "Dog",
    emoji: "🐶",
    description: "Loyal companion who loves new adventures",
    defaultName: "Buddy",
    colors: dogColors,
    sounds: dogSounds,
    earStyle: "floppy",
    tailStyle: "curvy",
    hasStripes: false,
    hasMane: false,
    hasWhiskers: false,
    hasPatches: false,
  },
  cat: {
    id: "cat",
    name: "Cat",
    emoji: "🐱",
    description: "Independent explorer with sharp instincts",
    defaultName: "Whiskers",
    colors: catColors,
    sounds: catSounds,
    earStyle: "pointed",
    tailStyle: "curvy",
    hasStripes: true,
    hasMane: false,
    hasWhiskers: true,
    hasPatches: false,
  },
  lion: {
    id: "lion",
    name: "Lion",
    emoji: "🦁",
    description: "Majestic ruler of the browsing savanna",
    defaultName: "Leo",
    colors: lionColors,
    sounds: lionSounds,
    earStyle: "round",
    tailStyle: "thin",
    hasStripes: false,
    hasMane: true,
    hasWhiskers: false,
    hasPatches: false,
  },
  tiger: {
    id: "tiger",
    name: "Tiger",
    emoji: "🐯",
    description: "Fierce guardian with blazing spirit",
    defaultName: "Rajah",
    colors: tigerColors,
    sounds: tigerSounds,
    earStyle: "round",
    tailStyle: "striped",
    hasStripes: true,
    hasMane: false,
    hasWhiskers: true,
    hasPatches: false,
  },
  fox: {
    id: "fox",
    name: "Fox",
    emoji: "🦊",
    description: "Clever trickster always one step ahead",
    defaultName: "Ember",
    colors: foxColors,
    sounds: foxSounds,
    earStyle: "pointed",
    tailStyle: "bushy",
    hasStripes: false,
    hasMane: false,
    hasWhiskers: true,
    hasPatches: false,
  },
  bunny: {
    id: "bunny",
    name: "Bunny",
    emoji: "🐰",
    description: "Gentle soul with boundless energy",
    defaultName: "Clover",
    colors: bunnyColors,
    sounds: bunnySounds,
    earStyle: "long",
    tailStyle: "puff",
    hasStripes: false,
    hasMane: false,
    hasWhiskers: true,
    hasPatches: false,
  },
  panda: {
    id: "panda",
    name: "Panda",
    emoji: "🐼",
    description: "Chill friend who savors every moment",
    defaultName: "Bamboo",
    colors: pandaColors,
    sounds: pandaSounds,
    earStyle: "round",
    tailStyle: "puff",
    hasStripes: false,
    hasMane: false,
    hasWhiskers: false,
    hasPatches: true,
  },
};

export const PET_TYPES: PetType[] = [
  "dog",
  "cat",
  "lion",
  "tiger",
  "fox",
  "bunny",
  "panda",
];

export function getPetDef(type: PetType): PetDefinition {
  return PET_REGISTRY[type];
}
