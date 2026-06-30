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
  memberCreatePlaceSchema,
  ownerPlaceEditSchema,
  type MemberCreatePlaceInput,
  type OwnerPlaceEditInput,
} from "@/lib/validations/owner-place";

function generatePlaceId() {
  return randomBytes(6).toString("hex");
}

export async function createMemberPlaceAction(input: MemberCreatePlaceInput) {
  const session = await requireSession();
  const data = memberCreatePlaceSchema.parse(input);
  const placeId = generatePlaceId();

  await db.insert(places).values({
    id: placeId,
    name: data.name,
    lat: 0,
    lng: 0,
    tradition: data.tradition,
    faith: data.faith,
    type: data.type,
    folder: "Member submissions",
    address: [data.address, data.city].filter(Boolean).join(", "),
    website: data.website ?? null,
    description: data.description ?? null,
    schools: [],
    isDraft: true,
    dataSource: "member_created",
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

  await db
    .update(places)
    .set({
      name: data.name,
      address: data.address,
      phone: data.phone ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
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
