"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { requirePermission } from "@/lib/auth-server";
import { placeInputSchema, type PlaceInput } from "@/lib/validations/place";

function placeRow(input: PlaceInput) {
  return {
    id: input.id,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    tradition: input.tradition,
    faith: input.faith,
    type: input.type,
    folder: input.folder,
    address: input.address,
    phone: input.phone ?? null,
    website: input.website ?? null,
    schools: input.schools,
    isDraft: input.isDraft,
    updatedAt: new Date(),
  };
}

export async function createPlaceAction(input: PlaceInput) {
  await requirePermission("place", "create");
  const data = placeInputSchema.parse(input);

  await db.insert(places).values(placeRow(data));

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/place/${data.id}`);
  revalidatePath("/admin/places");
  redirect(`/admin/places/${data.id}/edit`);
}

export async function updatePlaceAction(originalId: string, input: PlaceInput) {
  await requirePermission("place", "update");
  const data = placeInputSchema.parse(input);

  await db.update(places).set(placeRow(data)).where(eq(places.id, originalId));

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/place/${originalId}`);
  revalidatePath(`/place/${data.id}`);
  revalidatePath("/admin/places");
  redirect("/admin/places");
}

export async function deletePlaceAction(id: string) {
  await requirePermission("place", "delete");
  await db.delete(places).where(eq(places.id, id));

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/admin/places");
  redirect("/admin/places");
}
