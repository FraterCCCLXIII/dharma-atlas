"use client";

import { ArrowSquareOut, CalendarBlank } from "@phosphor-icons/react";
import { useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { stripMarkdown } from "@/lib/markdown";
import {
  expandPlaceEventOccurrences,
  formatEventWhen,
  formatListingSummary,
} from "@/lib/place-events";
import type { PlaceEvent, PlaceEventOccurrence } from "@/types/place";
import {
  PlaceEventsCalendar,
  placeOccurrenceAnchorId,
  placeScheduleAnchorId,
} from "./PlaceEventsCalendar";

const PAGE_SIZE = 10;

interface PlaceEventsSectionProps {
  events: PlaceEvent[];
}

type SelectedListing =
  | { kind: "schedule"; event: PlaceEvent }
  | { kind: "occurrence"; occurrence: PlaceEventOccurrence };

function EventDetailsModal({
  selected,
  onClose,
}: {
  selected: SelectedListing | null;
  onClose: () => void;
}) {
  if (!selected) return null;

  const event = selected.kind === "schedule" ? selected.event : selected.occurrence.event;
  const when =
    selected.kind === "schedule"
      ? formatListingSummary(event)
      : formatEventWhen(
          selected.occurrence.startsAt,
          selected.occurrence.endsAt,
          event.timezone,
        );

  return (
    <Modal open onClose={onClose} title={event.title} description={when} size="md">
      <div className="space-y-4">
        {event.description?.trim() ? (
          <MarkdownText className="text-sm text-ink-secondary">
            {event.description}
          </MarkdownText>
        ) : (
          <p className="text-sm text-ink-muted">No additional details.</p>
        )}

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Type</dt>
            <dd className="font-medium text-ink">
              {event.kind === "schedule" ? "Recurring" : "Special event"}
            </dd>
          </div>
          {event.kind === "schedule" && selected.kind === "occurrence" ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Repeats</dt>
              <dd className="text-right font-medium text-ink">
                {formatListingSummary(event)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Timezone</dt>
            <dd className="font-medium text-ink">{event.timezone}</dd>
          </div>
        </dl>

        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
          >
            More info
            <ArrowSquareOut size={16} weight="bold" />
          </a>
        ) : null}
      </div>
    </Modal>
  );
}

function EventRowButton({
  when,
  title,
  description,
  highlight,
  onClick,
  iconClassName = "bg-accent-soft text-accent",
}: {
  when: string;
  title: string;
  description?: string | null;
  highlight?: boolean;
  onClick: () => void;
  iconClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 bg-surface-elevated px-4 py-3 text-left transition ${
        highlight
          ? "bg-brand/5 ring-inset ring-2 ring-brand/25"
          : "hover:bg-surface-muted/40"
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <CalendarBlank size={18} weight="duotone" />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-ink-muted">{when}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-ink">
          {title}
        </span>
        {description?.trim() ? (
          <span className="mt-0.5 block truncate text-sm text-ink-secondary">
            {description.trim()}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function EventModuleList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={`mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border ${className}`}
    >
      {children}
    </ul>
  );
}

function ViewMoreButton({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}) {
  if (remaining <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-sm font-medium text-brand transition hover:text-brand-hover"
    >
      View more ({Math.min(PAGE_SIZE, remaining)} of {remaining})
    </button>
  );
}

export function PlaceEventsSection({ events }: PlaceEventsSectionProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(PAGE_SIZE);
  const [upcomingVisible, setUpcomingVisible] = useState(PAGE_SIZE);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedListing | null>(null);

  const schedules = useMemo(
    () => events.filter((event) => event.kind === "schedule" && !event.isCancelled),
    [events],
  );
  const specials = useMemo(
    () => events.filter((event) => event.kind === "event" && !event.isCancelled),
    [events],
  );

  const upcomingOccurrences = useMemo(() => {
    const fromSpecials = expandPlaceEventOccurrences(specials, {
      horizonDays: 180,
      limit: 100,
    });
    const fromSchedules = expandPlaceEventOccurrences(schedules, {
      horizonDays: 180,
      limit: 100,
    });
    return [...fromSpecials, ...fromSchedules].sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt),
    );
  }, [specials, schedules]);

  /** Public profile: schedules + upcoming specials only (no past one-offs). */
  const publicCalendarEvents = useMemo(() => {
    const upcomingSpecialIds = new Set(
      upcomingOccurrences
        .filter((row) => row.event.kind === "event")
        .map((row) => row.event.id),
    );
    return [
      ...schedules,
      ...specials.filter((event) => upcomingSpecialIds.has(event.id)),
    ];
  }, [schedules, specials, upcomingOccurrences]);

  function openFromCalendar(occurrence: PlaceEventOccurrence) {
    const anchorId = placeOccurrenceAnchorId(occurrence);
    const upcomingIndex = upcomingOccurrences.findIndex(
      (row) =>
        row.event.id === occurrence.event.id && row.startsAt === occurrence.startsAt,
    );
    if (upcomingIndex >= 0 && upcomingIndex >= upcomingVisible) {
      setUpcomingVisible(upcomingIndex + 1);
    }

    setSelected({ kind: "occurrence", occurrence });
    setHighlightId(anchorId);
    window.setTimeout(() => setHighlightId(null), 1800);
  }

  if (publicCalendarEvents.length === 0) return null;

  const visibleSchedules = schedules.slice(0, scheduleVisible);
  const visibleUpcoming = upcomingOccurrences.slice(0, upcomingVisible);

  return (
    <section className="space-y-8 border-b border-border pb-10">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink">Calendar</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Regular practice and upcoming gatherings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCalendar((current) => !current)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
            aria-expanded={showCalendar}
          >
            <CalendarBlank size={14} weight="bold" />
            {showCalendar ? "Hide calendar" : "Show calendar"}
          </button>
        </div>
        {showCalendar ? (
          <div className="mt-4 w-full">
            <PlaceEventsCalendar
              events={publicCalendarEvents}
              onSelectOccurrence={openFromCalendar}
            />
          </div>
        ) : null}
      </div>

      {schedules.length > 0 ? (
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Regular practice</h2>
          <EventModuleList>
            {visibleSchedules.map((event) => {
              const anchorId = placeScheduleAnchorId(event.id);
              return (
                <li key={event.id} id={anchorId}>
                  <EventRowButton
                    when={formatListingSummary(event)}
                    title={event.title}
                    description={
                      event.description
                        ? stripMarkdown(event.description)
                        : undefined
                    }
                    highlight={highlightId === anchorId}
                    iconClassName="bg-brand/10 text-brand"
                    onClick={() => setSelected({ kind: "schedule", event })}
                  />
                </li>
              );
            })}
          </EventModuleList>
          <ViewMoreButton
            remaining={schedules.length - visibleSchedules.length}
            onClick={() => setScheduleVisible((count) => count + PAGE_SIZE)}
          />
        </div>
      ) : null}

      {upcomingOccurrences.length > 0 ? (
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Upcoming events</h2>
          <EventModuleList>
            {visibleUpcoming.map((occurrence) => {
              const anchorId = placeOccurrenceAnchorId(occurrence);
              const isRecurring = occurrence.event.kind === "schedule";
              return (
                <li key={`${occurrence.event.id}-${occurrence.startsAt}`} id={anchorId}>
                  <EventRowButton
                    when={formatEventWhen(
                      occurrence.startsAt,
                      occurrence.endsAt,
                      occurrence.event.timezone,
                    )}
                    title={occurrence.event.title}
                    description={
                      occurrence.event.description
                        ? stripMarkdown(occurrence.event.description)
                        : undefined
                    }
                    highlight={highlightId === anchorId}
                    iconClassName={
                      isRecurring ? "bg-brand/10 text-brand" : "bg-accent-soft text-accent"
                    }
                    onClick={() => setSelected({ kind: "occurrence", occurrence })}
                  />
                </li>
              );
            })}
          </EventModuleList>
          <ViewMoreButton
            remaining={upcomingOccurrences.length - visibleUpcoming.length}
            onClick={() => setUpcomingVisible((count) => count + PAGE_SIZE)}
          />
        </div>
      ) : null}

      <EventDetailsModal selected={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
