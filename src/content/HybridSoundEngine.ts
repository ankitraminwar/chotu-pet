import type {
  EvolutionStage,
  SoundEvent,
  SoundProfile,
  SoundProfileEntry,
  AudioPlayConfig,
  SoundNote,
  StageModifiers,
  PetType,
} from "../shared/types";
import {
  getSoundProfiles,
  getStageModifiers,
  getPetSoundModifier,
} from "../shared/soundProfiles";

// ── SOUND EVENTS LIST ───────────────────────────────────────
const ALL_SOUND_EVENTS: SoundEvent[] = [
  "feed",
  "click",
  "hover",
  "hungry",
  "sleep",
  "levelup",
  "streak",
  "angry",
  "evolve",
  "wakeup",
  "pop",
  "rename",
  "curious",
];

// ── PITCH VARIATION POOLS (round-robin per event) ───────────
const PITCH_POOLS: Partial<Record<SoundEvent, number[]>> = {
  feed: [0, +2, +4, -1],
  click: [0, +3, -2, +1, +5],
  hover: [0, +1, +2, +3, -1],
  levelup: [0],
  evolve: [0],
  hungry: [0, -2, -3],
  angry: [0, -1, -2],
  streak: [0, +1, -1],
  pop: [0, +2, +4, -2],
  wakeup: [0, +1],
  rename: [0, +2],
  curious: [0, +1, -1, +3],
  sleep: [0],
};

/** Events that get a tiny random delay for organic feel */
const TIMING_VARIATION_EVENTS: Set<SoundEvent> = new Set([
  "hover",
  "click",
  "pop",
]);

/** Combo sequences: some events trigger multiple sounds */
const COMBOS: Partial<
  Record<SoundEvent, { events: SoundEvent[]; delayMs: number }>
> = {
  evolve: { events: ["pop", "levelup"], delayMs: 200 },
};

/**
 * Hybrid sound engine: plays AudioBuffer (PRIMARY)
 * with oscillator synth (FALLBACK) if audio fails to load.
 *
 * Supports pitch shifting, layering, trim, variation, and per-stage personality.
 */
