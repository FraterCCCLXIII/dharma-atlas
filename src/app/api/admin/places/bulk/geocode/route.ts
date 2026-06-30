import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-server";
import { geocodeAddress, hasValidCoords, mergeQualityFlag, withoutQualityFlag } from "@/lib/geocode";
import { getPlaceById } from "@/lib/data/places";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  await requireAdminSession();

  const body = (await request.json()) as { placeIds?: string[] };
  const placeIds = body.placeIds ?? [];
  if (placeIds.length === 0) {
    return NextResponse.json({ error: "No places selected" }, { status: 400 });
  }

  const results: { id: string; ok: boolean; lat?: number; lng?: number }[] = [];

  for (const id of placeIds) {
    const place = await getPlaceById(id, { includeDrafts: true });
    if (!place?.address?.trim()) {
      results.push({ id, ok: false });
      continue;
    }

    const geocoded = await geocodeAddress(place.address.trim());
    if (!geocoded || !hasValidCoords(geocoded.lat, geocoded.lng)) {
      const flags = mergeQualityFlag(place.qualityFlags ?? [], "missing_coords");
      await db
        .update(places)
        .set({ qualityFlags: flags, updatedAt: new Date() })
        .where(eq(places.id, id));
      results.push({ id, ok: false });
      continue;
    }

    const flags = withoutQualityFlag(place.qualityFlags ?? [], "missing_coords");
    await db
      .update(places)
      .set({
        lat: geocoded.lat,
        lng: geocoded.lng,
        coordPrecision: "address",
        qualityFlags: flags,
        updatedAt: new Date(),
      })
      .where(eq(places.id, id));
    results.push({ id, ok: true, lat: geocoded.lat, lng: geocoded.lng });
  }

  return NextResponse.json({ results });
}
