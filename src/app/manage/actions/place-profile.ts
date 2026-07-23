"use server";

import { randomBytes } from "node:crypto";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { teachers } from "@/db/schema";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";
import { requireSession } from "@/lib/auth-server";
import { getPlaceEvents, replacePlaceEvents } from "@/lib/data/place-events";
import { getPlaceById } from "@/lib/data/places";
import {
  getPlaceSocials,
  replacePlaceSocials,
} from "@/lib/data/place-socials";
import {
  getPlaceTeachers,
  replacePlaceTeachers,
} from "@/lib/data/place-teachers";
import { canEditPlace } from "@/lib/place-access";
import {
  deleteLocalPlacePhoto,
  PLACE_PHOTO_MAX_BYTES,
  resolveImageContentType,
  saveLocalPlacePhoto,
} from "@/lib/place-photo-files";
import { roles, type AppRole } from "@/lib/permissions";
import {
  placeEventsReplaceSchema,
  placeSocialsReplaceSchema,
  placeTeachersReplaceSchema,
  type PlaceEventInput,
  type PlaceSocialInput,
  type PlaceTeacherInput,
} from "@/lib/validations/place-profile";

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

async function assertTeacherSlugsExist(slugs: (string | null | undefined)[]) {
  const unique = [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))];
  if (unique.length === 0) return;

  const rows = await db
    .select({ slug: teachers.slug })
    .from(teachers)
    .where(inArray(teachers.slug, unique));
  const found = new Set(rows.map((row) => row.slug));
  const missing = unique.filter((slug) => !found.has(slug));
  if (missing.length > 0) {
    throw new Error(
      `Unknown teacher profile slug${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Leave blank if there is no profile yet.`,
    );
  }
}

export async function listPlaceTeachersAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  return getPlaceTeachers(placeId);
}

export async function savePlaceTeachersAction(
  placeId: string,
  teachersInput: PlaceTeacherInput[],
) {
  await requirePlaceProfilePermission(placeId);
  const data = placeTeachersReplaceSchema.parse({ teachers: teachersInput });
  await assertTeacherSlugsExist(data.teachers.map((t) => t.teacherSlug));
  const saved = await replacePlaceTeachers(placeId, data.teachers);
  await revalidatePlace(placeId);
  return saved;
}

export async function listPlaceEventsAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  return getPlaceEvents(placeId);
}

export async function savePlaceEventsAction(
  placeId: string,
  eventsInput: PlaceEventInput[],
) {
  await requirePlaceProfilePermission(placeId);
  const data = placeEventsReplaceSchema.parse({ events: eventsInput });
  const saved = await replacePlaceEvents(placeId, data.events);
  await revalidatePlace(placeId);
  return saved;
}

export async function listPlaceSocialsAction(placeId: string) {
  await requirePlaceProfilePermission(placeId);
  return getPlaceSocials(placeId);
}

export async function savePlaceSocialsAction(
  placeId: string,
  socialsInput: PlaceSocialInput[],
) {
  await requirePlaceProfilePermission(placeId);
  const data = placeSocialsReplaceSchema.parse({ socials: socialsInput });
  const saved = await replacePlaceSocials(placeId, data.socials);
  await revalidatePlace(placeId);
  return saved;
}

export async function uploadPlaceTeacherImageAction(placeId: string, formData: FormData) {
  await requirePlaceProfilePermission(placeId);

  const normalizedId = placeId.trim();
  if (!normalizedId) throw new Error("Place ID is required before uploading a photo.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }
  if (file.size > PLACE_PHOTO_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveImageContentType(buffer, file.type);
  const fileKey = `teacher-${randomBytes(4).toString("hex")}`;
  const path = saveLocalPlacePhoto(normalizedId, fileKey, buffer, contentType);
  return { path };
}

export async function deletePlaceTeacherImageAction(placeId: string, path: string) {
  await requirePlaceProfilePermission(placeId);
  if (!path.startsWith(`/places/${placeId.trim()}-teacher-`)) {
    throw new Error("Not a place teacher image.");
  }
  deleteLocalPlacePhoto(path);
}
