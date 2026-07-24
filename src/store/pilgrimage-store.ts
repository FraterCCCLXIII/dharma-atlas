import { create } from "zustand";
import type { PilgrimageKind } from "@/data/pilgrimage";

export type PilgrimageMobileView = "list" | "map";

interface PilgrimageState {
  filtersOpen: boolean;
  view: PilgrimageKind;
  mobileView: PilgrimageMobileView;
  selectedSiteSlug: string | null;
  selectedRouteSlug: string | null;
  regions: string[];
  traditions: string[];
  query: string;
  toggleFilters: () => void;
  setFiltersOpen: (open: boolean) => void;
  setView: (view: PilgrimageKind) => void;
  setMobileView: (view: PilgrimageMobileView) => void;
  selectSite: (slug: string | null) => void;
  selectRoute: (slug: string | null) => void;
  toggleRegion: (region: string) => void;
  toggleTradition: (tradition: string) => void;
  clearRegions: () => void;
  clearTraditions: () => void;
  setQuery: (query: string) => void;
  clearFilters: () => void;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

export const usePilgrimageStore = create<PilgrimageState>((set) => ({
  filtersOpen: false,
  view: "site",
  mobileView: "list",
  selectedSiteSlug: null,
  selectedRouteSlug: null,
  regions: [],
  traditions: [],
  query: "",
  toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
  setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
  setView: (view) =>
    set({
      view,
      selectedSiteSlug: null,
      selectedRouteSlug: null,
    }),
  setMobileView: (mobileView) => set({ mobileView }),
  selectSite: (selectedSiteSlug) =>
    set({ selectedSiteSlug, selectedRouteSlug: null }),
  selectRoute: (selectedRouteSlug) =>
    set({ selectedRouteSlug, selectedSiteSlug: null }),
  toggleRegion: (region) =>
    set((state) => ({ regions: toggleInList(state.regions, region) })),
  toggleTradition: (tradition) =>
    set((state) => ({
      traditions: toggleInList(state.traditions, tradition),
    })),
  clearRegions: () => set({ regions: [] }),
  clearTraditions: () => set({ traditions: [] }),
  setQuery: (query) => set({ query }),
  clearFilters: () => set({ regions: [], traditions: [], query: "" }),
}));

export function usePilgrimageActiveFilterCount(): number {
  return usePilgrimageStore(
    (s) =>
      s.regions.length +
      s.traditions.length +
      (s.query.trim().length > 0 ? 1 : 0),
  );
}
