import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { claims, user } from "@/db/schema";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface Claim {
  id: number;
  userId: string;
  userEmail: string;
  userName: string;
  placeId: string | null;
  placeName: string;
  listingUrl: string | null;
  affiliationRole: string;
  message: string;
  status: ClaimStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

function rowToClaim(
  row: typeof claims.$inferSelect,
  userRow: { email: string; name: string },
): Claim {
  return {
    id: row.id,
    userId: row.userId,
    userEmail: userRow.email,
    userName: userRow.name,
    placeId: row.placeId,
    placeName: row.placeName,
    listingUrl: row.listingUrl,
    affiliationRole: row.affiliationRole,
    message: row.message,
    status: row.status as ClaimStatus,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}

export async function getPendingClaimsCount() {
  const [row] = await db
    .select({ count: count() })
    .from(claims)
    .where(eq(claims.status, "pending"));
  return row?.count ?? 0;
}

export async function getClaims(status?: ClaimStatus): Promise<Claim[]> {
  const query = db
    .select({ claim: claims, user })
    .from(claims)
    .innerJoin(user, eq(claims.userId, user.id))
    .orderBy(desc(claims.createdAt));

  const rows = status
    ? await query.where(eq(claims.status, status))
    : await query;

  return rows.map((row) => rowToClaim(row.claim, row.user));
}

export async function getClaimById(id: number): Promise<Claim | null> {
  const [row] = await db
    .select({ claim: claims, user })
    .from(claims)
    .innerJoin(user, eq(claims.userId, user.id))
    .where(eq(claims.id, id))
    .limit(1);

  return row ? rowToClaim(row.claim, row.user) : null;
}

export async function getPendingClaimForUserPlace(userId: string, placeId: string) {
  const [row] = await db
    .select()
    .from(claims)
    .where(
      and(
        eq(claims.userId, userId),
        eq(claims.placeId, placeId),
        eq(claims.status, "pending"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createClaim(data: {
  userId: string;
  placeId?: string;
  placeName: string;
  listingUrl?: string;
  affiliationRole: string;
  message: string;
}) {
  if (data.placeId) {
    const existing = await getPendingClaimForUserPlace(data.userId, data.placeId);
    if (existing) {
      throw new Error("You already have a pending claim for this location.");
    }
  }

  const [row] = await db
    .insert(claims)
    .values({
      userId: data.userId,
      placeId: data.placeId ?? null,
      placeName: data.placeName,
      listingUrl: data.listingUrl ?? null,
      affiliationRole: data.affiliationRole,
      message: data.message,
      status: "pending",
    })
    .returning();

  return row!;
}

export async function updateClaimStatus(
  id: number,
  status: ClaimStatus,
  reviewedBy: string,
) {
  await db
    .update(claims)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
    })
    .where(eq(claims.id, id));
}
