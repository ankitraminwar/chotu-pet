# ◈ DESIGN.md
### *Visual Design System — Cyber-Organic Futurism*

---

## ◈ 1. DESIGN PHILOSOPHY

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "The pet exists at the boundary between machine and life.    │
│    Its UI should feel like touching something that breathes —  │
│    cold glass on the outside, warm bioluminescence within."    │
│                                                                 │
│    Influences:  Apple Vision Pro · Cyberpunk 2077 HUDs         │
│                 NieR: Automata UI · Framer's design language   │
│                 Bioluminescent deep sea creatures              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Three unbreakable design laws:**
1. **Nothing is ever static** — even idle states have micro-movement
2. **Depth over flatness** — every surface has layers, blur, and light
3. **Feedback is physical** — interactions have spring, weight, and sound

---

## ◈ 2. COLOR SYSTEM — AURORA SPECTRUM

```css
/* ── src/styles/tokens.css ────────────────────────────────────── */

:root {
  /* ── VOID PALETTE (base) ── */
  --void-0:     #00000A;    /* absolute void — deepest bg */
  --void-100:   #050510;    /* page background */
  --void-200:   #0A0A1F;    /* card base */
  --void-300:   #0F0F2E;    /* elevated surface */
  --void-400:   #16163D;    /* hover state */
  --void-500:   #1E1E50;    /* border/divider */

  /* ── AURORA PRIMARIES ── */
  --aurora-cyan:      #00E5FF;   /* primary action, glow */
  --aurora-cyan-dim:  #00E5FF33; /* transparent version */
  --aurora-violet:    #BF5AF2;   /* secondary, level badges */
  --aurora-emerald:   #00FF87;   /* success, hunger high */
  --aurora-coral:     #FF6B6B;   /* danger, hunger low */
  --aurora-gold:      #FFD60A;   /* XP, streaks, legendary */
  --aurora-rose:      #FF375F;   /* angry state, critical */

  /* ── GLASS SURFACES ── */
  --glass-10:   rgba(255, 255, 255, 0.03);
  --glass-20:   rgba(255, 255, 255, 0.06);
  --glass-40:   rgba(255, 255, 255, 0.10);
  --glass-60:   rgba(255, 255, 255, 0.16);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-lit: rgba(0, 229, 255, 0.25);

  /* ── CHROMATIC GRADIENTS ── */
  --grad-aurora:    linear-gradient(135deg, #00E5FF 0%, #BF5AF2 50%, #FF6B6B 100%);
  --grad-void:      linear-gradient(180deg, #050510 0%, #0F0F2E 100%);
  --grad-ember:     linear-gradient(135deg, #FF6B6B 0%, #FFD60A 100%);
  --grad-nebula:    linear-gradient(135deg, #0A0A1F 0%, #1E0A3D 50%, #0A1F2E 100%);
  --grad-hologram:  linear-gradient(135deg,
                      rgba(0,229,255,0.15) 0%,
                      rgba(191,90,242,0.15) 50%,
                      rgba(255,107,107,0.15) 100%);

  /* ── GLOW SYSTEM ── */
  --glow-cyan:    0 0 20px rgba(0, 229, 255, 0.4),
                  0 0 60px rgba(0, 229, 255, 0.15);
  --glow-violet:  0 0 20px rgba(191, 90, 242, 0.4),
                  0 0 60px rgba(191, 90, 242, 0.15);
  --glow-gold:    0 0 20px rgba(255, 214, 10, 0.5),
                  0 0 40px rgba(255, 214, 10, 0.2);
  --glow-subtle:  0 0 30px rgba(0, 229, 255, 0.08);

  /* ── SEMANTIC TOKENS ── */
  --stat-critical:  var(--aurora-coral);
  --stat-warning:   var(--aurora-gold);
  --stat-healthy:   var(--aurora-emerald);
  --stat-full:      var(--aurora-cyan);

  /* ── SPACING ── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ── BORDER RADIUS ── */
  --radius-sm:  8px;
  --radius-md:  14px;
  --radius-lg:  20px;
  --radius-xl:  28px;
  --radius-full: 9999px;
}
```

