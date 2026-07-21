import { getSchools, placeMatchesTraditionFilter } from "@/lib/schools";
import type { PlaceMarker, PlaceType } from "@/types/place";

export interface PlaceFilters {
  query: string;
  traditions: string[];
  schools: string[];
  types: PlaceType[];
  faiths: string[];
}

export function filterPlaces<T extends PlaceMarker>(
  places: T[],
  filters: PlaceFilters,
): T[] {
  const q = filters.query.trim().toLowerCase();

  return places.filter((place) => {
    if (q) {
      const haystack = `${place.name} ${place.address}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.traditions.length) {
      const matchesTradition = filters.traditions.some((tradition) =>
        placeMatchesTraditionFilter(place, tradition),
      );
      if (!matchesTradition) return false;
    }
    if (filters.schools.length) {
      const placeSchools = getSchools(place);
      if (!filters.schools.some((school) => placeSchools.includes(school))) return false;
    }
    if (filters.types.length && !filters.types.includes(place.type)) return false;
    if (filters.faiths.length && !filters.faiths.includes(place.faith)) return false;
    return true;
  });
}

export function getUniqueValues(places: PlaceMarker[]) {
  return {
    traditions: [...new Set(places.map((p) => p.tradition))].sort(),
    types: [...new Set(places.map((p) => p.type))].sort() as PlaceType[],
    faiths: [...new Set(places.map((p) => p.faith))].sort(),
  };
}

export { getSchools, inferSchools, schoolLabel } from "@/lib/schools";

export function traditionGradient(tradition: string): string {
  const gradients: Record<string, string> = {
    Theravada: "from-emerald-700 via-teal-600 to-cyan-800",
    Tibetan: "from-amber-700 via-orange-600 to-red-900",
    Zen: "from-stone-600 via-neutral-700 to-zinc-900",
    Buddhist: "from-slate-600 via-gray-700 to-slate-900",
    Vietnamese: "from-rose-700 via-red-600 to-amber-900",
    Chinese: "from-red-800 via-rose-700 to-amber-800",
    "Southeast Asian": "from-yellow-700 via-amber-600 to-orange-900",
    "Pure Land": "from-violet-700 via-purple-600 to-indigo-900",
    "Won Buddhism": "from-sky-700 via-blue-600 to-indigo-900",
    Mahayana: "from-sky-700 via-cyan-600 to-blue-900",
    "Advaita Vedanta": "from-indigo-700 via-violet-600 to-purple-900",
    "Contemplative Christianity": "from-rose-800 via-pink-700 to-red-900",
    "Contemplative Christian": "from-rose-800 via-pink-700 to-red-900",
    Hindu: "from-orange-600 via-amber-500 to-red-800",
    Nonduality: "from-cyan-600 via-sky-500 to-teal-800",
    "Non-Dualism": "from-cyan-600 via-sky-500 to-teal-800",
    Sufi: "from-green-700 via-emerald-600 to-teal-900",
    "Indigenous Wisdom": "from-amber-800 via-yellow-700 to-stone-900",
  };
  return gradients[tradition] ?? "from-teal-700 via-emerald-800 to-stone-900";
}

/** Marker / filter swatch colors — one distinct hue per tradition. */
export const TRADITION_COLORS: Record<string, string> = {
  // Buddhist root + lineages
  Buddhist: "#475569",
  Theravada: "#0f766e",
  Tibetan: "#b45309",
  Zen: "#57534e",
  Vietnamese: "#be123c",
  Chinese: "#b91c1c",
  "Southeast Asian": "#ca8a04",
  "Pure Land": "#7c3aed",
  "Won Buddhism": "#2563eb",
  Mahayana: "#0284c7",
  // Other root traditions
  "Advaita Vedanta": "#4f46e5",
  "Contemplative Christianity": "#9f1239",
  "Contemplative Christian": "#9f1239",
  Hindu: "#ea580c",
  Nonduality: "#0891b2",
  "Non-Dualism": "#0891b2",
  Sufi: "#15803d",
  "Indigenous Wisdom": "#92400e",
};

export function traditionMarkerColor(tradition: string): string {
  return TRADITION_COLORS[tradition] ?? "#d17f28";
}
