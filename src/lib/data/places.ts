import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { count, desc, eq, ilike, isNotNull, isNull, or, and, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { placeMemberships, places, user } from "@/db/schema";
import { isPlaceInMapBounds } from "@/lib/coords";
import type { ExplorePlaceSearchOptions } from "@/lib/explore-api-params";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { attachPhotosToPlace } from "@/lib/data/place-photos";
import { placeMatchesLocationFilter } from "@/lib/location-filter";
import { filterPlaces, type PlaceFilters } from "@/lib/places";
import {
  placeMarkerToMapPin,
  rowToPlace,
  rowToPlaceMarker,
} from "@/lib/place-row";
import { setOntologySnapshot } from "@/lib/schools";
import type { ExploreMapPin, Place, PlaceMarker } from "@/types/place";

export type { ExplorePlaceSearchOptions } from "@/lib/explore-api-params";

const notDeleted = isNull(places.deletedAt);
const publishedOnly = and(eq(places.isDraft, false), notDeleted)!;

export const EXPLORE_MARKERS_CACHE_TAG = "explore-markers";

export async function getPlacesCount() {
  const [row] = await db.select({ count: count() }).from(places).where(notDeleted);
  return row?.count ?? 0;
}

export async function getPublishedPlacesCount() {
  const [row] = await db.select({ count: count() }).from(places).where(publishedOnly);
  return row?.count ?? 0;
}

export async function getAllPlaces(): Promise<Place[]> {
  const rows = await db
    .select()
    .from(places)
    .where(publishedOnly)
    .orderBy(places.name);
  return rows.map(rowToPlace);
}

export async function getAllPlaceMarkers(): Promise<PlaceMarker[]> {
  const rows = await db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      lat: places.lat,
      lng: places.lng,
      tradition: places.tradition,
      faith: places.faith,
      type: places.type,
      address: places.address,
      locationMode: places.locationMode,
      photo: places.photo,
      schools: places.schools,
    })
    .from(places)
    .where(publishedOnly)
    .orderBy(places.name);
  return rows.map(rowToPlaceMarker);
}

export const getCachedPlaceMarkers = unstable_cache(
  async () => getAllPlaceMarkers(),
  ["explore-place-markers"],
  {
    tags: [EXPLORE_MARKERS_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function getAllPlacesForAdmin(): Promise<Place[]> {
  const rows = await db.select().from(places).where(notDeleted).orderBy(places.name);
  return rows.map(rowToPlace);
}

export async function getAllPlaceIds(): Promise<string[]> {
  const rows = await db
    .select({ id: places.id })
    .from(places)
    .where(publishedOnly);
  return rows.map((r) => r.id);
}

/** Public sitemap / pretty URLs — prefer slug over id. */
export async function getAllPlaceSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: places.slug, id: places.id })
    .from(places)
    .where(publishedOnly);
  return rows.map((r) => r.slug || r.id);
}

function placeFromRow(
  row: typeof places.$inferSelect,
  options?: { includeDrafts?: boolean; includeDeleted?: boolean },
): Place | null {
  if (row.deletedAt && !options?.includeDeleted) return null;
  if (row.isDraft && !options?.includeDrafts) return null;
  return rowToPlace(row);
}

// Wrapped in React `cache()` so `generateMetadata` and the page component share
// a single fetch (and its photo join) within one request instead of running it twice.
export const getPlaceById = cache(async (
  id: string,
  options?: { includeDrafts?: boolean; includeDeleted?: boolean },
): Promise<Place | null> => {
  const [row] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!row) return null;
  const place = placeFromRow(row, options);
  return place ? attachPhotosToPlace(place) : null;
});

export const getPlaceBySlug = cache(async (
  slug: string,
  options?: { includeDrafts?: boolean; includeDeleted?: boolean },
): Promise<Place | null> => {
  const [row] = await db.select().from(places).where(eq(places.slug, slug)).limit(1);
  if (!row) return null;
  const place = placeFromRow(row, options);
  return place ? attachPhotosToPlace(place) : null;
});

