# ◈ PERFORMANCE.md
### *GPU-First Optimization — Budget · Profiling · Strategies*

---

## ◈ 1. PERFORMANCE BUDGETS — NON-NEGOTIABLE

```
╔══════════════════════════════════════════════════════════════════╗
║  METRIC                          TARGET      MAXIMUM   KILL     ║
╠══════════════════════════════════════════════════════════════════╣
║  Content script bundle           < 35kb      50kb      70kb     ║
║  Popup bundle                    < 180kb     250kb     350kb     ║
║  Background worker bundle        < 15kb      25kb      40kb      ║
║  Page LCP impact                 0ms         +5ms      +15ms     ║
║  rAF frame time (pet render)     < 1.5ms     3ms       6ms       ║
║  GSAP timeline play()            < 0.5ms     1ms       2ms       ║
║  Storage read on mount           1 call      1 call    2 calls   ║
║  Storage writes per minute       ≤ 1         3         5         ║
║  WebGL draw calls per frame      1           2         4         ║
║  Active particles max            20          40        60        ║
║  Popup open to interactive       < 120ms     200ms     350ms     ║
╚══════════════════════════════════════════════════════════════════╝
```

> Any metric hitting KILL threshold triggers an immediate performance audit before merge.

---

## ◈ 2. GPU-FIRST RENDERING STRATEGY

### The Compositor Thread is Sacred
```
Properties that run on GPU compositor thread (ZERO main thread cost):
  ✅ transform: translate / scale / rotate
  ✅ opacity
  ✅ filter (on elements with will-change: filter)
  ✅ backdrop-filter

Properties that trigger layout (NEVER animate these):
  ❌ width / height
  ❌ top / left / bottom / right
  ❌ padding / margin
  ❌ font-size
  ❌ border-width
```

```css
/* Every animated element gets promoted to its own GPU layer */
.pet-container,
.pet-canvas,
.aura-canvas,
.speech-bubble {
  will-change: transform;
  transform: translateZ(0);   /* force layer creation */
  contain: strict;            /* CSS containment — isolation from rest of page */
}
```

---

## ◈ 3. WEBGL OPTIMIZATION

### Single Draw Call Per Frame
```typescript
// renderer.ts — entire frame in ONE draw call

class WebGLRenderer {
  private vao: WebGLVertexArrayObject  // Vertex Array Object
  private ubo: WebGLBuffer             // Uniform Buffer Object

  renderFrame(state: RenderState) {
    const gl = this.gl

    // Update uniforms in single UBO upload
    this.updateUniforms(state)

    // Single draw call renders: background aura + sprite + overlay
    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)  // 1 fullscreen quad
    gl.bindVertexArray(null)
  }
}
```

### Sprite Baking — OffscreenCanvas
```typescript
// Pre-bake ALL sprite frames at extension startup (not per-frame)

type BakedSprite = {
  imageData:  ImageData     // for 2D canvas
  texture:    WebGLTexture  // for WebGL path
}

class SpriteBaker {
  private cache = new Map<string, BakedSprite>()

  bakeAll(sprites: SpriteData, palettes: Record<SkinId, Palette>) {
    const offscreen = new OffscreenCanvas(16, 16)
    const ctx = offscreen.getContext('2d')!

    // Bake every combination of sprite × skin
    for (const [moodKey, frames] of Object.entries(sprites)) {
      for (const [skinId, palette] of Object.entries(palettes)) {
        frames.forEach((frame, i) => {
          const key = `${moodKey}-${skinId}-${i}`
          this.cache.set(key, this.bakeFrame(ctx, offscreen, frame, palette))
        })
      }
    }
  }

  // Per-frame draw = putImageData (< 0.1ms) not pixel loop (> 2ms)
  draw(ctx: CanvasRenderingContext2D, key: string, scale: number) {
    const baked = this.cache.get(key)!
    ctx.putImageData(baked.imageData, 0, 0)
  }
}
```

---

## ◈ 4. CONTENT SCRIPT BUNDLE CONTROL

### Hard Rule: No React in Content Script
```typescript
// FORBIDDEN in any file imported by content/index.ts:
import React from 'react'           // ❌ +45kb
import { motion } from 'motion/react' // ❌ +25kb  (use GSAP instead)
import * as THREE from 'three'      // ❌ +650kb (use separate canvas)

// ALLOWED in content script:
import gsap from 'gsap'             // ✅ +24kb (minified)
import { Howl } from 'howler'       // ✅ +7kb
```

### Bundle Analysis Workflow
```bash
# After every feature addition:
npm run build
npx bundlesize

# Check content.js specifically:
ls -lh dist/content.js
# Target: under 35kb gzipped

# Full visual report:
npm run analyze
# Opens bundle-report.html in browser
```

### Tree-shake GSAP — Import Only What's Used
```typescript
// BAD — imports entire GSAP
import gsap from 'gsap'

// GOOD — import only used plugins
import { gsap }         from 'gsap'
import { CustomEase }   from 'gsap/CustomEase'  // only if used
gsap.registerPlugin(CustomEase)
```

---

## ◈ 5. MEMORY MANAGEMENT

