"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { authClient } from "@/lib/auth-client";

interface SearchPlace {
  id: string;
  name: string;
  address: string;
  tradition: string;
  type: string;
}

interface ClaimLocationPageViewProps {
  initialPlaceId?: string;
  initialPlaceName?: string;
}

export function ClaimLocationPageView({
  initialPlaceId,
  initialPlaceName,
}: ClaimLocationPageViewProps) {
  const { data: session, isPending } = authClient.useSession();
  const [query, setQuery] = useState(initialPlaceName ?? "");
  const [results, setResults] = useState<SearchPlace[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchPlace | null>(
    initialPlaceId && initialPlaceName
      ? {
          id: initialPlaceId,
          name: initialPlaceName,
          address: "",
          tradition: "",
          type: "",
        }
      : null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const runSearch = useCallback(async (value: string, page = 1, append = false) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchTotal(0);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/places/search?q=${encodeURIComponent(trimmed)}&page=${page}`,
      );
      const data = (await res.json()) as { places: SearchPlace[]; total: number };
      setSearchTotal(data.total);
      setSearchPage(page);
      setResults((prev) => (append ? [...prev, ...data.places] : data.places));
    } catch {
      if (!append) setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!initialPlaceName) return;
    void runSearch(initialPlaceName);
  }, [initialPlaceName, runSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selected || selected.name !== query) {
        void runSearch(query);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, runSearch, selected]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      setError("Select a location from the search results.");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: selected.id,
          placeName: selected.name,
          listingUrl: window.location.origin + `/place/${selected.id}`,
          affiliationRole: String(formData.get("affiliationRole")),
          message: String(formData.get("message")),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Claim request failed");

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <FormPageShell title="Claim a location" description="Loading…">
        <p className="text-ink-secondary">Loading…</p>
      </FormPageShell>
    );
  }

  if (!session) {
    return (
      <FormPageShell
        title="Claim a location"
        description="Sign in or create an account to manage a listing you represent."
      >
        <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6">
          <p className="text-sm text-ink-secondary">
            Like Yelp or Airbnb, we verify affiliation before granting edit access. Create a free
            account to start a claim request.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup?redirect=/claim" className={submitButtonClassName}>
              Create account
            </Link>
            <Link
              href="/login?redirect=/claim"
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
            >
              Sign in
            </Link>
          </div>
        </div>
      </FormPageShell>
    );
  }

  if (submitted) {
    return (
      <FormPageShell
        title="Claim submitted"
        description="We’ll review your request and email you when it’s approved."
      >
        <p className="text-base leading-relaxed text-ink-secondary">
          Thank you. Once verified, you&apos;ll be able to edit{" "}
          <strong className="font-medium text-ink">{selected?.name}</strong> from your dashboard.
        </p>
        <Link href="/manage" className={`${submitButtonClassName} mt-6 inline-flex`}>
          Go to dashboard
        </Link>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title="Claim a location"
      description="Search for your center, then tell us about your role. We verify affiliation before granting edit access."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-3">
          <FormField id="claim-search" label="Find your location">
            <input
              id="claim-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              className={fieldClassName}
              placeholder="Search by name, city, or address"
              autoComplete="off"
            />
          </FormField>

          {searching && <p className="text-sm text-ink-muted">Searching…</p>}

          {!searching && results.length > 0 && !selected && (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-elevated">
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(place);
                      setQuery(place.name);
                      setResults([]);
                    }}
                    className="block w-full px-4 py-3 text-left transition hover:bg-surface-muted"
                  >
                    <p className="font-medium text-ink">{place.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {[place.type, place.tradition, place.address].filter(Boolean).join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!selected && results.length < searchTotal && !searching && (
            <button
              type="button"
              onClick={() => void runSearch(query, searchPage + 1, true)}
              className="text-sm font-medium text-brand hover:underline"
            >
              Load more results ({results.length} of {searchTotal})
            </button>
          )}

          {selected && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{selected.name}</p>
                {selected.address && (
                  <p className="mt-0.5 text-sm text-ink-muted">{selected.address}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                }}
                className="text-sm font-medium text-brand hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {!selected && query.trim().length >= 2 && !searching && results.length === 0 && (
            <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm text-ink-secondary">
              No match found.{" "}
              <Link href="/manage/places/new" className="font-medium text-brand hover:underline">
                Add a new location
              </Link>{" "}
              instead.
            </div>
          )}
        </section>

        {selected && (
          <>
            <FormField id="claim-role" label="Your role">
              <input
                id="claim-role"
                name="affiliationRole"
                type="text"
                required
                className={fieldClassName}
                placeholder="Director, resident, authorized teacher, etc."
              />
            </FormField>

            <FormField id="claim-message" label="How are you affiliated?">
              <textarea
                id="claim-message"
                name="message"
                rows={4}
                required
                minLength={10}
                className={`${fieldClassName} resize-y`}
                placeholder="Tell us about your connection to this place — we use this to verify your claim."
              />
            </FormField>
          </>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {selected && (
          <button type="submit" disabled={submitting} className={submitButtonClassName}>
            {submitting ? "Submitting…" : "Submit claim request"}
          </button>
        )}
      </form>
    </FormPageShell>
  );
}