export async function searchPlaces(options: {
  query?: string;
  page?: number;
  pageSize?: number;
  publishedOnly?: boolean;
  qualityFlag?: string;
  /** When true, only soft-deleted places. Default excludes deleted. */
  deletedOnly?: boolean;
}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;
  const q = options.query?.trim();

  const filters: SQL[] = [];
  if (options.deletedOnly) filters.push(isNotNull(places.deletedAt));
  else filters.push(notDeleted);
  if (options.publishedOnly) filters.push(eq(places.isDraft, false));
  if (options.qualityFlag?.trim()) {
    filters.push(sql`${places.qualityFlags} @> ARRAY[${options.qualityFlag.trim()}]::text[]`);
  }
  if (q) {
    filters.push(
      or(
        ilike(places.name, `%${q}%`),
        ilike(places.tradition, `%${q}%`),
        ilike(places.address, `%${q}%`),
      )!,
    );
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(places)
      .where(where)
      .orderBy(places.name)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(places).where(where),
  ]);

  return {
    places: rows.map(rowToPlace),
    total: totalRow?.count ?? 0,
    page,
    pageSize,
  };
}

async function filterCachedExploreMarkers(
  options: ExplorePlaceSearchOptions,
): Promise<PlaceMarker[]> {
  const [markers, ontology] = await Promise.all([
    getCachedPlaceMarkers(),
    getOntologySnapshot(),
  ]);
  setOntologySnapshot(ontology);

  const placeFilters: PlaceFilters = {
    query: options.query ?? "",
    traditions: options.traditions ?? [],
    schools: options.schools ?? [],
    types: options.types ?? [],
    faiths: options.faiths ?? [],
  };

  let filtered = filterPlaces(markers, placeFilters);

  if (options.locationBounds) {
    filtered = filtered.filter((place) =>
      placeMatchesLocationFilter(
        place.lat,
        place.lng,
        place.address,
        {
          label: "",
          lat: options.locationLat ?? 0,
          lng: options.locationLng ?? 0,
          bounds: options.locationBounds!,
          matchTerms: options.locationMatchTerms,
        },
      ),
    );
  } else if (options.bounds) {
    filtered = filtered.filter((place) =>
      isPlaceInMapBounds(place.lat, place.lng, options.bounds!),
    );
  }

  return filtered;
}

/** Explore list search over cached slim markers (same filters as the map). */
export async function searchExplorePlaces(options: ExplorePlaceSearchOptions) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const filtered = await filterCachedExploreMarkers(options);

  const total = filtered.length;
  const offset = (page - 1) * pageSize;
  const pagePlaces = filtered.slice(offset, offset + pageSize);

  return {
    places: pagePlaces,
    total,
    page,
    pageSize,
  };
}

/** Hard cap so a continent-scale / zoomed-out query cannot ship the full catalog. */
const MAX_MAP_PINS = 1200;

/**
 * Viewport / filter-scoped map pins (no name/photo/address).
 * Same filter semantics as {@link searchExplorePlaces}.
 */
