#!/usr/bin/env node
/**
 * process-auto-photos.mjs
 *
 * Reads JPEGs/PNGs from `<project-root>/Material/fotos auto/` and writes
 * resized WebP files into `<project-root>/src/assets/auto/`.
 *
 * Behavior:
 *   - If the source filename already matches a semantic name (e.g. `front.jpeg`),
 *     it's used directly.
 *   - Otherwise, the script sorts the images alphabetically and maps them, in
 *     order, to: front, side, rear, interior, dashboard, engine, detail-1,
 *     detail-2. This lets the user keep WhatsApp-style filenames; they can also
 *     rename files manually for direct mapping.
 *
 * Idempotent (overwrites existing WebPs).
 *
 * Run from the manuel-cordova project root:
 *     node scripts/process-auto-photos.mjs
 */

import { readdir, mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
// `Material/` lives at the workspace root (one level above the Astro project).
const WORKSPACE_ROOT = resolve(PROJECT_ROOT, '..');
const SOURCE_DIR = join(WORKSPACE_ROOT, 'Material', 'fotos auto');
const OUTPUT_DIR = join(PROJECT_ROOT, 'src', 'assets', 'auto');

const SEMANTIC_ORDER = [
  'front',
  'side',
  'rear',
  'interior',
  'dashboard',
  'engine',
  'detail-1',
  'detail-2',
];

const SEMANTIC_NAME_SET = new Set(SEMANTIC_ORDER);
// Aliases: filenames that aren't in SEMANTIC_ORDER but should map to a semantic
// slot anyway (e.g. user-renamed `patente-oculta` for the front shot).
const SEMANTIC_ALIASES = {
  'patente-oculta': 'front',
};

const stripExt = (name) => name.replace(/\.[^.]+$/, '');
const isSupportedImage = (name) => /\.(jpe?g|png)$/i.test(name);

async function listImages(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch (err) {
    throw new Error(`Cannot read source directory: ${dir}\n${err.message}`);
  }
  return entries.filter(isSupportedImage).sort((a, b) => a.localeCompare(b, 'en'));
}

async function buildMapping(files) {
  // Direct semantic mapping (case-insensitive) takes priority.
  const direct = {};
  const remaining = [];
  for (const file of files) {
    const base = stripExt(file).toLowerCase();
    if (SEMANTIC_NAME_SET.has(base)) {
      direct[base] = file;
    } else if (SEMANTIC_ALIASES[base]) {
      const slot = SEMANTIC_ALIASES[base];
      direct[slot] = file;
    } else {
      remaining.push(file);
    }
  }

  // Fall back to alphabetical order for whatever remains.
  const mapping = { ...direct };
  if (remaining.length > 0) {
    let idx = 0;
    for (const file of remaining) {
      while (idx < SEMANTIC_ORDER.length && mapping[SEMANTIC_ORDER[idx]]) idx += 1;
      if (idx >= SEMANTIC_ORDER.length) {
        throw new Error(
          `Too many images found. Expected at most ${SEMANTIC_ORDER.length}; got ${files.length}.`,
        );
      }
      const name = SEMANTIC_ORDER[idx];
      mapping[name] = file;
      idx += 1;
    }
  }
  return mapping;
}

async function main() {
  console.log(`[photos] source: ${SOURCE_DIR}`);
  console.log(`[photos] output: ${OUTPUT_DIR}`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await listImages(SOURCE_DIR);
  if (files.length === 0) {
    throw new Error('No JPEG/PNG files found in source directory.');
  }
  console.log(`[photos] found ${files.length} image file(s):`);
  for (const f of files) console.log(`  - ${f}`);

  const mapping = await buildMapping(files);
  console.log('[photos] semantic mapping:');
  for (const [name, src] of Object.entries(mapping)) {
    console.log(`  ${name.padEnd(10)} <- ${src}`);
  }

  let processed = 0;
  for (const [name, srcFile] of Object.entries(mapping)) {
    const inputPath = join(SOURCE_DIR, srcFile);
    const outputPath = join(OUTPUT_DIR, `${name}.webp`);

    const srcStat = await stat(inputPath);
    await sharp(inputPath)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);
    const outStat = await stat(outputPath);

    const srcKB = (srcStat.size / 1024).toFixed(0);
    const outKB = (outStat.size / 1024).toFixed(0);
    console.log(
      `[photos] ${name.padEnd(10)} ${srcFile}  (${srcKB} KB)  ->  ${name}.webp  (${outKB} KB)`,
    );
    processed += 1;
  }

  console.log(`[photos] done — ${processed} file(s) written.`);
}

main().catch((err) => {
  console.error(`[photos] FAILED: ${err.message}`);
  process.exit(1);
});
