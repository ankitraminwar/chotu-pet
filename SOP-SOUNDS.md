# ◈ SOP-SOUNDS.md

### _Hybrid Sound Design System — Audio Files + Synth Fallback_

---

## ◈ PHILOSOPHY

```
┌─────────────────────────────────────────────────────────┐
│  Hybrid audio: real sound files + synth fallback.       │
│                                                         │
│  PRIMARY: Pixabay CC0 audio files (.mp3)                │
│  FALLBACK: Web Audio API oscillator synthesis            │
│                                                         │
│  This gives us:                                         │
│  • Rich, real-world sounds (animal cries, laughs, wows) │
│  • Zero-dependency synth fallback if files fail          │
│  • Per-stage sound personalities (5 evolution stages)    │
│  • Per-pet pitch modifiers (7 pet types sound different) │
│  • Addictive variation via pitch pools + random offsets  │
│  • Graceful degradation — never crashes on audio error  │
└─────────────────────────────────────────────────────────┘
```

---

## ◈ SOUND FILES

All audio from Pixabay (CC0 public domain). Stored in `src/assets/sounds/`.

| File                     | Description         | Used in Stages |
| ------------------------ | ------------------- | -------------- |
| `baby-chick-chirp.mp3`   | Baby chick chirp    | 2, 3, 4, 5     |
| `kitten-meow-short.mp3`  | Soft cat meow       | 3, 4, 5        |
| `kitten-meow-hungry.mp3` | Hungry kitten cry   | 2, 3, 4, 5     |
| `baby-laugh-short.mp3`   | Baby laugh          | 2, 3, 4, 5     |
| `dog-bark-short.mp3`     | Short dog bark      | 3, 4, 5        |
| `wow-cartoon.mp3`        | Cartoon wow         | 3, 4, 5        |
| `wow-female.mp3`         | Female wow reaction | 4              |
| `wow-surprised-male.mp3` | Surprised male wow  | 4, 5           |
| `baby-babble-short.mp3`  | Baby babble         | 4, 5           |

**Download**: `npm run sounds:download` (requires `PIXABAY_KEY` env var)
**Verify**: `npm run sounds:check`

---

## ◈ HYBRID SOUND ENGINE ARCHITECTURE

```typescript
// content/HybridSoundEngine.ts

class HybridSoundEngine {
  private ctx: AudioContext; // Web Audio API context
  private masterGain: GainNode; // Master volume control
  private stage: EvolutionStage; // Current evolution stage (1-5)
  private petType: PetType; // Current pet type
  private profiles: Record<EvolutionStage, SoundProfile>;
  private bufferCache: Map<string, AudioBuffer>; // Decoded audio cache

  play(event: SoundEvent): void; // Play hybrid sound
  setStage(stage: EvolutionStage): void; // Switch sound profile
  setPetType(petType: PetType): void; // Apply pet pitch modifier
  preloadProfile(stage: EvolutionStage): Promise<void>;
  setVolume(v: number): void;
  mute(): void;
  unmute(): void;

  // Backward-compatible with old SoundEngine:
  playSoundEvent(sounds, event): void; // Maps to play()
  playNotes(notes: SoundNote[]): void; // Direct synth playback
}
```

### Sound Resolution Order

1. Check profile for current stage + event
2. If audio file configured → try AudioBuffer from cache
3. If buffer loaded → play via Web Audio API (PRIMARY)
4. If buffer not loaded → trigger async load, play synth (FALLBACK)
5. If `layer: true` → play both audio AND synth simultaneously

---

## ◈ EVOLUTION STAGE PROFILES

```
╔══════════════════════════════════════════════════════════════════╗
║  EVENT        ST.1      ST.2         ST.3         ST.4  ST.5   ║
╠══════════════════════════════════════════════════════════════════╣
║  feed       Synth    🐣 Chick     🐣 Chick     😲 Wow  😲 Wow  ║
║  click      Synth    🐣 Chick     🐶 Bark      🐶 Bark 🐶 Bark ║
║  hover      Synth    Synth        🐱 Meow      🐱 Meow 🐱 Meow ║
║  hungry     Synth    🐱 Hungry    🐱 Hungry    🐱 Hungry  🐱   ║
║  levelup    Synth    👶 Laugh     👶 Laugh     😲 Wow  😲+Synth ║
║  streak     Synth    Synth        😲 Wow       😲 Wow  😲 Wow  ║
║  angry      Synth    🐱 Hungry    🐶 Bark      🐶 Bark 🐶 x3  ║
║  evolve     Synth    Synth        Synth        😲+Synth 😲+Synth║
║  sleep      Synth    Synth        Synth        Synth   Synth   ║
║  pop        Synth    Synth        Synth        Synth   Synth   ║
║  curious    Synth    Synth        Synth        👶 Babble Babble ║
╚══════════════════════════════════════════════════════════════════╝
```

