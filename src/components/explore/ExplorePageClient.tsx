"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ListBullets, MapTrifold } from "@phosphor-icons/react";
import { buildDirectoryEntries } from "@/lib/directory";
import { fetchExploreMarkers } from "@/lib/explore-markers-client";
import { placeMatchesLocationFilter } from "@/lib/location-filter";
import { filterPlaces } from "@/lib/places";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";
import type { Teacher } from "@/types/teacher";
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
    <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-surface-muted">
      <p className="text-sm text-ink-muted">Loading map…</p>
    </div>
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

function useSyncListToMap() {
  const [syncListToMap, setSyncListToMap] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setSyncListToMap(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return syncListToMap;
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

export function ExplorePageClient({ teachers }: { teachers: Teacher[] }) {
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
  const syncListToMap = useSyncListToMap();

  const needsMarkers =
    entityFilter === "locations" ||
    entityFilter === "all" ||
    traditions.length > 0 ||
    schools.length > 0 ||
    types.length > 0 ||
    faiths.length > 0 ||
    locationFilter != null;

  const { markers, loading: markersLoading, error: markersError } =
    useExploreMarkers(needsMarkers);

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
    if (!locationFilter) return byFilters;
    return byFilters.filter((place) =>
      placeMatchesLocationFilter(
        place.lat,
        place.lng,
        place.address,
        locationFilter,
      ),
    );
  }, [markers, placeFilters, locationFilter]);

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
  // Avoid mounting Leaflet while the map pane is hidden (mobile list). Unmounting
  // thousands of markers on soft-nav to a place page freezes the main thread.
  const mapMounted = showMap && (syncListToMap || mobileView === "map");
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
        markersLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-muted">
            Loading directory…
          </div>
        ) : (
          <DirectoryList entries={directoryEntries} />
        )
      ) : null
    ) : entityFilter === "people" ? (
      <TeacherList
        teachers={filteredTeachers}
        variant="tile"
        sortOrder={peopleSort}
      />
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
              markersLoading ? (
                <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
                  Loading…
                </div>
              ) : (
                <AllFeaturePage places={markers} teachers={teachers} />
              )
            ) : isPeopleBrowse ? (
              <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
                {showLuminaries && <PeopleCarousels teachers={teachers} />}
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

        <div className="relative flex min-h-0 min-w-0 flex-1">
          <section
            className={`flex min-h-0 w-full flex-col ${
              showMap ? "lg:w-[52%] xl:w-[48%]" : ""
            } ${
              showMap && mobileView === "map" ? "hidden lg:flex" : "flex"
            }`}
          >
            {listContent}
          </section>

          <section
            aria-hidden={!showMap || !mapMounted}
            className={`relative z-0 min-h-0 flex-1 p-3 sm:p-4 lg:p-5 ${
              !showMap
                ? "hidden"
                : mobileView === "list"
                  ? "hidden lg:block"
                  : "block"
            }`}
          >
            <div className="map-panel h-full overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              {mapMounted ? (
                markersLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                    Loading map…
                  </div>
                ) : (
                  <PlaceMap places={filteredPlaces} />
                )
              ) : null}
            </div>
          </section>

          {showMap ? <MobileMapToggle /> : null}
        </div>
      </div>
    </div>
  );
}
