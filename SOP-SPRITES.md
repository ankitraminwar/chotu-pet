# ◈ SOP-SPRITES.md
### *Pixel Art Sprite Pipeline — Design · Convert · Optimize · Ship*

---

## ◈ SPRITE SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────────────────┐
│                    SPRITE PIPELINE                               │
│                                                                  │
│  Design Tool          Convert          Bake           Render     │
│  (Lospec/Aseprite) → array data  →  OffscreenCanvas → WebGL     │
│                                                                  │
│  16×16 grid · 9-key palette · 2+ frames · skin-parametric       │
└──────────────────────────────────────────────────────────────────┘
```

All sprites are stored as **pure JavaScript 2D arrays**.  
No PNG files in the bundle. No runtime image decoding.  
At init, the `SpriteBaker` renders every sprite×skin combination  
into cached `ImageData` objects once. Per-frame cost = `putImageData()` = < 0.05ms.

---

## ◈ COLOR KEY SYSTEM

```typescript
// src/shared/sprites.ts

export type ColorKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const COLOR_KEYS = {
  0: 'transparent',   // empty space — never drawn
  1: 'body',          // main body fill — skin-controlled
  2: 'outline',       // dark borders — skin-controlled
  3: 'eye',           // eyes (pupils, iris)
  4: 'blush',         // cheek accent dots
  5: 'shine',         // specular highlight — always white
  6: 'belly',         // lighter belly patch — skin-controlled
  7: 'ear',           // ear color — skin-controlled
  8: 'tongue',        // mouth expressions
  9: 'special',       // stars, crown, glow accents
} as const

// Keys 1, 2, 6, 7 are overridden per skin
// Keys 3, 4, 5, 8, 9 are universal across all skins
```

---

## ◈ SPRITE DATA FORMAT

```typescript
export type SpriteRow   = ColorKey[]          // 16 elements
export type SpriteGrid  = SpriteRow[]         // 16 rows
export type SpriteFrame = SpriteGrid          // alias for clarity
export type AnimFrames  = [SpriteFrame, SpriteFrame, ...SpriteFrame[]]

export type SpriteSetForStage = Record<PetMood, AnimFrames>

export const SPRITES: Record<EvolutionStage, SpriteSetForStage> = {
  1: { idle: [...], happy: [...], hungry: [...], ... },
  2: { idle: [...], happy: [...], hungry: [...], ... },
  3: { idle: [...], happy: [...], hungry: [...], ... },
  4: { idle: [...], happy: [...], hungry: [...], ... },
  5: { idle: [...], happy: [...], hungry: [...], ... },
}
```

---

## ◈ SPRITE BAKING SYSTEM

```typescript
// content/SpriteBaker.ts

export class SpriteBaker {
  private cache = new Map<string, ImageData>()
  private gl?:   WebGLRenderingContext
  private texCache = new Map<string, WebGLTexture>()

  // Called ONCE at content script init
  bakeAll(scale: number) {
    const offscreen = new OffscreenCanvas(16, 16)
    const ctx = offscreen.getContext('2d', { willReadFrequently: true })!

    for (const [stage, stageSprites] of Object.entries(SPRITES)) {
      for (const [mood, frames] of Object.entries(stageSprites)) {
        for (const [skinId, palette] of Object.entries(SKIN_PALETTES)) {
          frames.forEach((frame, i) => {
            const key = `${stage}-${mood}-${skinId}-${i}`

            // Draw sprite to offscreen at 1x
            ctx.clearRect(0, 0, 16, 16)
            frame.forEach((row, y) => {
              row.forEach((colorKey, x) => {
                if (colorKey === 0) return
                ctx.fillStyle = palette[colorKey as ColorKey]
                ctx.fillRect(x, y, 1, 1)
              })
            })

            // Cache ImageData (scaled to display size)
            this.cache.set(key, ctx.getImageData(0, 0, 16, 16))
          })
        }
      }
    }
  }

  // Ultra-fast draw — zero computation per frame
  draw(
    ctx:     CanvasRenderingContext2D,
    stage:   EvolutionStage,
    mood:    PetMood,
    skin:    SkinId,
    frame:   number,
    scale:   number
  ) {
    const key = `${stage}-${mood}-${skin}-${frame}`
    const imageData = this.cache.get(key)
    if (!imageData) return

    // putImageData is ~0.05ms — the fastest possible draw
    ctx.save()
    ctx.scale(scale, scale)
    ctx.putImageData(imageData, 0, 0)
    ctx.restore()
  }
}
```

---

## ◈ DESIGN TOOLS

| Tool | Platform | Best For |
|------|----------|---------|
| **Lospec Pixel Editor** | Browser (lospec.com/pixel-editor) | Quick iteration, shareable |
| **Aseprite** | Desktop ($20, worth it) | Professional, animation preview |
| **Libresprite** | Desktop (free fork of Aseprite) | Full features, no cost |
| **Piskel** | Browser (piskelapp.com) | Beginner-friendly |

**Recommended: Aseprite** — it exports sprite sheets and can automate palette swapping.

---

## ◈ SPRITE DESIGN RULES

```
GRID & STRUCTURE
□ All sprites: exactly 16×16 pixels (stages 1–3)
              or 16×18 pixels (stages 4–5 — slightly taller)
□ 1px transparent border on all 4 sides (pet never touches edge)
□ Body fully enclosed by outline (color key 2)
□ No isolated single-pixel islands (they disappear at small scale)

