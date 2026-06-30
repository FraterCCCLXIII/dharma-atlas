import "server-only";

import { count, eq, ilike, or, and, sql, type SQL } from "drizzle-orm";
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
  qualityFlag?: string;
}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;
  const q = options.query?.trim();

  const filters: SQL[] = [];
  if (options.publishedOnly) filters.push(publishedOnly);
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

export async function getPublishRequestedCount() {
  const [row] = await db
    .select({ count: count() })
    .from(places)
    .where(sql`${places.publishRequestedAt} IS NOT NULL AND ${places.isDraft} = true`);
  return row?.count ?? 0;
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
