#!/usr/bin/env node
/**
 * Verify all expected sound files exist in src/assets/sounds/
 */

import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const soundsDir = resolve(__dirname, "..", "src/assets/sounds");

const EXPECTED_FILES = [
  "baby-chick-chirp.mp3",
  "kitten-meow-short.mp3",
  "kitten-meow-hungry.mp3",
  "baby-laugh-short.mp3",
  "dog-bark-short.mp3",
  "wow-cartoon.mp3",
  "wow-female.mp3",
  "wow-surprised-male.mp3",
  "baby-babble-short.mp3",
];

let missing = 0;
let found = 0;

for (const file of EXPECTED_FILES) {
  const filePath = resolve(soundsDir, file);
  if (existsSync(filePath)) {
    console.log(`✓ ${file}`);
    found++;
  } else {
    console.error(`✗ MISSING: ${file}`);
    missing++;
  }
}

console.log("");
console.log(`${found}/${EXPECTED_FILES.length} files present`);

if (missing > 0) {
  console.error(`${missing} file(s) missing. Run: npm run sounds:download`);
  process.exit(1);
} else {
  console.log("All sound files present!");
}