### Stage Personality Modifiers

| Stage | Name      | Master Pitch | Reverb | Stereo | Personality          |
| ----- | --------- | ------------ | ------ | ------ | -------------------- |
| 1     | Void Egg  | -5 semitones | 0      | 0      | Mysterious, deep     |
| 2     | Hatchling | +4 semitones | 0      | 0      | Baby-like, high      |
| 3     | Pixel     | 0            | 0      | 0      | Neutral, playful     |
| 4     | Prism     | +2 semitones | 0.3    | 0      | Expressive, spacious |
| 5     | Legendary | 0            | 0.4    | 0.8    | Rich, epic           |

### Per-Pet Pitch Modifiers

| Pet   | Pitch Offset | Character              |
| ----- | ------------ | ---------------------- |
| Dog   | 0            | Neutral baseline       |
| Cat   | +3           | Higher, lighter        |
| Lion  | -4           | Deep, powerful         |
| Tiger | -3           | Deep, fierce           |
| Fox   | +2           | Slightly higher, yippy |
| Bunny | +5           | Very high, tiny        |
| Panda | -1           | Slightly lower, chill  |

---

## ◈ SOUND EVENT REGISTRY

| Event     | Trigger            | Character                                |
| --------- | ------------------ | ---------------------------------------- |
| `feed`    | New domain visited | Rewarding — chick chirp → wow (by stage) |
| `click`   | Pet clicked        | Playful interaction response             |
| `hover`   | Cursor over pet    | Ultra-subtle acknowledgment              |
| `hungry`  | Hunger low         | Sad, drooping tone                       |
| `sleep`   | Pet sleeping       | Near-silent pulse                        |
| `levelup` | XP threshold       | Triumphant celebration                   |
| `streak`  | Streak milestone   | Wow reaction                             |
| `angry`   | Hunger = 0         | Urgent, growly                           |
| `evolve`  | Stage change       | Layered, transformative                  |
| `wakeup`  | Wake from sleep    | Bright chirp                             |
| `pop`     | Speech bubble      | Clean UI blip                            |
| `rename`  | Pet renamed        | Sparkle confirmation                     |
| `curious` | Cursor nearby      | Inquisitive babble                       |

---

## ◈ VARIATION SYSTEM (Viral Feel)

### Pitch Pools (Round-Robin)

Each event has a pool of pitch variations cycled in round-robin order:

```
feed:    [0, +2, +4, -1] semitones
click:   [0, +3, -2, +1, +5]
hover:   [0, +1, +2, +3, -1]
levelup: [0]  (always same — ceremonial)
hungry:  [0, -2, -3]  (gets sadder)
angry:   [0, -1, -2]  (gets lower)
```

### Random Micro-Variation

Every AudioBuffer playback gets ±3% random pitch variation:

```
source.playbackRate.value = baseRate * (1 + (Math.random() - 0.5) * 0.06)
```

### Timing Variation

Hover, click, and pop events get 0-40ms random delay for organic feel.

### Combo Sequences

- `evolve` → plays: pop → levelup (200ms apart)

---

## ◈ ADDING NEW SOUNDS

```
◈ Step 1 — Add sound file to src/assets/sounds/
◈ Step 2 — Add filename to src/assets/sounds/index.ts
◈ Step 3 — Add download entry in scripts/download-sounds.mjs
◈ Step 4 — Map the file in src/shared/soundProfiles.ts
           Add to relevant stage profiles using hybrid() helper
◈ Step 5 — If new event: add to SoundEvent type in types.ts
◈ Step 6 — Run: npm run sounds:check (verify all files present)
◈ Step 7 — Test with all pet types (each has pitch offset)
◈ Step 8 — Test fallback: rename .mp3 → pet shouldn't crash
◈ Step 9 — Test volume at 0.1, 0.5, and 1.0
◈ Step 10 — Test mute toggle persistence
```

---

## ◈ BROWSER AUTOPLAY RULES

```typescript
// AudioContext is initialized on first user gesture (click/hover)
// The PetWidget calls sound.init() and sound.resume() on interaction

contentEl.addEventListener("click", () => {
  this.sound.init(); // Creates AudioContext if not exists
  this.sound.resume(); // Resumes if suspended by browser
  this.sound.play("click");
});

// For sounds triggered by storage changes (no user gesture):
// If AudioContext is still suspended, only synth notes will attempt to play
// and will silently fail — this is by design. No audio errors shown to user.
```

---

## ◈ BUILD PIPELINE

Sound files are copied to `dist/sounds/` during build (`scripts/build.mjs`).
Content script loads them via `chrome.runtime.getURL('sounds/filename.mp3')`.
`manifest.json` includes `web_accessible_resources` for `sounds/*.mp3`.
