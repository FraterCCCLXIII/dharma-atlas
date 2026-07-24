"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ListBullets, MapTrifold } from "@phosphor-icons/react";
import { buildDirectoryEntries } from "@/lib/directory";
import { fetchExploreMarkers } from "@/lib/explore-markers-client";
import { fetchExploreTeachers } from "@/lib/explore-teachers-client";
import { placeMatchesLocationFilter } from "@/lib/location-filter";
import { filterPlaces } from "@/lib/places";
import {
  readPersistedSearchAsMapMoves,
  useExplorePlacesPersist,
} from "@/hooks/useExplorePlacesPersist";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";
import type { Teacher } from "@/types/teacher";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { AllFeaturePage } from "./AllFeaturePage";
import { DirectoryList } from "./DirectoryList";
import { FilterBar } from "./FilterBar";
import { PeopleCarousels } from "./PeopleCarousels";
import { PlaceList } from "./PlaceList";
import { TeacherList } from "./TeacherList";

/**
 * Desktop: filter rail open. Mobile: closed so the drawer doesn't cover place cards.
 * Re-applied on explore route changes because Zustand keeps filtersOpen across navigations.
 */
function useResponsiveFiltersOpen() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    useExploreStore.setState({ filtersOpen: desktop });
  }, [pathname]);
}

const PlaceMap = dynamic(() => import("./PlaceMap").then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => (
    <LoadingScreen variant="inline" minHeightClassName="min-h-full h-full" />
  ),
});

