# 🐾 Chotu Pet

### _Your tiny pixel friend that lives on every webpage_

```
 ██╗    ██╗███████╗██████╗ ███████╗██╗████████╗███████╗    ██████╗ ███████╗████████╗
 ██║    ██║██╔════╝██╔══██╗██╔════╝██║╚══██╔══╝██╔════╝    ██╔══██╗██╔════╝╚══██╔══╝
 ██║ █╗ ██║█████╗  ██████╔╝███████╗██║   ██║   █████╗      ██████╔╝█████╗     ██║
 ██║███╗██║██╔══╝  ██╔══██╗╚════██║██║   ██║   ██╔══╝      ██╔═══╝ ██╔══╝     ██║
 ╚███╔███╔╝███████╗██████╔╝███████║██║   ██║   ███████╗    ██║     ███████╗   ██║
  ╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚══════╝   ╚═╝
```

---

## ◈ DESIGN VISION

> **"Cyber-Organic Futurism"**
> The intersection of living biology and cold machine intelligence.
> A pet that feels truly _alive_ — rendered in liquid glass, aurora light, and spatial depth.
> Every frame is choreographed. Every interaction has weight. Nothing is static.

**Aesthetic DNA:**

- Apple Vision Pro spatial UI × Cyberpunk HUD × Studio Ghibli warmth
- Deep void backgrounds with chromatic aurora gradients
- Fluid mesh animations that breathe and pulse
- Typography that feels carved from obsidian
- Motion that has physics — spring, inertia, magnetic pull

---

## ◈ TECH STACK — 2026 CUTTING EDGE

```
╔══════════════════════════════════════════════════════════════╗
║  LAYER              TECHNOLOGY              PURPOSE           ║
╠══════════════════════════════════════════════════════════════╣
║  Build              Vite 6 + Rolldown       Blazing bundler   ║
║  UI Framework       React 19 + TS 5.4       Concurrent UI     ║
║  Animation          GSAP 3 + ScrollTrigger  Pro motion        ║
║  Spring Physics     Motion (Framer) v12     Spring dynamics   ║
║  3D / WebGL         Three.js r168           Pet 3D aura       ║
║  Shader Effects     CSS Houdini Paint API   GPU paint FX      ║
║  Particle FX        tsParticles v3          Burst effects      ║
║  Sound              Web Audio API + MP3     Hybrid audio       ║
║  State              Zustand v5              Atomic store       ║
║  Extension          CRXJS v3 (MV3)         HMR extension dev  ║
║  Icons              Lucide React            Sharp SVG icons    ║
║  CSS                CSS Layers + @scope     Cascade control   ║
║  Testing            Vitest 2 + Playwright   Unit + E2E        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ◈ DOCUMENTATION MAP

| Document                                     | Contents                                 | Priority      |
| -------------------------------------------- | ---------------------------------------- | ------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)         | System layers, data flows, module graph  | 🔴 Read First |
| [DESIGN.md](./DESIGN.md)                     | Visual system, tokens, spatial design    | 🔴 Read First |
| [ANIMATIONS.md](./ANIMATIONS.md)             | GSAP timelines, spring physics, WebGL fx | 🟠 Core       |
| [PERFORMANCE.md](./PERFORMANCE.md)           | GPU optimization, budgets, profiling     | 🟠 Core       |
| [SOP-SETUP.md](./SOP-SETUP.md)               | Dev environment, first run               | 🟡 Ops        |
| [SOP-DEVELOPMENT.md](./SOP-DEVELOPMENT.md)   | Workflow, patterns, debugging            | 🟡 Ops        |
| [SOP-BUILD-DEPLOY.md](./SOP-BUILD-DEPLOY.md) | Build pipeline, store publishing         | 🟡 Ops        |
| [SOP-SOUNDS.md](./SOP-SOUNDS.md)             | Hybrid audio system, sound profiles      | 🟢 Feature    |
| [SOP-SPRITES.md](./SOP-SPRITES.md)           | Sprite pipeline, WebGL rendering         | 🟢 Feature    |

---

## ◈ PROJECT STRUCTURE

```
website-pet/
├── src/
│   ├── background/             ← MV3 service worker
│   ├── content/
│   │   ├── index.ts            ← Injection orchestrator
│   │   ├── PetRenderer.ts      ← WebGL/Canvas engine
│   │   ├── AuraEffect.ts       ← Three.js ambient glow
│   │   ├── SoundEngine.ts      ← Oscillator synth (fallback)
│   │   ├── HybridSoundEngine.ts← Hybrid audio + synth engine
│   │   └── PhysicsBody.ts      ← Spring physics controller
│   ├── popup/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── PetStage.tsx    ← 3D pet preview (Three.js)
│   │   │   ├── StatOrb.tsx     ← Circular animated stat
│   │   │   ├── AuroraCard.tsx  ← Glass card with mesh bg
│   │   │   ├── SkinVault.tsx   ← Animated skin selector
│   │   │   └── XPCrystal.tsx   ← Crystalline XP bar
│   │   └── shaders/            ← GLSL shaders for popup bg
│   ├── shared/
│   │   ├── types.ts
│   │   ├── store.ts            ← Zustand store
│   │   ├── petLogic.ts
│   │   └── storage.ts
│   └── assets/
│       ├── sprites/            ← Sprite data (JS arrays)
│       ├── shaders/            ← .glsl files
│       └── fonts/              ← Subset woff2 fonts
├── public/manifest.json
├── vite.config.ts
└── docs/                       ← This folder
```

---

## ◈ QUICK START

```bash
git clone https://github.com/yourname/website-pet
cd website-pet
npm install

# Start with full hot reload
npm run dev

# Load into Chrome:
# chrome://extensions → Developer Mode → Load Unpacked → /dist
```

---

## ◈ CORE EXPERIENCE PILLARS

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   ◈ LIVING          │  │   ◈ REACTIVE         │  │   ◈ EVOLVING        │
│                     │  │                     │  │                     │
│  Pet breathes.      │  │  Every site visit   │  │  5 evolution stages │
│  Blinks randomly.   │  │  triggers physics   │  │  15 unlockable      │
│  Reacts to your     │  │  ripples, sound     │  │  skins. Secret      │
│  scroll speed and   │  │  synthesis, and     │  │  forms hidden in    │
│  cursor proximity.  │  │  particle bursts.   │  │  the code.          │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 🔒 Privacy Policy

Chotu Pet collects no user data whatsoever.

**What is stored:** Chotu's name, hunger, happiness, energy, XP, level, skin, and your settings are saved locally on your device using Chrome's built-in `chrome.storage.local` API.

**What is NOT stored:** No URLs, browsing history, personal information, or usage analytics are collected or transmitted.

**Third parties:** No third-party services, analytics tools, or external servers are used.

**Data deletion:** Uninstalling the extension removes all data.

Last updated: March 2026  
Contact: [GitHub Issues](https://github.com/ankitraminwar/chotu-pet/issues)
