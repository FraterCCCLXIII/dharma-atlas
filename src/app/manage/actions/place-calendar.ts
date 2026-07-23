"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";
import { requireSession } from "@/lib/auth-server";
import {
  connectAndSyncIcsSource,
  disconnectIcsSource,
  getPlaceIcsSource,
  importEventsFromCsv,
  syncExistingIcsSource,
} from "@/lib/data/place-calendar-import";
import { getPlaceById } from "@/lib/data/places";
import { canEditPlace } from "@/lib/place-access";
import { roles, type AppRole } from "@/lib/permissions";

async function requirePlaceProfilePermission(placeId: string) {
  const session = await requireSession();
  const role: AppRole = session.user.role === "owner" ? "owner" : "editor";
  const adminUpdate = roles[role].authorize({ place: ["update"] }).success;
  const ownerAccess = await canEditPlace(session.user.id, session.user.role, placeId);

  if (!adminUpdate && !ownerAccess) {
    throw new Error("Forbidden");
  }

  return session;
}

async function revalidatePlace(placeId: string) {
  const place = await getPlaceById(placeId, { includeDrafts: true });
  revalidatePlacePaths(placeId, place?.slug);
  revalidatePath(`/manage/places/${placeId}/edit`, "layout");
}

const icsUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid calendar URL")
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Calendar URL must start with http:// or https://",
  });

export async function getPlaceIcsSourceAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  return getPlaceIcsSource(placeId);
}

export async function connectIcsCalendarAction(placeId: string, url: string) {
  await requirePlaceProfilePermission(placeId);
  const parsed = icsUrlSchema.safeParse(url);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Enter a valid calendar URL");
  }
  const result = await connectAndSyncIcsSource(placeId, parsed.data);
  await revalidatePlace(placeId);
  return result;
}

export async function syncIcsCalendarAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  const result = await syncExistingIcsSource(placeId);
  await revalidatePlace(placeId);
  return result;
}

export async function disconnectIcsCalendarAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  await disconnectIcsSource(placeId);
  await revalidatePlace(placeId);
}

export async function importEventsCsvAction(placeId: string, csvText: string) {
  await requirePlaceProfilePermission(placeId);
  const trimmed = csvText.trim();
  if (!trimmed) throw new Error("Paste or upload a CSV first.");
  if (trimmed.length > 500_000) {
    throw new Error("CSV is too large (max about 500 KB).");
  }
  const result = await importEventsFromCsv(placeId, trimmed);
  await revalidatePlace(placeId);
  return result;
}
