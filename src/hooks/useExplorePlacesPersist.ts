"use client";

import { useEffect, useRef } from "react";
import {
  loadPersistedExplorePlaces,
  savePersistedExplorePlaces,
  type PersistedExplorePlaces,
} from "@/lib/explore-places-persist";
import { useExploreStore } from "@/store/explore-store";

const PERSIST_DEBOUNCE_MS = 200;

type PersistExtras = {
  searchAsMapMoves: boolean;
};

let didHydrateExplorePlaces = false;

/** Apply sessionStorage once, synchronously, before the first /places paint. */
export function hydrateExplorePlacesOnce(): void {
  if (didHydrateExplorePlaces || typeof window === "undefined") return;
  didHydrateExplorePlaces = true;

  const persisted = loadPersistedExplorePlaces();
  if (!persisted) return;

  useExploreStore.setState({
    query: persisted.query,
    traditions: persisted.traditions,
    schools: persisted.schools,
    types: persisted.types,
    faiths: persisted.faiths,
    locationFilter: persisted.locationFilter,
    mapView: persisted.mapView,
    mobileView: persisted.mobileView,
  });
}

/**
 * Restore /places filters + map viewport from sessionStorage on first paint,
 * then keep them in sync so a refresh does not reset the user’s session.
 */
export function useExplorePlacesPersist(extras: PersistExtras) {
  const searchAsMapMovesRef = useRef(extras.searchAsMapMoves);
  searchAsMapMovesRef.current = extras.searchAsMapMoves;

  hydrateExplorePlacesOnce();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const persist = () => {
      const state = useExploreStore.getState();
      if (state.entityFilter !== "locations") return;

      const payload: PersistedExplorePlaces = {
        query: state.query,
        traditions: state.traditions,
        schools: state.schools,
        types: state.types,
        faiths: state.faiths,
        locationFilter: state.locationFilter,
        mapView: state.mapView,
        searchAsMapMoves: searchAsMapMovesRef.current,
        mobileView: state.mobileView,
      };
      savePersistedExplorePlaces(payload);
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(persist, PERSIST_DEBOUNCE_MS);
    };

    const unsubscribe = useExploreStore.subscribe(schedule);
    schedule();

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
      persist();
    };
  }, [extras.searchAsMapMoves]);
}

/** Read restored “Search as map moves” once for initial React state. */
export function readPersistedSearchAsMapMoves(): boolean {
  hydrateExplorePlacesOnce();
  return loadPersistedExplorePlaces()?.searchAsMapMoves ?? true;
}
