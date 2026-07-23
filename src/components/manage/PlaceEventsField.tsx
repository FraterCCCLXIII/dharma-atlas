"use client";

import { CaretDown, CaretUp, Copy, Plus, Trash, UploadSimple } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { savePlaceEventsAction } from "@/app/manage/actions/place-profile";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import { MarkdownRichTextEditor } from "@/components/forms/MarkdownRichTextEditor";
import { PlaceCalendarImportModal } from "@/components/manage/PlaceCalendarImportModal";
import { PlaceEventsCalendar } from "@/components/place/PlaceEventsCalendar";
import {
  formatListingSummary,
  isoToLocalInput,
  MONTH_WEEK_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/place-events";
import type { PlaceEvent, PlaceMonthWeek, PlaceWeekday } from "@/types/place";
import type { PlaceEventInput } from "@/lib/validations/place-profile";

type EditorTab = "schedule" | "event";

function toDraft(event: PlaceEvent): PlaceEventInput {
  if (event.kind === "schedule") {
    return {
      kind: "schedule",
      id: event.id,
      title: event.title,
      description: event.description ?? null,
      startTime: event.startTime ?? "09:00",
      endTime: event.endTime ?? null,
      rule: event.rule ?? { freq: "weekly", daysOfWeek: [0] },
      timezone: event.timezone,
      url: event.url ?? null,
      isCancelled: event.isCancelled,
    };
  }
  return {
    kind: "event",
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    startsAt: event.startsAt ? isoToLocalInput(event.startsAt) : "",
    endsAt: event.endsAt ? isoToLocalInput(event.endsAt) : null,
    timezone: event.timezone,
    url: event.url ?? null,
    isCancelled: event.isCancelled,
  };
}

function emptySchedule(): PlaceEventInput {
  return {
    kind: "schedule",
    title: "",
    description: null,
    startTime: "09:00",
    endTime: "10:30",
    rule: { freq: "weekly", daysOfWeek: [0] },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
    url: null,
    isCancelled: false,
  };
}

function emptyEvent(): PlaceEventInput {
  return {
    kind: "event",
    title: "",
    description: null,
    startsAt: "",
    endsAt: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
    url: null,
    isCancelled: false,
  };
}

function isPastEvent(event: PlaceEventInput) {
  if (event.kind !== "event" || !event.startsAt) return false;
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return false;
  const end = event.endsAt ? new Date(event.endsAt) : start;
  return end.getTime() < Date.now();
}

function draftsToPreview(events: PlaceEventInput[]): PlaceEvent[] {
  return events.map((event, index): PlaceEvent => {
    if (event.kind === "schedule") {
      return {
        id: event.id ?? -(index + 1),
        placeId: "preview",
        kind: "schedule",
        title: event.title || "Untitled",
        description: event.description ?? undefined,
        startTime: event.startTime,
        endTime: event.endTime ?? undefined,
        rule: event.rule as PlaceEvent["rule"],
        timezone: event.timezone,
        url: event.url ?? undefined,
        isCancelled: event.isCancelled,
      };
    }
    return {
      id: event.id ?? -(index + 1),
      placeId: "preview",
      kind: "event",
      title: event.title || "Untitled",
      description: event.description ?? undefined,
      startsAt: event.startsAt
        ? new Date(event.startsAt).toISOString()
        : undefined,
      endsAt: event.endsAt ? new Date(event.endsAt).toISOString() : undefined,
      timezone: event.timezone,
      url: event.url ?? undefined,
      isCancelled: event.isCancelled,
    };
  });
}

interface PlaceEventsFieldProps {
  placeId: string;
  initialEvents: PlaceEvent[];
  showHeading?: boolean;
}

export function PlaceEventsField({
  placeId,
  initialEvents,
  showHeading = true,
}: PlaceEventsFieldProps) {
  const [events, setEvents] = useState<PlaceEventInput[]>(initialEvents.map(toDraft));
  const [tab, setTab] = useState<EditorTab>("schedule");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const scheduleIndexes = useMemo(
    () =>
      events
        .map((event, index) => (event.kind === "schedule" ? index : -1))
        .filter((index) => index >= 0),
    [events],
  );
  const activeEventIndexes = useMemo(
    () =>
      events
        .map((event, index) =>
          event.kind === "event" && !isPastEvent(event) ? index : -1,
        )
        .filter((index) => index >= 0),
    [events],
  );
  const pastEventIndexes = useMemo(
    () =>
      events
        .map((event, index) =>
          event.kind === "event" && isPastEvent(event) ? index : -1,
        )
        .filter((index) => index >= 0),
    [events],
  );

  const previewEvents = useMemo(() => draftsToPreview(events), [events]);

  function markDirty() {
    setSaved(false);
    setDirty(true);
  }

  function updateEvent(index: number, patch: Partial<PlaceEventInput>) {
    setEvents((current) =>
      current.map((event, i) => {
        if (i !== index) return event;
        return { ...event, ...patch } as PlaceEventInput;
      }),
    );
    markDirty();
  }

  function addListing(kind: EditorTab) {
    setEvents((current) => {
      const next = [...current, kind === "schedule" ? emptySchedule() : emptyEvent()];
      setEditingIndex(next.length - 1);
      return next;
    });
    setTab(kind);
    setShowPast(false);
    markDirty();
  }

  function removeEvent(index: number) {
    setEvents((current) => current.filter((_, i) => i !== index));
    setEditingIndex((current) => {
      if (current == null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
    markDirty();
  }

  function duplicateEvent(index: number) {
    setEvents((current) => {
      const source = current[index];
      if (!source) return current;
      const copy: PlaceEventInput =
        source.kind === "schedule"
          ? {
              ...source,
              id: undefined,
              title: source.title.trim() ? `${source.title.trim()} (copy)` : "",
            }
          : {
              ...source,
              id: undefined,
              title: source.title.trim() ? `${source.title.trim()} (copy)` : "",
            };
      const next = [...current, copy];
      setEditingIndex(next.length - 1);
      setTab(copy.kind);
      setShowPast(copy.kind === "event" && isPastEvent(copy));
      return next;
    });
    markDirty();
  }

  async function handleSave() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const payload = events.filter((event) => {
        if (!event.title.trim()) return false;
        if (event.kind === "schedule") return Boolean(event.startTime && event.rule);
        return Boolean(event.startsAt.trim());
      });
      const savedEvents = await savePlaceEventsAction(placeId, payload);
      setEvents(savedEvents.map(toDraft));
      setEditingIndex(null);
      setSaved(true);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save events");
    } finally {
      setBusy(false);
    }
  }

  function toggleWeekday(index: number, day: PlaceWeekday) {
    const event = events[index];
    if (!event || event.kind !== "schedule" || event.rule.freq !== "weekly") return;
    const set = new Set(event.rule.daysOfWeek);
    if (set.has(day)) {
      if (set.size === 1) return;
      set.delete(day);
    } else {
      set.add(day);
    }
    updateEvent(index, {
      rule: { freq: "weekly", daysOfWeek: [...set].sort((a, b) => a - b) as PlaceWeekday[] },
    });
  }

  function renderSharedFields(index: number, event: PlaceEventInput) {
    return (
      <>
        <FormField id={`listing-title-${index}`} label="Title">
          <input
            id={`listing-title-${index}`}
            value={event.title}
            onChange={(e) => updateEvent(index, { title: e.target.value })}
            className={fieldClassName}
            placeholder={event.kind === "schedule" ? "Sunday morning sit" : "Guest teacher weekend"}
          />
        </FormField>
        <FormField id={`listing-url-${index}`} label="Link (registration / more info)">
          <input
            id={`listing-url-${index}`}
            type="url"
            value={event.url ?? ""}
            onChange={(e) => updateEvent(index, { url: e.target.value || null })}
            className={fieldClassName}
            placeholder="https://"
          />
        </FormField>
        <FormField id={`listing-description-${index}`} label="Description">
          <MarkdownRichTextEditor
            id={`listing-description-${index}`}
            value={event.description ?? ""}
            onChange={(next) => updateEvent(index, { description: next.trim() || null })}
            rows={6}
            placeholder="What to expect, who it’s for…"
          />
        </FormField>
        <FormField id={`listing-tz-${index}`} label="Timezone">
          <input
            id={`listing-tz-${index}`}
            value={event.timezone}
            onChange={(e) => updateEvent(index, { timezone: e.target.value })}
            className={fieldClassName}
            placeholder="America/Los_Angeles"
          />
        </FormField>
        <label className="inline-flex items-center gap-2 text-sm text-ink-secondary">
          <input
            type="checkbox"
            checked={event.isCancelled}
            onChange={(e) => updateEvent(index, { isCancelled: e.target.checked })}
          />
          Cancelled (hidden from public list)
        </label>
      </>
    );
  }

  function renderRow(index: number) {
    const event = events[index];
    if (!event) return null;
    const open = editingIndex === index;
    const summary =
      event.kind === "schedule"
        ? formatListingSummary({
            id: event.id ?? 0,
            placeId: placeId,
            kind: "schedule",
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime ?? undefined,
            rule: event.rule as PlaceEvent["rule"],
            timezone: event.timezone,
            isCancelled: event.isCancelled,
          })
        : event.startsAt || "No date set";

    return (
      <li key={event.id ?? `new-${index}`}>
        <div className="flex items-center gap-3 px-3 py-3">
          <button
            type="button"
            onClick={() => setEditingIndex(open ? null : index)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-medium text-ink">
              {event.title.trim() || (event.kind === "schedule" ? "Untitled recurring event" : "Untitled event")}
            </p>
            <p className="truncate text-xs text-ink-muted">{summary}</p>
          </button>
          <button
            type="button"
            onClick={() => setEditingIndex(open ? null : index)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            aria-expanded={open}
            aria-label={open ? "Collapse" : "Edit"}
          >
            {open ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => duplicateEvent(index)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-50"
            aria-label="Duplicate"
            title="Duplicate"
          >
            <Copy size={16} weight="bold" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => removeEvent(index)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            aria-label="Remove"
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>

        {open ? (
          <div className="space-y-3 border-t border-border bg-surface px-3 py-4">
            {event.kind === "schedule" ? (
              <>
                {renderSharedFields(index, event)}
                <FormField id={`sched-freq-${index}`} label="Repeats">
                  <select
                    id={`sched-freq-${index}`}
                    value={event.rule.freq}
                    onChange={(e) => {
                      if (e.target.value === "monthlyNth") {
                        updateEvent(index, {
                          rule: { freq: "monthlyNth", week: 1, weekday: 3 },
                        });
                      } else {
                        updateEvent(index, {
                          rule: { freq: "weekly", daysOfWeek: [0] },
                        });
                      }
                    }}
                    className={fieldClassName}
                  >
                    <option value="weekly">Weekly (choose days)</option>
                    <option value="monthlyNth">Monthly (Nth weekday)</option>
                  </select>
                </FormField>

                {event.rule.freq === "weekly" ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-ink-secondary">Days</p>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAY_LABELS.map((label, day) => {
                        const active = event.rule.freq === "weekly" && event.rule.daysOfWeek.includes(day as PlaceWeekday);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleWeekday(index, day as PlaceWeekday)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                              active
                                ? "bg-brand text-brand-foreground"
                                : "border border-border text-ink-secondary hover:bg-surface-muted"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField id={`sched-week-${index}`} label="Which week">
                      <select
                        id={`sched-week-${index}`}
                        value={event.rule.week}
                        onChange={(e) =>
                          updateEvent(index, {
                            rule: {
                              freq: "monthlyNth",
                              week: Number(e.target.value) as PlaceMonthWeek,
                              weekday: event.rule.freq === "monthlyNth" ? event.rule.weekday : 3,
                            },
                          })
                        }
                        className={fieldClassName}
                      >
                        {([1, 2, 3, 4, -1] as PlaceMonthWeek[]).map((week) => (
                          <option key={week} value={week}>
                            {MONTH_WEEK_LABELS[week]}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField id={`sched-weekday-${index}`} label="Weekday">
                      <select
                        id={`sched-weekday-${index}`}
                        value={event.rule.weekday}
                        onChange={(e) =>
                          updateEvent(index, {
                            rule: {
                              freq: "monthlyNth",
                              week: event.rule.freq === "monthlyNth" ? event.rule.week : 1,
                              weekday: Number(e.target.value) as PlaceWeekday,
                            },
                          })
                        }
                        className={fieldClassName}
                      >
                        {WEEKDAY_LABELS.map((label, day) => (
                          <option key={label} value={day}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`sched-start-${index}`} label="Start time">
                    <input
                      id={`sched-start-${index}`}
                      type="time"
                      value={event.startTime}
                      onChange={(e) => updateEvent(index, { startTime: e.target.value })}
                      className={fieldClassName}
                    />
                  </FormField>
                  <FormField id={`sched-end-${index}`} label="End time (optional)">
                    <input
                      id={`sched-end-${index}`}
                      type="time"
                      value={event.endTime ?? ""}
                      onChange={(e) =>
                        updateEvent(index, { endTime: e.target.value || null })
                      }
                      className={fieldClassName}
                    />
                  </FormField>
                </div>
              </>
            ) : (
              <>
                {renderSharedFields(index, event)}
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`event-starts-${index}`} label="Starts">
                    <input
                      id={`event-starts-${index}`}
                      type="datetime-local"
                      value={event.startsAt}
                      onChange={(e) => updateEvent(index, { startsAt: e.target.value })}
                      className={fieldClassName}
                      required
                    />
                  </FormField>
                  <FormField id={`event-ends-${index}`} label="Ends (optional)">
                    <input
                      id={`event-ends-${index}`}
                      type="datetime-local"
                      value={event.endsAt ?? ""}
                      onChange={(e) =>
                        updateEvent(index, { endsAt: e.target.value || null })
                      }
                      className={fieldClassName}
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>
        ) : null}
      </li>
    );
  }

  const visibleIndexes = tab === "schedule" ? scheduleIndexes : activeEventIndexes;

  function openImport() {
    if (
      dirty &&
      !confirm(
        "You have unsaved edits. Importing will reload events from the server and discard unsaved changes. Continue?",
      )
    ) {
      return;
    }
    setImportOpen(true);
  }

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="min-w-0 max-w-xl flex-1 space-y-5">
        {showHeading ? (
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink">
              Recurring events & special events
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Standing practice times and one-time special events.
            </p>
          </div>
        ) : null}

          <div className="flex gap-1 rounded-full border border-border bg-surface-muted/50 p-1">
            {(
              [
                ["schedule", `Recurring Events (${scheduleIndexes.length})`],
                ["event", `Events (${activeEventIndexes.length})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTab(value);
                  setEditingIndex(null);
                }}
                data-active={tab === value}
                className="flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-secondary transition data-[active=true]:bg-surface-elevated data-[active=true]:text-ink data-[active=true]:shadow-sm"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => addListing(tab)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
            >
              <Plus size={14} weight="bold" />
              {tab === "schedule" ? "Add recurring event" : "Add event"}
            </button>
          </div>

          {visibleIndexes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-8 text-center">
              <p className="text-sm text-ink-muted">
                {tab === "schedule"
                  ? "No recurring events yet. Add weekly or monthly practice times."
                  : pastEventIndexes.length > 0
                    ? "No upcoming special events. Past events are below."
                    : "No special events yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-elevated">
              {visibleIndexes.map((index) => renderRow(index))}
            </ul>
          )}

          {tab === "event" && pastEventIndexes.length > 0 ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPast((current) => !current)}
                className="text-sm font-medium text-brand transition hover:text-brand-hover"
                aria-expanded={showPast}
              >
                {showPast
                  ? "Hide past events"
                  : `View past events (${pastEventIndexes.length})`}
              </button>
              {showPast ? (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-elevated opacity-90">
                  {pastEventIndexes.map((index) => renderRow(index))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !dirty}
              onClick={() => void handleSave()}
              className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save events"}
            </button>
            {saved ? (
              <span className="inline-flex items-center text-sm text-ink-muted">Saved</span>
            ) : null}
          </div>
          {dirty ? (
            <p className="text-xs text-amber-800">
              You have unsaved changes. Click Save to publish them on the listing.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 lg:sticky lg:top-6 lg:w-72">
        <button
          type="button"
          disabled={busy}
          onClick={openImport}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50 lg:w-auto lg:self-end"
        >
          <UploadSimple size={14} weight="bold" />
          Import
        </button>
        <PlaceEventsCalendar events={previewEvents} compact />
      </aside>

      <PlaceCalendarImportModal
        placeId={placeId}
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(importedEvents) => {
          setEvents(importedEvents.map(toDraft));
          setEditingIndex(null);
          setTab("event");
          setDirty(false);
          setSaved(true);
          setError("");
        }}
      />
    </section>
  );
}
