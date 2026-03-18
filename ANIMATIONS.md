# ◈ ANIMATIONS.md
### *Motion Design System — GSAP · Three.js · Spring Physics · WebGL*

---

## ◈ 1. ANIMATION PHILOSOPHY

```
┌──────────────────────────────────────────────────────────────────┐
│  HIERARCHY OF MOTION                                             │
│                                                                  │
│  1. PHYSICS LAYER   Spring mass-damper → floating bob, cursor   │
│  2. GSAP LAYER      Choreographed timelines → mood transitions  │
│  3. SHADER LAYER    GPU fragment shaders → aura, glow, plasma   │
│  4. PARTICLE LAYER  tsParticles → burst effects, trails         │
│  5. CSS LAYER       Transforms only → UI micro-interactions     │
│                                                                  │
│  Rule: Each layer handles ONLY its domain. Never mix.           │
└──────────────────────────────────────────────────────────────────┘
```

**The golden rule:** Everything moves with **intention and physics**. Nothing snaps. Nothing eases generically. Every animation has a spring constant, damping ratio, or custom timing function derived from physical reality.

---

## ◈ 2. ANIMATION ENGINE STACK

```bash
npm install gsap                    # Pro motion, timelines
npm install motion                  # Framer Motion (popup only)
npm install three                   # WebGL aura scene
npm install tsparticles             # Particle system
npm install @tsparticles/react      # React wrapper for popup
```

---

## ◈ 3. SPRING PHYSICS — FLOATING BOB

The pet's idle float is not a CSS animation. It uses a **real spring simulation** for organic feel:

```typescript
// content/PhysicsBody.ts

interface SpringState {
  y:       number   // current position
  vy:      number   // velocity
  target:  number   // rest position
}

export class SpringBody {
  private state: SpringState = { y: 0, vy: 0, target: 0 }

  // Spring constants — tune for feel
  private readonly STIFFNESS   = 0.04   // how fast it snaps back
  private readonly DAMPING     = 0.88   // how much it resists (1 = no oscillation)
  private readonly MASS        = 1.0

  // Breathe cycle: oscillate target between -4 and +4
  private breathePhase = 0

  tick(dt: number) {
    // Advance breathe cycle
    this.breathePhase += 0.018
    this.state.target = Math.sin(this.breathePhase) * 4

    // Spring force: F = -k * displacement
    const force = -this.STIFFNESS * (this.state.y - this.state.target)
    const damping = -this.DAMPING * this.state.vy

    this.state.vy += (force + damping) / this.MASS
    this.state.y  += this.state.vy

    return this.state.y
  }

  // Impulse: shove the pet (for bounces, jumps)
  impulse(vy: number) {
    this.state.vy += vy
  }

  // Override target (for shake effects)
  setTarget(y: number) {
    this.state.target = y
  }
}
```

---

## ◈ 4. GSAP MOOD TIMELINES

Each mood is a **pre-built GSAP timeline** that plays on state change:

