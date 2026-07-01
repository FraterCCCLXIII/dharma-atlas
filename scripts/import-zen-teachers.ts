#!/usr/bin/env tsx
/**
 * Import and enrich Zen teacher profiles from AZTA and Mandalas Life sources.
 *
 * - Adds AZTA members not already in teachers.json
 * - Enriches existing profiles (bio, lineage/order, location, center, website)
 * - Adds Mandalas list teachers not covered by AZTA (actual teachers only)
 * - Downloads portrait images for new profiles and those missing photos
 *
 * Usage:
 *   npx tsx scripts/import-zen-teachers.ts
 *   npx tsx scripts/import-zen-teachers.ts --dry-run
 *   npx tsx scripts/import-zen-teachers.ts --skip-photos
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Teacher, TeachersDataset } from "../src/types/teacher";
import { findPortraitUrl } from "./sources/imagesearch";
import { USER_AGENT } from "./sources/http";

const ROOT = join(import.meta.dirname, "..");
const TEACHERS_JSON = join(ROOT, "src/data/teachers.json");
const OUTPUT_DIR = join(ROOT, "public/people");
const MANDALAS_MD = join(
  ROOT,
  "../.cursor/projects/Users-paulbloch-dharma-centers/uploads/the-most-prominent-american-zen-buddhists-0.md",
);

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_PHOTOS = process.argv.includes("--skip-photos");

const ZEN_TOPICS = ["Meditation", "Mindfulness", "Compassion", "Liberation"];

type AztaMember = {
  last: string;
  first: string;
  center: string;
  centerUrl: string | null;
  city: string;
  state: string;
  country: string;
  lineage: string;
  order: string;
};

type SourcePerson = {
  key: string;
  name: string;
  slug?: string;
  azta?: AztaMember;
  mandalasBio?: string;
  mandalasTitle?: string;
  wikipediaTitle?: string;
};

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  const stop = new Set([
    "de", "da", "di", "du", "the", "rev", "roshi", "sensei", "nim", "soen", "san",
    "roku", "zen", "soto", "rinzai", "roshi", "master", "teacher", "priest", "dr",
  ]);
  return normalizeText(value)
    .split(" ")
    .filter((t) => t.length > 1 && !stop.has(t));
}

function stripParenthetical(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function formatLineage(lineage: string, order: string): string {
  const l = lineage.trim();
  const o = order.trim();
  if (!l && !o) return "Zen";
  if (!o || normalizeText(l) === normalizeText(o)) return l || o;
  if (!l) return o;
  if (normalizeText(l).includes(normalizeText(o))) return l;
  if (normalizeText(o).includes(normalizeText(l))) return o;
  return `${l} / ${o}`;
}

function formatLocation(city: string, state: string, country: string): string {
  const parts = [city.trim(), state.trim()].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return country.trim() || "United States";
}

function shortBioFromText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 160) return trimmed;
  const cut = trimmed.slice(0, 157);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function isWeakBio(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("may refer to:") ||
    lower.includes("disambiguation") ||
    lower.length < 80
  );
}

function isTeacherBio(text: string): boolean {
  const hasZenContext = /\b(zen|buddhist|roshi|rōshi|dharma|zendo|sangha|sōtō|soto|rinzai|kwan um|seon|soen sa nim)\b/i.test(
    text,
  );
  const hasTeacherRole = /\b(teacher|priest|monk|abbess|abbot|master|dharma heir|transmission|ordained|guiding teacher)\b/i.test(
    text,
  );
  return hasZenContext && hasTeacherRole;
}

function parseAztaHtml(html: string): AztaMember[] {
  const members: AztaMember[] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    if (cells.length < 8) continue;
    const clean = cells.slice(0, 8).map((cell) => {
      const link = cell.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/);
      if (link) {
        return {
          text: link[2].replace(/<[^>]+>/g, "").trim(),
          url: link[1],
        };
      }
      return { text: cell.replace(/<[^>]+>/g, "").trim(), url: null as string | null };
    });
    if (!clean[0].text || clean[0].text === "Last Name") continue;
    members.push({
      last: decodeHtmlEntities(clean[0].text),
      first: decodeHtmlEntities(clean[1].text),
      center: decodeHtmlEntities(clean[2].text),
      centerUrl: clean[2].url,
      city: decodeHtmlEntities(clean[3].text),
      state: decodeHtmlEntities(clean[4].text),
      country: decodeHtmlEntities(clean[5].text),
      lineage: decodeHtmlEntities(clean[6].text),
      order: decodeHtmlEntities(clean[7].text),
    });
  }
  return members;
}

async function fetchAztaMembers(): Promise<AztaMember[]> {
  const all: AztaMember[] = [];
  for (let page = 0; page < 10; page++) {
    const res = await fetch(`https://zenteachers.org/members-of-azta?page=${page}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) break;
    const html = await res.text();
    const members = parseAztaHtml(html);
    if (!members.length) break;
    all.push(...members);
  }
  return all;
}

function parseMandalasBios(markdown: string): Map<string, string> {
  const bios = new Map<string, string>();
  for (const section of markdown.split(/\n### /).slice(1)) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim();
    if (!title) continue;
    const body = lines
      .slice(1)
      .filter((line) => {
        const t = line.trim();
        return t && t !== title && !t.startsWith("![");
      })
      .join(" ")
      .trim();
    if (body) bios.set(title, body);
  }
  return bios;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function personKey(last: string, first: string): string {
  return `${normalizeText(last)}|${significantTokens(first).sort().join("-")}`;
}

function findMergedKey(byKey: Map<string, SourcePerson>, last: string, first: string): string | null {
  const titleTokens = significantTokens(first);
  for (const [key, person] of byKey) {
    const aztaLast = person.azta?.last;
    if (!aztaLast || normalizeText(aztaLast) !== normalizeText(last)) continue;
    const personTokens = significantTokens(person.azta?.first ?? person.name);
    if (personTokens.some((t) => titleTokens.includes(t))) return key;
  }
  return null;
}

function displayNameFromAzta(member: AztaMember): string {
  return decodeHtmlEntities(`${member.first} ${member.last}`.replace(/\s+/g, " ").trim());
}

function displayNameFromMandalas(title: string): string {
  return stripParenthetical(title);
}

function preferredSlug(name: string, existingSlug?: string): string {
  if (existingSlug) return existingSlug;
  return slugify(name);
}

function buildSourcePeople(aztaMembers: AztaMember[], mandalasBios: Map<string, string>): SourcePerson[] {
  const byKey = new Map<string, SourcePerson>();

  for (const member of aztaMembers) {
    const key = personKey(member.last, member.first);
    const name = displayNameFromAzta(member);
    byKey.set(key, {
      key,
      name,
      azta: member,
    });
  }

  for (const [title, bio] of mandalasBios) {
    const base = displayNameFromMandalas(title);
    const parts = base.split(/\s+/);
    if (parts.length < 2) continue;
    const last = parts[parts.length - 1]!;
    const first = parts.slice(0, -1).join(" ");

    let matchedKey: string | null = findMergedKey(byKey, last, first);
    if (!matchedKey) {
      for (const [key, person] of byKey) {
        if (normalizeText(person.name).includes(normalizeText(last))) {
          const personTokens = significantTokens(person.name);
          const titleTokens = significantTokens(base);
          const overlap = personTokens.filter((t) => titleTokens.includes(t)).length;
          if (overlap >= 1 || normalizeText(person.name) === normalizeText(base)) {
            matchedKey = key;
            break;
          }
        }
      }
    }

    const wikipediaTitle = stripParenthetical(title);
    if (matchedKey) {
      const existing = byKey.get(matchedKey)!;
      existing.mandalasBio = bio;
      existing.mandalasTitle = title;
      existing.wikipediaTitle = wikipediaTitle;
      if (title.includes("(") || base.length < existing.name.length) {
        existing.name = base;
      }
    } else {
      const key = personKey(last, first);
      byKey.set(key, {
        key,
        name: base,
        mandalasBio: bio,
        mandalasTitle: title,
        wikipediaTitle,
      });
    }
  }

  return [...byKey.values()];
}

function lastNameMatches(name: string, last: string): boolean {
  const tokens = normalizeText(name).split(" ");
  return tokens[tokens.length - 1] === normalizeText(last);
}

function namesLikelySame(a: string, b: string): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na === nb) return true;
  const ta = significantTokens(a);
  const tb = significantTokens(b);
  const overlap = ta.filter((t) => tb.includes(t));
  if (overlap.length >= 2) return true;
  if (overlap.length === 1 && ta.length === 1 && tb.length === 1) return true;
  return false;
}

function givenNameTokens(first: string, fullName?: string): string[] {
  const fromFirst = significantTokens(first);
  if (fromFirst.length) return fromFirst;
  if (!fullName) return [];
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return significantTokens(fullName);
  return significantTokens(parts.slice(0, -1).join(" "));
}

function findExistingTeacher(
  person: SourcePerson,
  teachers: Teacher[],
): Teacher | undefined {
  if (person.slug) {
    const bySlug = teachers.find((t) => t.slug === person.slug);
    if (bySlug) return bySlug;
  }

  const targetNames = new Set<string>();
  targetNames.add(normalizeText(person.name));
  if (person.mandalasTitle) targetNames.add(normalizeText(stripParenthetical(person.mandalasTitle)));
  if (person.azta) targetNames.add(normalizeText(displayNameFromAzta(person.azta)));

  for (const teacher of teachers) {
    if (targetNames.has(normalizeText(teacher.name))) return teacher;
  }

  const last = person.azta?.last ?? person.name.split(/\s+/).slice(-1)[0] ?? "";
  const firstTokens = givenNameTokens(person.azta?.first ?? "", person.name);
  const candidates = teachers.filter(
    (t) =>
      lastNameMatches(t.name, last) &&
      givenNameTokens("", t.name).some((token) => firstTokens.includes(token)),
  );
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    let best: Teacher | undefined;
    let bestScore = 0;
    for (const candidate of candidates) {
      const score = givenNameTokens("", candidate.name).filter((t) => firstTokens.includes(t)).length;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    if (best && bestScore >= 1) return best;
  }

  const slugCandidate = slugify(person.name);
  return teachers.find((t) => t.slug === slugCandidate);
}

function shouldEnrichExisting(existing: Teacher, incoming: Teacher, person: SourcePerson): boolean {
  if (namesLikelySame(existing.name, incoming.name)) return true;
  if (person.azta && namesLikelySame(existing.name, displayNameFromAzta(person.azta))) return true;
  if (person.mandalasTitle && namesLikelySame(existing.name, stripParenthetical(person.mandalasTitle))) {
    return true;
  }
  return false;
}

function teacherFromSource(person: SourcePerson, existing?: Teacher): Teacher {
  const azta = person.azta;
  const bio = person.mandalasBio ?? existing?.biography?.[0] ?? "";
  const name = existing?.name ?? person.name;
  const slug = preferredSlug(name, existing?.slug);
  const lineage = azta
    ? formatLineage(azta.lineage, azta.order)
    : person.mandalasBio
      ? defaultMandalasLineage(person.mandalasBio)
      : existing?.lineage ?? "Sōtō Zen";
  const location = azta
    ? formatLocation(azta.city, azta.state, azta.country)
    : existing?.location ?? "United States";
  const base = azta?.center || existing?.base;
  const website = azta?.centerUrl ?? existing?.website ?? null;
  const shortBio = bio
    ? shortBioFromText(bio)
    : existing?.shortBio ??
      (azta
        ? `${name} is a Zen teacher at ${azta.center} in ${formatLocation(azta.city, azta.state, azta.country)}.`
        : name);

  const socials = [...(existing?.socials ?? [])];
  if (website && !socials.some((s) => s.url === website)) {
    socials.unshift({ label: azta?.center ?? "Website", url: website });
  }

  return {
    slug,
    name,
    tradition: existing?.tradition ?? "Buddhist",
    lineage,
    location,
    base,
    yearsTeaching: existing?.yearsTeaching ?? 0,
    birthYear: existing?.birthYear ?? null,
    deathYear: existing?.deathYear ?? null,
    languages: existing?.languages?.length ? existing.languages : ["English"],
    shortBio,
    biography: bio ? [bio] : existing?.biography ?? [shortBio],
    topics: existing?.topics?.length ? existing.topics : ZEN_TOPICS,
    photo: existing?.photo ?? "",
    heroPhoto: existing?.heroPhoto,
    website,
    socials,
    bibliography: existing?.bibliography ?? [],
    retreats: existing?.retreats ?? [],
    relations: existing?.relations,
    ...(existing && "archiveNumber" in existing
      ? { archiveNumber: (existing as Teacher & { archiveNumber?: string }).archiveNumber }
      : {}),
  };
}

function defaultMandalasLineage(bio: string): string {
  if (/\bwhite plum\b/i.test(bio)) return "Sōtō Zen / White Plum";
  if (/\bkwan um\b/i.test(bio)) return "Korean Seon (Kwan Um)";
  if (/\brinzai\b/i.test(bio)) return "Rinzai Zen";
  if (/\bharada[- ]yasutani\b/i.test(bio)) return "Harada-Yasutani";
  if (/\bsanbo kyodan\b/i.test(bio)) return "Sanbo Kyodan";
  if (/\bdiamond sangha\b/i.test(bio)) return "Diamond Sangha";
  if (/\bsōtō|soto\b/i.test(bio)) return "Sōtō Zen";
  return "Zen";
}

function shouldAddMandalasOnly(person: SourcePerson): boolean {
  if (person.azta) return true;
  if (!person.mandalasBio) return false;
  if (
    person.mandalasTitle &&
    /\((musician|actor|actress|swimmer|photographer|composer)\)/i.test(person.mandalasTitle)
  ) {
    return false;
  }
  return isTeacherBio(person.mandalasBio);
}

function mergeTeacher(existing: Teacher, incoming: Teacher): Teacher {
  const useIncomingBio = personHasBetterBio(existing, incoming);
  return {
    ...existing,
    name: existing.name.length >= incoming.name.length ? existing.name : incoming.name,
    lineage: mergeLineage(existing.lineage, incoming.lineage),
    location:
      !existing.location || existing.location === "Unknown" || existing.location.length < 3
        ? incoming.location
        : existing.location,
    base: existing.base ?? incoming.base,
    website: existing.website ?? incoming.website ?? undefined,
    shortBio: useIncomingBio ? incoming.shortBio : existing.shortBio,
    biography: useIncomingBio ? incoming.biography : existing.biography,
    socials: mergeSocials(existing.socials, incoming.socials),
    topics: existing.topics?.length ? existing.topics : incoming.topics,
  };
}

function personHasBetterBio(existing: Teacher, incoming: Teacher): boolean {
  const existingBio = existing.biography?.[0] ?? existing.shortBio ?? "";
  const incomingBio = incoming.biography?.[0] ?? incoming.shortBio ?? "";
  if (isWeakBio(existingBio) && !isWeakBio(incomingBio)) return true;
  return incomingBio.length > existingBio.length + 40;
}

function mergeLineage(existing: string, incoming: string): string {
  if (!existing || existing === "Zen") return incoming;
  if (!incoming || incoming === "Zen") return existing;
  const e = normalizeText(existing);
  const i = normalizeText(incoming);
  if (e === i || e.includes(i) || i.includes(e)) return existing.length >= incoming.length ? existing : incoming;
  if (existing.includes("/")) return existing;
  return incoming.includes("/") ? incoming : `${existing} / ${incoming.split("/").pop()?.trim() ?? incoming}`;
}

function mergeSocials(
  existing: Teacher["socials"],
  incoming: Teacher["socials"],
): Teacher["socials"] {
  const merged = [...existing];
  for (const social of incoming) {
    if (!merged.some((s) => s.url === social.url)) merged.push(social);
  }
  return merged;
}

async function downloadImage(url: string, destBase: string): Promise<string | null> {
  await new Promise((r) => setTimeout(r, 400));
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/") || contentType.includes("svg")) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 800) return null;
  const ext = contentType.includes("png")
    ? ".png"
    : contentType.includes("webp")
      ? ".webp"
      : ".jpg";
  const fullPath = `${destBase}${ext}`;
  writeFileSync(fullPath, buffer);
  return `/people/${destBase.split("/").pop()}${ext}`;
}

function hasLocalPhoto(photo: string | undefined): boolean {
  return Boolean(photo && photo.startsWith("/people/") && existsSync(join(ROOT, "public", photo)));
}

async function main() {
  const dataset = JSON.parse(readFileSync(TEACHERS_JSON, "utf8")) as TeachersDataset;
  const mandalasMarkdown = readFileSync(MANDALAS_MD, "utf8");
  const aztaMembers = await fetchAztaMembers();
  const mandalasBios = parseMandalasBios(mandalasMarkdown);
  const sourcePeople = buildSourcePeople(aztaMembers, mandalasBios);

  console.log(`AZTA members: ${aztaMembers.length}`);
  console.log(`Mandalas bios: ${mandalasBios.size}`);
  console.log(`Unified source people: ${sourcePeople.length}`);

  const existingBySlug = new Map(dataset.teachers.map((t) => [t.slug, t]));
  let added = 0;
  let enriched = 0;
  let photosDownloaded = 0;
  const touchedSlugs: string[] = [];

  if (!DRY_RUN && !existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const person of sourcePeople) {
    if (!shouldAddMandalasOnly(person)) continue;

    const existing = findExistingTeacher(person, dataset.teachers);
    const incoming = teacherFromSource(person, existing);
    person.slug = incoming.slug;

    if (existing) {
      if (!shouldEnrichExisting(existing, incoming, person)) {
        if (existingBySlug.has(incoming.slug)) {
          console.log(`⏭  Skipping duplicate slug ${incoming.slug}`);
          continue;
        }
        added++;
        touchedSlugs.push(incoming.slug);
        if (!DRY_RUN) {
          dataset.teachers.push(incoming);
          existingBySlug.set(incoming.slug, incoming);
        }
        console.log(`+  Added ${incoming.name} (${incoming.lineage})`);
        continue;
      }

      const merged = mergeTeacher(existing, incoming);
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        enriched++;
        touchedSlugs.push(merged.slug);
        if (!DRY_RUN) {
          const idx = dataset.teachers.findIndex((t) => t.slug === existing.slug);
          if (idx >= 0) dataset.teachers[idx] = merged;
          existingBySlug.set(merged.slug, merged);
        }
        console.log(`✎  Enriched ${merged.name}`);
      }
      continue;
    }

    if (existingBySlug.has(incoming.slug)) {
      console.log(`⏭  Skipping duplicate slug ${incoming.slug}`);
      continue;
    }

    added++;
    touchedSlugs.push(incoming.slug);
    if (!DRY_RUN) {
      dataset.teachers.push(incoming);
      existingBySlug.set(incoming.slug, incoming);
    }
    console.log(`+  Added ${incoming.name} (${incoming.lineage})`);
  }

  if (!SKIP_PHOTOS && !DRY_RUN) {
    for (const slug of touchedSlugs) {
      const teacher = existingBySlug.get(slug);
      if (!teacher || hasLocalPhoto(teacher.photo)) continue;

      const person = sourcePeople.find((p) => p.slug === slug);
      console.log(`📷 ${teacher.name}…`);
      const found = await findPortraitUrl({
        name: teacher.name,
        wikipediaTitle: person?.wikipediaTitle ?? person?.mandalasTitle,
      });
      if (!found?.url) {
        console.warn(`   ⚠ no portrait found`);
        continue;
      }
      const local = await downloadImage(found.url, join(OUTPUT_DIR, slug));
      if (!local) {
        console.warn(`   ⚠ download failed`);
        continue;
      }
      teacher.photo = local;
      teacher.heroPhoto = local;
      photosDownloaded++;
      console.log(`   → ${local}`);
    }
  }

  if (!DRY_RUN) {
    dataset.count = dataset.teachers.length;
    dataset.teachers.sort((a, b) => a.name.localeCompare(b.name, "en"));
    writeFileSync(TEACHERS_JSON, `${JSON.stringify(dataset, null, 2)}\n`);
  }

  console.log(`\n${DRY_RUN ? "Dry run —" : "✅"} Added ${added}, enriched ${enriched}, photos ${photosDownloaded}`);
  console.log(`Total teachers: ${dataset.teachers.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
