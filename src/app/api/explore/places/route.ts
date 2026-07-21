import { NextResponse } from "next/server";
import type { MapBounds } from "@/lib/coords";
import { searchExplorePlaces } from "@/lib/data/places";
import type { Faith, PlaceType } from "@/types/place";

function parseCsv(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBoundNumber(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseBoundsPair(
  searchParams: URLSearchParams,
  keys: [string, string, string, string],
): MapBounds | null {
  const [southKey, northKey, westKey, eastKey] = keys;
  const south = parseBoundNumber(searchParams.get(southKey));
  const north = parseBoundNumber(searchParams.get(northKey));
  const west = parseBoundNumber(searchParams.get(westKey));
  const east = parseBoundNumber(searchParams.get(eastKey));
  if (south == null || north == null || west == null || east == null) {
    return null;
  }
  if (south > north) return null;
  return { south, north, west, east };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Number(searchParams.get("pageSize") ?? "20") || 20,
  );

  const locationBounds = parseBoundsPair(searchParams, [
    "locSouth",
    "locNorth",
    "locWest",
    "locEast",
  ]);
  const mapBounds = locationBounds
    ? null
    : parseBoundsPair(searchParams, ["south", "north", "west", "east"]);

  const result = await searchExplorePlaces({
    query,
    page,
    pageSize,
    traditions: parseCsv(searchParams.get("traditions")),
    schools: parseCsv(searchParams.get("schools")),
    types: parseCsv(searchParams.get("types")) as PlaceType[],
    faiths: parseCsv(searchParams.get("faiths")) as Faith[],
    bounds: mapBounds,
    locationBounds,
    locationLat: Number(searchParams.get("locLat")) || undefined,
    locationLng: Number(searchParams.get("locLng")) || undefined,
    locationMatchTerms: parseCsv(searchParams.get("locTerms")),
  });

  return NextResponse.json(result);
}
