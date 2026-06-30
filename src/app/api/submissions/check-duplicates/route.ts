import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/data/places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";
  const location = searchParams.get("location")?.trim() ?? "";
  const q = [name, location].filter(Boolean).join(" ");
  if (q.length < 2) {
    return NextResponse.json({ matches: [] });
  }

  const result = await searchPlaces({
    query: q,
    page: 1,
    pageSize: 5,
    publishedOnly: true,
  });

  return NextResponse.json({
    matches: result.places.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      tradition: place.tradition,
    })),
  });
}
