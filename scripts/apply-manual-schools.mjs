#!/usr/bin/env node
/**
 * Apply manual school assignments from scripts/manual-schools.json into places.json.
 * Manual schools are stored on each place and merged at runtime with name-based inference.
 *
 * Usage: node scripts/apply-manual-schools.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const placesPath = join(__dirname, "../src/data/places.json");
const manualPath = join(__dirname, "manual-schools.json");

const manual = JSON.parse(readFileSync(manualPath, "utf8"));
const payload = JSON.parse(readFileSync(placesPath, "utf8"));

function resolveManualSchools(place) {
  if (manual.byId?.[place.id]?.length) {
    return [...new Set(manual.byId[place.id])].sort();
  }

  const name = place.name.toLowerCase();

  for (const rule of manual.byNamePattern ?? []) {
    if (rule.traditions?.length && !rule.traditions.includes(place.tradition)) continue;
    const pattern = new RegExp(rule.pattern, "i");
    if (pattern.test(name)) {
      return [...new Set(rule.schools)].sort();
    }
  }

  const traditionSchools = manual.byTradition?.[place.tradition];
  if (traditionSchools?.length) {
    return [...new Set(traditionSchools)].sort();
  }

  return [];
}

let updated = 0;

for (const place of payload.places) {
  const schools = resolveManualSchools(place);

  if (schools.length > 0) {
    place.schools = schools;
    updated += 1;
  } else {
    delete place.schools;
  }
}

writeFileSync(placesPath, JSON.stringify(payload, null, 2) + "\n");
console.log(`Applied manual schools to ${updated}/${payload.places.length} places.`);
