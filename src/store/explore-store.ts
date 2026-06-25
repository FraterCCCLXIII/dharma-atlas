import { create } from "zustand";
import type { PlaceType } from "@/types/place";

export type MobileView = "list" | "map";
export type EntityFilter = "all" | "locations" | "people";

interface ExploreState {
  hoveredId: string | null;
  pinnedPopupId: string | null;
  entityFilter: EntityFilter;
  query: string;
  traditions: string[];
  schools: string[];
  types: PlaceType[];
  faiths: string[];
  mobileView: MobileView;
  filtersOpen: boolean;
  setHoveredId: (id: string | null) => void;
  setPinnedPopupId: (id: string | null) => void;
  setEntityFilter: (filter: EntityFilter) => void;
  setQuery: (query: string) => void;
  toggleTradition: (tradition: string) => void;
  toggleSchool: (school: string) => void;
  toggleType: (type: PlaceType) => void;
  toggleFaith: (faith: string) => void;
  clearFilters: () => void;
  setMobileView: (view: MobileView) => void;
  toggleFilters: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  hoveredId: null,
  pinnedPopupId: null,
  entityFilter: "all",
  query: "",
  traditions: [],
  schools: [],
  types: [],
  faiths: [],
  mobileView: "list",
  filtersOpen: true,
  setHoveredId: (id) => set({ hoveredId: id }),
  setPinnedPopupId: (id) =>
    set(id ? { pinnedPopupId: id, hoveredId: id } : { pinnedPopupId: null }),
  setEntityFilter: (entityFilter) =>
    set({
      entityFilter,
      hoveredId: null,
      pinnedPopupId: null,
    }),
  setQuery: (query) => set({ query }),
  toggleTradition: (tradition) =>
    set((s) => ({
      traditions: s.traditions.includes(tradition)
        ? s.traditions.filter((t) => t !== tradition)
        : [...s.traditions, tradition],
    })),
  toggleSchool: (school) =>
    set((s) => ({
      schools: s.schools.includes(school)
        ? s.schools.filter((value) => value !== school)
        : [...s.schools, school],
    })),
  toggleType: (type) =>
    set((s) => ({
      types: s.types.includes(type)
        ? s.types.filter((t) => t !== type)
        : [...s.types, type],
    })),
  toggleFaith: (faith) =>
    set((s) => ({
      faiths: s.faiths.includes(faith)
        ? s.faiths.filter((f) => f !== faith)
        : [...s.faiths, faith],
    })),
  clearFilters: () =>
    set({ query: "", traditions: [], schools: [], types: [], faiths: [] }),
  setMobileView: (view) => set({ mobileView: view }),
  toggleFilters: () => set((s) => ({ filtersOpen: !s.filtersOpen })),
}));