```typescript
// content/timelines.ts
import gsap from 'gsap'

interface TimelineTarget {
  canvas:       HTMLCanvasElement
  container:    HTMLElement
  speechBubble: HTMLElement
  auraCanvas:   HTMLCanvasElement
}

export function buildTimelines(el: TimelineTarget) {

  // ── HAPPY TIMELINE (new site visited) ──────────────────
  const happy = gsap.timeline({ paused: true })
    .to(el.container, {
      y: -16,
      duration: 0.25,
      ease: 'power3.out'
    })
    .to(el.container, {
      y: 4,
      duration: 0.15,
      ease: 'power2.in'
    })
    .to(el.container, {
      scaleX: 1.2,
      scaleY: 0.85,
      duration: 0.08,
      ease: 'power2.in'
    })
    .to(el.container, {
      scaleX: 0.9,
      scaleY: 1.1,
      duration: 0.12,
      ease: 'elastic.out(1, 0.5)'
    })
    .to(el.container, {
      scaleX: 1,
      scaleY: 1,
      y: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.4)'
    })
    .fromTo(el.auraCanvas,
      { opacity: 0.3 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' },
      '<'
    )

  // ── LEVELUP TIMELINE ────────────────────────────────────
  const levelup = gsap.timeline({ paused: true })
    .to(el.container, {
      x: gsap.utils.wrap([-3, 3, -3, 3, -3, 3, 0]),
      duration: 0.5,
      ease: 'none',
      repeat: 1
    })
    .to(el.canvas, {
      filter: 'brightness(10) saturate(0)',
      duration: 0.15,
      ease: 'power3.in'
    })
    .to(el.canvas, {
      filter: 'brightness(1) saturate(1)',
      duration: 0.3,
      ease: 'power2.out'
    })
    .fromTo(el.container,
      { scale: 0.2, rotation: -10 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)'
      },
      '<0.1'
    )

  // ── SLEEP TIMELINE ──────────────────────────────────────
  const sleep = gsap.timeline({ paused: true, repeat: -1 })
    .to(el.container, {
      scaleY: 0.92,
      scaleX: 1.04,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })

  // ── HUNGRY TIMELINE ─────────────────────────────────────
  const hungry = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3 })
    .to(el.container, {
      x: -3,
      duration: 0.12,
      ease: 'power1.inOut'
    })
    .to(el.container, {
      x: 3,
      duration: 0.12,
      ease: 'power1.inOut'
    })
    .to(el.container, {
      x: 0,
      duration: 0.08
    })

  // ── ANGRY TIMELINE ──────────────────────────────────────
  const angry = gsap.timeline({ paused: true, repeat: -1 })
    .to(el.container, {
      x: gsap.utils.wrap([-4, 4, -4, 4, 0]),
      duration: 0.1,
      ease: 'none',
      stagger: 0.05
    })

  // ── EVOLVE TIMELINE ─────────────────────────────────────
  const evolve = gsap.timeline({ paused: true })
    .to(el.container, {
      rotation: 360,
      duration: 0.7,
      ease: 'power2.inOut'
    })
    .to(el.canvas, {
      filter: 'brightness(20) saturate(0)',
      duration: 0.2
    }, '-=0.1')
    .set(el.canvas, { filter: 'none' })
    .fromTo(el.container,
      { scale: 0, rotation: 0 },
      {
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.25)'
      }
    )

  return { happy, levelup, sleep, hungry, angry, evolve }
}
```

---

## ◈ 5. MAGNETIC CURSOR EFFECT

When cursor is near the pet, it's subtly **pulled toward the cursor** — like magnetic attraction:

```typescript
// content/MagneticEffect.ts

export class MagneticEffect {
  private active = false
  private currentX = 0
  private currentY = 0
  private targetX  = 0
  private targetY  = 0

  // Lerp speed — how fast it follows cursor
  private readonly LERP = 0.08
  // Maximum pull distance in px
  private readonly MAX_PULL = 12
  // Distance in px before effect activates
  private readonly ACTIVATION_RADIUS = 150

  attach(container: HTMLElement) {
    document.addEventListener('mousemove', (e) => {
      if (!this.active) return

      const rect = container.getBoundingClientRect()
      const petCenterX = rect.left + rect.width / 2
      const petCenterY = rect.top + rect.height / 2

      const dx = e.clientX - petCenterX
      const dy = e.clientY - petCenterY
      const dist = Math.hypot(dx, dy)

      if (dist < this.ACTIVATION_RADIUS) {
        // Magnetic pull — stronger when closer
        const strength = (1 - dist / this.ACTIVATION_RADIUS) * this.MAX_PULL
        this.targetX = (dx / dist) * strength
        this.targetY = (dy / dist) * strength
      } else {
        this.targetX = 0
        this.targetY = 0
      }
    })

    // Smooth lerp on rAF
    const tick = () => {
      this.currentX += (this.targetX - this.currentX) * this.LERP
      this.currentY += (this.targetY - this.currentY) * this.LERP
      container.style.setProperty('--mag-x', `${this.currentX}px`)
      container.style.setProperty('--mag-y', `${this.currentY}px`)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  enable()  { this.active = true  }
  disable() { this.active = false; this.targetX = 0; this.targetY = 0 }
}
```

