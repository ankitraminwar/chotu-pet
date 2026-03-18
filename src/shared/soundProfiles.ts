import type {
  EvolutionStage,
  SoundProfile,
  SoundProfileEntry,
  StageModifiers,
  PetType,
} from "./types";
import { SOUND_FILES } from "../assets/sounds/index";

// ── HELPER: create a synth-only entry ───────────────────────
function synthOnly(synth: SoundProfileEntry["synth"]): SoundProfileEntry {
  return { synth };
}

// ── HELPER: create a hybrid entry (audio + synth fallback) ──
function hybrid(
  file: string,
  synth: SoundProfileEntry["synth"],
  opts?: Partial<SoundProfileEntry["audio"]>,
): SoundProfileEntry {
  return {
    audio: { file, ...opts },
    synth,
  };
}

// ── DEFAULT SYNTHS (reused across profiles) ─────────────────
const SYNTH = {
  softSineBlip: [
    { freq: 523, duration: 0.08, type: "sine" as const, gain: 0.2 },
  ],
  ultraQuietSine: [
    { freq: 800, duration: 0.05, type: "sine" as const, gain: 0.08 },
  ],
  lowThud: [{ freq: 73, duration: 0.1, type: "sine" as const, gain: 0.25 }],
  nearSilentPulse: [
    { freq: 100, duration: 0.6, type: "sine" as const, gain: 0.03 },
    { freq: 90, duration: 0.8, type: "sine" as const, gain: 0.02, delay: 0.8 },
  ],
  quietDescending: [
    { freq: 300, duration: 0.15, type: "triangle" as const, gain: 0.1 },
    {
      freq: 220,
      duration: 0.2,
      type: "triangle" as const,
      gain: 0.08,
      delay: 0.12,
    },
  ],
  tinyTriangleSine: [
    { freq: 1200, duration: 0.04, type: "triangle" as const, gain: 0.1 },
  ],
  softPulse: [
    { freq: 200, duration: 0.4, type: "sine" as const, gain: 0.05 },
    { freq: 180, duration: 0.5, type: "sine" as const, gain: 0.04, delay: 0.5 },
  ],
  popBlip: [
    { freq: 800, duration: 0.06, type: "sine" as const, gain: 0.25 },
    {
      freq: 1200,
      duration: 0.04,
      type: "sine" as const,
      gain: 0.15,
      delay: 0.04,
    },
  ],
  feedChirpy: [
    { freq: 400, duration: 0.08, type: "square" as const, gain: 0.3 },
    {
      freq: 600,
      duration: 0.1,
      type: "square" as const,
      gain: 0.35,
      delay: 0.06,
    },
    {
      freq: 800,
      duration: 0.12,
      type: "square" as const,
      gain: 0.25,
      delay: 0.12,
    },
  ],
  clickTap: [
    { freq: 500, duration: 0.06, type: "sawtooth" as const, gain: 0.25 },
    {
      freq: 650,
      duration: 0.08,
      type: "sawtooth" as const,
      gain: 0.2,
      delay: 0.05,
    },
  ],
  hungryWhine: [
    { freq: 400, duration: 0.2, type: "triangle" as const, gain: 0.3 },
    {
      freq: 300,
      duration: 0.25,
      type: "triangle" as const,
      gain: 0.25,
      delay: 0.18,
    },
    {
      freq: 220,
      duration: 0.3,
      type: "triangle" as const,
      gain: 0.2,
      delay: 0.38,
    },
  ],
  sleepBreath: [
    { freq: 120, duration: 0.6, type: "sine" as const, gain: 0.08 },
    { freq: 100, duration: 0.8, type: "sine" as const, gain: 0.05, delay: 0.8 },
  ],
  levelupFanfare: [
    { freq: 523, duration: 0.12, type: "square" as const, gain: 0.3 },
    {
      freq: 659,
      duration: 0.12,
      type: "square" as const,
      gain: 0.3,
      delay: 0.1,
    },
    {
      freq: 784,
      duration: 0.12,
      type: "square" as const,
      gain: 0.3,
      delay: 0.2,
    },
    {
      freq: 1047,
      duration: 0.25,
      type: "square" as const,
      gain: 0.35,
      delay: 0.3,
    },
  ],
  streakWow: [
    { freq: 600, duration: 0.1, type: "triangle" as const, gain: 0.3 },
    {
      freq: 900,
      duration: 0.15,
      type: "triangle" as const,
      gain: 0.35,
      delay: 0.08,
    },
  ],
  angryGrowl: [
    { freq: 80, duration: 0.3, type: "sawtooth" as const, gain: 0.25 },
    {
      freq: 70,
      duration: 0.4,
      type: "sawtooth" as const,
      gain: 0.2,
      delay: 0.25,
    },
  ],
  evolveAscend: [
    { freq: 261, duration: 0.15, type: "square" as const, gain: 0.3 },
    {
      freq: 329,
      duration: 0.15,
      type: "square" as const,
      gain: 0.3,
      delay: 0.1,
    },
    {
      freq: 392,
      duration: 0.15,
      type: "square" as const,
      gain: 0.3,
      delay: 0.2,
    },
    {
      freq: 523,
      duration: 0.15,
      type: "square" as const,
      gain: 0.3,
      delay: 0.3,
    },
    {
      freq: 659,
      duration: 0.2,
      type: "square" as const,
      gain: 0.35,
      delay: 0.4,
    },
    {
      freq: 784,
      duration: 0.25,
      type: "triangle" as const,
      gain: 0.4,
      delay: 0.55,
    },
  ],
  wakeupChime: [
    { freq: 500, duration: 0.08, type: "sine" as const, gain: 0.2 },
    {
      freq: 700,
      duration: 0.1,
      type: "sine" as const,
      gain: 0.25,
      delay: 0.06,
    },
  ],
  renameSparkle: [
    { freq: 1000, duration: 0.06, type: "sine" as const, gain: 0.15 },
    {
      freq: 1400,
      duration: 0.06,
      type: "sine" as const,
      gain: 0.12,
      delay: 0.05,
    },
  ],
  curiousHum: [
    { freq: 350, duration: 0.12, type: "sine" as const, gain: 0.15 },
    { freq: 450, duration: 0.1, type: "sine" as const, gain: 0.12, delay: 0.1 },
  ],
};

