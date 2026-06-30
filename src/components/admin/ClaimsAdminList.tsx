"use client";

import Link from "next/link";
import { useState } from "react";
import type { Claim } from "@/lib/data/claims";
import {
  approveClaimAction,
  linkClaimPlaceAction,
  rejectClaimAction,
} from "@/app/admin/actions/claims";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

function ClaimPlaceLinker({ claim }: { claim: Claim }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; name: string; address: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  async function search(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as {
        places: { id: string; name: string; address: string }[];
      };
      setResults(data.places);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <p className="text-sm font-medium text-amber-900">Link to a listing before approving</p>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          void search(e.target.value);
        }}
        placeholder="Search places…"
        className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
      />
      {searching && <p className="mt-2 text-xs text-ink-muted">Searching…</p>}
      <ul className="mt-2 space-y-1">
        {results.map((place) => (
          <li key={place.id}>
            <form action={linkClaimPlaceAction} className="flex items-center justify-between gap-2">
              <input type="hidden" name="id" value={claim.id} />
              <input type="hidden" name="placeId" value={place.id} />
              <span className="text-sm">
                {place.name}
                {place.address ? ` · ${place.address}` : ""}
              </span>
              <button
                type="submit"
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                Link
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClaimsAdminList({
  claims,
  currentStatus,
}: {
  claims: Claim[];
  currentStatus: string;
}) {
  return (
    <div className="mt-8">
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/claims" : `/admin/claims?status=${f.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              currentStatus === f.value
                ? "bg-brand text-brand-foreground"
                : "border border-border text-ink-secondary hover:bg-surface-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {claims.map((claim) => (
          <article
            key={claim.id}
            className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  claim · {claim.status}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">
                  {claim.placeName}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  From {claim.userName} ({claim.userEmail})
                </p>
              </div>
              <time className="text-xs text-ink-muted">
                {claim.createdAt.toLocaleDateString()}
              </time>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              <div>
                <dt className="text-ink-muted">Role</dt>
                <dd>{claim.affiliationRole}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Message</dt>
                <dd className="whitespace-pre-wrap">{claim.message}</dd>
              </div>
              {claim.placeId && (
                <div>
                  <dt className="text-ink-muted">Listing</dt>
                  <dd>
                    <Link
                      href={`/place/${claim.placeId}`}
                      className="text-brand hover:underline"
                      target="_blank"
                    >
                      View place page
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {claim.status === "pending" && !claim.placeId && (
              <ClaimPlaceLinker claim={claim} />
            )}

            {claim.status === "pending" && claim.placeId && (
              <div className="mt-4 flex gap-2">
                <form action={approveClaimAction}>
                  <input type="hidden" name="id" value={claim.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Approve & grant access
                  </button>
                </form>
                <form action={rejectClaimAction}>
                  <input type="hidden" name="id" value={claim.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted"
                  >
                    Reject
                  </button>
                </form>
              </div>
            )}
          </article>
        ))}

        {claims.length === 0 && (
          <p className="text-sm text-ink-muted">No claims in this view.</p>
        )}
      </div>
    </div>
  );
}
