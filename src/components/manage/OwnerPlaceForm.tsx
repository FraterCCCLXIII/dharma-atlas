"use client";

import Link from "next/link";
import { useState } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { PlaceLineageField } from "@/components/forms/PlaceLineageField";
import { getKnownSchoolSlugs } from "@/components/forms/SchoolTagsField";
import {
  createMemberPlaceAction,
  deleteMemberPlaceAction,
  requestPublishAction,
  updateOwnerPlaceAction,
} from "@/app/manage/actions/places";
import { placeTypes } from "@/lib/validations/place";
import type { OwnerPlaceEditInput } from "@/lib/validations/owner-place";
import type { PlaceLineageValue } from "@/lib/schools";
import { PlacePhotosField } from "@/components/admin/PlacePhotosField";
import type { Place } from "@/types/place";

export function MemberCreatePlaceForm() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [lineage, setLineage] = useState<PlaceLineageValue>({
    faith: "Buddhist",
    tradition: "Buddhist",
    schools: [],
  });
  const [hoursText, setHoursText] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    if (!lineage.tradition.trim()) {
      setError("Choose a tradition or school from the list, or add a custom tradition.");
      setSaving(false);
      return;
    }

    try {
      await createMemberPlaceAction({
        name: String(formData.get("name")),
        type: String(formData.get("type")) as (typeof placeTypes)[number],
        faith: lineage.faith,
        tradition: lineage.tradition,
        address: String(formData.get("address")),
        city: String(formData.get("city")),
        phone: String(formData.get("phone") || "") || null,
        website: String(formData.get("website") || "") || null,
        description: String(formData.get("description") || "") || null,
        hoursText: hoursText.trim() || null,
        schools: lineage.schools,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create listing");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <p className="text-sm text-ink-secondary">
        New listings start as drafts. Fill in as much as you can now — you can add photos after
        create, then request publish when ready.
      </p>

      <FormField id="name" label="Place name">
        <input
          id="name"
          name="name"
          required
          className={fieldClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <FormField id="type" label="Place type">
        <select id="type" name="type" required className={fieldClassName} defaultValue="Center">
          {placeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="lineage" label="Tradition / school">
        <PlaceLineageField id="lineage" value={lineage} onChange={setLineage} />
      </FormField>

      <FormField id="address" label="Street address">
        <input id="address" name="address" required className={fieldClassName} />
      </FormField>

      <FormField id="city" label="City / region">
        <input id="city" name="city" required className={fieldClassName} />
      </FormField>

      <FormField id="phone" label="Phone">
        <input id="phone" name="phone" type="tel" className={fieldClassName} />
      </FormField>

      <FormField id="website" label="Website">
        <input id="website" name="website" type="url" className={fieldClassName} placeholder="https://" />
      </FormField>

      <FormField id="description" label="Description">
        <textarea
          id="description"
          name="description"
          rows={4}
          className={`${fieldClassName} resize-y`}
          placeholder="Programs, visiting teachers, community focus…"
        />
      </FormField>

      <FormField id="hours" label="Opening hours">
        <textarea
          id="hours"
          rows={4}
          value={hoursText}
          onChange={(e) => setHoursText(e.target.value)}
          className={`${fieldClassName} resize-y`}
          placeholder={"Monday: 9am – 5pm\nTuesday: 9am – 5pm\nWednesday: Closed"}
        />
        <p className="mt-1 text-xs text-ink-muted">One day per line.</p>
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={submitButtonClassName}>
          {saving ? "Creating…" : "Create draft listing"}
        </button>
        <Link
          href="/manage"
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function OwnerPlaceForm({ place }: { place: Place }) {
  const hoursLines = place.openingHours?.weekdayDescriptions?.join("\n") ?? "";
  const knownSlugs = getKnownSchoolSlugs();
  const [form, setForm] = useState<OwnerPlaceEditInput>({
    name: place.name,
    type: place.type,
    faith: place.faith,
    tradition: place.tradition,
    address: place.address,
    phone: place.phone ?? null,
    website: place.website ?? null,
    description: place.description ?? null,
    hoursText: hoursLines || null,
    schools: (place.schools ?? []).filter((slug) => knownSlugs.includes(slug)),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
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

    if (!form.tradition.trim()) {
      setError("Choose a tradition or school from the list, or add a custom tradition.");
      setSaving(false);
      return;
    }

    try {
      await updateOwnerPlaceAction(place.id, form);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
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
      setError(e instanceof Error ? e.message : "Could not delete listing");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
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

      <FormField id="address" label="Address">
        <input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={fieldClassName}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Coordinates ({place.lat.toFixed(4)}, {place.lng.toFixed(4)}) update when the address
          changes.
        </p>
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

      <FormField id="description" label="Description">
        <textarea
          id="description"
          rows={6}
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
          className={`${fieldClassName} resize-y`}
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

      <PlacePhotosField placeId={place.id} initialPhotos={place.photos ?? []} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={submitButtonClassName}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {!place.isDraft ? (
          <Link
            href={`/place/${place.id}`}
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
                await requestPublishAction(place.id);
              } catch (e) {
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
        <Link
          href="/manage"
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
        >
          Back to Place Listings
        </Link>
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
  );
}
