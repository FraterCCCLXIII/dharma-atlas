import { getSchools } from "@/lib/schools";
import type { Place, PlaceType } from "@/types/place";

export interface PlaceFilters {
  query: string;
  traditions: string[];
  schools: string[];
  types: PlaceType[];
  faiths: string[];
}

export function filterPlaces(places: Place[], filters: PlaceFilters): Place[] {
  const q = filters.query.trim().toLowerCase();

  return places.filter((place) => {
    if (q && !place.name.toLowerCase().includes(q)) return false;
    if (filters.traditions.length && !filters.traditions.includes(place.tradition))
      return false;
    if (filters.schools.length) {
      const placeSchools = getSchools(place);
      if (!filters.schools.some((school) => placeSchools.includes(school))) return false;
    }
    if (filters.types.length && !filters.types.includes(place.type)) return false;
    if (filters.faiths.length && !filters.faiths.includes(place.faith)) return false;
    return true;
  });
}

export function getUniqueValues(places: Place[]) {
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
  };
  return gradients[tradition] ?? "from-teal-700 via-emerald-800 to-stone-900";
}

export const TRADITION_COLORS: Record<string, string> = {
  Theravada: "#0f766e",
  Tibetan: "#b45309",
  Zen: "#57534e",
  Buddhist: "#475569",
  Vietnamese: "#be123c",
  Chinese: "#b91c1c",
  "Southeast Asian": "#d97706",
  "Pure Land": "#7c3aed",
  "Won Buddhism": "#2563eb",
};

export function traditionMarkerColor(tradition: string): string {
  return TRADITION_COLORS[tradition] ?? "#b8894a";
}