function FilterSidebar({
  entityFilter,
  filtersOpen,
  onClose,
  places,
  teachers,
}: {
  entityFilter: EntityFilter;
  filtersOpen: boolean;
  onClose: () => void;
  places: PlaceMarker[];
  teachers: Teacher[];
}) {
  return (
    <>
      {filtersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="absolute inset-0 z-10 bg-ink/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-elevated transition-[width] duration-200 ease-out max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 max-lg:w-[min(100%,18rem)] max-lg:shadow-[var(--shadow-card)] lg:relative lg:z-auto ${
          filtersOpen
            ? "lg:w-72"
            : "max-lg:hidden lg:w-0 lg:border-r-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <FilterBar
          places={places}
          teachers={teachers}
          entityFilter={entityFilter}
          onClose={onClose}
        />
      </aside>
    </>
  );
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

/** True while the window is actively being resized (settles after quiet period). */
function useWindowResizing(settleMs = 160) {
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      setResizing(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setResizing(false), settleMs);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [settleMs]);

  return resizing;
}

function MobileMapToggle() {
  const mobileView = useExploreStore((s) => s.mobileView);
  const setMobileView = useExploreStore((s) => s.setMobileView);
  const showingMap = mobileView === "map";

  return (
    <button
      type="button"
      aria-pressed={showingMap}
      aria-label={showingMap ? "Show list" : "Show map"}
      onClick={() => setMobileView(showingMap ? "list" : "map")}
      className={`absolute top-5 right-5 z-30 rounded-full border border-border bg-surface-elevated p-2.5 shadow-[var(--shadow-float)] transition hover:bg-surface-muted lg:hidden ${
        showingMap ? "text-brand" : "text-ink-secondary hover:text-ink"
      }`}
    >
      {showingMap ? (
        <ListBullets size={18} weight="bold" />
      ) : (
        <MapTrifold size={18} weight="bold" />
      )}
    </button>
  );
}

function SearchAsMapMovesControl({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg border border-border bg-[var(--map-overlay)] px-3 py-2 text-sm text-ink shadow-[var(--shadow-float)] backdrop-blur-sm transition hover:bg-surface-elevated">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 shrink-0 rounded border-border text-brand focus:ring-brand/30"
      />
      <span className="whitespace-nowrap font-medium">Search as map moves</span>
    </label>
  );
}

function useExploreMarkers(enabled: boolean) {
  const [markers, setMarkers] = useState<PlaceMarker[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExploreMarkers()
      .then((data) => {
        if (cancelled) return;
        setMarkers(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load places");
        setMarkers([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { markers, loading, error };
}

function useExploreTeachers(enabled: boolean) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExploreTeachers()
      .then((data) => {
        if (cancelled) return;
        setTeachers(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load people");
        setTeachers([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { teachers, loading, error };
}

export function ExplorePageClient() {
  useResponsiveFiltersOpen();
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const query = useExploreStore((s) => s.query);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const mobileView = useExploreStore((s) => s.mobileView);
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const peopleSort = useExploreStore((s) => s.peopleSort);
  const peopleLifeEra = useExploreStore((s) => s.peopleLifeEra);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const isDesktop = useDesktopLayout();
  const windowResizing = useWindowResizing();
  const [searchAsMapMoves, setSearchAsMapMoves] = useState(
    readPersistedSearchAsMapMoves,
  );
  // When on, the place list filters to the current map viewport (once bounds exist).
  const syncListToMap = searchAsMapMoves;
  useExplorePlacesPersist({ searchAsMapMoves });
  // Keep Leaflet mounted across the lg breakpoint so resize does not rebuild
  // thousands of markers mid-drag. Cleared when leaving the locations map.
  const [mapWarm, setMapWarm] = useState(false);

  const needsMarkers =
    entityFilter === "locations" ||
    entityFilter === "all" ||
    traditions.length > 0 ||
    schools.length > 0 ||
    types.length > 0 ||
    faiths.length > 0 ||
    locationFilter != null;

  // People/home need the teacher directory; locations-only browse does not.
  const needsTeachers = entityFilter === "people" || entityFilter === "all";

  const { markers, loading: markersLoading, error: markersError } =
    useExploreMarkers(needsMarkers);
  const { teachers, loading: teachersLoading, error: teachersError } =
    useExploreTeachers(needsTeachers);

  const placeQuery = entityFilter === "locations" ? query : "";
  const teacherQuery = entityFilter === "people" ? query : "";

  const placeFilters = useMemo(
    () => ({ query: placeQuery, traditions, schools, types, faiths }),
    [placeQuery, traditions, schools, types, faiths],
  );
  const teacherFilters = useMemo(
    () => ({ query: teacherQuery, traditions, schools, lifeEra: peopleLifeEra }),
    [teacherQuery, traditions, schools, peopleLifeEra],
  );

  const filteredPlaces = useMemo(() => {
    const byFilters = filterPlaces(markers, placeFilters);
    // Search-as-map-moves uses the viewport for the list; keep map pins free of
    // the Near You / area lock so panning can reveal places outside that seed.
    if (!locationFilter || syncListToMap) return byFilters;
    return byFilters.filter((place) =>
      placeMatchesLocationFilter(
        place.lat,
        place.lng,
        place.address,
        locationFilter,
      ),
    );
  }, [markers, placeFilters, locationFilter, syncListToMap]);

  const directoryEntries = useMemo(
    () =>
      buildDirectoryEntries(
        markers,
        teachers,
        entityFilter,
        placeFilters,
        teacherFilters,
      ),
    [markers, teachers, entityFilter, placeFilters, teacherFilters],
  );

  const filteredTeachers = useMemo(
    () =>
      directoryEntries.filter((e) => e.kind === "teacher").map((e) => e.data),
    [directoryEntries],
  );

  const showMap = entityFilter === "locations";
  // Visible map pane: desktop split, or mobile map mode.
  const mapPaneActive = showMap && (isDesktop || mobileView === "map");
  // Avoid mounting Leaflet while the map pane is hidden (mobile list). Unmounting
  // thousands of markers on soft-nav to a place page freezes the main thread.
  // Also defer first mount until the window resize gesture settles — crossing
  // 1024px mid-drag otherwise mounts the full marker set and stalls layout.
  useEffect(() => {
    if (!showMap) {
      setMapWarm(false);
      return;
    }
    if (mapPaneActive && !windowResizing) {
      setMapWarm(true);
    }
  }, [showMap, mapPaneActive, windowResizing]);
  const mapMounted = showMap && mapWarm;
  const isPeopleBrowse = entityFilter === "people";
  const isAllBrowse = entityFilter === "all";
  const hasActiveBrowse =
    placeQuery.trim().length > 0 ||
    traditions.length > 0 ||
    schools.length > 0 ||
    types.length > 0 ||
    faiths.length > 0 ||
    locationFilter != null;
  const hasActivePeopleBrowse =
    teacherQuery.trim().length > 0 ||
    traditions.length > 0 ||
    schools.length > 0 ||
    peopleLifeEra !== "all";
  const showAllFeature = isAllBrowse && !hasActiveBrowse;
  const showLuminaries = isPeopleBrowse && !hasActivePeopleBrowse;
  const useScrollLayout = isPeopleBrowse || isAllBrowse;

  const listContent =
    isAllBrowse ? (
      hasActiveBrowse ? (
        markersLoading || teachersLoading ? (
          <LoadingScreen />
        ) : teachersError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              Couldn’t load people
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">{teachersError}</p>
          </div>
        ) : (
          <DirectoryList entries={directoryEntries} />
        )
      ) : null
    ) : entityFilter === "people" ? (
      teachersLoading ? (
        <LoadingScreen />
      ) : teachersError ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Couldn’t load people
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">{teachersError}</p>
        </div>
      ) : (
        <TeacherList
          teachers={filteredTeachers}
          variant="tile"
          sortOrder={peopleSort}
        />
      )
    ) : markersError ? (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          Couldn’t load locations
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{markersError}</p>
      </div>
    ) : (
      <PlaceList
        syncListToMap={syncListToMap}
        filteredMarkerCount={filteredPlaces.length}
      />
    );

  if (useScrollLayout) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-surface-elevated">
        <div className="relative flex min-h-0 flex-1">
          {!showAllFeature && (
            <FilterSidebar
              entityFilter={entityFilter}
              filtersOpen={filtersOpen}
              onClose={toggleFilters}
              places={markers}
              teachers={teachers}
            />
          )}

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {showAllFeature ? (
              markersLoading || teachersLoading ? (
                <LoadingScreen />
              ) : teachersError ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
                  <p className="font-display text-lg font-semibold text-ink">
                    Couldn’t load directory
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-ink-muted">{teachersError}</p>
                </div>
              ) : (
                <AllFeaturePage places={markers} teachers={teachers} />
              )
            ) : isPeopleBrowse ? (
              <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
                {showLuminaries && !teachersLoading && !teachersError ? (
                  <PeopleCarousels teachers={teachers} />
                ) : null}
                {listContent}
              </div>
            ) : (
              listContent
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-elevated">
      <div className="relative flex min-h-0 flex-1">
        <FilterSidebar
          entityFilter={entityFilter}
          filtersOpen={filtersOpen}
          onClose={toggleFilters}
          places={markers}
          teachers={teachers}
        />

        <div
          className={`relative flex min-h-0 min-w-0 flex-1 ${
            showMap && mobileView === "map" ? "flex-col lg:flex-row" : ""
          }`}
        >
          <section
            className={`min-h-0 w-full flex-col ${
              showMap
                ? "lg:relative lg:order-none lg:flex lg:w-[52%] xl:w-[48%]"
                : "flex"
            } ${
              showMap && mobileView === "map"
                ? "order-2 flex shrink-0 px-3 sm:px-4 lg:order-none lg:min-h-0 lg:flex-1 lg:px-0"
                : "flex"
            }`}
          >
            {listContent}
          </section>

          <section
            aria-hidden={!showMap || !mapMounted}
            className={`relative z-0 min-h-0 ${
              !showMap
                ? "hidden"
                : mobileView === "list"
                  ? "hidden lg:block lg:flex-1 lg:p-5"
                  : "order-1 flex min-h-0 flex-1 flex-col p-3 pb-0 sm:p-4 sm:pb-0 lg:order-none lg:p-5"
            }`}
          >
            <div className="relative min-h-0 flex-1" data-map-shell>
              <div className="map-panel absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
                {mapMounted ? (
                  markersLoading ? (
                    <LoadingScreen
                      variant="inline"
                      minHeightClassName="min-h-full h-full"
                    />
                  ) : (
                    <PlaceMap places={filteredPlaces} />
                  )
                ) : null}
                {mapMounted && !markersLoading ? (
                  <SearchAsMapMovesControl
                    checked={searchAsMapMoves}
                    onChange={setSearchAsMapMoves}
                  />
                ) : null}
              </div>
            </div>
          </section>

          {showMap ? <MobileMapToggle /> : null}
        </div>
      </div>
    </div>
  );
}