### Strict Cleanup on Unmount
```typescript
// content/index.ts — nothing leaks

class PetController {
  private cleanup: (() => void)[] = []

  mount() {
    const rafId = requestAnimationFrame(this.tick.bind(this))
    this.cleanup.push(() => cancelAnimationFrame(rafId))

    const listener = this.onStorageChange.bind(this)
    chrome.storage.onChanged.addListener(listener)
    this.cleanup.push(() => chrome.storage.onChanged.removeListener(listener))

    const mousemove = this.onMouseMove.bind(this)
    document.addEventListener('mousemove', mousemove, { passive: true })
    this.cleanup.push(() => document.removeEventListener('mousemove', mousemove))

    // GSAP timelines
    this.cleanup.push(() => this.timelines.happy.kill())
    this.cleanup.push(() => this.timelines.levelup.kill())

    // WebGL context
    this.cleanup.push(() => {
      this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    })
  }

  unmount() {
    this.cleanup.forEach(fn => fn())
    this.cleanup = []
    this.container.remove()
  }
}

// Trigger unmount on page unload
window.addEventListener('pagehide', () => petController.unmount())
```

### Particle Hard Cap
```typescript
class ParticleSystem {
  private readonly MAX = 40  // absolute ceiling

  emit(config: EmitConfig) {
    const space = this.MAX - this.activeCount()
    if (space <= 0) return  // silently skip if at cap
    config.count = Math.min(config.count, space)
    this.tsParticles.emit(config)
  }
}
```

---

## ◈ 6. REACT POPUP OPTIMIZATIONS

### React 19 Compiler — Auto-memoization
```tsx
// With React 19 + babel-plugin-react-compiler:
// The compiler automatically memoizes — you don't need useMemo/useCallback
// Just write clean components. Compiler handles optimization.

// Still manually optimize expensive computations:
const xpPercent = useMemo(
  () => calculateXPPercent(petState.xp, petState.level),
  [petState.xp, petState.level]
)
```

### CSS Transitions Over JS for Stat Bars
```css
/* GPU handles width transition — not React re-render */
.stat-fill {
  width: var(--stat-value);  /* driven by CSS custom property */
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: width;
}
```

```tsx
// Set via CSS custom property — avoids inline style churn
statFill.style.setProperty('--stat-value', `${value}%`)
// Much faster than re-rendering the component to update width
```

### Virtualize Nothing — Popup is Tiny
```
The popup has < 20 components total.
Zero virtualization needed.
Do NOT add react-virtual or similar — overkill that adds bundle size.
```

---

## ◈ 7. STORAGE OPTIMIZATION

### Batch All Writes
```typescript
// storage.ts — write queue with debounce

class StorageWriter {
  private queue: Partial<StorageSchema> = {}
  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly DEBOUNCE_MS = 800

  write(patch: Partial<StorageSchema>) {
    // Merge patch into queue
    this.queue = { ...this.queue, ...patch }

    // Reset debounce timer
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      chrome.storage.local.set(this.queue)
      this.queue = {}
      this.timer = null
    }, this.DEBOUNCE_MS)
  }

  // Force immediate write (for critical updates)
  flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      chrome.storage.local.set(this.queue)
      this.queue = {}
      this.timer = null
    }
  }
}
```

### Read Once, Subscribe for Changes
```typescript
// NEVER poll storage. NEVER read on every frame.

// ✅ CORRECT PATTERN:
// 1. Read once on mount
const initial = await chrome.storage.local.get(['petState', 'dailyStats', 'settings'])

// 2. Subscribe to changes (push-based, not pull-based)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return
  // Only process fields we care about
  if (changes.petState)   handlePetStateChange(changes.petState.newValue)
  if (changes.dailyStats) handleStatsChange(changes.dailyStats.newValue)
})
```

---

## ◈ 8. FRAME SKIP STRATEGY

```typescript
// Skip rendering when page/tab is not visible — saves CPU + battery

class AnimationController {
  private paused = false
  private rafId: number = 0

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause()
      } else {
        this.resume()
      }
    })

    // Also pause when pet is scrolled off-screen
    const observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? this.resume() : this.pause()
    })
    observer.observe(this.container)
  }

  private pause() {
    this.paused = true
    cancelAnimationFrame(this.rafId)
    // Freeze GSAP timelines
    gsap.globalTimeline.pause()
  }

  private resume() {
    this.paused = false
    gsap.globalTimeline.resume()
    this.rafId = requestAnimationFrame(this.tick.bind(this))
  }
}
```

---

## ◈ 9. PRE-RELEASE PERFORMANCE CHECKLIST

```
BUNDLE
□ npm run build → all bundles within budget
□ npm run analyze → no unexpected large deps
□ content.js contains zero React/Three.js code

RUNTIME
□ Chrome DevTools → Performance → record 30s browsing
□ No Long Tasks > 50ms caused by extension
□ Frame time consistently < 2ms in Performance panel
□ Memory snapshot: zero detached DOM nodes after 10 navigations

STORAGE
□ Chrome DevTools → Application → Extension Storage
□ Verify data structure matches StorageSchema
□ Storage writes: ≤ 1 per minute during normal browsing

PAGE IMPACT
□ Test on: news site (text-heavy), YouTube, GitHub, Google
□ Lighthouse Performance score unchanged with extension enabled
□ No CLS (Cumulative Layout Shift) caused by pet injection
□ No render-blocking from content script execution

BATTERY
□ Chrome Task Manager: extension CPU < 0.1% when idle
□ Animation pauses when tab backgrounded (verify in Task Manager)
```

---

## ◈ 10. PROFILING COMMANDS

```bash
# Measure bundle sizes with context
npx source-map-explorer dist/content.js
npx source-map-explorer dist/popup.js

# Run Lighthouse on a test page with extension loaded
npx lighthouse https://github.com --chrome-flags="--load-extension=./dist"

# Check for memory leaks (run in Chrome DevTools console)
# Navigate 20 pages, then:
performance.memory.usedJSHeapSize / 1024 / 1024 + ' MB'
# Should be stable, not growing
```
