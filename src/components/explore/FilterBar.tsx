"use client";

import type { ReactNode } from "react";
import { CaretRight, Crosshair, MapPin, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  BUDDHIST_TRADITION_ID,
  countLineageFilterSelections,
  getLineageFilterTree,
  isBuddhismRootSelected,
  isLineageSchoolVisuallyActive,
  isSubschoolVisuallyActive,
  subschoolLabel,
  type LineageFilterState,
  type LineageSchoolNode,
} from "@/lib/schools";
import {
  getExplorePlaceTypeOptions,
  getUniqueValues,
  traditionMarkerColor,
} from "@/lib/places";
import { PEOPLE_SORT_LABELS, type PeopleSortOrder } from "@/lib/teacher-groups";
import {
  PEOPLE_LIFE_ERA_LABELS,
  PEOPLE_LIFE_ERA_ORDER,
} from "@/lib/teacher-life-era";
import { NEAR_YOU_LABEL } from "@/lib/user-location";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import type { PlaceMarker, PlaceType } from "@/types/place";
import type { Teacher } from "@/types/teacher";

interface FilterBarProps {
  places: PlaceMarker[];
  teachers: Teacher[];
  entityFilter: EntityFilter;
  onClose?: () => void;
}

function FilterChip({
  label,
  active,
  onClick,
  color,
  nested = false,
  expandable = false,
  expanded = false,
  onToggleExpand,
  expandLabel,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  nested?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  expandLabel?: string;
}) {
  return (
    <div
      className={`inline-flex w-full items-stretch overflow-hidden rounded-lg border text-left font-medium transition ${
        nested ? "text-[12px]" : "text-xs"
      } ${
        active
          ? "border-accent bg-accent text-brand-foreground shadow-sm"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex min-w-0 flex-1 items-center gap-2 text-left ${
          nested ? "px-2.5 py-1.5" : "px-3 py-2"
        }`}
      >
        {color && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
        <span className="min-w-0 flex-1">{label}</span>
      </button>

      {expandable && onToggleExpand && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand();
          }}
          aria-expanded={expanded}
          aria-label={expandLabel}
          className={`inline-flex shrink-0 items-center justify-center border-l px-2 transition ${
            active
              ? "border-brand-foreground/20 hover:bg-brand-foreground/10"
              : "border-border hover:bg-surface-muted"
          }`}
        >
          <CaretRight
            size={14}
            weight="bold"
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      )}
    </div>
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
      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function LineageSchoolRow({
  school,
  depth,
  lineageState,
  expandedKeys,
  onToggleExpanded,
  onToggleLineageSchool,
  onToggleSubschool,
}: {
  school: LineageSchoolNode;
  depth: number;
  lineageState: LineageFilterState;
  expandedKeys: Set<string>;
  onToggleExpanded: (key: string) => void;
  onToggleLineageSchool: (id: string) => void;
  onToggleSubschool: (slug: string) => void;
}) {
  const expandKey = `school:${school.id}`;
  const hasSubschools = school.subschools.length > 0;
  const expanded = expandedKeys.has(expandKey);
  const color = traditionMarkerColor(school.id);
  const schoolActive = isLineageSchoolVisuallyActive(lineageState, school.id);

  return (
    <div
      className="space-y-1.5"
      style={{ marginLeft: depth > 0 ? `${depth * 12}px` : undefined }}
    >
      <FilterChip
        label={school.label}
        active={schoolActive}
        color={color}
        expandable={hasSubschools}
        expanded={expanded}
        expandLabel={`${expanded ? "Collapse" : "Expand"} ${school.label} subschools`}
        onClick={() => onToggleLineageSchool(school.id)}
        onToggleExpand={() => onToggleExpanded(expandKey)}
      />

      {hasSubschools && expanded && (
        <div className="space-y-1.5 border-l border-border pl-3">
          {school.subschools.map((subschool) => (
            <FilterChip
              key={subschool}
              label={subschoolLabel(subschool)}
              active={isSubschoolVisuallyActive(lineageState, subschool)}
              color={color}
              nested
              onClick={() => onToggleSubschool(subschool)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BuddhismFilterTree({
  schools,
  lineageState,
  expandedKeys,
  onToggleExpanded,
  onToggleBuddhismRoot,
  onToggleLineageSchool,
  onToggleSubschool,
}: {
  schools: LineageSchoolNode[];
  lineageState: LineageFilterState;
  expandedKeys: Set<string>;
  onToggleExpanded: (key: string) => void;
  onToggleBuddhismRoot: () => void;
  onToggleLineageSchool: (id: string) => void;
  onToggleSubschool: (slug: string) => void;
}) {
  const rootExpandKey = `tradition:${BUDDHIST_TRADITION_ID}`;
  const hasSchools = schools.length > 0;
  const expanded = expandedKeys.has(rootExpandKey);
  const color = traditionMarkerColor(BUDDHIST_TRADITION_ID);
  const buddhismActive = isBuddhismRootSelected(lineageState);

  return (
    <div className="space-y-1.5">
      <FilterChip
        label="Buddhism"
        active={buddhismActive}
        color={color}
        expandable={hasSchools}
        expanded={expanded}
        expandLabel={`${expanded ? "Collapse" : "Expand"} Buddhist schools`}
        onClick={onToggleBuddhismRoot}
        onToggleExpand={() => onToggleExpanded(rootExpandKey)}
      />

      {hasSchools && expanded && (
        <div className="space-y-1.5 border-l border-border pl-3">
          {schools.map((school) => (
            <LineageSchoolRow
              key={school.id}
              school={school}
              depth={0}
              lineageState={lineageState}
              expandedKeys={expandedKeys}
              onToggleExpanded={onToggleExpanded}
              onToggleLineageSchool={onToggleLineageSchool}
              onToggleSubschool={onToggleSubschool}
            />
          ))}
        </div>
      )}
    </div>
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
  const toggleBuddhismRoot = useExploreStore((s) => s.toggleBuddhismRoot);
  const toggleLineageSchool = useExploreStore((s) => s.toggleLineageSchool);
  const toggleSubschool = useExploreStore((s) => s.toggleSubschool);
  const toggleType = useExploreStore((s) => s.toggleType);
  const clearTypes = useExploreStore((s) => s.clearTypes);
  const clearTraditions = useExploreStore((s) => s.clearTraditions);
  const clearFilters = useExploreStore((s) => s.clearFilters);
  const query = useExploreStore((s) => s.query);
  const peopleSort = useExploreStore((s) => s.peopleSort);
  const setPeopleSort = useExploreStore((s) => s.setPeopleSort);
  const peopleLifeEra = useExploreStore((s) => s.peopleLifeEra);
  const setPeopleLifeEra = useExploreStore((s) => s.setPeopleLifeEra);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const setLocationFilter = useExploreStore((s) => s.setLocationFilter);

  const lineageState = useMemo(
    () => ({ traditions, schools }),
    [traditions, schools],
  );

  const placeOptions = useMemo(() => {
    if (entityFilter === "locations") {
      return {
        traditions: [] as string[],
        types: getExplorePlaceTypeOptions(),
        faiths: [] as string[],
      };
    }
    return getUniqueValues(places);
  }, [entityFilter, places]);

  const lineageTree = useMemo(
    () => getLineageFilterTree(places, teachers, entityFilter),
    [places, teachers, entityFilter],
  );

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedKeys((current) => {
      const next = new Set(current);

      if (
        isBuddhismRootSelected(lineageState) ||
        lineageTree.buddhism.schools.some(
          (school) =>
            isLineageSchoolVisuallyActive(lineageState, school.id) ||
            school.subschools.some((subschool) =>
              isSubschoolVisuallyActive(lineageState, subschool),
            ),
        )
      ) {
        next.add(`tradition:${BUDDHIST_TRADITION_ID}`);
      }

      for (const school of lineageTree.buddhism.schools) {
        if (
          isLineageSchoolVisuallyActive(lineageState, school.id) ||
          school.subschools.some((subschool) =>
            isSubschoolVisuallyActive(lineageState, subschool),
          )
        ) {
          next.add(`school:${school.id}`);
        }
      }

      return next;
    });
  }, [lineageState, lineageTree.buddhism.schools]);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const showPlaceTypes = entityFilter !== "people";
  const showPeopleSort = entityFilter === "people";
  const activeFilterCount =
    countLineageFilterSelections(lineageState) +
    (showPlaceTypes ? types.length : 0) +
    (showPeopleSort && peopleLifeEra !== "all" ? 1 : 0) +
    (query.length > 0 ? 1 : 0) +
    (locationFilter ? 1 : 0);

  const showBuddhismTree =
    entityFilter !== "people" ||
    lineageTree.buddhism.schools.length > 0 ||
    isBuddhismRootSelected(lineageState);

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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
              aria-label="Close filters"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {locationFilter && (
          <FilterSection title="Location">
            <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">
              {locationFilter.label === NEAR_YOU_LABEL ? (
                <Crosshair size={12} weight="bold" className="shrink-0 text-brand" />
              ) : (
                <MapPin size={12} weight="bold" className="shrink-0 text-brand" />
              )}
              <span className="truncate">
                {locationFilter.label === NEAR_YOU_LABEL
                  ? "Near you"
                  : `Near ${locationFilter.label}`}
              </span>
              <button
                type="button"
                onClick={() => setLocationFilter(null)}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
                aria-label={
                  locationFilter.label === NEAR_YOU_LABEL
                    ? "Clear near you"
                    : `Clear near ${locationFilter.label}`
                }
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          </FilterSection>
        )}

        {showPeopleSort && (
          <>
            <FilterSection title="Era">
              {PEOPLE_LIFE_ERA_ORDER.map((era) => (
                <FilterChip
                  key={era}
                  label={PEOPLE_LIFE_ERA_LABELS[era]}
                  active={peopleLifeEra === era}
                  onClick={() => setPeopleLifeEra(era)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Sort by">
              {(Object.keys(PEOPLE_SORT_LABELS) as PeopleSortOrder[]).map((sort) => (
                <FilterChip
                  key={sort}
                  label={PEOPLE_SORT_LABELS[sort]}
                  active={peopleSort === sort}
                  onClick={() => setPeopleSort(sort)}
                />
              ))}
            </FilterSection>
          </>
        )}

        {showPlaceTypes && placeOptions.types.length > 0 && (
          <FilterSection title="Type">
            <FilterChip
              label="All"
              active={types.length === 0}
              onClick={clearTypes}
            />
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

        {(showBuddhismTree || lineageTree.otherTraditions.length > 0) && (
          <FilterSection title="Tradition">
            <FilterChip
              label="All"
              active={traditions.length === 0 && schools.length === 0}
              onClick={clearTraditions}
            />
            {showBuddhismTree && (
              <BuddhismFilterTree
                schools={lineageTree.buddhism.schools}
                lineageState={lineageState}
                expandedKeys={expandedKeys}
                onToggleExpanded={toggleExpanded}
                onToggleBuddhismRoot={toggleBuddhismRoot}
                onToggleLineageSchool={toggleLineageSchool}
                onToggleSubschool={toggleSubschool}
              />
            )}

            {lineageTree.otherTraditions.map(({ id, label }) => (
              <FilterChip
                key={id}
                label={label}
                active={traditions.includes(id)}
                color={traditionMarkerColor(id)}
                onClick={() => toggleTradition(id)}
              />
            ))}
          </FilterSection>
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
  const peopleLifeEra = useExploreStore((s) => s.peopleLifeEra);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const showPlaceTypes = entityFilter !== "people";
  return (
    countLineageFilterSelections({ traditions, schools }) +
    (showPlaceTypes ? types.length : 0) +
    (entityFilter === "people" && peopleLifeEra !== "all" ? 1 : 0) +
    (query.length > 0 ? 1 : 0) +
    (locationFilter ? 1 : 0)
  );
}
