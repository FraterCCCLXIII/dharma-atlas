import { assertAdminApiKey } from "@/lib/admin-api/auth";
import { apiErrorResponse } from "@/lib/admin-api/errors";

export async function withAdminApiAuth(
  request: Request,
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    assertAdminApiKey(request);
    return await handler();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