---

## ◈ 6. WEBGL AURA SHADER

The ambient glow behind the pet is a **GLSL fragment shader** — not CSS box-shadow:

```glsl
// src/content/shaders/aura.frag

precision mediump float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_color;       // pet's glow color from skin
uniform float u_intensity;   // 0.0–1.0, driven by pet mood
uniform float u_style;       // 0=soft, 1=pulse, 2=plasma, 3=chromatic

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution) - 0.5;
  float dist = length(uv);

  // Base soft radial glow
  float glow = smoothstep(0.5, 0.0, dist) * u_intensity;

  // Style variations
  if (u_style == 1.0) {
    // Pulse: rhythmic breathing
    float pulse = 0.7 + 0.3 * sin(u_time * 2.0);
    glow *= pulse;
  }
  else if (u_style == 2.0) {
    // Plasma: animated noise rings
    float rings = sin(dist * 20.0 - u_time * 3.0) * 0.5 + 0.5;
    glow *= rings;
  }
  else if (u_style == 3.0) {
    // Chromatic: RGB split
    float r = smoothstep(0.5, 0.0, length(uv + vec2(0.02, 0.0)));
    float g = smoothstep(0.5, 0.0, dist);
    float b = smoothstep(0.5, 0.0, length(uv - vec2(0.02, 0.0)));
    gl_FragColor = vec4(r, g, b, max(r, max(g, b)) * u_intensity);
    return;
  }

  gl_FragColor = vec4(u_color * glow, glow * 0.8);
}
```

---

## ◈ 7. TSPARTICLES CONFIGURATIONS

```typescript
// content/particleConfigs.ts

export const FEED_BURST = {
  particles: {
    number: { value: 0 },
    color: { value: ['#00E5FF', '#BF5AF2', '#FFD60A'] },
    shape: { type: 'star' },
    size: { value: { min: 2, max: 5 } },
    move: {
      enable: true,
      speed: { min: 3, max: 8 },
      direction: 'outside',
      outModes: 'destroy',
      decay: 0.1,
    },
    life: { duration: { value: 0.6 }, count: 1 },
    opacity: { value: 1, animation: { enable: true, speed: 2, destroy: 'min' } },
  },
  emitters: {
    position: { x: 50, y: 50 },
    rate: { quantity: 12, delay: 0 },
    life: { count: 1, duration: 0.1 },
  },
}

export const LEVELUP_RING = {
  particles: {
    number: { value: 0 },
    color: { value: '#FFD60A' },
    shape: { type: ['circle', 'star'] },
    size: { value: { min: 3, max: 7 } },
    move: {
      enable: true,
      speed: 6,
      direction: 'outside',
      path: { enable: true, options: { size: 2 } },
    },
    life: { duration: { value: 1.2 }, count: 1 },
    opacity: { value: { min: 0, max: 1 }, animation: { enable: true, speed: 1, startValue: 'max', destroy: 'min' } },
  },
  emitters: {
    position: { x: 50, y: 50 },
    rate: { quantity: 24, delay: 0 },
    life: { count: 1, duration: 0.05 },
  },
}

export const SLEEP_ZZZ = {
  particles: {
    number: { value: 0 },
    color: { value: '#B8E6FF' },
    shape: { type: 'char', options: { char: { value: 'z', font: 'JetBrains Mono', weight: 400 } } },
    size: { value: 8 },
    move: {
      enable: true,
      speed: 1,
      direction: 'top-right',
      outModes: 'destroy',
    },
    life: { duration: { value: 2 }, count: 1 },
    opacity: { value: { min: 0, max: 0.8 }, animation: { enable: true, speed: 0.3, startValue: 'max', destroy: 'min' } },
  },
  emitters: {
    position: { x: 60, y: 20 },
    rate: { quantity: 1, delay: 1.5 },
  },
}
```

