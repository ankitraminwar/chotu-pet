# ◈ SOP-SETUP.md
### *Environment Setup & First Run — Standard Operating Procedure*

---

## ◈ PREREQUISITES

```
╔═══════════════════════════════════════════════════════╗
║  TOOL              VERSION     CHECK COMMAND          ║
╠═══════════════════════════════════════════════════════╣
║  Node.js           ≥ 20.0     node -v                ║
║  npm               ≥ 10.0     npm -v                 ║
║  Git               ≥ 2.40     git --version          ║
║  Chrome            ≥ 120      chrome://version       ║
║  VS Code           Latest     —                      ║
╚═══════════════════════════════════════════════════════╝
```

> Node 20+ required for native fetch, improved performance, and LTS support.

---

## ◈ STEP 1 — CLONE & INSTALL

```bash
git clone https://github.com/yourname/website-pet
cd website-pet

# Install all deps including GSAP, Three.js, Tone.js
npm install

# Verify no audit errors
npm audit --audit-level=high
```

---

## ◈ STEP 2 — VS CODE WORKSPACE SETUP

Install these extensions (`.vscode/extensions.json` already configured):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "antfu.vite",
    "bradlc.vscode-tailwindcss",
    "glsl-canvas.glsl-canvas",        ← GLSL shader preview
    "slevesque.shader",               ← GLSL syntax highlighting
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## ◈ STEP 3 — FIRST BUILD

```bash
npm run dev
```

Expected terminal output:
```
  ◈ CRXJS Chrome Extension Vite Plugin v3.x
  ◈ React Compiler enabled (babel-plugin-react-compiler)

  ➜  Popup:     http://localhost:5173/popup/index.html
  ➜  Extension: dist/ (watch mode)

  ✓ Built in 1,240ms
  ✓ content.js     32.4 kb (gzip: 11.2 kb)
  ✓ popup.js      167.8 kb (gzip: 54.3 kb)
  ✓ background.js  12.1 kb (gzip:  4.8 kb)
```

---

## ◈ STEP 4 — LOAD EXTENSION IN CHROME

```
1. Open: chrome://extensions
2. Toggle: Developer mode → ON  (top-right)
3. Click:  Load unpacked
4. Select: /dist folder from your project root
5. Result: "Website Pet ◈" card appears
6. Pin:    Extensions toolbar → puzzle icon → pin Website Pet
```

---

## ◈ STEP 5 — VERIFY INSTALLATION

Run through every check:

```
◈ Pet widget
□ Visit https://github.com → pet appears bottom-right corner
□ Pet has aura glow behind it (not just flat canvas)
□ Pet bobs/floats gently
□ Hover over pet → subtle magnetic pull toward cursor
□ Click pet → bounce animation plays + sound (if enabled)

◈ Feeding
□ Visit 3 new domains → happiness increases each time
□ Speech bubble appears on new domain visit
□ tsParticles burst fires on new domain

◈ Popup
□ Click extension icon → popup opens in < 150ms
□ All three stat orbs (Hunger, Happy, Energy) display
□ XP crystal bar visible with level progress
□ Streak count shows correctly
□ Pet 3D preview animates in popup

◈ No errors
□ DevTools → Console → zero errors from extension
□ chrome://extensions → Website Pet → no error badge
```

---

## ◈ STEP 6 — DEV WORKFLOW SETUP

```bash
# Terminal 1: Vite watcher (hot reload)
npm run dev

# Terminal 2: TypeScript type checker (watch)
npm run type-check:watch

# Terminal 3: Test runner (watch)
npm run test:watch
```

### Hot Reload Behavior

| Layer | Auto-reloads? | Manual step needed |
|-------|-------------|-------------------|
| Popup UI | ✅ Yes (CRXJS HMR) | None |
| Content Script | ⚠️ Partial | Reload extension |
| Background Worker | ❌ No | Reload extension |
| GLSL Shaders | ✅ Yes (vite-plugin-glsl) | None |

**Quick extension reload shortcut:**
```
chrome://extensions → Website Pet → ↻ Reload
Keyboard: Tab to the reload button → Enter
```

---

## ◈ TROUBLESHOOTING MATRIX

| Symptom | Cause | Fix |
|---------|-------|-----|
| Pet not visible on pages | Missing content_scripts in manifest | Check public/manifest.json |
| Popup shows blank white | React error in popup | Right-click popup → Inspect → Console |
| No aura effect | WebGL context blocked | Check site CSP headers (some block WebGL) |
| Sounds not playing | Autoplay policy | Click pet first — triggers AudioContext resume |
| Storage not persisting | Missing "storage" permission | Add to permissions[] in manifest.json |
| GSAP animations janky | 60fps content, 12fps sprite mismatch | Check frame throttle logic in animator.ts |
| Build fails: GLSL import | Missing vite-plugin-glsl | npm install vite-plugin-glsl |
| Type errors on chrome.* | Missing types | npm install @types/chrome |
| Pet duplicates on SPA | Missing mount guard | Check MOUNT_ID guard in content/index.ts |
