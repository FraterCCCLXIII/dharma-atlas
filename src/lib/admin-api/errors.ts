import { ZodError } from "zod";

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof AdminApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return Response.json({ error: "Validation failed", details: error.flatten() }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return Response.json({ error: message }, { status: 500 });
}
