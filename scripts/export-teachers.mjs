#!/usr/bin/env node
/**
 * Export teachers from spiritual-teachers generated JSON into dharma-centers.
 *
 * Usage:
 *   node scripts/export-teachers.mjs
 *   TEACHERS_SOURCE=/path/to/teachers.generated.json node scripts/export-teachers.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultSource = resolve(
  __dirname,
  "../../Documents/github/spiritual-teachers/scripts/data/teachers.generated.json",
);
const sourcePath = process.env.TEACHERS_SOURCE ?? defaultSource;
const outputPath = join(__dirname, "../src/data/teachers.json");

function normalizeRelations(relations) {
  if (!relations) return undefined;

  if (!Array.isArray(relations)) {
    const hasAny =
      relations.teachers?.length ||
      relations.peers?.length ||
      relations.students?.length;
    return hasAny ? relations : undefined;
  }

  if (relations.length === 0) return undefined;

  const grouped = { teachers: [], peers: [], students: [] };

  for (const rel of relations) {
    const entry = {
      ...(rel.toSlug ? { slug: rel.toSlug } : {}),
      name: rel.name,
      role: rel.role,
      ...(rel.note ? { note: rel.note } : {}),
    };

    if (rel.type === "teacher") grouped.teachers.push(entry);
    else if (rel.type === "peer") grouped.peers.push(entry);
    else if (rel.type === "student") grouped.students.push(entry);
  }

  const hasAny =
    grouped.teachers.length || grouped.peers.length || grouped.students.length;
  return hasAny ? grouped : undefined;
}

function normalizeTeacher(raw) {
  const {
    _source: _ignored,
    base,
    heroPhoto,
    website,
    relations,
    ...rest
  } = raw;

  return {
    ...rest,
    ...(base != null ? { base } : {}),
    ...(heroPhoto ? { heroPhoto } : {}),
    ...(website ? { website } : {}),
    relations: normalizeRelations(relations),
    socials: raw.socials ?? [],
    bibliography: raw.bibliography ?? [],
    retreats: raw.retreats ?? [],
    biography: raw.biography ?? [],
    topics: raw.topics ?? [],
    languages: raw.languages ?? [],
  };
}

const raw = JSON.parse(readFileSync(sourcePath, "utf8"));
const teachers = raw.map(normalizeTeacher).sort((a, b) => a.name.localeCompare(b.name));

const dataset = {
  source: "spiritual-teachers",
  sourceName: "Wisdom Archive",
  count: teachers.length,
  teachers,
};

writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Exported ${teachers.length} teachers → ${outputPath}`);
