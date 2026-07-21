"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, MapPin, X } from "@phosphor-icons/react";
import {
  SearchScopeDropdown,
  getSearchPlaceholder,
  useSearchScope,
  type ExploreEntity,
} from "@/components/explore/EntityToggle";
import {
  pathFromEntityFilter,
  personProfilePath,
} from "@/lib/explore-routes";
import type { MapBounds } from "@/lib/coords";
import { useExploreStore, type LocationFilter } from "@/store/explore-store";

type PlaceSuggestion = {
  id: string;
  name: string;
  address: string;
  tradition: string;
  type: string;
};

type PersonSuggestion = {
  slug: string;
  name: string;
  tradition: string;
  location: string;
};

type LocationSuggestion = {
  label: string;
  lat: number;
  lng: number;
  bounds: MapBounds;
};

type Suggestion =
  | { kind: "place"; place: PlaceSuggestion }
  | { kind: "person"; person: PersonSuggestion }
  | { kind: "location"; location: LocationSuggestion };

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function ExploreSearchField() {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const query = useExploreStore((s) => s.query);
  const setQuery = useExploreStore((s) => s.setQuery);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const setLocationFilter = useExploreStore((s) => s.setLocationFilter);
  const setMobileView = useExploreStore((s) => s.setMobileView);
  const { scope, setScope } = useSearchScope();

  const [draft, setDraft] = useState(query);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>(
    [],
  );
  const [personSuggestions, setPersonSuggestions] = useState<
    PersonSuggestion[]
  >([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedDraft = useDebouncedValue(draft.trim(), 300);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const updateMenuPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (debouncedDraft.length < 2) {
      setPlaceSuggestions([]);
      setPersonSuggestions([]);
      setLocationSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const q = encodeURIComponent(debouncedDraft);

    async function load() {
      try {
        const entityReq =
          scope === "locations"
            ? fetch(`/api/places/search?q=${q}&page=1`, {
                signal: controller.signal,
              })
            : fetch(`/api/explore/teachers?q=${q}&page=1&pageSize=5`, {
                signal: controller.signal,
              });

        const geoReq =
          debouncedDraft.length >= 3
            ? fetch(`/api/geocode/search?q=${q}`, {
                signal: controller.signal,
              })
            : null;

        const [entityRes, geoRes] = await Promise.all([
          entityReq,
          geoReq,
        ]);

        if (entityRes.ok) {
          const data = (await entityRes.json()) as {
            places?: PlaceSuggestion[];
            teachers?: Array<{
              slug: string;
              name: string;
              tradition: string;
              location: string;
            }>;
          };
          if (scope === "locations") {
            setPlaceSuggestions((data.places ?? []).slice(0, 5));
            setPersonSuggestions([]);
          } else {
            setPersonSuggestions(
              (data.teachers ?? []).slice(0, 5).map((teacher) => ({
                slug: teacher.slug,
                name: teacher.name,
                tradition: teacher.tradition,
                location: teacher.location,
              })),
            );
            setPlaceSuggestions([]);
          }
        }

        if (geoRes?.ok) {
          const data = (await geoRes.json()) as {
            locations?: LocationSuggestion[];
          };
          setLocationSuggestions((data.locations ?? []).slice(0, 5));
        } else if (!geoReq) {
          setLocationSuggestions([]);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    void load();
    return () => controller.abort();
  }, [debouncedDraft, scope]);

  const suggestions: Suggestion[] = [
    ...placeSuggestions.map((place) => ({ kind: "place" as const, place })),
    ...personSuggestions.map((person) => ({ kind: "person" as const, person })),
    ...locationSuggestions.map((location) => ({
      kind: "location" as const,
      location,
    })),
  ];

  useEffect(() => {
    setHighlight(0);
  }, [debouncedDraft, scope, suggestions.length]);

  const navigateToScope = (nextScope: ExploreEntity = scope) => {
    const href = pathFromEntityFilter(nextScope);
    if (href !== pathname) {
      router.push(href);
    }
  };

  const applyLocation = (location: LocationSuggestion) => {
    const next: LocationFilter = {
      label: location.label,
      lat: location.lat,
      lng: location.lng,
      bounds: location.bounds,
    };
    setLocationFilter(next);
    setDraft("");
    setQuery("");
    setScope("locations");
    setMobileView("map");
    navigateToScope("locations");
    setMenuOpen(false);
  };

  const submitSearch = () => {
    const selected = suggestions[highlight];
    if (menuOpen && selected) {
      if (selected.kind === "location") {
        applyLocation(selected.location);
        return;
      }
      if (selected.kind === "place") {
        setMenuOpen(false);
        router.push(`/place/${selected.place.id}`);
        return;
      }
      setMenuOpen(false);
      router.push(personProfilePath(selected.person.slug));
      return;
    }

    setQuery(draft);
    navigateToScope();
    setMenuOpen(false);
  };

  const clearSearch = () => {
    setDraft("");
    setQuery("");
    setMenuOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (!suggestions.length) return;
      event.preventDefault();
      setMenuOpen(true);
      setHighlight((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      if (!suggestions.length) return;
      event.preventDefault();
      setMenuOpen(true);
      setHighlight((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
      return;
    }
    if (event.key === "Escape") {
      setMenuOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  const showMenu =
    menuOpen && draft.trim().length >= 2 && suggestions.length > 0;

  const dropdown =
    showMenu &&
    createPortal(
      <div
        ref={dropdownRef}
        id={listId}
        role="listbox"
        aria-label="Search suggestions"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
        }}
        className="z-[1000] max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-border bg-surface-elevated shadow-[var(--shadow-float)]"
      >
        {placeSuggestions.length > 0 && (
          <SuggestionGroup label="Places">
            {placeSuggestions.map((place, index) => (
              <SuggestionButton
                key={place.id}
                active={highlight === index}
                label={place.name}
                detail={[place.type, place.address].filter(Boolean).join(" · ")}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/place/${place.id}`);
                }}
              />
            ))}
          </SuggestionGroup>
        )}

        {personSuggestions.length > 0 && (
          <SuggestionGroup label="People">
            {personSuggestions.map((person, index) => {
              const flatIndex = placeSuggestions.length + index;
              return (
                <SuggestionButton
                  key={person.slug}
                  active={highlight === flatIndex}
                  label={person.name}
                  detail={[person.tradition, person.location]
                    .filter(Boolean)
                    .join(" · ")}
                  onMouseEnter={() => setHighlight(flatIndex)}
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(personProfilePath(person.slug));
                  }}
                />
              );
            })}
          </SuggestionGroup>
        )}

        {locationSuggestions.length > 0 && (
          <SuggestionGroup label="Near">
            {locationSuggestions.map((location, index) => {
              const flatIndex =
                placeSuggestions.length + personSuggestions.length + index;
              return (
                <SuggestionButton
                  key={`${location.label}-${location.lat}-${location.lng}`}
                  active={highlight === flatIndex}
                  label={location.label}
                  detail="Show map near here"
                  icon={<MapPin size={16} weight="bold" />}
                  onMouseEnter={() => setHighlight(flatIndex)}
                  onClick={() => applyLocation(location)}
                />
              );
            })}
          </SuggestionGroup>
        )}
      </div>,
      document.body,
    );

  return (
    <div ref={rootRef} className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex w-full min-w-0 items-stretch rounded-full border border-border bg-surface shadow-[var(--shadow-card)] transition focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(209,127,40,0.15)] hover:shadow-[0_2px_12px_rgba(58,52,43,0.08)]">
        <SearchScopeDropdown value={scope} onChange={setScope} />
        <span className="my-2 w-px shrink-0 bg-border" aria-hidden />
        <label className="group relative block min-w-0 flex-1">
          <span className="sr-only">Search directory</span>
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand"
          />
          <input
            type="search"
            role="combobox"
            aria-expanded={showMenu}
            aria-controls={listId}
            aria-autocomplete="list"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setMenuOpen(true);
              updateMenuPosition();
            }}
            onFocus={() => {
              setMenuOpen(true);
              updateMenuPosition();
            }}
            onKeyDown={handleKeyDown}
            placeholder={getSearchPlaceholder(scope)}
            className="w-full rounded-r-full bg-transparent py-2.5 pl-10 pr-10 text-sm text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {draft && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </label>
      </div>

      {locationFilter && (
        <div className="flex min-w-0 items-center gap-2 px-1">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">
            <MapPin size={12} weight="bold" className="shrink-0 text-brand" />
            <span className="truncate">Near {locationFilter.label}</span>
            <button
              type="button"
              onClick={() => setLocationFilter(null)}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
              aria-label={`Clear near ${locationFilter.label}`}
            >
              <X size={10} weight="bold" />
            </button>
          </span>
        </div>
      )}

      {dropdown}
    </div>
  );
}

function SuggestionGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="py-1">
      <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function SuggestionButton({
  label,
  detail,
  active,
  icon,
  onClick,
  onMouseEnter,
}: {
  label: string;
  detail?: string;
  active: boolean;
  icon?: ReactNode;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition ${
        active
          ? "bg-surface-muted text-ink"
          : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
      }`}
    >
      {icon ? <span className="mt-0.5 shrink-0 text-brand">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">
          {label}
        </span>
        {detail ? (
          <span className="mt-0.5 block truncate text-xs text-ink-muted">
            {detail}
          </span>
        ) : null}
      </span>
    </button>
  );
}
