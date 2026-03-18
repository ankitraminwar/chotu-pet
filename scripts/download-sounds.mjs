#!/usr/bin/env node
/**
 * Sound Asset Download Script
 * Downloads CC0 audio files from Pixabay and saves them to src/assets/sounds/
 *
 * Usage:
 *   PIXABAY_KEY=your-api-key node scripts/download-sounds.mjs
 *
 * Or set PIXABAY_KEY in a .env file at project root.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const soundsDir = resolve(root, "src/assets/sounds");

// Ensure directory exists
if (!existsSync(soundsDir)) {
  mkdirSync(soundsDir, { recursive: true });
}

// Try loading .env file for API key
let apiKey = process.env.PIXABAY_KEY || "";
const envPath = resolve(root, ".env");
if (!apiKey && existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  const match = envContent.match(/PIXABAY_KEY=(.+)/);
  if (match) apiKey = match[1].trim();
}

if (!apiKey) {
  console.error("✗ PIXABAY_KEY not set. Set it via environment or .env file.");
  console.error("  Get a free key at: https://pixabay.com/api/docs/");
  console.error("");
  console.error(
    "  Usage: PIXABAY_KEY=your-key node scripts/download-sounds.mjs",
  );
  process.exit(1);
}

/** @type {Array<{search: string, filename: string, maxDuration: number, trim?: {start: number, end: number}}>} */
const SOUNDS = [
  {
    search: "baby chick chirp short",
    filename: "baby-chick-chirp.mp3",
    maxDuration: 3,
    trim: { start: 0, end: 1.5 },
  },
  {
    search: "kitten meow soft short",
    filename: "kitten-meow-short.mp3",
    maxDuration: 2,
  },
  {
    search: "newborn kitten meow hungry",
    filename: "kitten-meow-hungry.mp3",
    maxDuration: 5,
  },
  {
    search: "baby laugh short happy",
    filename: "baby-laugh-short.mp3",
    maxDuration: 2,
    trim: { start: 0, end: 0.8 },
  },
  {
    search: "dog bark single short",
    filename: "dog-bark-short.mp3",
    maxDuration: 1,
  },
  {
    search: "wow cartoon cheerful",
    filename: "wow-cartoon.mp3",
    maxDuration: 2,
  },
  {
    search: "wow female reaction",
    filename: "wow-female.mp3",
    maxDuration: 1,
  },
  {
    search: "wow surprised male",
    filename: "wow-surprised-male.mp3",
    maxDuration: 1.5,
  },
  {
    search: "baby babble talking",
    filename: "baby-babble-short.mp3",
    maxDuration: 3,
    trim: { start: 0, end: 0.5 },
  },
];

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const sound of SOUNDS) {
  const filePath = resolve(soundsDir, sound.filename);

  if (existsSync(filePath)) {
    console.log(`⚠ already exists: ${sound.filename}`);
    skipped++;
    continue;
  }

  try {
    const query = encodeURIComponent(sound.search);
    const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${query}&media_type=music&per_page=10`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`✗ API error for "${sound.search}": ${res.status}`);
      failed++;
      continue;
    }

    const data = await res.json();
    const hits = data.hits || [];

    // Find first result within maxDuration
    const match = hits.find((h) => h.duration <= sound.maxDuration);

    if (!match) {
      // Try any result if none fit duration
      if (hits.length > 0) {
        const fallbackHit = hits[0];
        console.log(
          `⚠ no result within ${sound.maxDuration}s for "${sound.search}", using first result (${fallbackHit.duration}s)`,
        );
        const audioRes = await fetch(
          fallbackHit.previewURL || fallbackHit.audio,
        );
        if (audioRes.ok) {
          const buffer = Buffer.from(await audioRes.arrayBuffer());
          writeFileSync(filePath, buffer);
          console.log(`✓ downloaded: ${sound.filename} (fallback)`);
          downloaded++;
        } else {
          console.error(`✗ download failed: ${sound.filename}`);
          failed++;
        }
      } else {
        console.error(`✗ not found: "${sound.search}"`);
        failed++;
      }
      continue;
    }

    const audioUrl = match.previewURL || match.audio;
    const audioRes = await fetch(audioUrl);

    if (!audioRes.ok) {
      console.error(`✗ download failed: ${sound.filename}`);
      failed++;
      continue;
    }

    const buffer = Buffer.from(await audioRes.arrayBuffer());
    writeFileSync(filePath, buffer);
    console.log(`✓ downloaded: ${sound.filename} (${match.duration}s)`);
    downloaded++;
  } catch (err) {
    console.error(`✗ error for "${sound.search}": ${err.message}`);
    failed++;
  }
}

console.log("");
console.log(
  `Done: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`,
);
console.log(`Sound files location: src/assets/sounds/`);