export async function searchExploreMapPins(options: ExplorePlaceSearchOptions) {
  const filtered = await filterCachedExploreMarkers(options);
  const total = filtered.length;

  let selected = filtered;
  if (selected.length > MAX_MAP_PINS) {
    const bounds = options.bounds ?? options.locationBounds;
    if (bounds) {
      const cLat = (bounds.north + bounds.south) / 2;
      const cLng = (bounds.east + bounds.west) / 2;
      selected = selected
        .map((place) => ({
          place,
          d:
            (place.lat - cLat) * (place.lat - cLat) +
            (place.lng - cLng) * (place.lng - cLng),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, MAX_MAP_PINS)
        .map((entry) => entry.place);
    } else {
      selected = selected.slice(0, MAX_MAP_PINS);
    }
  }

  const pins: ExploreMapPin[] = selected.map(placeMarkerToMapPin);
  return {
    markers: pins,
    total,
    truncated: total > pins.length,
  };
}

/** Single marker card for map popovers (name/photo/address). */
export async function getExplorePlaceCard(
  id: string,
): Promise<PlaceMarker | null> {
  const markers = await getCachedPlaceMarkers();
  return markers.find((marker) => marker.id === id) ?? null;
}

export async function getPublishRequestedCount() {
  const [row] = await db
    .select({ count: count() })
    .from(places)
    .where(
      and(
        notDeleted,
        sql`${places.publishRequestedAt} IS NOT NULL AND ${places.isDraft} = true`,
      ),
    );
  return row?.count ?? 0;
}

export async function getDraftPlacesCount() {
  const [row] = await db
    .select({ count: count() })
    .from(places)
    .where(and(eq(places.isDraft, true), notDeleted));
  return row?.count ?? 0;
}

export async function getDeletedPlacesCount() {
  const [row] = await db
    .select({ count: count() })
    .from(places)
    .where(isNotNull(places.deletedAt));
  return row?.count ?? 0;
}

export type DraftPlaceReview = Place & {
  ownerEmail: string | null;
  ownerName: string | null;
  createdAt: string;
};

function mapPlaceReviews(
  rows: {
    place: typeof places.$inferSelect;
    ownerEmail: string | null;
    ownerName: string | null;
  }[],
): DraftPlaceReview[] {
  const byId = new Map<string, DraftPlaceReview>();
  for (const row of rows) {
    if (byId.has(row.place.id)) continue;
    byId.set(row.place.id, {
      ...rowToPlace(row.place),
      ownerEmail: row.ownerEmail,
      ownerName: row.ownerName,
      createdAt: row.place.createdAt.toISOString(),
    });
  }
  return [...byId.values()];
}

/** Draft listings awaiting admin review / publish, newest and publish-requested first. */
export async function getDraftPlacesForReview(): Promise<DraftPlaceReview[]> {
  const rows = await db
    .select({
      place: places,
      ownerEmail: user.email,
      ownerName: user.name,
    })
    .from(places)
    .leftJoin(placeMemberships, eq(placeMemberships.placeId, places.id))
    .leftJoin(user, eq(user.id, placeMemberships.userId))
    .where(and(eq(places.isDraft, true), notDeleted))
    .orderBy(
      sql`CASE WHEN ${places.publishRequestedAt} IS NULL THEN 1 ELSE 0 END`,
      desc(places.publishRequestedAt),
      desc(places.createdAt),
    );

  return mapPlaceReviews(rows);
}

/** Soft-deleted listings retained for admin restore or permanent delete. */
export async function getDeletedPlacesForReview(): Promise<DraftPlaceReview[]> {
  const rows = await db
    .select({
      place: places,
      ownerEmail: user.email,
      ownerName: user.name,
    })
    .from(places)
    .leftJoin(placeMemberships, eq(placeMemberships.placeId, places.id))
    .leftJoin(user, eq(user.id, placeMemberships.userId))
    .where(isNotNull(places.deletedAt))
    .orderBy(desc(places.deletedAt));

  return mapPlaceReviews(rows);
}

export async function getSimilarPlaces(place: Place, limit = 4): Promise<Place[]> {
  const rows = await db
    .select()
    .from(places)
    .where(and(publishedOnly, sql`${places.id} <> ${place.id}`))
    .orderBy(
      sql`CASE WHEN ${places.tradition} = ${place.tradition} THEN 0 ELSE 1 END`,
      sql`ABS(${places.lat} - ${place.lat}) + ABS(${places.lng} - ${place.lng})`,
    )
    .limit(limit);

  return rows.map(rowToPlace);
}

export { rowToPlace } from "@/lib/place-row";
