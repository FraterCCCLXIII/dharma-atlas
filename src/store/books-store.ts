import { create } from "zustand";

interface BooksState {
  filtersOpen: boolean;
  topics: string[];
  publishers: string[];
  query: string;
  toggleFilters: () => void;
  setFiltersOpen: (open: boolean) => void;
  toggleTopic: (topic: string) => void;
  togglePublisher: (publisher: string) => void;
  setQuery: (query: string) => void;
  clearFilters: () => void;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

export const useBooksStore = create<BooksState>((set) => ({
  // Desktop opens on mount in BooksPageView; mobile stays closed.
  filtersOpen: false,
  topics: [],
  publishers: [],
  query: "",
  toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
  setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
  toggleTopic: (topic) =>
    set((state) => ({ topics: toggleInList(state.topics, topic) })),
  togglePublisher: (publisher) =>
    set((state) => ({
      publishers: toggleInList(state.publishers, publisher),
    })),
  setQuery: (query) => set({ query }),
  clearFilters: () => set({ topics: [], publishers: [], query: "" }),
}));

export function useBooksActiveFilterCount(): number {
  return useBooksStore(
    (s) =>
      s.topics.length +
      s.publishers.length +
      (s.query.trim().length > 0 ? 1 : 0),
  );
}
