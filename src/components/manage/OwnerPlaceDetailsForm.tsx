"use client";

import Link from "next/link";
import { useState } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { PlaceLineageField } from "@/components/forms/PlaceLineageField";
import {
  deleteMemberPlaceAction,
  requestPublishAction,
  updateOwnerPlaceAction,
} from "@/app/manage/actions/places";
import { placeProfilePath } from "@/lib/explore-routes";
import { placeToOwnerEditInput, ownerPlaceEditPath } from "@/lib/manage-place";
import { rethrowNextNavigation } from "@/lib/next-errors";
import {
  LOCATION_MODE_HINTS,
  LOCATION_MODE_LABELS,
} from "@/lib/place-location";
import { normalizePlaceSlug } from "@/lib/place-slug";
import { locationModes, placeTypes } from "@/lib/validations/place";
import type { OwnerPlaceEditInput } from "@/lib/validations/owner-place";
import type { PlaceLineageValue } from "@/lib/schools";
import type { Place } from "@/types/place";

export function OwnerPlaceDetailsForm({ place }: { place: Place }) {
  const [form, setForm] = useState<OwnerPlaceEditInput>(() => placeToOwnerEditInput(place));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [requestingPublish, setRequestingPublish] = useState(false);

  const lineageValue: PlaceLineageValue = {
    faith: form.faith,
    tradition: form.tradition,
    schools: form.schools ?? [],
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    if (!form.tradition.trim()) {
      setError("Choose a tradition or school from the list, or add a custom tradition.");
      setSaving(false);
      return;
    }

    try {
      await updateOwnerPlaceAction(place.id, form);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete “${place.name}”? It will be removed from your dashboard${
          place.isDraft ? "" : " and the public directory"
        }. An admin can restore it if needed.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await deleteMemberPlaceAction(place.id);
    } catch (e) {
      rethrowNextNavigation(e);
      setError(e instanceof Error ? e.message : "Could not delete listing");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-8">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Details</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Name, classification, location, and how visitors can reach you.
        </p>
      </div>

      {place.isDraft && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This listing is still a draft and is not visible in the public directory until our team
          publishes it.
          {place.publishRequestedAt
            ? " Publish has been requested — we’ll review it soon."
            : " When you’re ready, request publish below."}
        </p>
      )}

      <FormField id="name" label="Place name">
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={fieldClassName}
        />
      </FormField>

      <FormField id="slug" label="Public URL slug">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-ink-muted">/place/</span>
          <input
            id="slug"
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            onBlur={() =>
              setForm((f) => ({ ...f, slug: normalizePlaceSlug(f.slug) || f.slug }))
            }
            className={fieldClassName}
            placeholder="zen-center-berkeley"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Lowercase letters, numbers, and hyphens. Changing this updates your public link;
          the old URL redirects when possible via the place id.
        </p>
      </FormField>

      <FormField id="type" label="Place type">
        <select
          id="type"
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as OwnerPlaceEditInput["type"] }))
          }
          className={fieldClassName}
        >
          {placeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="lineage" label="Tradition / school">
        <PlaceLineageField
          id="lineage"
          value={lineageValue}
          onChange={(next) =>
            setForm((f) => ({
              ...f,
              faith: next.faith,
              tradition: next.tradition,
              schools: next.schools,
            }))
          }
        />
      </FormField>

      <FormField id="locationMode" label="Where do you meet?">
        <select
          id="locationMode"
          value={form.locationMode}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              locationMode: e.target.value as OwnerPlaceEditInput["locationMode"],
            }))
          }
          className={fieldClassName}
        >
          {locationModes.map((mode) => (
            <option key={mode} value={mode}>
              {LOCATION_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink-muted">
          {LOCATION_MODE_HINTS[form.locationMode]}
        </p>
      </FormField>

      <FormField
        id="address"
        label={
          form.locationMode === "online"
            ? "Service area (optional)"
            : form.locationMode === "area"
              ? "City / region"
              : "Street address"
        }
      >
        <input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={fieldClassName}
          placeholder={
            form.locationMode === "venue"
              ? "123 Main St, Berkeley, CA"
              : form.locationMode === "area"
                ? "Berkeley, CA"
                : "Optional region this online group serves"
          }
          required={form.locationMode !== "online"}
        />
        {form.locationMode !== "online" ? (
          <p className="mt-1 text-xs text-ink-muted">
            Map location updates when this changes
            {place.lat || place.lng
              ? ` (currently ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)})`
              : ""}
            .
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">
            Online listings do not appear as map pins.
          </p>
        )}
      </FormField>

      <FormField id="phone" label="Phone">
        <input
          id="phone"
          type="tel"
          value={form.phone ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
          className={fieldClassName}
        />
      </FormField>

      <FormField id="website" label="Website">
        <input
          id="website"
          type="url"
          value={form.website ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value || null }))}
          className={fieldClassName}
        />
      </FormField>

      <FormField id="hours" label="Opening hours">
        <textarea
          id="hours"
          rows={4}
          value={form.hoursText ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, hoursText: e.target.value || null }))}
          className={`${fieldClassName} resize-y`}
          placeholder={"Monday: 9am – 5pm\nTuesday: 9am – 5pm\nWednesday: Closed"}
        />
        <p className="mt-1 text-xs text-ink-muted">
          One day per line. These appear on your public listing.
        </p>
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClassName}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-ink-muted">Saved</span>}
        {!place.isDraft ? (
          <Link
            href={placeProfilePath({ id: place.id, slug: form.slug || place.slug })}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
          >
            View public page
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-full border border-dashed border-border px-4 py-2 text-sm text-ink-muted">
            Preview unavailable — draft
          </span>
        )}
        {place.isDraft && !place.publishRequestedAt && (
          <button
            type="button"
            disabled={requestingPublish}
            onClick={async () => {
              setRequestingPublish(true);
              try {
                await requestPublishAction(place.id, {
                  returnTo: ownerPlaceEditPath(place.id, "details"),
                });
              } catch (e) {
                rethrowNextNavigation(e);
                setError(e instanceof Error ? e.message : "Could not request publish");
                setRequestingPublish(false);
              }
            }}
            className="inline-flex items-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/5"
          >
            {requestingPublish ? "Requesting…" : "Request publish"}
          </button>
        )}
        {place.isDraft && place.publishRequestedAt && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
            Publish requested
          </span>
        )}
        <button
          type="button"
          disabled={deleting || saving}
          onClick={() => void handleDelete()}
          className="inline-flex items-center rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete listing"}
        </button>
      </div>
    </form>
    </div>
  );
}
