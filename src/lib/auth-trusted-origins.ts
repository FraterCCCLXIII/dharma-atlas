/**
 * Trusted Origin helpers for Better Auth CSRF checks.
 *
 * Credential POSTs send the browser Origin; production often serves both the
 * apex and www host, so we always trust the sibling of BETTER_AUTH_URL.
 */

/**
 * Build the trustedOrigins list for Better Auth.
 *
 * Always includes local dev hosts. When baseURL is a public host, also includes
 * its www/apex sibling so neither Origin is rejected with INVALID_ORIGIN.
 */
export function buildTrustedOrigins(baseURL: string | undefined): string[] {
  const origins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  if (!baseURL) return [...origins];

  try {
    const url = new URL(baseURL);
    origins.add(url.origin);

    const { hostname } = url;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return [...origins];
    }

    const siblingHost = hostname.startsWith("www.")
      ? hostname.slice(4)
      : `www.${hostname}`;
    origins.add(`${url.protocol}//${siblingHost}`);
  } catch {
    origins.add(baseURL);
  }

  return [...origins];
}
