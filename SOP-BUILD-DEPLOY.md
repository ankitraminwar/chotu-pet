# ◈ SOP-BUILD-DEPLOY.md
### *Build Pipeline · Packaging · Chrome Web Store Publishing*

---

## ◈ COMMAND REFERENCE

```bash
npm run dev              # Dev mode — Vite watch + HMR
npm run build            # Production build → dist/
npm run type-check       # TypeScript check (no emit)
npm run type-check:watch # TS check in watch mode
npm run lint             # ESLint full scan
npm run lint:fix         # ESLint auto-fix
npm run test             # Vitest all tests
npm run test:watch       # Vitest watch mode
npm run test:e2e         # Playwright extension tests
npm run analyze          # Rollup bundle visualizer
npm run package          # build + zip → releases/
npm run size-check       # Verify all budgets pass
```

---

## ◈ BUILD PIPELINE STAGES

```
npm run build
      │
      ├─ [1] TypeScript compilation (oxc-transform)
      │
      ├─ [2] GLSL shader inlining (vite-plugin-glsl)
      │
      ├─ [3] React 19 Compiler optimization pass
      │
      ├─ [4] Rollup bundling with manual chunk splitting:
      │       • content.js    ← no React/Three/Motion
      │       • background.js ← vanilla only
      │       • popup.js      ← full React stack
      │       • chunks/three-[hash].js
      │       • chunks/gsap-[hash].js
      │
      ├─ [5] OXC minification (fastest 2025 minifier)
      │
      ├─ [6] Asset copying (icons, fonts)
      │
      └─ [7] CRXJS manifest processing → dist/manifest.json

Expected build time: < 3 seconds
```

---

## ◈ PRE-RELEASE CHECKLIST — RUN EVERY TIME

### Automated Checks
```bash
# Run entire pre-release suite:
npm run preflight

# Which runs in sequence:
#  → npm run type-check
#  → npm run lint
#  → npm run test
#  → npm run build
#  → npm run size-check
#  → echo "✓ All checks passed — ready to release"
```

### Manual Verification Matrix
```
CORE FUNCTIONALITY
□ Fresh install on clean Chrome profile — pet appears
□ Pet visible: github.com, youtube.com, gmail.com, wikipedia.org
□ Pet NOT visible: chrome://newtab, chrome://extensions, edge://
□ Visit 10 new domains → hunger/XP increases correctly
□ Browser idle 10 minutes → sleep animation triggers
□ Popup → all three stat orbs animate correctly
□ Popup → skin change applies to page pet immediately
□ Popup → pet name rename persists after browser restart

ANIMATIONS
□ HAPPY timeline plays on new domain visit (1.5s)
□ tsParticles burst emits correctly
□ Speech bubble glassmorphism renders correctly
□ Aura WebGL shader visible and animated
□ LEVELUP timeline plays at correct XP thresholds
□ EVOLVE sequence completes without visual artifacts

EDGE CASES
□ Extension update doesn't wipe existing pet state
□ Multiple tabs open simultaneously — no duplicate pets
□ SPA navigation (React/Next.js apps) — pet persists
□ Pages with strict CSP — graceful fallback (no WebGL = canvas fallback)
□ prefers-reduced-motion: true → animations disabled
□ Very long page → pet stays in fixed corner (no layout shift)
```

---

## ◈ VERSION MANAGEMENT

```bash
# Bump version (updates package.json)
npm version patch   # 1.2.3 → 1.2.4  (bug fix)
npm version minor   # 1.2.3 → 1.3.0  (new feature)
npm version major   # 1.2.3 → 2.0.0  (major change / breaking)

# Sync version to manifest.json (do manually or via script)
# public/manifest.json → "version": "1.2.4"

# Commit version bump
git add -A
git commit -m "chore(release): bump to v1.2.4"
git tag v1.2.4
git push origin main --tags
```

---

## ◈ PACKAGING FOR CHROME WEB STORE

```bash
# Creates: releases/website-pet-v1.2.4.zip
npm run package

# Manual zip if needed:
cd dist
zip -r ../releases/website-pet-v$(node -p "require('../package.json').version").zip .
cd ..
```

**Zip structure (manifest.json must be at root):**
```
website-pet-v1.2.4.zip
├── manifest.json          ← ROOT LEVEL — required
├── background.js
├── content.js
├── pet.css
├── popup/
│   └── index.html
├── chunks/
│   ├── three-abc123.js
│   └── gsap-def456.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## ◈ CHROME WEB STORE SUBMISSION

```
1. Go to:   https://chrome.google.com/webstore/devconsole
2. Click:   New Item
3. Upload:  releases/website-pet-vX.X.X.zip

STORE LISTING
□ Name:         Website Pet ◈
□ Tagline:      A living pixel creature that grows with your browsing
□ Description:  (See STORE_DESCRIPTION.md — 400-word optimized)
□ Category:     Fun
□ Language:     English (+ add translations later)

MEDIA (required)
□ Icon:         128×128 PNG — the pet in HAPPY state
□ Screenshots:  1280×800 — min 2, max 5
                - Screenshot 1: Pet on GitHub page with aura visible
                - Screenshot 2: Popup dashboard showing stats
                - Screenshot 3: Evolution sequence collage
                - Screenshot 4: Pet in 4 different skin variants
□ Promo tile:   440×280 PNG — key art with aurora bg

PRIVACY & PERMISSIONS JUSTIFICATION
□ storage:      "Saves your pet's stats, name, and settings locally"
□ tabs:         "Detects when you visit new websites to feed your pet"
□ No remote code: checked ✓
□ No user data collected: checked ✓
□ Privacy policy URL: (add GitHub Pages link)
```

---

## ◈ POST-RELEASE PROTOCOL

```
IMMEDIATE (within 1 hour of approval)
□ GitHub Release created with full changelog
□ CHANGELOG.md updated
□ Tag pushed: git push origin --tags

WITHIN 24 HOURS
□ Test install from Chrome Web Store (not local dist/)
□ Monitor Chrome Web Store reviews tab
□ Check extension error reports in Developer Dashboard
□ Post on relevant communities if major release

IF CRITICAL BUG FOUND
□ Chrome Web Store → Developer Dashboard → Edit → Package → Upload fix
□ Approval typically 2–4 hours for critical fixes
□ Keep previous release .zip archived for rollback evidence
```

---

## ◈ ARCHIVE POLICY

Keep release zips forever:
```
releases/
├── website-pet-v1.0.0.zip   ← keep
├── website-pet-v1.1.0.zip   ← keep
├── website-pet-v1.2.0.zip   ← keep
└── website-pet-v1.2.4.zip   ← current
```

Do not delete old zips — needed for rollback and store history.
