"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import {
  expandPlaceEventOccurrencesForMonth,
  formatEventWhen,
  formatListingSummary,
  WEEKDAY_LABELS,
} from "@/lib/place-events";
import type { PlaceEvent, PlaceEventOccurrence } from "@/types/place";

function dateKeyInZone(iso: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(iso))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function placeOccurrenceAnchorId(occurrence: PlaceEventOccurrence): string {
  return `place-event-${occurrence.event.id}-${occurrence.startsAt.replace(/[^0-9]/g, "")}`;
}

export function placeScheduleAnchorId(eventId: number): string {
  return `place-schedule-${eventId}`;
}

interface PlaceEventsCalendarProps {
  events: PlaceEvent[];
  /** Compact styling for manage sidebar-like panels. */
  compact?: boolean;
  /** Called when an occurrence is chosen from a day card (profile: scroll to list). */
  onSelectOccurrence?: (occurrence: PlaceEventOccurrence) => void;
}

function DayHoverCard({
  occurrences,
  onSelect,
  align = "center",
}: {
  occurrences: PlaceEventOccurrence[];
  onSelect?: (occurrence: PlaceEventOccurrence) => void;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      role="tooltip"
      className={`absolute bottom-[calc(100%+6px)] z-20 w-56 rounded-xl border border-border bg-surface-elevated p-2 text-left shadow-[var(--shadow-float)] ${alignClass}`}
    >
      <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
        {occurrences.length} gathering{occurrences.length === 1 ? "" : "s"}
      </p>
      <ul className="max-h-56 space-y-0.5 overflow-y-auto">
        {occurrences.map((occurrence) => (
          <li key={`${occurrence.event.id}-${occurrence.startsAt}`}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelect?.(occurrence);
              }}
              className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-surface-muted"
            >
              <p className="truncate text-xs font-medium text-ink">
                {occurrence.event.title}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {occurrence.event.kind === "schedule"
                  ? formatListingSummary(occurrence.event)
                  : formatEventWhen(
                      occurrence.startsAt,
                      occurrence.endsAt,
                      occurrence.event.timezone,
                    )}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlaceEventsCalendar({
  events,
  compact = false,
  onSelectOccurrence,
}: PlaceEventsCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  const occurrences = useMemo(
    () => expandPlaceEventOccurrencesForMonth(events, year, month),
    [events, year, month],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, PlaceEventOccurrence[]>();
    for (const occurrence of occurrences) {
      const key = dateKeyInZone(occurrence.startsAt, occurrence.event.timezone);
      const list = map.get(key) ?? [];
      list.push(occurrence);
      map.set(key, list);
    }
    return map;
  }, [occurrences]);

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number | null; key: string | null; col: number }> = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, key: null, col: i });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, key, col: (firstWeekday + day - 1) % 7 });
  }

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  function shiftMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    setOpenKey(null);
  }

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 120);
  }

  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          aria-label="Previous month"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <p className={`font-medium text-ink ${compact ? "text-sm" : "text-base"}`}>
          {monthLabel(year, month)}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          aria-label="Next month"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted"
          >
            {label}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (cell.day == null || !cell.key) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          const dayEvents = byDay.get(cell.key) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isOpen = openKey === cell.key;
          const isToday = cell.key === todayKey;
          const align =
            cell.col <= 1 ? "left" : cell.col >= 5 ? "right" : "center";

          return (
            <div
              key={cell.key}
              className="relative"
              onMouseEnter={() => {
                if (!hasEvents) return;
                clearCloseTimer();
                setOpenKey(cell.key);
              }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                disabled={!hasEvents}
                onClick={() => {
                  if (!hasEvents) return;
                  setOpenKey(isOpen ? null : cell.key);
                }}
                aria-expanded={hasEvents ? isOpen : undefined}
                aria-haspopup={hasEvents ? "dialog" : undefined}
                className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-xs transition ${
                  isOpen
                    ? "bg-brand text-brand-foreground"
                    : hasEvents
                      ? "bg-accent-soft text-ink hover:bg-brand/15"
                      : "text-ink-muted"
                } ${isToday && !isOpen ? "ring-1 ring-brand/40" : ""} disabled:cursor-default`}
              >
                <span className={compact ? "text-[11px]" : "text-xs"}>{cell.day}</span>
                {hasEvents ? (
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${
                      isOpen ? "bg-brand-foreground" : "bg-brand"
                    }`}
                  />
                ) : null}
              </button>

              {isOpen && hasEvents ? (
                <div
                  onMouseEnter={clearCloseTimer}
                  onMouseLeave={scheduleClose}
                >
                  <DayHoverCard
                    occurrences={dayEvents}
                    align={align}
                    onSelect={(occurrence) => {
                      setOpenKey(null);
                      onSelectOccurrence?.(occurrence);
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {occurrences.length === 0 ? (
        <p className="mt-3 text-xs text-ink-muted">No gatherings this month.</p>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">
          Hover or tap a highlighted day, then choose an event.
        </p>
      )}
    </div>
  );
}
