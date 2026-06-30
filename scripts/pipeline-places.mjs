#!/usr/bin/env node
/**
 * Orchestrate the place data pipeline.
 *
 * Usage:
 *   node scripts/pipeline-places.mjs              # default batch (limits on slow steps)
 *   node scripts/pipeline-places.mjs --full         # all locations, no step limits
 *   node scripts/pipeline-places.mjs --quick        # audit + clean only
 *   node scripts/pipeline-places.mjs --no-api       # geocode from cache only
 *   node scripts/pipeline-places.mjs --import       # re-import KML + sources first
 *   node scripts/pipeline-places.mjs --from=regeocode   # resume mid-pipeline
 *   node scripts/pipeline-places.mjs --skip-discover
 *   node scripts/pipeline-places.mjs --discover-only
 *   node scripts/pipeline-places.mjs --skip-seed
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const QUICK = args.includes("--quick");
const FULL = args.includes("--full");
const NO_API = args.includes("--no-api");
const IMPORT = args.includes("--import");
const SKIP_PHOTOS = args.includes("--skip-photos");
const SKIP_DISCOVER = args.includes("--skip-discover");
const DISCOVER_ONLY = args.includes("--discover-only");
const discoverRegionArg = args.find((a) => a.startsWith("--discover-region="));
const DISCOVER_REGION = discoverRegionArg ? discoverRegionArg.split("=")[1] : "";
const discoverCellsArg = args.find((a) => a.startsWith("--discover-cells="));
const DISCOVER_CELLS = discoverCellsArg ? discoverCellsArg.split("=")[1] : "";
const SKIP_SEED = args.includes("--skip-seed");
const photoLimitArg = args.find((a) => a.startsWith("--photo-limit="));
const PHOTO_LIMIT = photoLimitArg ? photoLimitArg.split("=")[1] : "";

function run(cmd, cmdArgs, label) {
  console.log(`\n▶ ${label}`);
  const started = Date.now();
  const result = spawnSync(cmd, cmdArgs, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });
  const elapsed = Math.round((Date.now() - started) / 1000);
  console.log(`  (${elapsed}s)`);
  if (result.status !== 0) {
    console.error(`Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

function limitArg(defaultLimit) {
  if (FULL) return [];
  return ["--limit", String(defaultLimit)];
}

const fromArg = args.find((a) => a.startsWith("--from="));
const FROM_STEP = fromArg ? fromArg.split("=")[1] : "audit";

const STEP_ORDER = [
  "audit",
  "clean",
  "discover",
  "regeocode",
  "google-enrich",
  "recover-sources",
  "recover",
  "enrich",
  "descriptions",
  "photos",
  "seed",
  "final-audit",
];

function shouldRun(step) {
  const fromIdx = STEP_ORDER.indexOf(FROM_STEP);
  const stepIdx = STEP_ORDER.indexOf(step);
  if (fromIdx < 0 || stepIdx < 0) return true;
  return stepIdx >= fromIdx;
}

console.log(
  `Pipeline mode: ${QUICK ? "quick" : FULL ? "full (all locations)" : "default batch"}${FROM_STEP !== "audit" ? `, from=${FROM_STEP}` : ""}`,
);

if (IMPORT && !QUICK && shouldRun("audit")) {
  run("node", [join(__dirname, "import-kml.mjs")], "Import Shambhala KML");
  run(
    "python3",
    [join(__dirname, "import-sources.py"), ...(NO_API ? ["--no-api"] : [])],
    "Import directory sources",
  );
}

if (shouldRun("audit")) {
  run("python3", [join(__dirname, "audit-places.py")], "Audit places");
}
if (shouldRun("clean")) {
  run("python3", [join(__dirname, "clean-places.py")], "Clean places");
}

if (!QUICK) {
  if (shouldRun("discover") && !SKIP_DISCOVER) {
    const discoverArgs = [join(__dirname, "discover-google-places.py"), "--grid", "3"];
    if (DISCOVER_REGION) discoverArgs.push("--region", DISCOVER_REGION);
    if (DISCOVER_CELLS) discoverArgs.push("--limit-cells", DISCOVER_CELLS);
    else if (!FULL) discoverArgs.push("--limit-cells", "5");
    run(
      "python3",
      discoverArgs,
      FULL
        ? "Google Places discovery (all regions, full grid + queries)"
        : "Google Places discovery (5 metros, 3×3 grid)",
    );
  }

  if (DISCOVER_ONLY) {
    console.log("\n✅ Discovery complete (--discover-only)\n");
    process.exit(0);
  }

  if (shouldRun("regeocode")) {
    const regeocodeArgs = [join(__dirname, "regeocode-places.py"), ...limitArg(300)];
    if (NO_API) regeocodeArgs.push("--no-api");
    run("python3", regeocodeArgs, FULL ? "Re-geocode all flagged places" : "Re-geocode places");
  }

  if (shouldRun("google-enrich")) {
    const googleArgs = [join(__dirname, "enrich-google-places.py")];
    if (FULL) googleArgs.push("--only-missing");
    else googleArgs.push(...limitArg(100));
    run(
      "python3",
      googleArgs,
      FULL ? "Google Places enrich (all places)" : "Google Places enrich (batch)",
    );
    if (FULL) {
      run(
        "python3",
        [join(__dirname, "enrich-google-places.py"), "--only-missing-photo"],
        "Google Places photos (all places missing a photo)",
      );
    }
  }

  if (!GOOGLE && shouldRun("recover-sources")) {
    run(
      "python3",
      [join(__dirname, "recover-source-urls.py")],
      "Recover websites from dhamma.org and BuddhaNet sources",
    );
  }

  if (!GOOGLE && shouldRun("recover")) {
    run(
      "python3",
      [join(__dirname, "recover-websites.py"), ...limitArg(150)],
      FULL ? "Recover websites for all places missing URLs" : "Recover websites",
    );
  }

  if (!GOOGLE && shouldRun("enrich")) {
    run(
      "python3",
      [join(__dirname, "enrich-places.py")],
      "Enrich addresses/phone from OSM (Nominatim + Overpass)",
    );
  }

  if (!GOOGLE && shouldRun("descriptions")) {
    run(
      "python3",
      [join(__dirname, "fetch-descriptions.py"), ...limitArg(150)],
      FULL ? "Fetch descriptions for all places" : "Fetch descriptions",
    );
  }

  if (!GOOGLE && shouldRun("photos") && !SKIP_PHOTOS) {
    const photoArgs = ["run", "download-place-photos", "--"];
    if (PHOTO_LIMIT) photoArgs.push(`--limit=${PHOTO_LIMIT}`);
    else if (!FULL) photoArgs.push("--limit=200");
    run(
      "npm",
      photoArgs,
      FULL ? "Download real photos for all places" : "Download place photos",
    );
  }
}

if (!SKIP_SEED && shouldRun("seed")) {
  run("npm", ["run", "db:seed"], "Seed database");
}

if (shouldRun("final-audit")) {
  run("python3", [join(__dirname, "audit-places.py")], "Final audit");
}

console.log("\n✅ Pipeline complete. Review scripts/reports/places-audit.csv\n");
