import { build } from "esbuild";
import { cpSync, mkdirSync, existsSync, readdirSync } from "fs";
import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

// ── Build content script (IIFE — no module support in content scripts) ──
await build({
  entryPoints: [resolve(root, "src/content/index.ts")],
  bundle: true,
  outfile: resolve(dist, "content.js"),
  format: "iife",
  target: "chrome120",
  minify: true,
  treeShaking: true,
});

console.log("✓ content.js built");

// ── Build background service worker ──
await build({
  entryPoints: [resolve(root, "src/background/index.ts")],
  bundle: true,
  outfile: resolve(dist, "background.js"),
  format: "esm",
  target: "chrome120",
  minify: true,
  treeShaking: true,
});

console.log("✓ background.js built");

// ── Copy sound files to dist ──
const soundsSrc = resolve(root, "src/assets/sounds");
const soundsDist = resolve(dist, "sounds");
if (existsSync(soundsSrc)) {
  mkdirSync(soundsDist, { recursive: true });
  const mp3Files = readdirSync(soundsSrc).filter((f) => f.endsWith(".mp3"));
  for (const file of mp3Files) {
    cpSync(resolve(soundsSrc, file), resolve(soundsDist, file));
  }
  console.log(`✓ ${mp3Files.length} sound files copied`);
} else {
  console.log("⚠ No sounds directory found, skipping audio copy");
}

// ── Generate PNG icons from logo ──
const logoSrc = existsSync(resolve(root, "src/assets/logo.png"))
  ? resolve(root, "src/assets/logo.png")
  : resolve(root, "public/logo.png");
const iconsDir = resolve(dist, "icons");
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

await Promise.all(
  [16, 48, 128].map((size) =>
    sharp(logoSrc)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(resolve(iconsDir, `icon${size}.png`)),
  ),
);

console.log("✓ icons generated");

// ── Copy manifest ──
cpSync(resolve(root, "public/manifest.json"), resolve(dist, "manifest.json"));
console.log("✓ manifest.json copied");

console.log(
  "\n◈ Build complete! Load dist/ as unpacked extension in chrome://extensions",
);
