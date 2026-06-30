import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/data/places";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({ key: `places-search:${ip}`, limit: 60 });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  if (!query.trim()) {
    return NextResponse.json({ places: [], total: 0 });
  }

  const result = await searchPlaces({
    query,
    page: Number.isFinite(page) ? page : 1,
    pageSize: 10,
    publishedOnly: true,
  });

  return NextResponse.json({
    places: result.places.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      tradition: place.tradition,
      type: place.type,
    })),
    total: result.total,
  });
}
