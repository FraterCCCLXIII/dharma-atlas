import "server-only";

import { count, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import type { Place, Faith, PlaceType } from "@/types/place";

function rowToPlace(row: typeof places.$inferSelect): Place {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    tradition: row.tradition,
    faith: row.faith as Faith,
    type: row.type as PlaceType,
    folder: row.folder,
    address: row.address,
    phone: row.phone,
    website: row.website,
    schools: row.schools.length ? row.schools : undefined,
  };
}

export async function getPlacesCount() {
  const [row] = await db.select({ count: count() }).from(places);
  return row?.count ?? 0;
}

export async function getAllPlaces(): Promise<Place[]> {
  const rows = await db.select().from(places).orderBy(places.name);
  return rows.map(rowToPlace);
}

export async function getAllPlaceIds(): Promise<string[]> {
  const rows = await db.select({ id: places.id }).from(places);
  return rows.map((r) => r.id);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const [row] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  return row ? rowToPlace(row) : null;
}

export async function searchPlaces(options: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;
  const q = options.query?.trim();

  const where = q
    ? or(
        ilike(places.name, `%${q}%`),
        ilike(places.tradition, `%${q}%`),
        ilike(places.address, `%${q}%`),
      )
    : undefined;

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

export { rowToPlace };
