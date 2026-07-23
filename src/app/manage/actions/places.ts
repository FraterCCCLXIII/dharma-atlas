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
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";
import {
  allocateUniquePlaceSlug,
  assertUniquePlaceSlug,
} from "@/lib/data/place-slugs";
import { coordPrecisionForMode } from "@/lib/place-location";
import { getSubschoolLabelMap } from "@/lib/schools";
import { safeOwnerPlaceReturnTo } from "@/lib/manage-place";
import {
  filterKnownOfferings,
  filterKnownSchools,
  memberCreatePlaceSchema,
  ownerPlaceEditSchema,
  type MemberCreatePlaceInput,
  type OwnerPlaceEditInput,
} from "@/lib/validations/owner-place";

export type UpdateOwnerPlaceResult = { ok: true };

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
  const locationMode = data.locationMode;
  const street = data.address.trim();
  const city = data.city.trim();
  const fullAddress =
    locationMode === "online"
      ? city || street
      : locationMode === "area"
        ? city || street
        : [street, city].filter(Boolean).join(", ");

  let lat = 0;
  let lng = 0;
  if (locationMode !== "online") {
    const geocodeQuery =
      locationMode === "area" ? city || street : [street, city].filter(Boolean).join(", ");
    const coords = await resolveCoords(
      locationMode === "area" ? "" : street,
      locationMode === "area" ? geocodeQuery : city,
    );
    lat = coords.lat;
    lng = coords.lng;
  }

  const qualityFlags = hasValidCoords(lat, lng) ? [] : ["missing_coords"];
  const schools = filterKnownSchools(data.schools ?? []);
  const hoursText = data.hoursText?.trim();
  const slug = await allocateUniquePlaceSlug({
    name: data.name,
    city,
    address: fullAddress,
    fallbackId: placeId,
  });

  await db.insert(places).values({
    id: placeId,
    slug,
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
    locationMode,
    coordPrecision: hasValidCoords(lat, lng)
      ? coordPrecisionForMode(locationMode)
      : "unknown",
  });

  await createMembership({
    userId: session.user.id,
    placeId,
  });

  revalidatePath("/manage");
  redirect(`/manage/places/${placeId}/edit/details`);
}

export async function updateOwnerPlaceAction(
  placeId: string,
  input: OwnerPlaceEditInput,
): Promise<UpdateOwnerPlaceResult> {
  await requirePlaceAccess(placeId);
  const data = ownerPlaceEditSchema.parse(input);
  const existing = await getPlaceById(placeId, { includeDrafts: true });
  if (!existing) throw new Error("Place not found");

  const locationMode = data.locationMode;
  const addressChanged =
    data.address.trim() !== (existing.address?.trim() ?? "") ||
    locationMode !== (existing.locationMode ?? "venue");
  let lat = existing.lat;
  let lng = existing.lng;
  let qualityFlags = [...(existing.qualityFlags ?? [])];
  let coordPrecision = coordPrecisionForMode(locationMode);

  if (locationMode === "online") {
    lat = 0;
    lng = 0;
    coordPrecision = "unknown";
    qualityFlags = mergeQualityFlag(qualityFlags, "missing_coords");
  } else if (addressChanged && data.address.trim()) {
    const geocoded = await geocodeAddress(data.address.trim());
    if (geocoded) {
      lat = geocoded.lat;
      lng = geocoded.lng;
      coordPrecision = coordPrecisionForMode(locationMode);
      qualityFlags = withoutQualityFlag(qualityFlags, "missing_coords");
    } else {
      qualityFlags = mergeQualityFlag(qualityFlags, "missing_coords");
      coordPrecision = "unknown";
    }
  }

  const schools = filterKnownSchools(data.schools ?? []);
  const offerings = filterKnownOfferings(data.offerings ?? []);
  const knownSlugs = new Set(Object.keys(getSubschoolLabelMap()));
  // Preserve admin-only custom school slugs members cannot select.
  const customSlugs = (existing.schools ?? []).filter((slug) => !knownSlugs.has(slug));
  const previousSlug = existing.slug;
  const slug = await assertUniquePlaceSlug(data.slug, placeId);

  await db
    .update(places)
    .set({
      name: data.name,
      slug,
      type: data.type,
      faith: data.faith,
      tradition: data.tradition,
      locationMode,
      address: data.address,
      phone: data.phone ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
      notice: data.notice ?? null,
      schools: [...schools, ...customSlugs].sort(),
      offerings,
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

  revalidatePlacePaths(placeId, slug, previousSlug);
  revalidatePath("/manage");
  revalidatePath(`/manage/places/${placeId}/edit`, "layout");
  return { ok: true };
}

export async function requestPublishAction(
  placeId: string,
  options?: { returnTo?: string },
) {
  await requirePlaceAccess(placeId);
  await db
    .update(places)
    .set({ publishRequestedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, placeId));
  revalidatePath("/manage");
  revalidatePath(`/manage/places/${placeId}/edit`, "layout");
  redirect(safeOwnerPlaceReturnTo(placeId, options?.returnTo));
}

/** Soft-delete: hides from public/manage; admin can restore or permanently delete. */
export async function deleteMemberPlaceAction(placeId: string) {
  await requirePlaceAccess(placeId);

  await db
    .update(places)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(places.id, placeId));

  revalidatePlacePaths(placeId);
  revalidatePath("/manage");
  revalidatePath("/admin/location-reviews");
  redirect("/manage");
}
