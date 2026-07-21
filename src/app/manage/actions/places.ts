"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { createMembership } from "@/lib/data/memberships";
import { getPlaceById } from "@/lib/data/places";
import { requirePlaceAccess } from "@/lib/place-access";
import {
  geocodeAddress,
  hasValidCoords,
  mergeQualityFlag,
  withoutQualityFlag,
} from "@/lib/geocode";
import { revalidateExploreMarkers } from "@/lib/admin-api/revalidate";
import { getSubschoolLabelMap } from "@/lib/schools";
import {
  filterKnownSchools,
  memberCreatePlaceSchema,
  ownerPlaceEditSchema,
  type MemberCreatePlaceInput,
  type OwnerPlaceEditInput,
} from "@/lib/validations/owner-place";

function generatePlaceId() {
  return randomBytes(6).toString("hex");
}

async function resolveCoords(address: string, city: string) {
  const query = [address, city].filter(Boolean).join(", ");
  const geocoded = await geocodeAddress(query);
  return geocoded ?? { lat: 0, lng: 0 };
}

export async function createMemberPlaceAction(input: MemberCreatePlaceInput) {
  const session = await requireSession();
  const data = memberCreatePlaceSchema.parse(input);
  const placeId = generatePlaceId();
  const fullAddress = [data.address, data.city].filter(Boolean).join(", ");
  const { lat, lng } = await resolveCoords(data.address ?? "", data.city ?? "");
  const qualityFlags = hasValidCoords(lat, lng) ? [] : ["missing_coords"];

  const schools = filterKnownSchools(data.schools ?? []);
  const hoursText = data.hoursText?.trim();

  await db.insert(places).values({
    id: placeId,
    name: data.name,
    lat,
    lng,
    tradition: data.tradition,
    faith: data.faith,
    type: data.type,
    folder: "Member submissions",
    address: fullAddress,
    phone: data.phone ?? null,
    website: data.website ?? null,
    description: data.description ?? null,
    schools,
    openingHours: hoursText
      ? JSON.stringify({
          weekdayDescriptions: hoursText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        })
      : null,
    isDraft: true,
    dataSource: "member_created",
    qualityFlags,
    coordPrecision: hasValidCoords(lat, lng) ? "address" : "unknown",
  });

  await createMembership({
    userId: session.user.id,
    placeId,
  });

  revalidatePath("/manage");
  redirect(`/manage/places/${placeId}/edit`);
}

export async function updateOwnerPlaceAction(placeId: string, input: OwnerPlaceEditInput) {
  await requirePlaceAccess(placeId);
  const data = ownerPlaceEditSchema.parse(input);
  const existing = await getPlaceById(placeId, { includeDrafts: true });
  if (!existing) throw new Error("Place not found");

  const addressChanged = data.address.trim() !== (existing.address?.trim() ?? "");
  let lat = existing.lat;
  let lng = existing.lng;
  let qualityFlags = [...(existing.qualityFlags ?? [])];
  let coordPrecision = existing.coordPrecision ?? "unknown";

  if (addressChanged) {
    const geocoded = await geocodeAddress(data.address.trim());
    if (geocoded) {
      lat = geocoded.lat;
      lng = geocoded.lng;
      coordPrecision = "address";
      qualityFlags = withoutQualityFlag(qualityFlags, "missing_coords");
    } else {
      qualityFlags = mergeQualityFlag(qualityFlags, "missing_coords");
    }
  }

  const schools = filterKnownSchools(data.schools ?? []);
  const knownSlugs = new Set(Object.keys(getSubschoolLabelMap()));
  // Preserve admin-only custom school slugs members cannot select.
  const customSlugs = (existing.schools ?? []).filter((slug) => !knownSlugs.has(slug));

  await db
    .update(places)
    .set({
      name: data.name,
      type: data.type,
      faith: data.faith,
      tradition: data.tradition,
      address: data.address,
      phone: data.phone ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
      schools: [...schools, ...customSlugs].sort(),
      ...(data.hoursText !== undefined
        ? {
            openingHours: data.hoursText?.trim()
              ? JSON.stringify({
                  weekdayDescriptions: data.hoursText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              : null,
          }
        : {}),
      lat,
      lng,
      qualityFlags,
      coordPrecision,
      updatedAt: new Date(),
    })
    .where(eq(places.id, placeId));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${placeId}`);
  revalidatePath("/manage");
  revalidatePath(`/manage/places/${placeId}/edit`);
  redirect("/manage");
}

export async function requestPublishAction(placeId: string) {
  await requirePlaceAccess(placeId);
  await db
    .update(places)
    .set({ publishRequestedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, placeId));
  revalidatePath("/manage");
  redirect("/manage");
}

/** Soft-delete: hides from public/manage; admin can restore or permanently delete. */
export async function deleteMemberPlaceAction(placeId: string) {
  await requirePlaceAccess(placeId);

  await db
    .update(places)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, placeId));

  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${placeId}`);
  revalidatePath("/manage");
  revalidatePath("/admin/places");
  revalidatePath("/admin/location-reviews");
  revalidateExploreMarkers();
  redirect("/manage");
}
