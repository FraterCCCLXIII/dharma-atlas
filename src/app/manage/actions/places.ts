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
import {
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
    website: data.website ?? null,
    description: data.description ?? null,
    schools: [],
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

  await db
    .update(places)
    .set({
      name: data.name,
      type: data.type,
      tradition: data.tradition,
      address: data.address,
      phone: data.phone ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
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
  revalidatePath("/locations");
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
