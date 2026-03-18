# 🐾 Chotu Pet — Chrome Web Store Upload Guide

> One-time setup + repeatable release process for publishing Chotu Pet on the Chrome Web Store.

---

## 📋 Prerequisites

| Requirement               | Detail                                            |
| ------------------------- | ------------------------------------------------- |
| Google account            | Used to log in to the Developer Dashboard         |
| One-time registration fee | $5 USD (one-time, per Google account)             |
| Built extension           | Run `yarn build` — produces the `dist/` folder    |
| Screenshots               | Min 1280×800 PNG, max 5 screenshots               |
| Store icon                | 128×128 PNG (already in `dist/icons/icon128.png`) |

---

## 🔧 Step 1 — Build & Package

```bash
# 1. Install dependencies (first time or after package.json changes)
yarn install

# 2. Run full preflight: type-check + lint + build
yarn type-check && yarn lint && yarn build

# 3. Create the ZIP from the dist/ folder (NOT the project root)
cd dist
zip -r ../releases/chotu-pet-v1.0.0.zip .
cd ..

# Or use the built-in script:
yarn package
```

✅ The ZIP must contain these files at the **root** level (not inside a subfolder):

```
manifest.json         ← required at root
index.html
background.js
content.js
assets/
icons/
sounds/
```

> 💡 **Common mistake:** zipping the parent folder instead of `dist/` contents.
> Always `cd dist && zip -r ../releases/name.zip .`

---

## 🚀 Step 2 — Chrome Web Store Developer Dashboard

### First-time setup

1. Go to [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the **$5 one-time registration fee**
4. Accept the Developer Agreement

### Upload new extension

1. Click **"New Item"** (top-right)
2. Upload: `releases/chotu-pet-v1.0.0.zip`
3. Wait for upload to process (~10–30 seconds)

---

## 📝 Step 3 — Store Listing Details

Fill in the following on the **Store Listing** tab:

### Basic Info

| Field                             | Value                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Name**                          | Chotu Pet 🐾                                                                                                    |
| **Short description** (132 chars) | `Meet Chotu — your tiny pixel pet who lives on every tab! Feed him by browsing new sites and watch him evolve.` |
| **Detailed description**          | See below                                                                                                       |
| **Category**                      | Fun                                                                                                             |
| **Language**                      | English                                                                                                         |

### Detailed Description (copy-paste this)

```
🐾 Meet Chotu — your tiny pixel companion who lives right on your webpage!

Chotu is a cute pixel pet that grows as you browse the web. Every new website you visit feeds him, keeps him happy, and helps him evolve through 5 unique stages!

✨ FEATURES
• 7 adorable pets: Dog, Cat, Lion, Tiger, Fox, Bunny & Panda
• 5 evolution stages: Egg → Hatchling → Pixel → Prism → Legendary
• Real browsing stats: hunger, happiness, energy, XP & daily streaks
• Hybrid sound system: audio files + synth fallback
• Draggable — place Chotu in any corner
• Rename your pet anything you want
• Sound board to preview all 13 sound effects
• Zero tracking. 100% local. Your data never leaves your device.

🎮 HOW IT WORKS
1. Install and Chotu appears on every webpage
2. Visit new websites to feed him
3. Keep his hunger & happiness up
4. Level up and unlock new evolution stages
5. Customize size, position, and which pet you want

🔒 PRIVACY
Chotu stores everything locally using Chrome's storage API. No servers, no analytics, no data collection of any kind.

FREE — No ads, no premium, no sign-up required.
```

---

## 🖼️ Step 4 — Screenshots & Promotional Images

### Required: Screenshots (1–5)

- **Size:** 1280×800 or 640×400 PNG/JPEG
- **Suggested shots:**

| #   | What to capture                                               |
| --- | ------------------------------------------------------------- |
| 1   | Chotu on a popular site (e.g. github.com) at default position |
| 2   | Popup open showing stats & XP bar                             |
| 3   | Pet selector showing all 7 pets                               |
| 4   | Evolution stage — Chotu at Legendary stage                    |
| 5   | SoundBoard panel open                                         |

### Optional: Promotional tile

- Small tile: 440×280 PNG
- Large tile: 920×680 PNG (boosts visibility in store search)

### How to take screenshots

```
1. Load dist/ as unpacked extension in chrome://extensions
2. Open any website (GitHub, YouTube, etc.)
3. Use Chrome DevTools → Ctrl+Shift+P → "Capture full size screenshot"
   OR use the browser zoom to fit the shot
```

---

## 🔐 Step 5 — Privacy Practices

In the **Privacy Practices** tab answer:

| Question                               | Answer                          |
| -------------------------------------- | ------------------------------- |
| Does your extension collect user data? | **No**                          |
| Does it use remote code?               | **No**                          |
| Does it require a single purpose?      | **Yes** — Virtual pet companion |

### Permissions Justification (write exactly as shown)

| Permission | Justification                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------- |
| `storage`  | Saves Chotu's stats and your settings locally on your device only — no external servers       |
| `tabs`     | Detects when you visit new websites so Chotu can be "fed" — only checks tab URL on navigation |
| `alarms`   | Runs periodic stat decay (hunger/energy) so Chotu feels alive — fires every 5–15 minutes      |

---

## ✅ Step 6 — Pre-Submission Checklist

```
TECHNICAL
□ manifest.json version matches your ZIP filename
□ content_security_policy has NO 'unsafe-inline' or 'unsafe-eval'
□ No remote script src in any HTML file
□ No console.log() calls in src/ (run: grep -r "console.log" src/)
□ manifest.json has minimal permissions only

STORE LISTING
□ Name: "Chotu Pet 🐾"
□ Short description: ≤ 132 characters
□ Detailed description: filled out
□ Category: Fun
□ At least 1 screenshot uploaded (1280×800)
□ Icon 128×128 visible and clear

PRIVACY
□ Privacy policy URL OR "No user data collected" selected
□ Permissions justified for each permission listed
```

---

## 📦 Step 7 — Submit for Review

1. Click **"Submit for review"**
2. Google will review within **1–3 business days** (sometimes faster)
3. You'll get an email at the registered Google account when approved or if changes are needed

---

## 🔄 Updating an Existing Listing (Repeat Releases)

```bash
# 1. Bump version in package.json AND public/manifest.json
#    e.g. "version": "1.0.1"

# 2. Build and package
yarn build
cd dist && zip -r ../releases/chotu-pet-v1.0.1.zip . && cd ..

# 3. In the Developer Dashboard:
#    → Your extension → "Package" tab → "Upload new package"
#    → Upload the new ZIP
#    → Click "Submit for review"
```

> Patch releases (e.g. 1.0.1) go through a faster review than first-time submissions.

---

## 🛠️ Troubleshooting Common Rejections

| Rejection reason          | Fix                                                             |
| ------------------------- | --------------------------------------------------------------- |
| "Excessive permissions"   | Only request `storage`, `tabs`, `alarms` — remove anything else |
| "Remote code execution"   | Ensure CSP in manifest has no `unsafe-eval`                     |
| "Misleading description"  | Remove claims like "most popular" or "best"                     |
| "Inadequate description"  | Expand to 500+ characters with clear feature list               |
| "Policy violation — spam" | Each version must have meaningful changes                       |
| "Missing privacy policy"  | Add a URL or use privacypolicygenerator.info for a free one     |

---

## 🔗 Useful Links

- Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Extension policies: https://developer.chrome.com/docs/webstore/program-policies/
- Review guidelines: https://developer.chrome.com/docs/webstore/review-process/
- Privacy policy generator: https://www.privacypolicygenerator.info/

---

_Last updated: March 2026_