ANATOMY CONSISTENCY (all stages 2–5)
□ Ears:  rows 0–1, columns 4–5 and 10–11 (color key 7)
□ Eyes:  rows 5–6, columns 3–4 (left) and 11–12 (right)
□ Blush: row 8, columns 2–3 (left) and 12–13 (right)
□ Belly: rows 6–9, columns 6–9 (color key 6)

ANIMATION FRAMES
□ Minimum 2 frames per mood
□ Frame difference should be subtle (2–4 pixel changes max)
□ Eyes: frame 1 = open, frame 2 = slightly squinted
□ Body: slight positional shift (+1px translate or ±1px scale at grid level)
□ No jarring jumps between frame 1 and 2

PER-STAGE EVOLUTION MARKS
□ Stage 1: No ears, no blush, simple oval — minimal
□ Stage 2: Ears appear, blush appears, round form
□ Stage 3: Full detail — belly patch, expressive eyes
□ Stage 4: Slight wing nubs appear (rows 4–5, flanks), glow outline added
□ Stage 5: Crown (color key 9), larger form, sparkle pixel always present
```

---

## ◈ AI PROMPTS FOR SPRITE GENERATION

### Prompt 1 — Generate Full Sprite Set for a Mood
```
Create a JavaScript object containing 2-frame pixel art sprite data
for a kawaii blob creature in [MOOD] state.

Output format:
const [MOOD]Frames: AnimFrames = [
  [ /* frame 1: 16 arrays of 16 numbers */ ],
  [ /* frame 2: 16 arrays of 16 numbers */ ],
]

Color key mapping:
  0 = transparent  (background, empty)
  1 = body         (#7EC8E3 — main body fill)
  2 = outline      (#4A9DB8 — dark border)
  3 = eye          (#1a1a2e — pupils)
  4 = blush        (#FFB3BA — cheeks)
  5 = shine        (#FFFFFF — highlight)
  6 = belly        (#B8E6F5 — belly patch)
  7 = ear          (#5BA3C9 — ears)
  8 = tongue       (#FF6B6B — mouth)
  9 = special      (#FFD60A — stars, glow)

Anatomy rules:
  - Canvas: 16×16
  - 1px transparent border on all sides
  - Ears at rows 0–1, cols 4–5 and 10–11 (key 7)
  - Eyes at rows 5–6, cols 3–4 and 11–12 (key 3)
  - Blush at row 8, cols 2–3 and 12–13 (key 4)
  - Belly patch rows 6–9, cols 6–9 (key 6)

[MOOD] expression:
  IDLE:    neutral, eyes open (key 3 filled 2×2 blocks)
  HAPPY:   eyes as upward arcs (top row of eye block removed)
  HUNGRY:  eyes pointing inward-down, frown (key 8 downward arc)
  SLEEP:   eyes as horizontal single-pixel lines
  ANGRY:   eyes as X shapes (diagonal pixels), no blush, red tint not possible
  LEVELUP: big round eyes (3×3), huge smile, key 9 sparkle added

Provide both frames. Frame 2 should differ by: [slight eye squint / +1px y shift / belly expansion]
```

### Prompt 2 — Evolution Stage Transformation
```
I have a pixel art sprite for evolution stage 3 of my Chrome extension pet.
Create the stage 4 version following these rules:
- Stage 4 adds: small wing nubs at rows 4–5, columns 0–1 and 14–15 (use key 7)
- Stage 4 adds: a subtle glow outline — add key 9 pixels 1px outside the outer outline
- Stage 4 is 16×18 instead of 16×16 (add 2 blank rows at top for crown space)
- Keep all existing anatomy positions but shift down by 1 row
- Keep all 6 mood variants
```

### Prompt 3 — Skin Color Preview
```
I have this pixel art sprite array: [PASTE ARRAY]
With this palette:
  1 = #7EC8E3 (body), 2 = #4A9DB8 (outline), 6 = #B8E6F5 (belly), 7 = #5BA3C9 (ear)

Show me what this looks like rendered with these alternative palettes:
  Ember skin:   1=#C84A1E, 2=#7A2A0E, 6=#E8885A, 7=#A03A1A
  Nebula skin:  1=#4A1A7E, 2=#2A0A4A, 6=#7A4AB8, 7=#3A0A6A

Output as CSS color swatches + confirm the 2D array is unchanged.
```

---

## ◈ SPRITE QUALITY CHECKLIST

```
□ Renders correctly at scale 2x, 3x, 4x, 6x (test all)
□ Pixel-perfect: image-rendering: pixelated applied
□ No anti-aliasing artifacts (canvas smoothing = false)
□ Correct rendering with all 9 skin palettes
□ Frame 1 → Frame 2 animation is smooth at 12fps
□ Readable on white background (github, google)
□ Readable on dark background (dark mode sites)
□ Outline visible against both light and dark pages
□ Speech bubble doesn't visually clash with sprite
□ Aura glow complements the skin's glowColor
```

---

## ◈ CANVAS ANTI-ALIASING — CRITICAL CONFIG

```typescript
// Must be set immediately on canvas creation
// BEFORE any draw calls

const ctx = canvas.getContext('2d')!
ctx.imageSmoothingEnabled = false   // ← CRITICAL for pixel art

// Also set in CSS:
canvas.style.imageRendering = 'pixelated'
canvas.style.imageRendering = 'crisp-edges'  // Firefox fallback
```

If you forget this, sprites will look blurry at any scale.  
This is the #1 most common pixel art rendering mistake.
