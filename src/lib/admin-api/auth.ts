import { AdminApiError } from "@/lib/admin-api/errors";

export function getAdminApiKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return request.headers.get("x-admin-api-key")?.trim() ?? null;
}

export function assertAdminApiKey(request: Request): void {
  const expected = process.env.ADMIN_API_KEY?.trim();
  if (!expected) {
    throw new AdminApiError(
      503,
      "ADMIN_API_KEY is not configured on the server.",
    );
  }

  const provided = getAdminApiKey(request);
  if (!provided || provided !== expected) {
    throw new AdminApiError(403, "Forbidden");
  }
}
