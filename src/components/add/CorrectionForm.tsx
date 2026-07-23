"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { personProfilePath, placeProfilePath } from "@/lib/explore-routes";
import {
  locationReportReasons,
  reportReasonLabel,
  teacherReportReasons,
} from "@/lib/report-reasons";

type EntityType = "location" | "teacher";

interface PlaceResult {
  id: string;
  slug?: string;
  name: string;
  address: string;
  tradition: string;
}

interface TeacherResult {
  slug: string;
  name: string;
  tradition: string;
}

type SelectedEntity =
  | { entityType: "location"; id: string; slug?: string; name: string; subtitle: string }
  | { entityType: "teacher"; id: string; name: string; subtitle: string };

export function CorrectionForm() {
  const [entityType, setEntityType] = useState<EntityType>("location");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedEntity[]>([]);
  const [selected, setSelected] = useState<SelectedEntity | null>(null);
  const [searching, setSearching] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons =
    entityType === "location" ? locationReportReasons : teacherReportReasons;

  useEffect(() => {
    if (selected) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        if (entityType === "location") {
          const res = await fetch(
            `/api/places/search?q=${encodeURIComponent(trimmed)}&page=1`,
          );
          const data = (await res.json()) as { places: PlaceResult[] };
          setResults(
            (data.places ?? []).map((place) => ({
              entityType: "location" as const,
              id: place.id,
              slug: place.slug,
              name: place.name,
              subtitle: [place.address, place.tradition].filter(Boolean).join(" · "),
            })),
          );
        } else {
          const res = await fetch(
            `/api/explore/teachers?q=${encodeURIComponent(trimmed)}&pageSize=10`,
          );
          const data = (await res.json()) as { teachers: TeacherResult[] };
          setResults(
            (data.teachers ?? []).map((teacher) => ({
              entityType: "teacher" as const,
              id: teacher.slug,
              name: teacher.name,
              subtitle: teacher.tradition,
            })),
          );
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, entityType, selected]);

  function resetSelection() {
    setSelected(null);
    setResults([]);
    setReason("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selected) {
      setError("Select a listing from the search results.");
      return;
    }

    setSubmitting(true);
    setError("");

    const entityPath =
      selected.entityType === "location"
        ? placeProfilePath({ id: selected.id, slug: selected.slug })
        : personProfilePath(selected.id);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: selected.entityType,
          entityId: selected.id,
          entityName: selected.name,
          entityPath,
          reason,
          details,
          submitterEmail: email,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Correction failed");
      }

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Correction failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-sm leading-relaxed text-ink-secondary">
        Thank you. We&apos;ve received your correction and will review it soon.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FormField id="correction-type" label="Listing type">
        <select
          id="correction-type"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as EntityType);
            setQuery("");
            resetSelection();
          }}
          className={fieldClassName}
        >
          <option value="location">Location</option>
          <option value="teacher">Person</option>
        </select>
      </FormField>

      <FormField id="correction-search" label="Find the listing">
        <input
          id="correction-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) resetSelection();
          }}
          className={fieldClassName}
          placeholder={
            entityType === "location"
              ? "Search by name, city, or address"
              : "Search by name or tradition"
          }
          autoComplete="off"
        />
      </FormField>

      {selected ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="font-medium text-ink">{selected.name}</p>
          {selected.subtitle && (
            <p className="mt-0.5 text-sm text-ink-muted">{selected.subtitle}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              resetSelection();
            }}
            className="mt-2 text-sm font-medium text-brand hover:underline"
          >
            Choose a different listing
          </button>
        </div>
      ) : (
        <>
          {searching && (
            <p className="text-sm text-ink-muted">Searching…</p>
          )}
          {!searching && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-ink-muted">No matching listings found.</p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {results.map((item) => (
                <li key={`${item.entityType}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setQuery(item.name);
                      setResults([]);
                    }}
                    className="block w-full px-4 py-3 text-left transition hover:bg-surface-muted"
                  >
                    <p className="font-medium text-ink">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-sm text-ink-muted">{item.subtitle}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && (
        <>
          <FormField id="correction-reason" label="What needs correcting?">
            <select
              id="correction-reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={fieldClassName}
            >
              <option value="" disabled>
                Select a reason
              </option>
              {reasons.map((value) => (
                <option key={value} value={value}>
                  {reportReasonLabel(entityType, value)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="correction-details" label="Details">
            <textarea
              id="correction-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required={reason === "other"}
              className={`${fieldClassName} resize-y`}
              placeholder="Describe the correction"
            />
          </FormField>

          <FormField id="correction-email" label="Your email">
            <input
              id="correction-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClassName}
              placeholder="you@example.com"
            />
          </FormField>

          <button type="submit" disabled={submitting} className={submitButtonClassName}>
            {submitting ? "Submitting…" : "Submit correction"}
          </button>
        </>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
