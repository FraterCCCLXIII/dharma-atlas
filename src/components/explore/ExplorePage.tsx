"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import placesDataset from "@/data/places.json";
import teachersDataset from "@/data/teachers.json";
import { ExploreNav } from "@/components/layout/SiteHeader";
import { buildDirectoryEntries } from "@/lib/directory";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import { useExploreRouteSync } from "@/hooks/useExploreRouteSync";
import type { PlacesDataset } from "@/types/place";
import type { TeachersDataset } from "@/types/teacher";
import { DirectoryList } from "./DirectoryList";
import { AllFeaturePage } from "./AllFeaturePage";
import { FilterBar, useActiveFilterCount } from "./FilterBar";
import { PlaceList } from "./PlaceList";
import { TeacherList } from "./TeacherList";

const PlaceMap = dynamic(() => import("./PlaceMap").then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-surface-muted">
      <p className="text-sm text-ink-muted">Loading map…</p>
    </div>
  ),
});

const places = placesDataset as PlacesDataset;
const teachers = teachersDataset as TeachersDataset;

function FilterSidebar({
  entityFilter,
  filtersOpen,
  onClose,
}: {
  entityFilter: EntityFilter;
  filtersOpen: boolean;
  onClose: () => void;
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
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-elevated transition-[width,transform] duration-200 ease-out max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 max-lg:w-[min(100%,18rem)] max-lg:shadow-[var(--shadow-card)] lg:relative lg:z-auto ${
          filtersOpen
            ? "max-lg:translate-x-0 lg:w-72"
            : "max-lg:pointer-events-none max-lg:-translate-x-full lg:w-0 lg:border-r-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <FilterBar
          places={places.places}
          teachers={teachers.teachers}
          entityFilter={entityFilter}
          onClose={onClose}
        />
      </aside>
    </>
  );
}

export function ExplorePage() {
  useExploreRouteSync();

  const entityFilter = useExploreStore((s) => s.entityFilter);
  const query = useExploreStore((s) => s.query);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const mobileView = useExploreStore((s) => s.mobileView);
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const activeFilterCount = useActiveFilterCount();

  const placeFilters = useMemo(
    () => ({ query, traditions, schools, types, faiths }),
    [query, traditions, schools, types, faiths],
  );
  const teacherFilters = useMemo(
    () => ({ query, traditions, schools }),
    [query, traditions, schools],
  );

  const directoryEntries = useMemo(
    () =>
      buildDirectoryEntries(
        places.places,
        teachers.teachers,
        entityFilter,
        placeFilters,
        teacherFilters,
      ),
    [entityFilter, placeFilters, teacherFilters],
  );

  const filteredPlaces = useMemo(
    () => directoryEntries.filter((e) => e.kind === "place").map((e) => e.data),
    [directoryEntries],
  );

  const filteredTeachers = useMemo(
    () =>
      directoryEntries.filter((e) => e.kind === "teacher").map((e) => e.data),
    [directoryEntries],
  );

  const showMap = entityFilter !== "people";
  const isPeopleBrowse = entityFilter === "people";
  const isAllBrowse = entityFilter === "all";
  const hasActiveBrowse =
    query.trim().length > 0 ||
    traditions.length > 0 ||
    schools.length > 0 ||
    types.length > 0 ||
    faiths.length > 0;
  const showAllFeature = isAllBrowse && !hasActiveBrowse;
  const useScrollLayout = isPeopleBrowse || isAllBrowse;

  const listContent =
    isAllBrowse ? (
      hasActiveBrowse ? (
        <DirectoryList entries={directoryEntries} />
      ) : null
    ) : entityFilter === "people" ? (
      <TeacherList teachers={filteredTeachers} variant="tile" />
    ) : (
      <PlaceList places={filteredPlaces} />
    );

  if (useScrollLayout) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-surface">
        <ExploreNav activeFilterCount={activeFilterCount} />

        <div className="relative flex min-h-0 flex-1">
          <FilterSidebar
            entityFilter={entityFilter}
            filtersOpen={filtersOpen}
            onClose={toggleFilters}
          />

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {showAllFeature ? (
              <AllFeaturePage places={places.places} teachers={teachers.teachers} />
            ) : isPeopleBrowse ? (
              <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
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
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <ExploreNav activeFilterCount={activeFilterCount} />

      <div className="relative flex min-h-0 flex-1">
        <FilterSidebar
          entityFilter={entityFilter}
          filtersOpen={filtersOpen}
          onClose={toggleFilters}
        />

        <div className="flex min-h-0 min-w-0 flex-1">
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
            aria-hidden={!showMap}
            className={`relative z-0 min-h-0 flex-1 p-3 sm:p-4 lg:p-5 ${
              !showMap
                ? "hidden"
                : mobileView === "list"
                  ? "hidden lg:block"
                  : "block"
            }`}
          >
            <div className="map-panel h-full overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              {showMap ? <PlaceMap places={filteredPlaces} /> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
