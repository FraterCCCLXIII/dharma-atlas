"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleNotch,
  Crosshair,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  Path,
  X,
} from "@phosphor-icons/react";
import {
  SearchScopeDropdown,
  getSearchPlaceholder,
  useSearchScope,
  type ExploreEntity,
} from "@/components/explore/EntityToggle";
import { useNavBarChromeCompact } from "@/components/layout/NavBarLogoContext";
import {
  pilgrimageRoutePath,
  pilgrimageSitePath,
} from "@/data/pilgrimage";
import {
  pathFromSearchScope,
  personProfilePath,
  placeProfilePath,
} from "@/lib/explore-routes";
import type { MapBounds } from "@/lib/coords";
import {
  expandBounds,
  matchTermsForLocationLabel,
  queryMatchesLocationLabel,
} from "@/lib/location-filter";
import {
  searchPilgrimageCatalog,
  type PilgrimageSearchHit,
} from "@/lib/pilgrimage-search";
import {
  isLocationNearYou,
  loadStoredNearBounds,
  NEAR_YOU_LABEL,
  resolveNearBoundsForLabeling,
  resolveUserLocation,
  storeNearBounds,
} from "@/lib/user-location";
import { useExploreStore, type LocationFilter } from "@/store/explore-store";
import { usePilgrimageStore } from "@/store/pilgrimage-store";

type PlaceSuggestion = {
  id: string;
  name: string;
  address: string;
  tradition: string;
  type: string;
  lat?: number;
  lng?: number;
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
  matchTerms?: string[];
};

