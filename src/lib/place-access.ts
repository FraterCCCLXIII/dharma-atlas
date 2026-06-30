import "server-only";

import { getMembership } from "@/lib/data/memberships";
import { getSession, requireSession } from "@/lib/auth-server";
import { isAdminRole } from "@/lib/permissions";

export async function canEditPlace(userId: string, role: string | null | undefined, placeId: string) {
  if (isAdminRole(role)) return true;
  const membership = await getMembership(userId, placeId);
  return Boolean(membership);
}

export async function requirePlaceAccess(placeId: string) {
  const session = await requireSession();
  const allowed = await canEditPlace(session.user.id, session.user.role, placeId);
  if (!allowed) throw new Error("Forbidden");
  return session;
}

export async function getOptionalSession() {
  return getSession();
}
