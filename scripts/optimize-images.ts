#!/usr/bin/env tsx
/**
 * Optimize source images in public/ so we never serve huge originals.
 *
 * Resizes anything wider than --max-width and re-encodes it at a sane quality,
 * writing back to the SAME path and format (so existing `/places/<id>.jpg`
 * references and next/image keep working). Already-small images are skipped, so
 * it is safe to re-run — e.g. after downloading new place photos.
 *
 * This is complementary to next/image: next/image resizes/serves WebP/AVIF at
 * request time, and this step keeps the source files it reads (and any images
 * served directly) from being multi-hundred-KB full-res originals.
 *
 * Usage:
 *   npm run optimize-images                 # dry run over public/places (default)
 *   npm run optimize-images -- --write        # actually rewrite files
 *   npm run optimize-images -- --write --dir=public
 *   npm run optimize-images -- --write public/places/e2d5fb9f75ce.jpg   # specific files
 *   npm run optimize-images -- --write --max-width=1600 --quality=80
 *   npm run optimize-images -- --write --force  # re-encode even if already small
 *
 * Note: rewriting is in place and lossy; originals are the downloaded artifacts
 * (re-fetchable via the photo pipeline) and are tracked in git, so recover with
 * `git checkout` if needed.
 */

import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const FORCE = args.includes("--force");
const num = (flag: string, fallback: number) => {
  const a = args.find((x) => x.startsWith(`${flag}=`));
  return a ? Number(a.split("=")[1]) : fallback;
};
const MAX_WIDTH = num("--max-width", 1600);
const QUALITY = num("--quality", 80);
const LIMIT = num("--limit", 0);
const dirArg = args.find((x) => x.startsWith("--dir="));
const DEFAULT_DIR = join(ROOT, "public/places");
const explicitFiles = args.filter((x) => !x.startsWith("--"));

const EXTS = new Set([".jpg", ".jpeg", ".png"]);
const SKIP_DIRS = new Set(["generated", "optimized", "_optimized"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else if (EXTS.has(extname(entry.name).toLowerCase())) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function collectFiles(): string[] {
  if (explicitFiles.length > 0) {
    return explicitFiles.map((f) => (f.startsWith("/") ? f : join(ROOT, f)));
  }
  const base = dirArg ? join(ROOT, dirArg.split("=")[1]) : DEFAULT_DIR;
  return walk(base);
}

function fmt(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function optimize(file: string): Promise<{ before: number; after: number } | null> {
  const before = statSync(file).size;
  const image = sharp(file, { failOn: "none" });
  const meta = await image.metadata();
  const width = meta.width ?? 0;

  const needsResize = width > MAX_WIDTH;
  // Heuristic: skip images that are already small and not oversized.
  if (!FORCE && !needsResize && before < 150 * 1024) return null;

  const ext = extname(file).toLowerCase();
  let pipeline = image;
  if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
  }

  const output = await pipeline.toBuffer();
  // Don't grow files: keep the original if re-encoding didn't help.
  if (!FORCE && output.length >= before) return { before, after: before };

  if (WRITE) {
    await sharp(output).toFile(file);
  }
  return { before, after: output.length };
}

async function main() {
  let files = collectFiles();
  if (LIMIT > 0) files = files.slice(0, LIMIT);

  console.log(
    `${WRITE ? "Optimizing" : "[dry run] Would optimize"} up to ${files.length} image(s) ` +
      `(max-width=${MAX_WIDTH}, quality=${QUALITY})`,
  );

  let changed = 0;
  let savedBefore = 0;
  let savedAfter = 0;
  for (const file of files) {
    let result: Awaited<ReturnType<typeof optimize>>;
    try {
      result = await optimize(file);
    } catch (err) {
      console.warn(`  ! skip ${relative(ROOT, file)}: ${(err as Error).message}`);
      continue;
    }
    if (!result || result.after >= result.before) continue;
    changed++;
    savedBefore += result.before;
    savedAfter += result.after;
    console.log(
      `  ${relative(ROOT, file)}  ${fmt(result.before)} -> ${fmt(result.after)}`,
    );
  }

  const saved = savedBefore - savedAfter;
  console.log(
    `\n${changed} image(s) ${WRITE ? "optimized" : "would change"}; ` +
      `${fmt(savedBefore)} -> ${fmt(savedAfter)} (saved ${fmt(saved)}).` +
      (WRITE ? "" : "  Re-run with --write to apply."),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
