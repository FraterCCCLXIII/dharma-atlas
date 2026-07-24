"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Reorder, useDragControls } from "motion/react";
import {
  ArrowLeft,
  DotsSixVertical,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { AuthModal } from "@/components/auth/AuthModal";
import { saveUserPilgrimageRoute } from "@/app/actions/user-pilgrimage-routes";
import { pilgrimageRoutePath, type PilgrimageRoute } from "@/data/pilgrimage";
import { authClient } from "@/lib/auth-client";
import {
  resolveCatalogStop,
  routeStopFromPlace,
  stopRefForPlace,
  type PlaceStopDetails,
  type RouteStopPoint,
} from "@/lib/pilgrimage-stop-ref";
import { MAP_STICKY_ASIDE, MAP_STICKY_SHELL } from "@/lib/map-shell-layout";
import { PilgrimageRouteMap } from "./PilgrimageRouteMap";

type PlaceSearchHit = {
  id: string;
  name: string;
  address: string;
  tradition: string;
  type: string;
  lat: number;
  lng: number;
  slug?: string;
  photo?: string | null;
  pilgrimageSlug?: string | null;
};

type AddCandidate = {
  ref: string;
  name: string;
  detail: string;
  place: PlaceStopDetails;
};

export function PilgrimageCustomizeEditor({
  route,
  savedRoute,
  initialPlaceDetails = {},
}: {
  /** Catalog (or synthetic) route used for map chrome / base reference. */
  route: PilgrimageRoute;
  /** When set, editor updates this saved itinerary instead of creating one. */
  savedRoute: {
    id: string;
    title: string;
    stopSlugs: string[];
    baseRouteSlug: string | null;
    shareId: string;
  };
  initialPlaceDetails?: Record<string, PlaceStopDetails>;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [title, setTitle] = useState(savedRoute.title);
  const [stopRefs, setStopRefs] = useState<string[]>([...savedRoute.stopSlugs]);
  const [placeDetails, setPlaceDetails] = useState<
    Record<string, PlaceStopDetails>
  >(initialPlaceDetails);
  const [addQuery, setAddQuery] = useState("");
  const [addCandidates, setAddCandidates] = useState<AddCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  /** Index to insert at when picking a site; null = add panel closed. */
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const stops = useMemo(() => {
    const resolved: RouteStopPoint[] = [];
    for (const ref of stopRefs) {
      const catalog = resolveCatalogStop(ref);
      if (catalog) {
        resolved.push(catalog);
        continue;
      }
      if (ref.startsWith("place:")) {
        const id = ref.slice("place:".length);
        const place = placeDetails[id];
        if (place) resolved.push(routeStopFromPlace(place));
      }
    }
    return resolved;
  }, [stopRefs, placeDetails]);

  useEffect(() => {
    if (insertAt == null) {
      setAddCandidates([]);
      setSearching(false);
      return;
    }
    const q = addQuery.trim();
    if (q.length < 2) {
      setAddCandidates([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      void fetch(`/api/places/search?q=${encodeURIComponent(q)}&page=1`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { places?: PlaceSearchHit[] };
          const existing = new Set(stopRefs);
          const next: AddCandidate[] = [];
          for (const place of data.places ?? []) {
            const details: PlaceStopDetails = {
              id: place.id,
              name: place.name,
              lat: place.lat,
              lng: place.lng,
              address: place.address,
              photo: place.photo,
              slug: place.slug,
              pilgrimageSlug: place.pilgrimageSlug,
            };
            const ref = stopRefForPlace(details);
            if (existing.has(ref) || existing.has(placeStopAlias(details))) {
              continue;
            }
            next.push({
              ref,
              name: place.name,
              detail: [place.type, place.address].filter(Boolean).join(" · "),
              place: details,
            });
            if (next.length >= 8) break;
          }
          setAddCandidates(next);
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") {
            setAddCandidates([]);
          }
        })
        .finally(() => setSearching(false));
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [addQuery, insertAt, stopRefs]);

  function openInsert(index: number) {
    setInsertAt(index);
    setAddQuery("");
    setAddCandidates([]);
  }

  function closeInsert() {
    setInsertAt(null);
    setAddQuery("");
    setAddCandidates([]);
  }

  function removeStop(ref: string) {
    setStopRefs((prev) => prev.filter((s) => s !== ref));
  }

  function addStop(candidate: AddCandidate) {
    setPlaceDetails((prev) => ({
      ...prev,
      [candidate.place.id]: candidate.place,
    }));
    setStopRefs((prev) => {
      if (prev.includes(candidate.ref)) return prev;
      if (insertAt == null) return [...prev, candidate.ref];
      const next = [...prev];
      next.splice(insertAt, 0, candidate.ref);
      return next;
    });
    closeInsert();
  }

  function handleSave() {
    setError(null);
    if (!session?.user) {
      setAuthOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await saveUserPilgrimageRoute({
        id: savedRoute.id,
        title,
        stopSlugs: stopRefs,
        baseRouteSlug: savedRoute.baseRouteSlug,
      });
      if (!result.ok) {
        if (result.error.toLowerCase().includes("sign in")) {
          setAuthOpen(true);
          return;
        }
        setError(result.error);
        return;
      }
      router.push(`/pilgrimage/my/${result.id}`);
    });
  }

  async function handleAuthSuccess() {
    setAuthOpen(false);
    setError(null);
    handleSave();
  }

  return (
    <div className="lg:flex lg:items-start">
      <div className="min-w-0 px-4 pb-20 pt-8 sm:px-6 lg:w-1/2 lg:px-8 xl:pl-12">
        <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
          <Link
            href={`/pilgrimage/my/${savedRoute.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition hover:text-ink"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to saved route
          </Link>

          <header className="mt-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              Edit saved route
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Customize itinerary
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {savedRoute.baseRouteSlug ? (
                <>
                  Based on{" "}
                  <Link
                    href={pilgrimageRoutePath(savedRoute.baseRouteSlug)}
                    className="font-medium text-brand hover:underline"
                  >
                    {route.name}
                  </Link>
                  .{" "}
                </>
              ) : null}
              Drag to reorder, use + to insert places, then save your changes.
              This route is already in your account.
            </p>
          </header>

          <label className="mt-8 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Route title
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-ink outline-none transition focus:border-border-strong"
            />
          </label>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Stops ({stops.length})
            </h2>

            <div className="mt-4">
              <InsertGap
                suppressed={
                  isReordering || (insertAt != null && insertAt !== 0)
                }
                active={!isReordering && insertAt === 0}
                query={addQuery}
                candidates={insertAt === 0 ? addCandidates : []}
                searching={searching}
                onOpen={() => openInsert(0)}
                onClose={closeInsert}
                onQueryChange={setAddQuery}
                onPick={addStop}
                label="Add a stop at the start"
              />

              <Reorder.Group
                axis="y"
                values={stopRefs}
                onReorder={setStopRefs}
                className="flex list-none flex-col"
              >
                {stopRefs.map((ref, index) => {
                  const stop = stops.find((entry) => entry.key === ref);
                  if (!stop) return null;
                  const insertActive =
                    !isReordering && insertAt === index + 1;
                  return (
                    <SortableStopRow
                      key={ref}
                      stopRef={ref}
                      name={stop.name}
                      detail={stop.detail}
                      index={index}
                      image={stop.image}
                      hovered={hoveredSlug === ref}
                      elevate={insertActive}
                      onHover={setHoveredSlug}
                      onRemove={() => removeStop(ref)}
                      onDragStart={() => {
                        closeInsert();
                        setIsReordering(true);
                      }}
                      onDragEnd={() => setIsReordering(false)}
                      insertAfter={
                        <InsertGap
                          suppressed={
                            isReordering ||
                            (insertAt != null && insertAt !== index + 1)
                          }
                          active={insertActive}
                          query={addQuery}
                          candidates={
                            insertAt === index + 1 ? addCandidates : []
                          }
                          searching={searching}
                          onOpen={() => openInsert(index + 1)}
                          onClose={closeInsert}
                          onQueryChange={setAddQuery}
                          onPick={addStop}
                          label={`Add a stop after ${stop.name}`}
                        />
                      }
                    />
                  );
                })}
              </Reorder.Group>
            </div>
          </section>

          {error ? (
            <p className="mt-6 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || sessionPending || stops.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
            <p className="text-xs text-ink-muted">
              Already saved — share from the route page anytime.
            </p>
          </div>
        </div>
      </div>

      <aside className={MAP_STICKY_ASIDE}>
        <PilgrimageRouteMap
          route={route}
          resolvedStops={stops}
          hoveredSlug={hoveredSlug}
          className={MAP_STICKY_SHELL}
        />
      </aside>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={`/pilgrimage/my/${savedRoute.id}/edit`}
        title="Save your pilgrimage"
        description="Create an account or sign in to update this customized pilgrimage."
        initialMode="signup"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function placeStopAlias(place: PlaceStopDetails): string {
  return place.pilgrimageSlug?.trim() || "";
}

function SortableStopRow({
  stopRef,
  name,
  detail,
  index,
  image,
  hovered,
  elevate = false,
  onHover,
  onRemove,
  onDragStart,
  onDragEnd,
  insertAfter,
}: {
  stopRef: string;
  name: string;
  detail: string;
  index: number;
  image?: string;
  hovered: boolean;
  /** Lift above sibling rows so the insert panel is not covered by later + gaps. */
  elevate?: boolean;
  onHover: (slug: string | null) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  insertAfter: ReactNode;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={stopRef}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative list-none ${elevate ? "z-40" : "z-0"}`}
      whileDrag={{
        zIndex: 50,
        scale: 1.01,
      }}
    >
      <div
        onMouseEnter={() => onHover(stopRef)}
        onMouseLeave={() => onHover(null)}
        className={`flex items-center gap-2 rounded-xl border bg-surface-elevated p-3 shadow-[var(--shadow-card)] ${
          hovered
            ? "border-accent ring-2 ring-brand/20"
            : "border-border"
        }`}
      >
        <button
          type="button"
          aria-label={`Drag to reorder ${name}`}
          className="inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink active:cursor-grabbing"
          onPointerDown={(event) => controls.start(event)}
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            {index + 1}. {name}
          </span>
          <span className="text-xs text-ink-muted">{detail}</span>
        </span>
        <IconButton label="Remove stop" onClick={onRemove}>
          <Trash size={14} weight="bold" />
        </IconButton>
      </div>
      {insertAfter}
    </Reorder.Item>
  );
}

function InsertGap({
  active,
  suppressed = false,
  query,
  candidates,
  searching,
  onOpen,
  onClose,
  onQueryChange,
  onPick,
  label,
}: {
  active: boolean;
  /** Keep gap height while hiding controls so drag reorder doesn't collapse rows. */
  suppressed?: boolean;
  query: string;
  candidates: AddCandidate[];
  searching: boolean;
  onOpen: () => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onPick: (candidate: AddCandidate) => void;
  label: string;
}) {
  return (
    <div
      className={`relative h-7 ${active ? "z-40" : "z-20"}`}
      aria-hidden={suppressed || undefined}
    >
      {!suppressed ? (
        <div className="group absolute inset-x-0 top-0 flex h-7 items-center justify-center">
          <div className="absolute inset-x-8 h-px bg-border transition group-hover:bg-brand/50" />
          <button
            type="button"
            aria-label={label}
            aria-expanded={active}
            onClick={active ? onClose : onOpen}
            className={`relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border transition ${
              active
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-surface text-ink-muted opacity-70 hover:border-brand hover:bg-brand hover:text-brand-foreground hover:opacity-100 group-hover:opacity-100"
            }`}
          >
            <Plus size={12} weight="bold" />
          </button>
        </div>
      ) : null}

      {active && !suppressed ? (
        <div className="absolute left-0 right-0 top-7 z-40 mt-1 rounded-xl border border-brand/40 bg-surface-elevated p-3 shadow-[var(--shadow-float)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-ink-secondary">{label}</p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search places by name or address…"
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-border-strong"
          />
          {candidates.length > 0 ? (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
              {candidates.map((candidate) => (
                <li
                  key={candidate.ref}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => onPick(candidate)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
                  >
                    <Plus
                      size={14}
                      weight="bold"
                      className="shrink-0 text-brand"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">
                        {candidate.name}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {candidate.detail}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 ? (
            <p className="mt-2 text-xs text-ink-muted">
              {searching ? "Searching…" : "No matching places."}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">
              Type a place name or address from the directory.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