export class HybridSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;
  private volume = 0.6;
  private muted = false;
  private stage: EvolutionStage = 1;
  private petType: PetType = "dog";
  private profiles: Record<EvolutionStage, SoundProfile>;
  private modifiers: Record<EvolutionStage, StageModifiers>;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadingFiles: Map<string, Promise<AudioBuffer | null>> = new Map();
  private activeSources: Map<SoundEvent, AudioBufferSourceNode> = new Map();
  private pitchIndex: Map<SoundEvent, number> = new Map();
  private soundBaseUrl = "";

  constructor() {
    this.profiles = getSoundProfiles();
    this.modifiers = getStageModifiers();
    this.detectSoundBaseUrl();
  }

  /** Detect the base URL for loading sound files */
  private detectSoundBaseUrl(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      this.soundBaseUrl = chrome.runtime.getURL("sounds/");
    } else {
      this.soundBaseUrl = "/sounds/";
    }
  }

  /** Initialize AudioContext (must be called from user gesture) */
  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  /** Resume suspended AudioContext */
  async resume(): Promise<void> {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  /** Set the current evolution stage and switch sound profiles */
  setStage(stage: EvolutionStage): void {
    this.stage = stage;
  }

  /** Set the current pet type for pet-specific sound modifiers */
  setPetType(petType: PetType): void {
    this.petType = petType;
  }

  /** Preload all audio files for a given stage (async, non-blocking) */
  async preloadProfile(stage: EvolutionStage): Promise<void> {
    const profile = this.profiles[stage];
    const filesToLoad = new Set<string>();

    for (const event of ALL_SOUND_EVENTS) {
      const entry = profile[event];
      if (entry.audio?.file) {
        filesToLoad.add(entry.audio.file);
      }
    }

    await Promise.all([...filesToLoad].map((file) => this.loadAudioFile(file)));
  }

  /** Play a sound event (hybrid: audio primary, synth fallback) */
  play(event: SoundEvent): void {
    if (!this.enabled || this.muted) return;
    this.init();

    // First user gesture: context now exists — preload profile in background
    if (
      this.ctx &&
      this.bufferCache.size === 0 &&
      this.loadingFiles.size === 0
    ) {
      void this.preloadProfile(this.stage);
    }

    // Handle combo sequences
    const combo = COMBOS[event];
    if (combo) {
      this.playCombo(event, combo.events, combo.delayMs);
      return;
    }

    this.playSingle(event);
  }

  /** Play the legacy PetSoundSet events (backward compatibility) */
  playSoundEvent(sounds: Record<string, SoundNote[]>, event: string): void {
    // Map old event names to new SoundEvent
    const mapped = event as SoundEvent;
    if (ALL_SOUND_EVENTS.includes(mapped)) {
      this.play(mapped);
    } else if (event === "happy") {
      this.play("feed");
    } else {
      // Direct synth fallback for unmapped events
      const notes = sounds[event];
      if (notes) this.playNotes(notes);
    }
  }

  /** Play oscillator notes (legacy synth system) */
  playNotes(notes: SoundNote[]): void {
    if (!this.enabled || this.muted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = note.type;
      osc.frequency.value = note.freq;

      const noteGain = (note.gain ?? 0.3) * this.volume;
      const startTime = now + (note.delay ?? 0);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(noteGain, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.duration + 0.01);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  mute(): void {
    this.muted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  unmute(): void {
    this.muted = false;
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  dispose(): void {
    // Stop all active sources
    for (const source of this.activeSources.values()) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.activeSources.clear();
    this.bufferCache.clear();
    this.loadingFiles.clear();

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }

  // ── PRIVATE METHODS ─────────────────────────────────────────

  private playSingle(event: SoundEvent): void {
    const profile = this.profiles[this.stage];
    const entry: SoundProfileEntry = profile[event];
    const stageModifiers = this.modifiers[this.stage];
    const petMod = getPetSoundModifier(this.petType);

    // Determine timing variation
    const shouldDelay = TIMING_VARIATION_EVENTS.has(event);
    const delay = shouldDelay ? Math.random() * 40 : 0;

    const doPlay = () => {
      const audioConfig = entry.audio;
      const buffer = audioConfig?.file
        ? this.bufferCache.get(audioConfig.file)
        : undefined;

      if (buffer && audioConfig) {
        // PRIMARY: play audio buffer
        this.playAudioBuffer(
          event,
          audioConfig,
          buffer,
          stageModifiers,
          petMod.pitchOffset,
        );

        // LAYER: also play synth if configured
        if (audioConfig.layer) {
          this.playNotes(entry.synth);
        }
      } else {
        // FALLBACK: play synth
        this.playNotes(entry.synth);

        // Try async loading for next time
        if (audioConfig?.file && !this.bufferCache.has(audioConfig.file)) {
          this.loadAudioFile(audioConfig.file);
        }
      }
    };

    if (delay > 0) {
      setTimeout(doPlay, delay);
    } else {
      doPlay();
    }
  }

  private playCombo(
    primaryEvent: SoundEvent,
    followUpEvents: SoundEvent[],
    delayMs: number,
  ): void {
    this.playSingle(primaryEvent);

    followUpEvents.forEach((evt, i) => {
      setTimeout(() => this.playSingle(evt), delayMs * (i + 1));
    });
  }

  private playAudioBuffer(
    event: SoundEvent,
    config: AudioPlayConfig,
    buffer: AudioBuffer,
    stageModifiers: StageModifiers,
    petPitchOffset: number,
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const repeatCount = config.repeat ?? 1;
    const repeatDelay = config.repeatDelay ?? 150;

    for (let i = 0; i < repeatCount; i++) {
      const playOnce = () => {
        if (!this.ctx || !this.masterGain) return;

        // Stop previous instance of this event (interrupt logic)
        if (i === 0) {
          const prev = this.activeSources.get(event);
          if (prev) {
            try {
              prev.stop();
            } catch {
              /* ok */
            }
          }
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Calculate playback rate: pitch shift + stage modifier + pet modifier + random variation
        const eventPitch = config.pitchShift ?? 0;
        const variationPitch = this.getNextPitchVariation(event);
        const totalSemitones =
          eventPitch +
          stageModifiers.masterPitch +
          petPitchOffset +
          variationPitch;
        const baseRate = Math.pow(2, totalSemitones / 12);
        const randomVariation = 1 + (Math.random() - 0.5) * 0.06; // ±3%
        source.playbackRate.value = baseRate * randomVariation;

        // Gain node for per-event volume
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = config.volume ?? this.volume;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Trim support
        const trimStart = config.trimStart ?? 0;
        const trimEnd = config.trimEnd;
        const duration =
          trimEnd !== undefined ? trimEnd - trimStart : undefined;

        if (i === 0) {
          this.activeSources.set(event, source);
        }

        source.addEventListener("ended", () => {
          if (this.activeSources.get(event) === source) {
            this.activeSources.delete(event);
          }
        });

        source.start(0, trimStart, duration);
      };

      if (i === 0) {
        playOnce();
      } else {
        setTimeout(playOnce, repeatDelay * i);
      }
    }
  }

  /** Round-robin pitch variation for an event */
  private getNextPitchVariation(event: SoundEvent): number {
    const pool = PITCH_POOLS[event] ?? [0];
    const currentIdx = this.pitchIndex.get(event) ?? 0;
    const pitch = pool[currentIdx % pool.length];
    this.pitchIndex.set(event, currentIdx + 1);
    return pitch;
  }

  /** Load an audio file and cache the decoded AudioBuffer */
  private async loadAudioFile(filename: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(filename)) {
      return this.bufferCache.get(filename)!;
    }

    // Avoid duplicate fetches
    const existing = this.loadingFiles.get(filename);
    if (existing) return existing;

    const promise = this.fetchAndDecode(filename);
    this.loadingFiles.set(filename, promise);

    const result = await promise;
    this.loadingFiles.delete(filename);

    if (result) {
      this.bufferCache.set(filename, result);
    }
    return result;
  }

  private async fetchAndDecode(filename: string): Promise<AudioBuffer | null> {
    try {
      // Do NOT call this.init() here — AudioContext can only be created/resumed
      // after a user gesture. Preloading before a gesture must silently skip;
      // loadAudioFile() will retry on the next play() call (which is user-triggered).
      if (!this.ctx) return null;

      const url = this.soundBaseUrl + filename;
      const response = await fetch(url);
      if (!response.ok) return null;

      const arrayBuf = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuf);
      return audioBuffer;
    } catch {
      // Silent fallback — no errors shown to user
      return null;
    }
  }
}
