# ◈ SOP-DEVELOPMENT.md
### *Daily Development Workflow & Engineering Standards*

---

## ◈ DAILY DEV RITUAL

```bash
# Start of every session — 60 seconds
git pull origin main           # get latest
npm install                    # sync deps if changed
npm run dev                    # start watcher
# Reload extension in chrome://extensions
# Open DevTools on a test tab
# You're ready.
```

---

## ◈ BRANCH STRATEGY

```
main ──────────────────────────────────────────────── production
  │
  ├── feature/gsap-evolve-timeline
  ├── feature/three-popup-scene
  ├── feature/magnetic-cursor
  ├── fix/webgl-context-lost
  ├── fix/storage-race-condition
  ├── perf/sprite-baking-offscreen
  ├── chore/upgrade-gsap-3.13
  └── docs/animation-state-machine
```

**Naming convention:** `type/short-kebab-description`

Types: `feature` · `fix` · `perf` · `refactor` · `chore` · `docs` · `test`

---

## ◈ FILE & CODE CONVENTIONS

### Naming
```
React Components    →  PascalCase.tsx         PetStage.tsx
Custom Hooks        →  use + PascalCase.ts    usePetState.ts
Vanilla Classes     →  PascalCase.ts          PhysicsBody.ts
Utilities           →  camelCase.ts           domainTracker.ts
GLSL Shaders        →  kebab-case.frag/.vert  aura-plasma.frag
CSS Modules         →  ComponentName.module.css
Constants           →  UPPER_SNAKE_CASE       MAX_PARTICLES
Types/Interfaces    →  PascalCase in types.ts PetState, SkinId
```

### Import Order (enforced by ESLint)
```typescript
// 1. Node built-ins
// 2. External packages (alphabetical)
import gsap           from 'gsap'
import { motion }     from 'motion/react'
import * as THREE     from 'three'

// 3. Internal: shared
import { PetState }   from '@shared/types'
import { usePetStore } from '@shared/store'

// 4. Internal: relative
import { buildTimelines }  from './timelines'
import { SpriteBaker }     from './SpriteBaker'

// 5. Styles / assets
import styles from './Component.module.css'
```

---

## ◈ FEATURE IMPLEMENTATION PLAYBOOK

### Adding a New Animation State

```
◈ Step 1 — Design the motion first (write it in ANIMATIONS.md)
           Answer: trigger condition, duration, sprite change, sound, particles

◈ Step 2 — Add to type system
           PetMood type in src/shared/types.ts

◈ Step 3 — Create GSAP timeline in content/timelines.ts
           Test in isolation: timeline.play() in browser console

◈ Step 4 — Wire to state machine in content/animator.ts
           Add transition trigger, duration, return-to-idle logic

◈ Step 5 — Add sprite frames in src/shared/sprites.ts
           If new sprites needed: follow SOP-SPRITES.md

◈ Step 6 — Add particle config in content/particleConfigs.ts
           If particles fire on this state

◈ Step 7 — Add sound event in SoundEngine.ts
           Follow SOP-SOUNDS.md

◈ Step 8 — Test on 5 different websites
           Test on: google.com, github.com, youtube.com, news site, localhost

◈ Step 9 — Update ANIMATIONS.md with new state documentation
```

### Adding a New Skin

```
◈ Step 1 — Add SkinId to union in types.ts
◈ Step 2 — Add full SkinPalette entry in shared/skins.ts
           Must define: body, outline, eye, belly, blush, shine,
                        glowColor, auraShader, particleColor
◈ Step 3 — Add unlock condition in petLogic.ts
◈ Step 4 — Add swatch in SkinVault.tsx popup component
◈ Step 5 — Update DESIGN.md §4 with new skin entry
◈ Step 6 — Test all 9 animation states with new skin
◈ Step 7 — Test on light page (white bg) and dark page (black bg)
```

### Adding a New Popup Component

```
◈ Step 1 — Create ComponentName.tsx in src/popup/components/
◈ Step 2 — Import motion from 'motion/react' (not GSAP — popup only)
◈ Step 3 — Use AuroraCard wrapper for glassmorphic surface
◈ Step 4 — Add to container variants for stagger entrance
◈ Step 5 — Memoize if props can be static
◈ Step 6 — Add ComponentName.module.css with component-scoped styles
◈ Step 7 — Check popup height stays ≤ 500px total
```

---

## ◈ COMMIT MESSAGE FORMAT

```
type(scope): concise description

Examples:
  feat(animations): add magnetic cursor spring effect
  feat(skins): add phantom secret unlock condition
  fix(webgl): handle context lost event gracefully
  perf(sprites): prebake to OffscreenCanvas at init
  fix(storage): debounce writes to max 1 per 800ms
  refactor(sounds): extract SoundEngine to standalone class
  chore(deps): upgrade GSAP 3.12 → 3.13
  docs(animations): document state machine transitions
  test(petLogic): add hunger decay boundary conditions
  style(popup): align stat orb spacing to 8px grid
```

---

## ◈ CODE REVIEW CHECKLIST

Before opening any PR:

```
CORRECTNESS
□ TypeScript: zero errors (npm run type-check)
□ ESLint: zero errors and zero warnings
□ Tests pass (npm run test)
□ Tested on Chrome 120+ (minimum target)

PERFORMANCE
□ Content script has ZERO React/Three.js/motion imports
□ No new storage reads added inside rAF loop
□ New animations use transform/opacity only (no layout props)
□ Bundle sizes still within budget (npm run build → check output)
□ No memory leaks (new listeners registered? → cleanup added?)

DESIGN CONSISTENCY
□ New colors use CSS variables from tokens.css (no hardcoded hex)
□ New animations use SPRING/EASING/DURATION constants from motion.ts
□ New components follow AuroraCard glass pattern
□ Typography uses var(--font-display) or var(--font-data) only

CODE QUALITY
□ Zero console.log in production code
□ No TODO comments (create GitHub issue instead)
□ New utility functions have JSDoc comments
□ ANIMATIONS.md or DESIGN.md updated for visual changes
```

---

## ◈ DEBUGGING TOOLKIT

### Access Pet State from Browser Console
```typescript
// On any page — inject debug helper via DevTools
// (Already available if NODE_ENV=development)

window.__pet.getState()          // full storage dump
window.__pet.setState({ hunger: 5 })  // test hungry state
window.__pet.playTimeline('levelup')  // trigger any GSAP timeline
window.__pet.emitParticles('burst')   // test particle config
window.__pet.testSound('evolve')      // test sound synthesis
window.__pet.setMood('sleep')         // force mood state
window.__pet.triggerEvolve()          // test evolution sequence
```

### Debug WebGL Aura
```typescript
// In content script dev mode:
window.__pet.aura.showDebug()    // overlay shader uniform values
window.__pet.aura.setStyle(3)    // test chromatic aberration style
window.__pet.aura.setIntensity(1) // max glow
```

### Debug Storage in Chrome
```
chrome://extensions → Website Pet → Inspect views → background page
→ Application tab → Storage → Extension Storage → Local Storage
→ You'll see: petState, dailyStats, settings as JSON
→ Double-click values to edit for testing
```

### Profile GSAP Timeline Performance
```typescript
// Temporarily log GSAP timeline render time
gsap.ticker.add((time, delta) => {
  if (delta > 16.6) {  // dropped below 60fps
    console.warn(`GSAP frame slow: ${delta.toFixed(1)}ms`)
  }
})
```
