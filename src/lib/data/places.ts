import "server-only";

import { count, eq, ilike, or, and, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { attachPhotosToPlace } from "@/lib/data/place-photos";
import { rowToPlace } from "@/lib/place-row";
import type { Place } from "@/types/place";

const publishedOnly = eq(places.isDraft, false);

export async function getPlacesCount() {
  const [row] = await db.select({ count: count() }).from(places);
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

export async function getAllPlacesForAdmin(): Promise<Place[]> {
  const rows = await db.select().from(places).orderBy(places.name);
  return rows.map(rowToPlace);
}

export async function getAllPlaceIds(): Promise<string[]> {
  const rows = await db
    .select({ id: places.id })
    .from(places)
    .where(publishedOnly);
  return rows.map((r) => r.id);
}

export async function getPlaceById(
  id: string,
  options?: { includeDrafts?: boolean },
): Promise<Place | null> {
  const [row] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!row) return null;
  if (row.isDraft && !options?.includeDrafts) return null;
  return attachPhotosToPlace(rowToPlace(row));
}

export async function searchPlaces(options: {
  query?: string;
  page?: number;
  pageSize?: number;
  publishedOnly?: boolean;
}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;
  const q = options.query?.trim();

  const filters: SQL[] = [];
  if (options.publishedOnly) filters.push(publishedOnly);
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

export async function getSimilarPlaces(place: Place, limit = 4): Promise<Place[]> {
  const all = await getAllPlaces();
  return all
    .filter((candidate) => candidate.id !== place.id)
    .sort((a, b) => {
      const aSameTradition = a.tradition === place.tradition ? 0 : 1;
      const bSameTradition = b.tradition === place.tradition ? 0 : 1;
      if (aSameTradition !== bSameTradition) return aSameTradition - bSameTradition;

      const aSameType = a.type === place.type ? 0 : 1;
      const bSameType = b.type === place.type ? 0 : 1;
      if (aSameType !== bSameType) return aSameType - bSameType;

      return distanceKm(place, a) - distanceKm(place, b);
    })
    .slice(0, limit);
}

function distanceKm(a: Place, b: Place): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export { rowToPlace } from "@/lib/place-row";
