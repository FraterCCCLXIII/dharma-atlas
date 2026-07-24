import { NextResponse } from "next/server";
import { parseExploreSearchParams } from "@/lib/explore-api-params";
import { searchExplorePlaces } from "@/lib/data/places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const options = parseExploreSearchParams(searchParams);
  const result = await searchExplorePlaces(options);

  return NextResponse.json(result);
}
