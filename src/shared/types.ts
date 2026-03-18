export type PetType =
  | "dog"
  | "cat"
  | "lion"
  | "tiger"
  | "fox"
  | "bunny"
  | "panda";

export type PetMood = "idle" | "happy" | "hungry" | "sleep" | "excited";

/** Evolution stages: 1=Egg/Void, 2=Hatchling, 3=Pixel, 4=Prism, 5=Legendary */
export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export type Position =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export type PetSize = "sm" | "md" | "lg";

export interface PetState {
  type: PetType;
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  level: number;
  xp: number;
  xpToNext: number;
  mood: PetMood;
  evolutionStage: EvolutionStage;
  totalFeeds: number;
  totalClicks: number;
  streak: number;
  lastFedAt: number;
  lastActiveAt: number;
  createdAt: number;
}

export interface Settings {
  soundEnabled: boolean;
  volume: number;
  petSize: PetSize;
  position: Position;
  showBubbles: boolean;
}

export interface StorageData {
  petState: PetState;
  settings: Settings;
  visitedDomains: string[];
  lastVisitDate: string;
}

export interface SoundNote {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain?: number;
  delay?: number;
}

export interface PetSoundSet {
  feed: SoundNote[];
  click: SoundNote[];
  happy: SoundNote[];
  hungry: SoundNote[];
  sleep: SoundNote[];
  levelup: SoundNote[];
}

export interface PetColors {
  body: string;
  bodyLight: string;
  outline: string;
  ear: string;
  earInner: string;
  eye: string;
  pupil: string;
  nose: string;
  blush: string;
  belly: string;
  tail: string;
  special: string;
  glow: string;
}

export type EarStyle = "floppy" | "pointed" | "round" | "long";
export type TailStyle = "curvy" | "bushy" | "thin" | "puff" | "striped";

export interface PetDefinition {
  id: PetType;
  name: string;
  emoji: string;
  description: string;
  defaultName: string;
  colors: PetColors;
  sounds: PetSoundSet;
  earStyle: EarStyle;
  tailStyle: TailStyle;
  hasStripes: boolean;
  hasMane: boolean;
  hasWhiskers: boolean;
  hasPatches: boolean;
}

// ── HYBRID SOUND SYSTEM TYPES ───────────────────────────────

/** All sound events the hybrid engine can play */
export type SoundEvent =
  | "feed"
  | "click"
  | "hover"
  | "hungry"
  | "sleep"
  | "levelup"
  | "streak"
  | "angry"
  | "evolve"
  | "wakeup"
  | "pop"
  | "rename"
  | "curious";

/** Configuration for playing a single audio buffer */
export interface AudioPlayConfig {
  /** Sound file name (e.g. 'dog-bark-short.mp3') */
  file: string;
  /** Pitch shift in semitones (e.g. +5 or -12) */
  pitchShift?: number;
  /** Trim start in seconds */
  trimStart?: number;
  /** Trim end in seconds */
  trimEnd?: number;
  /** Per-event volume (0–1), overrides master volume */
  volume?: number;
  /** Also play Tone.js/synth simultaneously */
  layer?: boolean;
  /** Repeat count for rapid-fire sounds (e.g. 3 barks) */
  repeat?: number;
  /** Delay between repeats in ms */
  repeatDelay?: number;
}

/** A single sound event entry in a profile */
export interface SoundProfileEntry {
  /** Audio file config (PRIMARY). Undefined = synth only */
  audio?: AudioPlayConfig;
  /** Synth fallback notes (FALLBACK — always defined) */
  synth: SoundNote[];
}

/** Maps every SoundEvent to its audio + synth config for a stage */
export type SoundProfile = Record<SoundEvent, SoundProfileEntry>;

/** Stage personality modifiers applied on top of individual sounds */
export interface StageModifiers {
  /** Master pitch shift in semitones applied to all sounds */
  masterPitch: number;
  /** Reverb wet amount (0-1, 0 = none) */
  masterReverb: number;
  /** Stereo width (0-1, 0 = mono) */
  stereoWidth: number;
}

/** Stage names for display */
export const STAGE_NAMES: Record<EvolutionStage, string> = {
  1: "Void Egg",
  2: "Hatchling",
  3: "Pixel",
  4: "Prism",
  5: "Legendary",
};

/** Level thresholds for evolution stages */
export const STAGE_THRESHOLDS: Record<EvolutionStage, number> = {
  1: 1,
  2: 5,
  3: 15,
  4: 30,
  5: 45,
};
