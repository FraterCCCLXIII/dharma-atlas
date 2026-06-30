import "server-only";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(options: {
  key: string;
  limit?: number;
  windowMs?: number;
}): { allowed: boolean; retryAfterMs: number } {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const entry = buckets.get(options.key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimitResponse(retryAfterMs: number) {
  return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
    },
  });
}
