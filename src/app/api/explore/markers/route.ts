import { NextResponse } from "next/server";
import { parseExploreSearchParams } from "@/lib/explore-api-params";
import {
  getCachedPlaceMarkers,
  searchExploreMapPins,
} from "@/lib/data/places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Home / all-browse featured still needs full PlaceMarker rows (name + photo).
  if (searchParams.get("full") === "1") {
    const markers = await getCachedPlaceMarkers();
    return NextResponse.json(
      { markers, count: markers.length, total: markers.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  }

  const options = parseExploreSearchParams(searchParams);
  const result = await searchExploreMapPins({
    ...options,
    page: 1,
    pageSize: 1,
  });

  return NextResponse.json(result, {
    headers: {
      // Viewport queries change often; keep short browser cache only.
      "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
    },
  });
}
