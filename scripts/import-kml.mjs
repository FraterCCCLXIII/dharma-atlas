#!/usr/bin/env node
/**
 * Re-seed places.json from the Shambhala Google My Maps KML export.
 * Usage: node scripts/import-kml.mjs
 */
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const MAP_ID = "1NrKT9tt74PDeKaq9aFQ4FQZjSrVU9j4";
const KML_URL = `https://www.google.com/maps/d/kml?mid=${MAP_ID}`;

const FOLDER_TO_TRADITION = {
  "Insight, Theravada, Vipassanna": "Theravada",
  Tibetan: "Tibetan",
  "Zen, Chan, Son, & Thien,": "Zen",
  "Other Buddhist Centers": "Buddhist",
  "Vietnamese Temples": "Vietnamese",
  "Chinese Temple": "Chinese",
  "Thai, Burmese, Lao, Cambodian, and Sri Lankan Temple": "Southeast Asian",
  "Pure Land, Soka Gakkai, Jodo Shin": "Pure Land",
  "Won Buddhism": "Won Buddhism",
};

function inferType(name) {
  const n = name.toLowerCase();
  if (n.includes("ashram")) return "Ashram";
  if (n.includes("monastery") || n.includes("vihara") || n.includes("vihāra"))
    return "Monastery";
  if (n.includes("temple")) return "Temple";
  if (n.includes("sangha") || n.includes("meditation center"))
    return "Meditation Center";
  if (n.includes("center") || n.includes("centre")) return "Center";
  if (n.includes("institute")) return "Institute";
  return "Center";
}

function inferFaith(name) {
  const n = name.toLowerCase();
  if (["hindu", "mandir", "gurdwara", "iskcon"].some((w) => n.includes(w)))
    return "Hindu";
  return "Buddhist";
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../src/data/places.json");
const existingPath = outPath;

function loadExistingPlaces() {
  try {
    const existing = JSON.parse(readFileSync(existingPath, "utf8"));
    return new Map(existing.places.map((place) => [place.id, place]));
  } catch {
    return new Map();
  }
}

const res = await fetch(KML_URL);
if (!res.ok) throw new Error(`Failed to fetch KML: ${res.status}`);

const buffer = Buffer.from(await res.arrayBuffer());
let kmlText;

if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(buffer);
  kmlText = zip.readAsText("doc.kml");
} else {
  kmlText = buffer.toString("utf8");
}

const parser = new XMLParser({ ignoreAttributes: false });
const doc = parser.parse(kmlText);
const folders = doc.kml?.Document?.Folder;
const folderList = Array.isArray(folders) ? folders : folders ? [folders] : [];

const places = [];
const seen = new Set();
const existingPlaces = loadExistingPlaces();

for (const folder of folderList) {
  const folderName = folder.name ?? "Unknown";
  const tradition = FOLDER_TO_TRADITION[folderName] ?? folderName;
  const placemarks = folder.Placemark;
  const list = Array.isArray(placemarks) ? placemarks : placemarks ? [placemarks] : [];

  for (const pm of list) {
    const name = String(pm.name ?? "").trim();
    const coordsRaw = pm.Point?.coordinates ?? pm.point?.coordinates;
    if (!name || !coordsRaw) continue;

    const [lng, lat] = String(coordsRaw).trim().split(",").map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const key = `${name}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const id = createHash("md5").update(key).digest("hex").slice(0, 12);
    const existing = existingPlaces.get(id);
    const place = {
      id,
      name,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      tradition,
      faith: inferFaith(name),
      type: inferType(name),
      folder: folderName,
      address: existing?.address ?? "",
      phone: existing?.phone ?? null,
      website: existing?.website ?? null,
      coordPrecision: existing?.coordPrecision ?? "pin",
    };

    if (existing?.schools?.length) {
      place.schools = existing.schools;
    }

    places.push(place);
  }
}

places.sort((a, b) => a.name.localeCompare(b.name));

const payload = {
  source: `https://www.google.com/maps/d/u/0/viewer?mid=${MAP_ID}`,
  sourceName: "Buddhist Centers, Temples, and Monasteries in the US",
  sourceCredit: "Shambhala Publications",
  count: places.length,
  places,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`Wrote ${places.length} places to ${outPath}`);
