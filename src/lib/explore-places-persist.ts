import type { MapBounds } from "@/lib/coords";
import type {
  ExploreMapView,
  LocationFilter,
  MobileView,
} from "@/store/explore-store";
import type { PlaceType } from "@/types/place";

const STORAGE_KEY = "da-explore-places-state";

const PLACE_TYPES = new Set<PlaceType>([
  "Center",
  "Temple",
  "Monastery",
  "Meditation Center",
  "Institute",
  "Ashram",
  "Sangha",
  "Historic Site",
  "Sacred Landscape",
]);

export type PersistedExplorePlaces = {
  query: string;
  traditions: string[];
  schools: string[];
  types: PlaceType[];
  faiths: string[];
  locationFilter: LocationFilter | null;
  mapView: ExploreMapView | null;
  searchAsMapMoves: boolean;
  mobileView: MobileView;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMapBounds(value: unknown): value is MapBounds {
  if (!value || typeof value !== "object") return false;
  const bounds = value as MapBounds;
  return (
    isFiniteNumber(bounds.north) &&
    isFiniteNumber(bounds.south) &&
    isFiniteNumber(bounds.east) &&
    isFiniteNumber(bounds.west)
  );
}

function isLocationFilter(value: unknown): value is LocationFilter {
  if (!value || typeof value !== "object") return false;
  const filter = value as LocationFilter;
  return (
    typeof filter.label === "string" &&
    isFiniteNumber(filter.lat) &&
    isFiniteNumber(filter.lng) &&
    isMapBounds(filter.bounds) &&
    (filter.matchTerms === undefined ||
      (Array.isArray(filter.matchTerms) &&
        filter.matchTerms.every((term) => typeof term === "string")))
  );
}

function isMapView(value: unknown): value is ExploreMapView {
  if (!value || typeof value !== "object") return false;
  const view = value as ExploreMapView;
  return (
    isFiniteNumber(view.lat) &&
    isFiniteNumber(view.lng) &&
    isFiniteNumber(view.zoom)
  );
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseTypes(value: unknown): PlaceType[] {
  return parseStringArray(value).filter((item): item is PlaceType =>
    PLACE_TYPES.has(item as PlaceType),
  );
}

export function loadPersistedExplorePlaces(): PersistedExplorePlaces | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const data = parsed as Record<string, unknown>;

    return {
      query: typeof data.query === "string" ? data.query : "",
      traditions: parseStringArray(data.traditions),
      schools: parseStringArray(data.schools),
      types: parseTypes(data.types),
      faiths: parseStringArray(data.faiths),
      locationFilter: isLocationFilter(data.locationFilter)
        ? data.locationFilter
        : null,
      mapView: isMapView(data.mapView) ? data.mapView : null,
      searchAsMapMoves:
        typeof data.searchAsMapMoves === "boolean"
          ? data.searchAsMapMoves
          : true,
      mobileView: data.mobileView === "map" ? "map" : "list",
    };
  } catch {
    return null;
  }
}

export function savePersistedExplorePlaces(
  state: PersistedExplorePlaces,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
