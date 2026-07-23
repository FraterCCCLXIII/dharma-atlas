import { describe, expect, it } from "vitest";
import {
  expandPastPlaceEventOccurrences,
  expandPlaceEventOccurrences,
  expandPlaceEventOccurrencesForMonth,
  formatScheduleRule,
  wallTimeToUtc,
} from "@/lib/place-events";
import type { PlaceEvent } from "@/types/place";

function oneTime(
  partial: Partial<PlaceEvent> & Pick<PlaceEvent, "startsAt">,
): PlaceEvent {
  return {
    id: 1,
    placeId: "abc",
    kind: "event",
    title: "Workshop",
    timezone: "UTC",
    isCancelled: false,
    ...partial,
  };
}

function weekly(partial?: Partial<PlaceEvent>): PlaceEvent {
  return {
    id: 2,
    placeId: "abc",
    kind: "schedule",
    title: "Sit",
    timezone: "UTC",
    startTime: "17:00",
    endTime: "18:00",
    rule: { freq: "weekly", daysOfWeek: [3] }, // Wednesday
    isCancelled: false,
    ...partial,
  };
}

describe("expandPlaceEventOccurrences", () => {
  it("includes a future one-time event", () => {
    const from = new Date("2026-07-01T00:00:00.000Z");
    const occurrences = expandPlaceEventOccurrences(
      [oneTime({ startsAt: "2026-07-10T17:00:00.000Z" })],
      { from, horizonDays: 30 },
    );
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]?.startsAt).toBe("2026-07-10T17:00:00.000Z");
  });

  it("expands weekly schedule by weekday", () => {
    const from = new Date("2026-07-01T00:00:00.000Z"); // Wednesday
    const occurrences = expandPlaceEventOccurrences([weekly()], {
      from,
      horizonDays: 21,
      limit: 10,
    });
    expect(occurrences.length).toBeGreaterThanOrEqual(3);
    // 2026-07-01, 07-08, 07-15 are Wednesdays
    expect(occurrences[0]?.startsAt).toBe(
      wallTimeToUtc(2026, 7, 1, 17, 0, "UTC").toISOString(),
    );
  });

  it("expands monthly nth weekday", () => {
    const from = new Date("2026-07-01T00:00:00.000Z");
    const occurrences = expandPlaceEventOccurrences(
      [
        weekly({
          id: 3,
          rule: { freq: "monthlyNth", week: 1, weekday: 3 },
        }),
      ],
      { from, horizonDays: 70, limit: 5 },
    );
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
    expect(occurrences[0]?.startsAt).toBe(
      wallTimeToUtc(2026, 7, 1, 17, 0, "UTC").toISOString(),
    );
  });

  it("skips cancelled listings", () => {
    const from = new Date("2026-07-01T00:00:00.000Z");
    const occurrences = expandPlaceEventOccurrences(
      [oneTime({ startsAt: "2026-07-10T17:00:00.000Z", isCancelled: true })],
      { from, horizonDays: 30 },
    );
    expect(occurrences).toHaveLength(0);
  });

  it("keeps a one-time event visible for a while after it starts", () => {
    const from = new Date("2026-07-10T18:00:00.000Z");
    const occurrences = expandPlaceEventOccurrences(
      [oneTime({ startsAt: "2026-07-10T17:00:00.000Z" })],
      { from, horizonDays: 30 },
    );
    expect(occurrences).toHaveLength(1);
  });
});

describe("expandPastPlaceEventOccurrences", () => {
  it("returns past one-time events newest first, not schedules", () => {
    const from = new Date("2026-07-20T00:00:00.000Z");
    const occurrences = expandPastPlaceEventOccurrences(
      [
        oneTime({ id: 1, startsAt: "2026-07-01T17:00:00.000Z" }),
        oneTime({ id: 2, startsAt: "2026-07-10T17:00:00.000Z" }),
        weekly({ id: 3 }),
      ],
      { from, lookbackDays: 60 },
    );
    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]?.event.id).toBe(2);
    expect(occurrences.every((row) => row.event.kind === "event")).toBe(true);
  });
});

describe("expandPlaceEventOccurrencesForMonth", () => {
  it("returns occurrences only for the requested month", () => {
    const occurrences = expandPlaceEventOccurrencesForMonth([weekly()], 2026, 7);
    expect(occurrences.length).toBeGreaterThan(0);
    expect(
      occurrences.every((row) => {
        const d = new Date(row.startsAt);
        return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 6;
      }),
    ).toBe(true);
  });
});

describe("formatScheduleRule", () => {
  it("labels weekly and monthly rules", () => {
    expect(formatScheduleRule({ freq: "weekly", daysOfWeek: [0, 3] })).toContain("Sun");
    expect(formatScheduleRule({ freq: "monthlyNth", week: 1, weekday: 3 })).toBe(
      "1st Wed of the month",
    );
  });
});
