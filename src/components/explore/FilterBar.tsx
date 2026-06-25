"use client";

import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { useMemo } from "react";
import { getSchoolOptions, schoolLabel } from "@/lib/schools";
import { getUniqueValues, traditionMarkerColor } from "@/lib/places";
import { getTeacherTraditions } from "@/lib/teachers";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import type { Place, PlaceType } from "@/types/place";
import type { Teacher } from "@/types/teacher";

interface FilterBarProps {
  places: Place[];
  teachers: Teacher[];
  entityFilter: EntityFilter;
  onClose?: () => void;
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
        active
          ? "border-ink bg-ink text-surface-elevated shadow-sm"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink"
      }`}
    >
      {color && !active && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function FilterBar({
  places,
  teachers,
  entityFilter,
  onClose,
}: FilterBarProps) {
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const toggleTradition = useExploreStore((s) => s.toggleTradition);
  const toggleSchool = useExploreStore((s) => s.toggleSchool);
  const toggleType = useExploreStore((s) => s.toggleType);
  const clearFilters = useExploreStore((s) => s.clearFilters);
  const query = useExploreStore((s) => s.query);

  const placeOptions = useMemo(() => getUniqueValues(places), [places]);
  const teacherTraditions = useMemo(
    () => getTeacherTraditions(teachers),
    [teachers],
  );
  const traditionOptions = useMemo(() => {
    if (entityFilter === "locations") return placeOptions.traditions;
    if (entityFilter === "people") return teacherTraditions;
    return [...new Set([...placeOptions.traditions, ...teacherTraditions])].sort();
  }, [entityFilter, placeOptions.traditions, teacherTraditions]);

  const schoolGroups = useMemo(
    () =>
      entityFilter === "people"
        ? []
        : getSchoolOptions(places, traditions),
    [places, traditions, entityFilter],
  );

  const showPlaceTypes = entityFilter !== "people";
  const activeFilterCount =
    traditions.length +
    schools.length +
    (showPlaceTypes ? types.length : 0) +
    (query.length > 0 ? 1 : 0);

  return (
    <nav
      id="explore-filters"
      aria-label="Explore filters"
      className="flex h-full flex-col bg-surface-elevated"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-ink">Filters</p>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-brand underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink lg:hidden"
              aria-label="Close filters"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {showPlaceTypes && placeOptions.types.length > 0 && (
          <FilterSection title="Type">
            {placeOptions.types.map((type) => (
              <FilterChip
                key={type}
                label={type}
                active={types.includes(type as PlaceType)}
                onClick={() => toggleType(type as PlaceType)}
              />
            ))}
          </FilterSection>
        )}

        {traditionOptions.length > 0 && (
          <FilterSection title="Tradition">
            {traditionOptions.map((tradition) => (
              <FilterChip
                key={tradition}
                label={tradition}
                active={traditions.includes(tradition)}
                color={traditionMarkerColor(tradition)}
                onClick={() => toggleTradition(tradition)}
              />
            ))}
          </FilterSection>
        )}

        {schoolGroups.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              School
            </h3>
            {schoolGroups.map(({ tradition, schools: traditionSchools }) => (
              <div key={tradition} className="space-y-2">
                <p className="text-xs font-medium text-ink-secondary">
                  {tradition}
                </p>
                <div className="space-y-1.5">
                  {traditionSchools.map((school) => (
                    <FilterChip
                      key={school}
                      label={schoolLabel(school)}
                      active={schools.includes(school)}
                      color={traditionMarkerColor(tradition)}
                      onClick={() => toggleSchool(school)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export function useActiveFilterCount() {
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const query = useExploreStore((s) => s.query);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const showPlaceTypes = entityFilter !== "people";
  return (
    traditions.length +
    schools.length +
    (showPlaceTypes ? types.length : 0) +
    (query.length > 0 ? 1 : 0)
  );
}
