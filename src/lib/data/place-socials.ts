import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { placeSocials } from "@/db/schema";
import type { PlaceSocial } from "@/types/place";
import type { PlaceSocialInput } from "@/lib/validations/place-profile";

function rowToPlaceSocial(row: typeof placeSocials.$inferSelect): PlaceSocial {
  return {
    id: row.id,
    placeId: row.placeId,
    platform: row.platform,
    url: row.url,
    label: row.label ?? undefined,
    sortOrder: row.sortOrder,
  };
}

export async function getPlaceSocials(placeId: string): Promise<PlaceSocial[]> {
  const rows = await db
    .select()
    .from(placeSocials)
    .where(eq(placeSocials.placeId, placeId))
    .orderBy(asc(placeSocials.sortOrder), asc(placeSocials.id));

  return rows.map(rowToPlaceSocial);
}

export async function replacePlaceSocials(
  placeId: string,
  input: PlaceSocialInput[],
): Promise<PlaceSocial[]> {
  const existing = await db
    .select({ id: placeSocials.id })
    .from(placeSocials)
    .where(eq(placeSocials.placeId, placeId));
  const existingIds = new Set(existing.map((row) => row.id));
  const keepIds = new Set(
    input.map((row) => row.id).filter((id): id is number => typeof id === "number"),
  );

  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    await db.delete(placeSocials).where(inArray(placeSocials.id, toDelete));
  }

  const now = new Date();
  for (const [index, social] of input.entries()) {
    const values = {
      placeId,
      platform: social.platform,
      url: social.url,
      label: social.platform === "other" ? social.label : null,
      sortOrder: social.sortOrder ?? index,
      updatedAt: now,
    };

    if (social.id && existingIds.has(social.id)) {
      await db.update(placeSocials).set(values).where(eq(placeSocials.id, social.id));
    } else {
      await db.insert(placeSocials).values(values);
    }
  }

  return getPlaceSocials(placeId);
}