---

## ◈ 3. TYPOGRAPHY SYSTEM

```css
/* Two fonts. Both unusual. Neither is Inter. */

@font-face {
  font-family: 'Syne';    /* display/headings — geometric, futuristic */
  src: url('../assets/fonts/Syne-Bold.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono'; /* data/numbers — crisp monospace */
  src: url('../assets/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-display: swap;
}

:root {
  --font-display: 'Syne', system-ui, sans-serif;
  --font-data:    'JetBrains Mono', 'Courier New', monospace;

  /* Scale — optical sizing */
  --text-2xs:  9px;    /* micro labels */
  --text-xs:   11px;   /* captions, tags */
  --text-sm:   13px;   /* body, descriptions */
  --text-base: 15px;   /* default UI */
  --text-lg:   18px;   /* section titles */
  --text-xl:   24px;   /* pet name */
  --text-2xl:  32px;   /* level number */
  --text-3xl:  48px;   /* hero numbers */

  /* Tracking */
  --tracking-tight:  -0.03em;
  --tracking-normal:  0;
  --tracking-wide:    0.08em;
  --tracking-widest:  0.2em;
}
```

---

## ◈ 4. PET SKIN SYSTEM — LAYERED PALETTE

Each skin overrides the base CSS variables. Skins are not just recolors — they change glow behavior, particle color, and aura shader uniforms.

```typescript
// src/shared/skins.ts

export const SKIN_PALETTES: Record<SkinId, SkinPalette> = {

  void: {
    body:       '#1A1A2E',
    outline:    '#00E5FF',
    eye:        '#00E5FF',
    belly:      '#0A0A1F',
    blush:      '#BF5AF2',
    shine:      '#FFFFFF',
    glowColor:  '#00E5FF',
    auraShader: 'aurora',
    particleColor: '#00E5FF',
  },

  aurora: {
    body:       '#1A3A2E',
    outline:    '#00FF87',
    eye:        '#BF5AF2',
    belly:      '#0A1F18',
    blush:      '#00FF87',
    shine:      '#FFFFFF',
    glowColor:  '#00FF87',
    auraShader: 'plasma',
    particleColor: '#00FF87',
  },

  ember: {
    body:       '#3A1A0A',
    outline:    '#FF6B35',
    eye:        '#FFD60A',
    belly:      '#1F0A05',
    blush:      '#FF375F',
    shine:      '#FFD60A',
    glowColor:  '#FF6B35',
    auraShader: 'ember',
    particleColor: '#FFD60A',
  },

  prism: {
    body:       '#1A1A1A',
    outline:    'url(#prism-gradient)',  /* CSS gradient stroke */
    eye:        '#FFFFFF',
    belly:      '#111111',
    blush:      '#FF375F',
    shine:      '#FFFFFF',
    glowColor:  'chromatic',            /* special: RGB split glow */
    auraShader: 'chromatic',
    particleColor: 'rainbow',
  },

  nebula: {
    body:       '#1A0A2E',
    outline:    '#BF5AF2',
    eye:        '#FF375F',
    belly:      '#0F051F',
    blush:      '#FF375F',
    shine:      '#BF5AF2',
    glowColor:  '#BF5AF2',
    auraShader: 'nebula',
    particleColor: '#BF5AF2',
  },

  crystal: {
    body:       '#C8E6F5',
    outline:    '#FFFFFF',
    eye:        '#1A2A4A',
    belly:      '#E8F5FF',
    blush:      '#ADB8FF',
    shine:      '#FFFFFF',
    glowColor:  '#B8E6FF',
    auraShader: 'crystal',
    particleColor: '#FFFFFF',
  },

  obsidian: {
    body:       '#0A0A0A',
    outline:    '#888888',
    eye:        '#C0C0C0',
    belly:      '#050505',
    blush:      '#444444',
    shine:      '#FFFFFF',
    glowColor:  '#888888',
    auraShader: 'mirror',
    particleColor: '#C0C0C0',
  },

  solaris: {
    body:       '#3A2A00',
    outline:    '#FFD60A',
    eye:        '#FF6B00',
    belly:      '#1F1500',
    blush:      '#FF9500',
    shine:      '#FFFFFF',
    glowColor:  '#FFD60A',
    auraShader: 'solar',
    particleColor: '#FFD60A',
  },

  phantom: {              /* 🔒 SECRET — near invisible */
    body:       'rgba(255,255,255,0.05)',
    outline:    'rgba(255,255,255,0.15)',
    eye:        'rgba(255,255,255,0.8)',
    belly:      'rgba(255,255,255,0.03)',
    blush:      'rgba(255,255,255,0.1)',
    shine:      '#FFFFFF',
    glowColor:  'rgba(255,255,255,0.3)',
    auraShader: 'phantom',
    particleColor: 'rgba(255,255,255,0.6)',
  },
}
```

