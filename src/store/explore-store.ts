import type { MapBounds } from "@/lib/coords";
import type { PeopleSortOrder } from "@/lib/teacher-groups";
import type { PeopleLifeEra } from "@/lib/teacher-life-era";
import {
  toggleBuddhismRoot as applyBuddhismRootToggle,
  toggleLineageSchoolSelection,
  toggleSubschoolSelection,
} from "@/lib/schools";
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
  peopleSort: PeopleSortOrder;
  peopleLifeEra: PeopleLifeEra;
  filtersOpen: boolean;
  mapBounds: MapBounds | null;
  setHoveredId: (id: string | null) => void;
  setPinnedPopupId: (id: string | null) => void;
  setEntityFilter: (filter: EntityFilter) => void;
  setQuery: (query: string) => void;
  toggleTradition: (tradition: string) => void;
  toggleSchool: (school: string) => void;
  toggleBuddhismRoot: () => void;
  toggleLineageSchool: (schoolId: string) => void;
  toggleSubschool: (subschool: string) => void;
  toggleType: (type: PlaceType) => void;
  toggleFaith: (faith: string) => void;
  clearFilters: () => void;
  setMobileView: (view: MobileView) => void;
  setPeopleSort: (sort: PeopleSortOrder) => void;
  setPeopleLifeEra: (era: PeopleLifeEra) => void;
  toggleFilters: () => void;
  setMapBounds: (bounds: MapBounds | null) => void;
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
  peopleSort: "tradition-school",
  peopleLifeEra: "all",
  filtersOpen: false,
  mapBounds: null,
  setHoveredId: (id) => set({ hoveredId: id }),
  setPinnedPopupId: (id) =>
    set(id ? { pinnedPopupId: id, hoveredId: id } : { pinnedPopupId: null }),
  setEntityFilter: (entityFilter) =>
    set({
      entityFilter,
      hoveredId: null,
      pinnedPopupId: null,
      mapBounds: null,
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
  toggleBuddhismRoot: () =>
    set((s) => {
      const next = applyBuddhismRootToggle({
        traditions: s.traditions,
        schools: s.schools,
      });
      return { traditions: next.traditions, schools: next.schools };
    }),
  toggleLineageSchool: (schoolId) =>
    set((s) => {
      const next = toggleLineageSchoolSelection(
        { traditions: s.traditions, schools: s.schools },
        schoolId,
      );
      return { traditions: next.traditions, schools: next.schools };
    }),
  toggleSubschool: (subschool) =>
    set((s) => {
      const next = toggleSubschoolSelection(
        { traditions: s.traditions, schools: s.schools },
        subschool,
      );
      return { traditions: next.traditions, schools: next.schools };
    }),
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
    set({
      query: "",
      traditions: [],
      schools: [],
      types: [],
      faiths: [],
      peopleLifeEra: "all",
    }),
  setMobileView: (view) => set({ mobileView: view }),
  setPeopleSort: (peopleSort) => set({ peopleSort }),
  setPeopleLifeEra: (peopleLifeEra) => set({ peopleLifeEra }),
  toggleFilters: () => set((s) => ({ filtersOpen: !s.filtersOpen })),
  setMapBounds: (mapBounds) => set({ mapBounds }),
}));
