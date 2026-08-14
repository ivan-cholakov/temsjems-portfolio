/**
 * Pre-generates responsive variants of every content image for the static
 * export - the build-time half of the pipeline described in
 * lib/image-variants.mjs. Runs before `next build` / `next dev` (see
 * package.json scripts). Output goes to public/_optimized/ (gitignored).
 *
 * For each source image and each width tier: downscale if the source is
 * wider, otherwise copy the original so the variant path always exists.
 * Re-runs are incremental - up-to-date variants are skipped by mtime, unless
 * the encoding settings fingerprint stored in the output dir has changed, in
 * which case everything is regenerated.
 */
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { VARIANT_WIDTHS } from "../lib/image-variants.mjs";

const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const OUT_DIR = path.join(PUBLIC_DIR, "_optimized");

// Everything rendered through next/image. Files used only as raw URLs
// (og-default.jpg, logo.jpg, favicons) are not listed.
const SOURCES = ["art", "blog", "m-monogram.webp"];

const EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png"]);

// Small-tier variants render at phone sizes where the extra compression is
// invisible; the large tiers keep more headroom for full-width artwork.
function qualityFor(tier) {
  return tier <= 828 ? 78 : 82;
}

const PNG_COMPRESSION_LEVEL = 9;

// Bump when the resize/encoding logic changes in a way the fields below
// don't capture, so existing variants are regenerated.
const SCRIPT_VERSION = 1;

// Everything that affects variant file contents besides the source image.
// A change here invalidates the whole cache: the mtime check alone would
// keep serving variants encoded with the old settings.
const SETTINGS_FINGERPRINT = JSON.stringify({
  version: SCRIPT_VERSION,
  widths: VARIANT_WIDTHS,
  quality: VARIANT_WIDTHS.map(qualityFor),
  pngCompressionLevel: PNG_COMPRESSION_LEVEL,
});

const FINGERPRINT_PATH = path.join(OUT_DIR, ".settings-fingerprint.json");

async function* walk(abs) {
  const s = await stat(abs);
  if (s.isFile()) {
    if (EXTENSIONS.has(path.extname(abs).toLowerCase())) yield abs;
    return;
  }
  for (const entry of await readdir(abs)) {
    yield* walk(path.join(abs, entry));
  }
}

async function isUpToDate(src, dest) {
  try {
    const [s, d] = await Promise.all([stat(src), stat(dest)]);
    return d.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

const storedFingerprint = await readFile(FINGERPRINT_PATH, "utf8").catch(
  () => null,
);
const settingsChanged = storedFingerprint !== SETTINGS_FINGERPRINT;

let generated = 0;
let skipped = 0;

for (const source of SOURCES) {
  for await (const srcPath of walk(path.join(PUBLIC_DIR, source))) {
    const rel = path.relative(PUBLIC_DIR, srcPath);
    const { width: intrinsicWidth } = await sharp(srcPath).metadata();
    for (const tier of VARIANT_WIDTHS) {
      const destPath = path.join(OUT_DIR, `w${tier}`, rel);
      if (!settingsChanged && (await isUpToDate(srcPath, destPath))) {
        skipped += 1;
        continue;
      }
      await mkdir(path.dirname(destPath), { recursive: true });
      if (!intrinsicWidth || tier >= intrinsicWidth) {
        await copyFile(srcPath, destPath);
      } else {
        const ext = path.extname(srcPath).toLowerCase();
        const resized = sharp(srcPath).resize({ width: tier });
        if (ext === ".webp") resized.webp({ quality: qualityFor(tier) });
        else if (ext === ".png")
          resized.png({ compressionLevel: PNG_COMPRESSION_LEVEL });
        else resized.jpeg({ quality: qualityFor(tier), mozjpeg: true });
        await resized.toFile(destPath);
      }
      generated += 1;
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(FINGERPRINT_PATH, SETTINGS_FINGERPRINT);

console.log(`image variants: ${generated} generated, ${skipped} up to date`);
