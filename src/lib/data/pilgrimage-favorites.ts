import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { pilgrimageFavorites } from "@/db/schema";
import {
  getPilgrimageRoute,
  getPilgrimageSite,
  type PilgrimageRoute,
  type PilgrimageSite,
} from "@/data/pilgrimage";
import {
  pilgrimageFavoriteKey,
  type PilgrimageFavoriteKind,
  type PilgrimageFavoriteRef,
} from "@/lib/pilgrimage-favorite-key";

export type { PilgrimageFavoriteKind, PilgrimageFavoriteRef };
export { pilgrimageFavoriteKey };

export async function listPilgrimageFavoriteRefs(
  userId: string,
): Promise<PilgrimageFavoriteRef[]> {
  const rows = await db
    .select({
      kind: pilgrimageFavorites.kind,
      slug: pilgrimageFavorites.slug,
    })
    .from(pilgrimageFavorites)
    .where(eq(pilgrimageFavorites.userId, userId))
    .orderBy(desc(pilgrimageFavorites.createdAt));

  return rows
    .filter(
      (row): row is PilgrimageFavoriteRef =>
        row.kind === "site" || row.kind === "route",
    )
    .map((row) => ({ kind: row.kind, slug: row.slug }));
}

export async function listPilgrimageFavoriteKeys(
  userId: string,
): Promise<string[]> {
  const refs = await listPilgrimageFavoriteRefs(userId);
  return refs.map((ref) => pilgrimageFavoriteKey(ref.kind, ref.slug));
}

export async function getFavoritePilgrimageEntries(userId: string): Promise<{
  sites: PilgrimageSite[];
  routes: PilgrimageRoute[];
}> {
  const refs = await listPilgrimageFavoriteRefs(userId);
  const sites: PilgrimageSite[] = [];
  const routes: PilgrimageRoute[] = [];

  for (const ref of refs) {
    if (ref.kind === "site") {
      const site = getPilgrimageSite(ref.slug);
      if (site) sites.push(site);
    } else {
      const route = getPilgrimageRoute(ref.slug);
      if (route) routes.push(route);
    }
  }

  return { sites, routes };
}

export async function addPilgrimageFavorite(
  userId: string,
  kind: PilgrimageFavoriteKind,
  slug: string,
): Promise<void> {
  await db
    .insert(pilgrimageFavorites)
    .values({ userId, kind, slug })
    .onConflictDoNothing({
      target: [
        pilgrimageFavorites.userId,
        pilgrimageFavorites.kind,
        pilgrimageFavorites.slug,
      ],
    });
}

export async function removePilgrimageFavorite(
  userId: string,
  kind: PilgrimageFavoriteKind,
  slug: string,
): Promise<void> {
  await db
    .delete(pilgrimageFavorites)
    .where(
      and(
        eq(pilgrimageFavorites.userId, userId),
        eq(pilgrimageFavorites.kind, kind),
        eq(pilgrimageFavorites.slug, slug),
      ),
    );
}