---

## ◈ 5. POPUP UI — SPATIAL LAYOUT SPEC

```
╔══════════════════════════════════════╗  340px wide
║  ◈ WEBSITE PET          [⚙] [✕]     ║  48px — Header bar (glass)
╠══════════════════════════════════════╣
║                                      ║
║         Three.js PetStage            ║  160px — 3D WebGL scene
║    [floating pet + aura + particles] ║          depth: z-parallax
║                                      ║
║         ◈ PIXEL  ·  Lv.12           ║  32px — name + level
╠══════════════════════════════════════╣
║                                      ║
║  ◎ HUNGER    ━━━━━━━━░░░░  78%      ║  circular orb + arc bar
║  ◎ HAPPY     ━━━━━━░░░░░░  61%      ║  glow color = stat value
║  ◎ ENERGY    ━━━━━━━━━━░░  88%      ║
║                                      ║
╠══════════════════════════════════════╣
║                                      ║
║  ████░░░░░ XP 2,450 / 3,000         ║  40px — crystalline XP bar
║                Stage 3 → 4           ║
║                                      ║
╠══════════════════════════════════════╣
║  🔥 x14 streak  │  🌐 23 today      ║  48px — stats row
╠══════════════════════════════════════╣
║                                      ║
║  [◈][◈][◈][◈][◈]  Skins             ║  52px — skin swatches
║                                      ║
╠══════════════════════════════════════╣
║  [Rename] [Aura] [Sound] [Position]  ║  44px — action row
╚══════════════════════════════════════╝  Total: ~428px
```

---

## ◈ 6. GLASS CARD SYSTEM

All popup surfaces use **layered glassmorphism** — not the generic blurry white kind. Deep void glass:

```css
.aurora-card {
  background:
    var(--glass-20),
    linear-gradient(135deg,
      rgba(0, 229, 255, 0.04) 0%,
      rgba(191, 90, 242, 0.04) 100%
    );
  border: 1px solid var(--glass-border);
  border-top-color: var(--glass-border-lit);  /* lit top edge */
  border-radius: var(--radius-lg);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03),
    0 8px 32px rgba(0, 0, 10, 0.6),
    inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}

/* Animated aurora shimmer on top edge */
.aurora-card::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 200%; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--aurora-cyan) 30%,
    var(--aurora-violet) 70%,
    transparent 100%
  );
  animation: shimmer 4s ease infinite;
}

@keyframes shimmer {
  0%   { left: -100%; opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
```

---

## ◈ 7. STAT ORB COMPONENT

Circular stat displays replace flat bars for the three core stats:

```
     ╭──────────────╮
    /  ◎  HUNGER    \
   |    ┌──────┐     |
   |    │  78  │     |   Arc progress ring (SVG stroke-dashoffset)
   |    │  %   │     |   Color: green → yellow → red by value
    \   └──────┘    /    Glow intensity = stat value
     ╰──────────────╯
     Arc bar below orb
```

```tsx
// StatOrb.tsx spec
interface StatOrbProps {
  label:   string
  value:   number     // 0–100
  icon:    string     // emoji or lucide icon
  color:   string     // overrides default color mapping
}

// Color logic:
// value > 60  → var(--aurora-emerald) + glow
// value 30-60 → var(--aurora-gold)    + pulse
// value < 30  → var(--aurora-coral)   + rapid pulse warning
```

