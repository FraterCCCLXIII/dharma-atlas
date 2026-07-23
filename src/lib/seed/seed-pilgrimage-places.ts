import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  pilgrimageRouteStops,
  pilgrimageRoutes,
  places,
} from "@/db/schema";
import {
  getPilgrimageImage,
  PILGRIMAGE_ROUTES,
  PILGRIMAGE_SITES,
  type PilgrimageSite,
} from "@/data/pilgrimage";
import { allocateUniquePlaceSlug } from "@/lib/data/place-slugs";
import {
  inferPilgrimagePlaceType,
  pilgrimageFaith,
  pilgrimagePlaceDescription,
  pilgrimagePlaceTradition,
} from "@/lib/seed/pilgrimage-place-type";
import { slugifyPlacePart } from "@/lib/place-slug";

const MATCH_RADIUS_M = 300;

export type SeedPilgrimageResult = {
  linked: number;
  created: number;
  updated: number;
  routes: number;
  stops: number;
  unmatchedStops: number;
};

type OverrideMap = Record<string, string>;

function loadOverrides(): OverrideMap {
  try {
    const path = join(process.cwd(), "src/data/pilgrimage-place-overrides.json");
    const raw = JSON.parse(readFileSync(path, "utf8")) as OverrideMap;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesLikelyMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = new Set(left.split(" ").filter((t) => t.length > 2));
  const rightTokens = right.split(" ").filter((t) => t.length > 2);
  if (rightTokens.length === 0) return false;
  const overlap = rightTokens.filter((t) => leftTokens.has(t)).length;
  return overlap >= Math.min(2, rightTokens.length);
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

function newPlaceId(): string {
  return randomBytes(6).toString("hex");
}

async function findExistingByPilgrimageSlug(slug: string) {
  const [row] = await db
    .select({ id: places.id })
    .from(places)
    .where(eq(places.pilgrimageSlug, slug))
    .limit(1);
  return row?.id ?? null;
}

async function findNearbyNameMatch(site: PilgrimageSite): Promise<string | null> {
  // Bounding-box prefilter (~350m) then precise haversine + name check.
  const latDelta = MATCH_RADIUS_M / 111_320;
  const lngDelta =
    MATCH_RADIUS_M / (111_320 * Math.max(0.2, Math.cos((site.lat * Math.PI) / 180)));

  const candidates = await db
    .select({
      id: places.id,
      name: places.name,
      lat: places.lat,
      lng: places.lng,
      pilgrimageSlug: places.pilgrimageSlug,
    })
    .from(places)
    .where(
      and(
        isNull(places.deletedAt),
        sql`${places.lat} between ${site.lat - latDelta} and ${site.lat + latDelta}`,
        sql`${places.lng} between ${site.lng - lngDelta} and ${site.lng + lngDelta}`,
      ),
    );

  let best: { id: string; distance: number } | null = null;
  for (const candidate of candidates) {
    if (candidate.pilgrimageSlug && candidate.pilgrimageSlug !== site.slug) {
      continue;
    }
    const distance = haversineMeters(
      site.lat,
      site.lng,
      candidate.lat,
      candidate.lng,
    );
    if (distance > MATCH_RADIUS_M) continue;
    if (!namesLikelyMatch(site.name, candidate.name)) continue;
    if (!best || distance < best.distance) {
      best = { id: candidate.id, distance };
    }
  }
  return best?.id ?? null;
}

async function upsertPilgrimagePlace(
  site: PilgrimageSite,
  overrides: OverrideMap,
): Promise<{ placeId: string; created: boolean; linked: boolean }> {
  const overrideId = overrides[site.slug];
  let placeId: string | null =
    (overrideId
      ? (
          await db
            .select({ id: places.id })
            .from(places)
            .where(eq(places.id, overrideId))
            .limit(1)
        )[0]?.id
      : null) ??
    (await findExistingByPilgrimageSlug(site.slug)) ??
    (await findNearbyNameMatch(site));

  const photo = getPilgrimageImage(site.slug) ?? null;
  const description = pilgrimagePlaceDescription(site);
  const type = inferPilgrimagePlaceType(site);
  const faith = pilgrimageFaith(site.tradition);
  const tradition = pilgrimagePlaceTradition(site.tradition);
  const address = [site.country].filter(Boolean).join(", ");

  if (placeId) {
    const [existing] = await db
      .select()
      .from(places)
      .where(eq(places.id, placeId))
      .limit(1);
    if (existing) {
      await db
        .update(places)
        .set({
          isPilgrimageSite: true,
          pilgrimageSlug: site.slug,
          description: existing.description?.trim()
            ? existing.description
            : description,
          descriptionSource: existing.descriptionSource ?? "pilgrimage_catalog",
          photo: existing.photo?.trim() ? existing.photo : photo,
          photoSource: existing.photo?.trim()
            ? existing.photoSource
            : photo
              ? "wikimedia"
              : existing.photoSource,
          dataSource: existing.dataSource ?? "pilgrimage_catalog",
          updatedAt: new Date(),
        })
        .where(eq(places.id, placeId));
      return {
        placeId,
        created: false,
        linked: !existing.pilgrimageSlug || existing.pilgrimageSlug !== site.slug,
      };
    }
  }

  const id = newPlaceId();
  const preferredSlug = slugifyPlacePart(site.slug) || slugifyPlacePart(site.name);
  const slugTaken = preferredSlug
    ? (
        await db
          .select({ id: places.id })
          .from(places)
          .where(eq(places.slug, preferredSlug))
          .limit(1)
      )[0]
    : null;
  const slug =
    preferredSlug && !slugTaken
      ? preferredSlug
      : await allocateUniquePlaceSlug({
          name: site.name,
          city: site.country,
          address,
          fallbackId: id,
        });

  await db.insert(places).values({
    id,
    slug,
    name: site.name,
    lat: site.lat,
    lng: site.lng,
    tradition,
    faith,
    type,
    folder: "Pilgrimage",
    address,
    description,
    descriptionSource: "pilgrimage_catalog",
    locationMode: type === "Sacred Landscape" ? "area" : "venue",
    coordPrecision: "pin",
    dataSource: "pilgrimage_catalog",
    photo,
    photoSource: photo ? "wikimedia" : null,
    isDraft: false,
    isPilgrimageSite: true,
    pilgrimageSlug: site.slug,
    schools: [],
    offerings: [],
    verifiedFields: [],
    qualityFlags: [],
  });

  return { placeId: id, created: true, linked: false };
}

export async function seedPilgrimagePlaces(): Promise<SeedPilgrimageResult> {
  const overrides = loadOverrides();
  const slugToPlaceId = new Map<string, string>();
  let created = 0;
  let linked = 0;
  let updated = 0;

  for (const site of PILGRIMAGE_SITES) {
    const result = await upsertPilgrimagePlace(site, overrides);
    slugToPlaceId.set(site.slug, result.placeId);
    if (result.created) created += 1;
    else if (result.linked) linked += 1;
    else updated += 1;
  }

  let routeCount = 0;
  let stopCount = 0;
  let unmatchedStops = 0;

  for (const route of PILGRIMAGE_ROUTES) {
    await db
      .insert(pilgrimageRoutes)
      .values({
        slug: route.slug,
        name: route.name,
        region: route.region,
        tradition: route.tradition,
        summary: route.summary,
        lengthNote: route.lengthNote,
        significance: route.significance ?? null,
        extraStops: route.extraStops ?? [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pilgrimageRoutes.slug,
        set: {
          name: route.name,
          region: route.region,
          tradition: route.tradition,
          summary: route.summary,
          lengthNote: route.lengthNote,
          significance: route.significance ?? null,
          extraStops: route.extraStops ?? [],
          updatedAt: new Date(),
        },
      });
    routeCount += 1;

    await db
      .delete(pilgrimageRouteStops)
      .where(eq(pilgrimageRouteStops.routeSlug, route.slug));

    let position = 0;
    for (const stopSlug of route.stopSlugs) {
      const placeId = slugToPlaceId.get(stopSlug);
      if (!placeId) {
        unmatchedStops += 1;
        continue;
      }
      const site = PILGRIMAGE_SITES.find((s) => s.slug === stopSlug);
      await db.insert(pilgrimageRouteStops).values({
        routeSlug: route.slug,
        placeId,
        position,
        templeNumber: site?.templeNumber ?? null,
      });
      position += 1;
      stopCount += 1;
    }
  }

  return {
    linked,
    created,
    updated,
    routes: routeCount,
    stops: stopCount,
    unmatchedStops,
  };
}
