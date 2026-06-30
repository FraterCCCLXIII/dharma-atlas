import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { roles, statement, type AppRole } from "@/lib/permissions";

type Resource = keyof typeof statement;
type Action<R extends Resource> = (typeof statement)[R][number];

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function roleOf(role: string | null | undefined): AppRole {
  if (role === "owner") return "owner";
  if (role === "editor") return "editor";
  return "member";
}

export async function requirePermission<R extends Resource>(
  resource: R,
  action: Action<R>,
) {
  const session = await requireSession();
  const role = roleOf(session.user.role);
  const result = roles[role].authorize({ [resource]: [action] } as never);
  if (!result.success) throw new Error("Forbidden");
  return session;
}
