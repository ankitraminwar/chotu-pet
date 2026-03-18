import { build } from "esbuild";
import { cpSync, mkdirSync, existsSync, writeFileSync, readdirSync } from "fs";
import { deflateSync } from "zlib";
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

// ── Generate PNG icons ──
function createPNG(size, r, g, b) {
  const width = size;
  const height = size;
  const rawLen = (1 + width * 4) * height;
  const raw = Buffer.alloc(rawLen);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 4);
    raw[offset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= radius) {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
        raw[px + 3] = 255;
      } else if (dist <= radius + 1.5) {
        // Anti-aliased edge
        const alpha = Math.max(
          0,
          Math.min(255, Math.round((radius + 1.5 - dist) * 170)),
        );
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
        raw[px + 3] = alpha;
      } else {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
      }
    }
  }

  const compressed = deflateSync(raw);

  function uint32BE(n) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(n, 0);
    return buf;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeData = Buffer.concat([Buffer.from(type), data]);
    return Buffer.concat([
      uint32BE(data.length),
      typeData,
      uint32BE(crc32(typeData)),
    ]);
  }

  const ihdrData = Buffer.concat([
    uint32BE(width),
    uint32BE(height),
    Buffer.from([8, 6, 0, 0, 0]), // 8-bit RGBA
  ]);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", ihdrData),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const iconsDir = resolve(dist, "icons");
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

// Chotu Pet cyan circle icon
const cyan = { r: 0, g: 229, b: 255 };
writeFileSync(
  resolve(iconsDir, "icon16.png"),
  createPNG(16, cyan.r, cyan.g, cyan.b),
);
writeFileSync(
  resolve(iconsDir, "icon48.png"),
  createPNG(48, cyan.r, cyan.g, cyan.b),
);
writeFileSync(
  resolve(iconsDir, "icon128.png"),
  createPNG(128, cyan.r, cyan.g, cyan.b),
);

console.log("✓ icons generated");

// ── Copy manifest ──
cpSync(resolve(root, "public/manifest.json"), resolve(dist, "manifest.json"));
console.log("✓ manifest.json copied");

console.log(
  "\n◈ Build complete! Load dist/ as unpacked extension in chrome://extensions",
);