// ── STAGE 1: "Void Egg" ─────────────────────────────────────
const STAGE_1: SoundProfile = {
  feed: synthOnly(SYNTH.softSineBlip),
  hover: synthOnly(SYNTH.ultraQuietSine),
  click: synthOnly(SYNTH.lowThud),
  sleep: synthOnly(SYNTH.nearSilentPulse),
  hungry: synthOnly(SYNTH.quietDescending),
  levelup: synthOnly(SYNTH.levelupFanfare),
  streak: synthOnly(SYNTH.streakWow),
  angry: synthOnly(SYNTH.angryGrowl),
  evolve: synthOnly(SYNTH.evolveAscend),
  wakeup: synthOnly(SYNTH.wakeupChime),
  pop: synthOnly(SYNTH.popBlip),
  rename: synthOnly(SYNTH.renameSparkle),
  curious: synthOnly(SYNTH.curiousHum),
};

// ── STAGE 2: "Hatchling" ────────────────────────────────────
const STAGE_2: SoundProfile = {
  feed: hybrid(SOUND_FILES.babyChickChirp, SYNTH.feedChirpy, { trimEnd: 1 }),
  hungry: hybrid(SOUND_FILES.kittenMeowHungry, SYNTH.hungryWhine),
  click: hybrid(SOUND_FILES.babyChickChirp, SYNTH.clickTap, { pitchShift: 2 }),
  hover: synthOnly(SYNTH.tinyTriangleSine),
  sleep: synthOnly(SYNTH.softPulse),
  levelup: hybrid(SOUND_FILES.babyLaughShort, SYNTH.levelupFanfare, {
    trimEnd: 0.8,
  }),
  angry: hybrid(SOUND_FILES.kittenMeowHungry, SYNTH.angryGrowl),
  streak: synthOnly(SYNTH.streakWow),
  evolve: synthOnly(SYNTH.evolveAscend),
  wakeup: synthOnly(SYNTH.wakeupChime),
  pop: synthOnly(SYNTH.popBlip),
  rename: synthOnly(SYNTH.renameSparkle),
  curious: synthOnly(SYNTH.curiousHum),
};

// ── STAGE 3: "Pixel" ────────────────────────────────────────
const STAGE_3: SoundProfile = {
  feed: hybrid(SOUND_FILES.babyChickChirp, SYNTH.feedChirpy),
  click: hybrid(SOUND_FILES.dogBarkShort, SYNTH.clickTap),
  hover: hybrid(SOUND_FILES.kittenMeowShort, SYNTH.tinyTriangleSine, {
    volume: 0.3,
  }),
  levelup: hybrid(SOUND_FILES.babyLaughShort, SYNTH.levelupFanfare),
  streak: hybrid(SOUND_FILES.wowCartoon, SYNTH.streakWow),
  angry: hybrid(SOUND_FILES.dogBarkShort, SYNTH.angryGrowl, { pitchShift: -3 }),
  hungry: hybrid(SOUND_FILES.kittenMeowHungry, SYNTH.hungryWhine),
  wakeup: hybrid(SOUND_FILES.babyChickChirp, SYNTH.wakeupChime),
  pop: synthOnly(SYNTH.popBlip),
  rename: hybrid(SOUND_FILES.babyLaughShort, SYNTH.renameSparkle, {
    trimEnd: 0.3,
  }),
  sleep: synthOnly(SYNTH.sleepBreath),
  evolve: synthOnly(SYNTH.evolveAscend),
  curious: synthOnly(SYNTH.curiousHum),
};

