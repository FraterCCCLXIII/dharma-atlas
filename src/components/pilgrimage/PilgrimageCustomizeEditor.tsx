"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
import {
  getPilgrimageImage,
  getPilgrimageSite,
  PILGRIMAGE_SITES,
  pilgrimageRoutePath,
  type PilgrimageRoute,
} from "@/data/pilgrimage";
import { authClient } from "@/lib/auth-client";
import { PilgrimageRouteMap } from "./PilgrimageRouteMap";

export function PilgrimageCustomizeEditor({
  route,
}: {
  route: PilgrimageRoute;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [title, setTitle] = useState(`My ${route.name}`);
  const [stopSlugs, setStopSlugs] = useState<string[]>([...route.stopSlugs]);
  const [addQuery, setAddQuery] = useState("");
  /** Index to insert at when picking a site; null = add panel closed. */
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const stops = useMemo(
    () =>
      stopSlugs
        .map((slug) => getPilgrimageSite(slug))
        .filter((site): site is NonNullable<typeof site> => site != null),
    [stopSlugs],
  );

  const addCandidates = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    if (!q || insertAt == null) return [];
    const existing = new Set(stopSlugs);
    return PILGRIMAGE_SITES.filter(
      (site) =>
        !existing.has(site.slug) &&
        (site.name.toLowerCase().includes(q) ||
          site.country.toLowerCase().includes(q) ||
          site.region.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [addQuery, stopSlugs, insertAt]);

  function openInsert(index: number) {
    setInsertAt(index);
    setAddQuery("");
  }

  function closeInsert() {
    setInsertAt(null);
    setAddQuery("");
  }

  function removeStop(slug: string) {
    setStopSlugs((prev) => prev.filter((s) => s !== slug));
  }

  function addStop(slug: string) {
    setStopSlugs((prev) => {
      if (prev.includes(slug)) return prev;
      if (insertAt == null) return [...prev, slug];
      const next = [...prev];
      next.splice(insertAt, 0, slug);
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
        title,
        stopSlugs,
        baseRouteSlug: route.slug,
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
    startTransition(async () => {
      const result = await saveUserPilgrimageRoute({
        title,
        stopSlugs,
        baseRouteSlug: route.slug,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/pilgrimage/my/${result.id}`);
    });
  }

  return (
    <div className="lg:flex lg:items-start">
      <div className="min-w-0 px-4 pb-20 pt-8 sm:px-6 lg:w-1/2 lg:px-8 xl:pl-12">
        <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
          <Link
            href={pilgrimageRoutePath(route.slug)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition hover:text-ink"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to {route.name}
          </Link>

          <header className="mt-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              Customize route
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Fork &amp; edit
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Based on{" "}
              <Link
                href={pilgrimageRoutePath(route.slug)}
                className="font-medium text-brand hover:underline"
              >
                {route.name}
              </Link>
              . Drag to reorder, use + to insert a stop, then save your version.
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
                active={insertAt === 0}
                query={addQuery}
                candidates={insertAt === 0 ? addCandidates : []}
                onOpen={() => openInsert(0)}
                onClose={closeInsert}
                onQueryChange={setAddQuery}
                onPick={addStop}
                label="Add a stop at the start"
              />

              <Reorder.Group
                axis="y"
                values={stopSlugs}
                onReorder={setStopSlugs}
                className="flex list-none flex-col"
              >
                {stopSlugs.map((slug, index) => {
                  const stop = getPilgrimageSite(slug);
                  if (!stop) return null;
                  return (
                    <SortableStopRow
                      key={slug}
                      slug={slug}
                      name={stop.name}
                      country={stop.country}
                      index={index}
                      image={getPilgrimageImage(slug)}
                      hovered={hoveredSlug === slug}
                      onHover={setHoveredSlug}
                      onRemove={() => removeStop(slug)}
                      insertAfter={
                        <InsertGap
                          active={insertAt === index + 1}
                          query={addQuery}
                          candidates={
                            insertAt === index + 1 ? addCandidates : []
                          }
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
              {pending ? "Saving…" : "Save my route"}
            </button>
            <p className="text-xs text-ink-muted">
              Saved to your account — you can share it afterward.
            </p>
          </div>
        </div>
      </div>

      <aside className="relative z-0 mt-8 min-h-0 p-3 sm:p-4 lg:sticky lg:top-0 lg:mt-0 lg:h-[calc(100dvh-var(--site-header-height,4.5rem))] lg:w-1/2 lg:shrink-0 lg:self-start lg:p-5">
        <PilgrimageRouteMap
          route={route}
          stopSlugs={stopSlugs}
          hoveredSlug={hoveredSlug}
          className="relative h-[360px] lg:h-full"
        />
      </aside>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={`${pilgrimageRoutePath(route.slug)}/customize`}
        title="Save your route"
        description="Create an account or sign in to keep this customized pilgrimage."
        initialMode="signup"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function SortableStopRow({
  slug,
  name,
  country,
  index,
  image,
  hovered,
  onHover,
  onRemove,
  insertAfter,
}: {
  slug: string;
  name: string;
  country: string;
  index: number;
  image?: string;
  hovered: boolean;
  onHover: (slug: string | null) => void;
  onRemove: () => void;
  insertAfter: ReactNode;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={slug}
      dragListener={false}
      dragControls={controls}
      className="relative list-none"
      whileDrag={{
        zIndex: 10,
        scale: 1.01,
      }}
    >
      <div
        onMouseEnter={() => onHover(slug)}
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
          <span className="text-xs text-ink-muted">{country}</span>
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
  query,
  candidates,
  onOpen,
  onClose,
  onQueryChange,
  onPick,
  label,
}: {
  active: boolean;
  query: string;
  candidates: { slug: string; name: string; country: string }[];
  onOpen: () => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onPick: (slug: string) => void;
  label: string;
}) {
  if (active) {
    return (
      <div className="my-2 rounded-xl border border-brand/40 bg-surface-elevated p-3 shadow-[var(--shadow-card)]">
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
          placeholder="Search sites by name, country, or region…"
          className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-border-strong"
        />
        {candidates.length > 0 ? (
          <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
            {candidates.map((site) => (
              <li
                key={site.slug}
                className="border-b border-border last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onPick(site.slug)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
                >
                  <Plus size={14} weight="bold" className="shrink-0 text-brand" />
                  <span className="min-w-0 flex-1 font-medium text-ink">
                    {site.name}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {site.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : query.trim() ? (
          <p className="mt-2 text-xs text-ink-muted">No matching sites.</p>
        ) : (
          <p className="mt-2 text-xs text-ink-muted">
            Type to search the pilgrimage catalog.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="group relative flex h-7 items-center justify-center">
      <div className="absolute inset-x-8 h-px bg-border transition group-hover:bg-brand/50" />
      <button
        type="button"
        aria-label={label}
        onClick={onOpen}
        className="relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-ink-muted opacity-70 transition hover:border-brand hover:bg-brand hover:text-brand-foreground hover:opacity-100 group-hover:opacity-100"
      >
        <Plus size={12} weight="bold" />
      </button>
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