---

## ◈ 8. POPUP — FRAMER MOTION PATTERNS

```tsx
// popup/components/AuroraCard.tsx
import { motion, useSpring, useTransform } from 'motion/react'

// Cards animate in with stagger on popup open
export const CARD_VARIANTS = {
  hidden:  { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
}

export const CONTAINER_VARIANTS = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
}

// Tilt card on hover (3D perspective)
export function AuroraCard({ children }: { children: React.ReactNode }) {
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(y, [-50, 50], [8, -8])
  const rotateY = useTransform(x, [-50, 50], [-8, 8])

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - rect.left - rect.width / 2)
        y.set(e.clientY - rect.top  - rect.height / 2)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      variants={CARD_VARIANTS}
      className="aurora-card"
    >
      {children}
    </motion.div>
  )
}
```

---

## ◈ 9. ANIMATION TIMING CONSTANTS

```typescript
// src/shared/motion.ts — single source of timing truth

export const SPRING = {
  SNAPPY:    { type: 'spring', stiffness: 600, damping: 35 } as const,
  BOUNCY:    { type: 'spring', stiffness: 400, damping: 20 } as const,
  WOBBLY:    { type: 'spring', stiffness: 200, damping: 12 } as const,
  SLOW:      { type: 'spring', stiffness: 100, damping: 25 } as const,
  ELASTIC:   { type: 'spring', stiffness: 300, damping: 8  } as const,
}

export const EASING = {
  OUT_EXPO:   [0.16, 1, 0.3, 1]      as const,
  OUT_BACK:   [0.34, 1.56, 0.64, 1]  as const,
  IN_EXPO:    [0.7, 0, 0.84, 0]      as const,
  SMOOTH:     [0.4, 0, 0.2, 1]       as const,
}

export const DURATION = {
  INSTANT:   0.08,
  FAST:      0.15,
  NORMAL:    0.25,
  SLOW:      0.4,
  DRAMATIC:  0.6,
}
```

---

## ◈ 10. ANIMATION STATE MACHINE

```
                    ┌─────────────────────────────────────────┐
                    │                IDLE                     │
                    │  Spring bob + blink every 3–5s          │
                    │  Cursor near → CURIOUS (if enabled)     │
                    └───┬───────────────────────────────┬─────┘
                        │                               │
          hunger < 30   │                               │ 10min no activity
                        ▼                               ▼
              ┌──────────────┐                 ┌──────────────┐
              │   HUNGRY     │                 │    SLEEP     │
              │  sad shake   │                 │   breathe    │
              │  loop        │                 │   zzz float  │
              └──────┬───────┘                 └──────┬───────┘
                     │ hunger=0                       │ any interaction
                     ▼                                ▼
              ┌──────────────┐                 ┌──────────────┐
              │    ANGRY     │                 │   WAKEUP     │
              │  rapid shake │                 │  chirp + yawn│
              │  red tint    │                 │  → IDLE      │
              └──────────────┘                 └──────────────┘

              new domain visit
                     │
                     ▼
              ┌──────────────┐
              │    HAPPY     │
              │  jump burst  │──────────────────────────────► IDLE
              │  particles   │  (1.5s then returns)
              └──────────────┘
                     │
               xp threshold?
                     ▼
              ┌──────────────┐
              │   LEVEL UP   │──────────────────────────────► IDLE
              │  flash+spring│  (2.5s)
              └──────────────┘
                     │
               stage threshold?
                     ▼
              ┌──────────────┐
              │   EVOLVE     │──────────────────────────────► IDLE
              │  full FX seq │  (3.5s) + new sprite set
              └──────────────┘
```
