import { isRedirectError } from "next/dist/client/components/redirect-error";

/** Re-throw Next.js redirect/navigation control-flow errors from try/catch. */
export function rethrowNextNavigation(error: unknown): void {
  if (isRedirectError(error)) throw error;
}
