/**
 * Package the dist/ folder into a versioned zip in releases/.
 * Uses Node's built-in zlib + fs — no extra dependencies required.
 */
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  readdirSync,
  statSync,
  readFileSync,
} from "fs";
import { resolve, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { createDeflateRaw } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");
const releasesDir = resolve(root, "releases");

const { version } = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
);
const zipPath = resolve(releasesDir, `chotu-pet-v${version}.zip`);

mkdirSync(releasesDir, { recursive: true });

// Collect all files under dist/
function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

const files = walk(dist);

// --- Minimal ZIP writer ---
function uint16LE(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}
function uint32LE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const entries = [];
const chunks = [];

for (const filepath of files) {
  const data = readFileSync(filepath);
  const arcname = relative(dist, filepath).replace(/\\/g, "/");
  const nameBytes = Buffer.from(arcname, "utf8");
  const crc = crc32(data);
  const uncompressedSize = data.length;

  // Compress
  const compressed = await new Promise((res, rej) => {
    const bufs = [];
    const d = createDeflateRaw({ level: 9 });
    d.on("data", (c) => bufs.push(c));
    d.on("end", () => res(Buffer.concat(bufs)));
    d.on("error", rej);
    d.end(data);
  });

  const offset = chunks.reduce((s, c) => s + c.length, 0);

  // Local file header
  const localHeader = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]), // signature
    uint16LE(20), // version needed
    uint16LE(0), // flags
    uint16LE(8), // deflate
    uint16LE(0),
    uint16LE(0), // mod time/date
    uint32LE(crc),
    uint32LE(compressed.length),
    uint32LE(uncompressedSize),
    uint16LE(nameBytes.length),
    uint16LE(0), // extra field length
    nameBytes,
  ]);

  chunks.push(localHeader, compressed);
  entries.push({
    arcname,
    nameBytes,
    crc,
    compressed,
    uncompressedSize,
    offset,
  });
}

// Central directory
const centralOffset = chunks.reduce((s, c) => s + c.length, 0);
const centralChunks = [];
for (const e of entries) {
  centralChunks.push(
    Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]), // signature
      uint16LE(20),
      uint16LE(20), // version made by / needed
      uint16LE(0), // flags
      uint16LE(8), // deflate
      uint16LE(0),
      uint16LE(0), // mod time/date
      uint32LE(e.crc),
      uint32LE(e.compressed.length),
      uint32LE(e.uncompressedSize),
      uint16LE(e.nameBytes.length),
      uint16LE(0),
      uint16LE(0), // extra / comment length
      uint16LE(0),
      uint16LE(0), // disk start / internal attr
      uint32LE(0), // external attr
      uint32LE(e.offset),
      e.nameBytes,
    ]),
  );
}
const centralSize = centralChunks.reduce((s, c) => s + c.length, 0);

// End of central directory
const eocd = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x05, 0x06]), // signature
  uint16LE(0),
  uint16LE(0), // disk numbers
  uint16LE(entries.length),
  uint16LE(entries.length),
  uint32LE(centralSize),
  uint32LE(centralOffset),
  uint16LE(0), // comment length
]);

const out = createWriteStream(zipPath);
for (const chunk of [...chunks, ...centralChunks, eocd]) out.write(chunk);
await new Promise((res) => out.end(res));

const kb = (statSync(zipPath).size / 1024).toFixed(1);
console.log(
  `✓ releases/chotu-pet-v${version}.zip (${kb} KB, ${entries.length} files)`,
);
