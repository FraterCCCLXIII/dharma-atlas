import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/geocode";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({
    key: `geocode-search:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 3) {
    return NextResponse.json({ locations: [] });
  }

  try {
    const locations = await searchLocations(query, 5);
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ locations: [] });
  }
}
