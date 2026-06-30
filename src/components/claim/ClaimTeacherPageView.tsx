"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { authClient } from "@/lib/auth-client";

interface SearchTeacher {
  slug: string;
  name: string;
  tradition: string;
  lineage: string;
}

export function ClaimTeacherPageView({
  initialSlug,
  initialName,
}: {
  initialSlug?: string;
  initialName?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [query, setQuery] = useState(initialName ?? "");
  const [results, setResults] = useState<SearchTeacher[]>([]);
  const [selected, setSelected] = useState<SearchTeacher | null>(
    initialSlug && initialName
      ? { slug: initialSlug, name: initialName, tradition: "", lineage: "" }
      : null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/explore/teachers?q=${encodeURIComponent(trimmed)}&pageSize=10`);
    const data = (await res.json()) as { teachers: SearchTeacher[] };
    setResults(data.teachers);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selected || selected.name !== query) void runSearch(query);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, runSearch, selected]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      setError("Select a teacher from the search results.");
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
          entityType: "teacher",
          teacherSlug: selected.slug,
          placeName: selected.name,
          listingUrl: `${window.location.origin}/person/${selected.slug}`,
          affiliationRole: String(formData.get("affiliationRole")),
          message: String(formData.get("message")),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Claim failed");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <FormPageShell title="Claim a teacher profile" description="Loading…">
        <p className="text-sm text-ink-muted">Checking session…</p>
      </FormPageShell>
    );
  }

  if (!session) {
    return (
      <FormPageShell
        title="Claim a teacher profile"
        description="Sign in to request management access for a teacher listing."
      >
        <div className="flex gap-3">
          <Link href="/signup?redirect=/claim/person" className={submitButtonClassName}>
            Create account
          </Link>
          <Link href="/login?redirect=/claim/person" className="rounded-full border border-border px-4 py-2 text-sm">
            Sign in
          </Link>
        </div>
      </FormPageShell>
    );
  }

  if (submitted) {
    return (
      <FormPageShell title="Claim submitted" description="We’ll review your request soon.">
        <Link href="/manage" className={`${submitButtonClassName} mt-4 inline-flex`}>
          Go to dashboard
        </Link>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title="Claim a teacher profile"
      description="Search for the teacher profile you represent, then describe your affiliation."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField id="teacher-search" label="Find teacher">
          <input
            id="teacher-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            className={fieldClassName}
            placeholder="Search by name or tradition"
          />
        </FormField>

        {!selected && results.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {results.map((teacher) => (
              <li key={teacher.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(teacher);
                    setQuery(teacher.name);
                    setResults([]);
                  }}
                  className="block w-full px-4 py-3 text-left hover:bg-surface-muted"
                >
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-ink-muted">{teacher.tradition}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <>
            <FormField id="claim-role" label="Your role">
              <input id="claim-role" name="affiliationRole" required className={fieldClassName} />
            </FormField>
            <FormField id="claim-message" label="Affiliation details">
              <textarea id="claim-message" name="message" required minLength={10} rows={4} className={fieldClassName} />
            </FormField>
            <button type="submit" disabled={submitting} className={submitButtonClassName}>
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Claiming a location instead?{" "}
        <Link href="/claim" className="text-brand hover:underline">
          Claim a location
        </Link>
      </p>
    </FormPageShell>
  );
}