type Suggestion =
  | { kind: "place"; place: PlaceSuggestion }
  | { kind: "person"; person: PersonSuggestion }
  | { kind: "location"; location: LocationSuggestion }
  | { kind: "pilgrimage"; entry: PilgrimageSearchHit };

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
  const chromeCompact = useNavBarChromeCompact();
  const query = useExploreStore((s) => s.query);
  const setQuery = useExploreStore((s) => s.setQuery);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const setLocationFilter = useExploreStore((s) => s.setLocationFilter);
  const setMobileView = useExploreStore((s) => s.setMobileView);
  const pilgrimageQuery = usePilgrimageStore((s) => s.query);
  const setPilgrimageQuery = usePilgrimageStore((s) => s.setQuery);
  const { scope, setScope } = useSearchScope();

  const [draft, setDraft] = useState(query);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [nearYouLoading, setNearYouLoading] = useState(false);
  const [nearYouError, setNearYouError] = useState<string | null>(null);
  /** Bounds used to badge “Near you” in search results — independent of filter. */
  const [nearYouBounds, setNearYouBounds] = useState<MapBounds | null>(null);
  const nearBoundsSourceRef = useRef<"browser" | "ip" | "stored" | null>(null);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>(
    [],
  );
  const [personSuggestions, setPersonSuggestions] = useState<
    PersonSuggestion[]
  >([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [pilgrimageSuggestions, setPilgrimageSuggestions] = useState<
    PilgrimageSearchHit[]
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
    setDraft(scope === "pilgrimage" ? pilgrimageQuery : query);
  }, [scope, query, pilgrimageQuery]);

  const rememberNearBounds = useCallback((bounds: MapBounds) => {
    setNearYouBounds(bounds);
    storeNearBounds(bounds);
  }, []);

  // Restore session bounds, then refresh for badges (works with filter off).
  useEffect(() => {
    const stored = loadStoredNearBounds();
    if (stored) {
      nearBoundsSourceRef.current = "stored";
      setNearYouBounds(stored);
    }

    let cancelled = false;
    void resolveNearBoundsForLabeling().then((resolved) => {
      if (cancelled || !resolved) return;
      const { bounds, source } = resolved;
      setNearYouBounds((current) => {
        // Active Near You filter owns bounds while pressed.
        if (locationFilter?.label === NEAR_YOU_LABEL) return current;
        // Upgrade stored/IP guess to GPS; otherwise keep what we have.
        if (
          current &&
          source !== "browser" &&
          nearBoundsSourceRef.current !== null
        ) {
          return current;
        }
        nearBoundsSourceRef.current = source;
        storeNearBounds(bounds);
        return bounds;
      });
    });
    return () => {
      cancelled = true;
    };
    // Intentionally once on mount for labeling; filter sync is separate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only warm-up
  }, []);

  // When Near You filter is on, keep badge bounds in sync with it.
  useEffect(() => {
    if (locationFilter?.label === NEAR_YOU_LABEL) {
      nearBoundsSourceRef.current = "browser";
      rememberNearBounds(locationFilter.bounds);
    }
  }, [locationFilter, rememberNearBounds]);

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
      setPilgrimageSuggestions([]);
      return;
    }

    if (scope === "pilgrimage") {
      setPilgrimageSuggestions(searchPilgrimageCatalog(debouncedDraft, 8));
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
            const places = data.places ?? [];
            const sorted = nearYouBounds
              ? [...places].sort((a, b) => {
                  const aNear = isLocationNearYou(a.lat, a.lng, nearYouBounds);
                  const bNear = isLocationNearYou(b.lat, b.lng, nearYouBounds);
                  if (aNear === bNear) return 0;
                  return aNear ? -1 : 1;
                })
              : places;
            setPlaceSuggestions(sorted.slice(0, 5));
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

        setPilgrimageSuggestions([]);

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
  }, [debouncedDraft, scope, nearYouBounds]);

  const matchingLocation =
    scope === "pilgrimage"
      ? undefined
      : locationSuggestions.find((location) =>
          queryMatchesLocationLabel(draft, location.label),
        );
  // When the query is clearly a place name ("California"), lead with Near
  // so Enter doesn't land on a partial place-name text match.
  const suggestions: Suggestion[] =
    scope === "pilgrimage"
      ? pilgrimageSuggestions.map((entry) => ({
          kind: "pilgrimage" as const,
          entry,
        }))
      : matchingLocation
        ? [
            ...locationSuggestions.map((location) => ({
              kind: "location" as const,
              location,
            })),
            ...placeSuggestions.map((place) => ({
              kind: "place" as const,
              place,
            })),
            ...personSuggestions.map((person) => ({
              kind: "person" as const,
              person,
            })),
          ]
        : [
            ...placeSuggestions.map((place) => ({
              kind: "place" as const,
              place,
            })),
            ...personSuggestions.map((person) => ({
              kind: "person" as const,
              person,
            })),
            ...locationSuggestions.map((location) => ({
              kind: "location" as const,
              location,
            })),
          ];

  useEffect(() => {
    setHighlight(0);
  }, [debouncedDraft, scope, suggestions.length]);

  const navigateToScope = (nextScope: ExploreEntity = scope) => {
    const href = pathFromSearchScope(nextScope);
    if (href !== pathname) {
      router.push(href);
    }
  };

  const nearYouActive = locationFilter?.label === NEAR_YOU_LABEL;

  /** Leaving Near You for any other search/result should clear the GPS filter. */
  const clearNearYouIfActive = () => {
    if (nearYouActive) {
      setLocationFilter(null);
      setNearYouError(null);
    }
  };

  const applyLocation = (location: LocationSuggestion) => {
    const next: LocationFilter = {
      label: location.label,
      lat: location.lat,
      lng: location.lng,
      bounds: expandBounds(location.bounds, 0.04),
      matchTerms:
        location.matchTerms != null
          ? location.matchTerms
          : matchTermsForLocationLabel(location.label),
    };
    setLocationFilter(next);
    setDraft("");
    setQuery("");
    setNearYouError(null);
    setScope("locations");
    setMobileView("map");
    navigateToScope("locations");
    setMenuOpen(false);
  };

  const openPlaceResult = (place: { id: string; slug?: string | null }) => {
    clearNearYouIfActive();
    setMenuOpen(false);
    // Full navigation — soft-nav from explore can stall on Leaflet unmount.
    window.location.assign(placeProfilePath(place));
  };

  const openPersonResult = (slug: string) => {
    clearNearYouIfActive();
    setMenuOpen(false);
    router.push(personProfilePath(slug));
  };

  const openPilgrimageResult = (entry: PilgrimageSearchHit) => {
    clearNearYouIfActive();
    setMenuOpen(false);
    setPilgrimageQuery("");
    const href =
      entry.kind === "route"
        ? pilgrimageRoutePath(entry.slug)
        : pilgrimageSitePath(entry.slug);
    router.push(href);
  };

  const applyNearYou = async () => {
    if (nearYouLoading) return;

    if (nearYouActive) {
      setLocationFilter(null);
      setNearYouError(null);
      return;
    }

    setNearYouLoading(true);
    setNearYouError(null);
    setMenuOpen(false);

    try {
      const location = await resolveUserLocation();
      if (!location) {
        setNearYouError("Couldn't find your location. Check permissions and try again.");
        return;
      }

      nearBoundsSourceRef.current = location.source;
      rememberNearBounds(location.bounds);
      applyLocation({
        label: NEAR_YOU_LABEL,
        lat: location.lat,
        lng: location.lng,
        bounds: location.bounds,
        // Bbox-only — avoid address token matches for the literal "you".
        matchTerms: [],
      });
    } finally {
      setNearYouLoading(false);
    }
  };

  const submitSearch = () => {
    const selected = menuOpen ? suggestions[highlight] : undefined;

    if (scope === "pilgrimage") {
      if (selected?.kind === "pilgrimage") {
        openPilgrimageResult(selected.entry);
        return;
      }
      clearNearYouIfActive();
      setPilgrimageQuery(draft);
      navigateToScope("pilgrimage");
      setMenuOpen(false);
      return;
    }

    // Prefer geo for locality queries ("California"), unless the user has
    // explicitly moved the highlight onto a place/person row.
    if (
      matchingLocation &&
      (!selected || selected.kind === "location")
    ) {
      applyLocation(
        selected?.kind === "location" ? selected.location : matchingLocation,
      );
      return;
    }

    if (selected) {
      if (selected.kind === "location") {
        applyLocation(selected.location);
        return;
      }
      if (selected.kind === "place") {
        openPlaceResult(selected.place);
        return;
      }
      if (selected.kind === "person") {
        openPersonResult(selected.person.slug);
        return;
      }
      if (selected.kind === "pilgrimage") {
        openPilgrimageResult(selected.entry);
        return;
      }
    }

    if (matchingLocation) {
      applyLocation(matchingLocation);
      return;
    }

    clearNearYouIfActive();
    setQuery(draft);
    navigateToScope();
    setMenuOpen(false);
  };

  const clearSearch = () => {
    setDraft("");
    if (scope === "pilgrimage") {
      setPilgrimageQuery("");
    } else {
      setQuery("");
    }
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

  const suggestionGroups = (() => {
    const groups: { label: string; items: { suggestion: Suggestion; index: number }[] }[] =
      [];
    const ensureGroup = (label: string) => {
      let group = groups.find((entry) => entry.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      return group;
    };

    suggestions.forEach((suggestion, index) => {
      if (suggestion.kind === "location") {
        // "Areas" — not "Near" — so this isn't confused with Near You.
        ensureGroup("Areas").items.push({ suggestion, index });
      } else if (suggestion.kind === "place") {
        ensureGroup("Places").items.push({ suggestion, index });
      } else if (suggestion.kind === "person") {
        ensureGroup("People").items.push({ suggestion, index });
      } else if (suggestion.entry.kind === "route") {
        ensureGroup("Routes").items.push({ suggestion, index });
      } else {
        ensureGroup("Sites").items.push({ suggestion, index });
      }
    });

    return groups;
  })();

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
        {suggestionGroups.map((group) => (
          <SuggestionGroup key={group.label} label={group.label}>
            {group.items.map(({ suggestion, index }) => {
              if (suggestion.kind === "location") {
                const { location } = suggestion;
                return (
                  <SuggestionButton
                    key={`${location.label}-${location.lat}-${location.lng}`}
                    active={highlight === index}
                    label={location.label}
                    detail="Show places in this area"
                    icon={<MapPin size={16} weight="bold" />}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => applyLocation(location)}
                  />
                );
              }
              if (suggestion.kind === "place") {
                const { place } = suggestion;
                const nearYou = isLocationNearYou(
                  place.lat,
                  place.lng,
                  nearYouBounds,
                );
                return (
                  <SuggestionButton
                    key={place.id}
                    active={highlight === index}
                    label={place.name}
                    detail={[place.type, place.address]
                      .filter(Boolean)
                      .join(" · ")}
                    badge={nearYou ? "Near you" : undefined}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => openPlaceResult(place)}
                  />
                );
              }
              if (suggestion.kind === "person") {
                const { person } = suggestion;
                return (
                  <SuggestionButton
                    key={person.slug}
                    active={highlight === index}
                    label={person.name}
                    detail={[person.tradition, person.location]
                      .filter(Boolean)
                      .join(" · ")}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => openPersonResult(person.slug)}
                  />
                );
              }
              const { entry } = suggestion;
              return (
                <SuggestionButton
                  key={`${entry.kind}-${entry.slug}`}
                  active={highlight === index}
                  label={entry.name}
                  detail={[entry.tradition, entry.region]
                    .filter(Boolean)
                    .join(" · ")}
                  icon={
                    entry.kind === "route" ? (
                      <Path size={16} weight="bold" />
                    ) : (
                      <MapTrifold size={16} weight="bold" />
                    )
                  }
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => openPilgrimageResult(entry)}
                />
              );
            })}
          </SuggestionGroup>
        ))}
      </div>,
      document.body,
    );

  return (
    <div ref={rootRef} className="w-full min-w-0">
      <div className="flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-full border border-border bg-surface transition focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(209,127,40,0.15)]">
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
              const next = e.target.value;
              setDraft(next);
              if (scope === "pilgrimage") {
                setPilgrimageQuery(next);
              }
              setMenuOpen(true);
              updateMenuPosition();
            }}
            onFocus={() => {
              setMenuOpen(true);
              updateMenuPosition();
              // Upgrade badge location to GPS if permission was granted earlier.
              if (nearBoundsSourceRef.current !== "browser") {
                void resolveNearBoundsForLabeling().then((resolved) => {
                  if (!resolved || resolved.source !== "browser") return;
                  nearBoundsSourceRef.current = "browser";
                  rememberNearBounds(resolved.bounds);
                });
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={getSearchPlaceholder(scope)}
            className={`h-full w-full bg-transparent py-0 pl-10 text-sm leading-none text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
              draft ? "pr-9" : "pr-0"
            }`}
          />
          {draft && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </label>
        {scope !== "pilgrimage" ? (
          <>
            <span className="my-2 w-px shrink-0 bg-border" aria-hidden />
            <button
              type="button"
              onClick={() => void applyNearYou()}
              disabled={nearYouLoading}
              aria-pressed={nearYouActive}
              aria-label={
                nearYouActive ? "Clear near you filter" : "Show places near you"
              }
              title={nearYouActive ? "Clear near you" : "Near You"}
              className={`inline-flex h-full shrink-0 items-center gap-1.5 rounded-r-full px-2.5 text-xs font-semibold leading-none transition sm:px-3.5 sm:text-sm ${
                nearYouActive
                  ? "bg-brand/10 text-brand"
                  : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
              } disabled:cursor-wait disabled:opacity-70`}
            >
              {nearYouLoading ? (
                <CircleNotch size={16} weight="bold" className="animate-spin" />
              ) : (
                <Crosshair size={16} weight="bold" className="text-brand" />
              )}
              {chromeCompact !== true ? (
                <span
                  className={
                    chromeCompact === false
                      ? "whitespace-nowrap"
                      : "hidden whitespace-nowrap min-[1100px]:inline"
                  }
                >
                  Near You
                </span>
              ) : null}
            </button>
          </>
        ) : null}
      </div>

      {nearYouError ? (
        <p className="mt-1.5 px-1 text-xs text-red-700" role="status" aria-live="polite">
          {nearYouError}
        </p>
      ) : null}

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
  badge,
  active,
  icon,
  onClick,
  onMouseEnter,
}: {
  label: string;
  detail?: string;
  badge?: string;
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
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">{label}</span>
          {badge ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              <Crosshair size={10} weight="bold" />
              {badge}
            </span>
          ) : null}
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
