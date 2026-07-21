import { NextResponse } from "next/server";
import { getCachedPlaceMarkers } from "@/lib/data/places";

export async function GET() {
  const markers = await getCachedPlaceMarkers();

  return NextResponse.json(
    { markers, count: markers.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