---

## ◈ 8. ON-PAGE PET WIDGET

The pet on every webpage — surgically minimal:

```css
#website-pet-◈ {
  position: fixed;
  z-index: 2147483647;
  bottom: 24px;
  right: 24px;

  /* Magnetic spring applied via JS transform */
  transform: translate(0, 0);
  will-change: transform;

  /* Never cause layout shift */
  pointer-events: auto;
  contain: strict;
}
```

### Aura Layer (WebGL canvas behind pet)
```
Pet canvas: 64×64px (sprite)
Aura canvas: 128×128px (centered behind pet, rendered via GLSL)
Aura is always larger than pet — bleeds into page atmosphere
```

### Speech Bubble — Glassmorphic
```css
.pet-speech {
  background: var(--glass-40);
  border: 1px solid var(--glass-border-lit);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-md);
  font-family: var(--font-data);
  font-size: var(--text-xs);
  color: var(--aurora-cyan);
  letter-spacing: var(--tracking-wide);
  padding: 6px 12px;
  text-shadow: 0 0 10px currentColor;
}
```

---

## ◈ 9. EVOLUTION VISUAL PROGRESSION

| Stage | Name | Visual Identity |
|-------|------|----------------|
| ◈ 1 | SEED | Geometric egg — wireframe glow outline only |
| ◈ 2 | SPROUT | Simple blob, single color, no aura |
| ◈ 3 | PIXEL | Full sprite, blush, ears, aura begins |
| ◈ 4 | PRISM | Slightly larger, wing stubs, chromatic edges |
| ◈ 5 | LEGEND | Crown + particle halo + continuous sparkle trail |

### Stage Transition Visual
```
Phase 1 (0.0–0.4s):  GSAP rapid shake (x ±4px, 8 iterations)
Phase 2 (0.4–0.6s):  White flash fills canvas (opacity 0→1)
Phase 3 (0.6–0.8s):  Flash fades — new sprite revealed
Phase 4 (0.8–1.2s):  Scale spring: 0 → 1.4 → 1.0 (cubic spring)
Phase 5 (1.2–2.0s):  tsParticles burst: 24 particles radial
Phase 6 (2.0–3.0s):  Aura shader transitions to new stage style
Phase 7 (ongoing):   New idle animation begins
```

---

## ◈ 10. RESPONSIVE SIZE SYSTEM

```typescript
export const PET_SIZES = {
  xs: { spriteScale: 2, canvas: 32,  aura: 64  },
  sm: { spriteScale: 3, canvas: 48,  aura: 96  },
  md: { spriteScale: 4, canvas: 64,  aura: 128 },  // default
  lg: { spriteScale: 5, canvas: 80,  aura: 160 },
  xl: { spriteScale: 7, canvas: 112, aura: 224 },
}
```

---

## ◈ 11. CSS HOUDINI — POPUP BACKGROUND

The popup background uses a CSS Houdini Paint Worklet for the animated mesh:

```javascript
// src/popup/shaders/aurora-paint.js (Paint Worklet)
class AuroraPainter {
  static get inputProperties() {
    return ['--aurora-time', '--aurora-intensity']
  }

  paint(ctx, size, props) {
    const t = parseFloat(props.get('--aurora-time')) || 0

    // Animated noise-based aurora mesh
    // 3 overlapping gradient blobs that move via sin/cos
    const blobs = [
      { x: size.width * (0.3 + 0.2 * Math.sin(t * 0.5)), color: '#00E5FF22' },
      { x: size.width * (0.7 + 0.2 * Math.cos(t * 0.3)), color: '#BF5AF222' },
      { x: size.width * (0.5 + 0.3 * Math.sin(t * 0.7)), color: '#FF6B6B11' },
    ]

    blobs.forEach(blob => {
      const grad = ctx.createRadialGradient(blob.x, size.height * 0.5, 0, blob.x, size.height * 0.5, 120)
      grad.addColorStop(0, blob.color)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size.width, size.height)
    })
  }
}

registerPaint('aurora', AuroraPainter)
```