// ── STAGE 4: "Prism" ────────────────────────────────────────
const STAGE_4: SoundProfile = {
  feed: hybrid(SOUND_FILES.wowFemale, SYNTH.feedChirpy, { trimEnd: 0.5 }),
  levelup: hybrid(SOUND_FILES.wowCartoon, SYNTH.levelupFanfare),
  streak: hybrid(SOUND_FILES.wowSurprisedMale, SYNTH.streakWow),
  click: hybrid(SOUND_FILES.dogBarkShort, SYNTH.clickTap),
  hover: hybrid(SOUND_FILES.kittenMeowShort, SYNTH.tinyTriangleSine, {
    volume: 0.25,
  }),
  hungry: hybrid(SOUND_FILES.kittenMeowHungry, SYNTH.hungryWhine),
  angry: hybrid(SOUND_FILES.dogBarkShort, SYNTH.angryGrowl, { pitchShift: -4 }),
  wakeup: hybrid(SOUND_FILES.babyChickChirp, SYNTH.wakeupChime),
  evolve: hybrid(SOUND_FILES.wowCartoon, SYNTH.evolveAscend, { layer: true }),
  curious: hybrid(SOUND_FILES.babyBabbleShort, SYNTH.curiousHum, {
    trimEnd: 0.5,
  }),
  sleep: synthOnly(SYNTH.sleepBreath),
  pop: synthOnly(SYNTH.popBlip),
  rename: hybrid(SOUND_FILES.babyLaughShort, SYNTH.renameSparkle, {
    trimEnd: 0.3,
  }),
};

// ── STAGE 5: "Legendary" ────────────────────────────────────
const STAGE_5: SoundProfile = {
  feed: hybrid(SOUND_FILES.wowCartoon, SYNTH.feedChirpy),
  levelup: hybrid(SOUND_FILES.wowCartoon, SYNTH.levelupFanfare, {
    layer: true,
  }),
  streak: hybrid(SOUND_FILES.wowSurprisedMale, SYNTH.streakWow),
  click: hybrid(SOUND_FILES.dogBarkShort, SYNTH.clickTap, { pitchShift: -5 }),
  hover: hybrid(SOUND_FILES.kittenMeowShort, SYNTH.tinyTriangleSine, {
    volume: 0.2,
  }),
  angry: hybrid(SOUND_FILES.dogBarkShort, SYNTH.angryGrowl, {
    repeat: 3,
    repeatDelay: 120,
  }),
  hungry: hybrid(SOUND_FILES.kittenMeowHungry, SYNTH.hungryWhine),
  evolve: hybrid(SOUND_FILES.wowCartoon, SYNTH.evolveAscend, { layer: true }),
  wakeup: hybrid(SOUND_FILES.babyChickChirp, SYNTH.wakeupChime),
  curious: hybrid(SOUND_FILES.babyBabbleShort, SYNTH.curiousHum, {
    trimEnd: 0.5,
  }),
  sleep: synthOnly(SYNTH.sleepBreath),
  pop: synthOnly(SYNTH.popBlip),
  rename: hybrid(SOUND_FILES.babyLaughShort, SYNTH.renameSparkle, {
    trimEnd: 0.3,
  }),
};

// ── EXPORTED PROFILES ───────────────────────────────────────
export function getSoundProfiles(): Record<EvolutionStage, SoundProfile> {
  return { 1: STAGE_1, 2: STAGE_2, 3: STAGE_3, 4: STAGE_4, 5: STAGE_5 };
}

// ── STAGE PERSONALITY MODIFIERS ─────────────────────────────
export function getStageModifiers(): Record<EvolutionStage, StageModifiers> {
  return {
    1: { masterPitch: -5, masterReverb: 0, stereoWidth: 0 },
    2: { masterPitch: +4, masterReverb: 0, stereoWidth: 0 },
    3: { masterPitch: 0, masterReverb: 0, stereoWidth: 0 },
    4: { masterPitch: +2, masterReverb: 0.3, stereoWidth: 0 },
    5: { masterPitch: 0, masterReverb: 0.4, stereoWidth: 0.8 },
  };
}

// ── PET-SPECIFIC SOUND MODIFIERS ────────────────────────────
interface PetSoundModifier {
  /** Extra pitch offset in semitones for this pet type */
  pitchOffset: number;
}

const PET_MODIFIERS: Record<PetType, PetSoundModifier> = {
  dog: { pitchOffset: 0 },
  cat: { pitchOffset: +3 }, // higher, lighter sounds
  lion: { pitchOffset: -4 }, // deep, powerful
  tiger: { pitchOffset: -3 }, // deep but not as much as lion
  fox: { pitchOffset: +2 }, // slightly higher, yippy
  bunny: { pitchOffset: +5 }, // very high, tiny sounds
  panda: { pitchOffset: -1 }, // slightly lower, chill
};

export function getPetSoundModifier(petType: PetType): PetSoundModifier {
  return PET_MODIFIERS[petType];
}
