"use client";

import Link from "next/link";
import { useState } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { TraditionPickerField } from "@/components/forms/TraditionPickerField";
import {
  createMemberPlaceAction,
  updateOwnerPlaceAction,
} from "@/app/manage/actions/places";
import { faiths, placeTypes } from "@/lib/validations/place";
import type { OwnerPlaceEditInput } from "@/lib/validations/owner-place";
import { PlacePhotosField } from "@/components/admin/PlacePhotosField";
import type { Place } from "@/types/place";

export function MemberCreatePlaceForm() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [faith, setFaith] = useState<(typeof faiths)[number]>("Buddhist");
  const [tradition, setTradition] = useState("Buddhist");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await createMemberPlaceAction({
        name: String(formData.get("name")),
        type: String(formData.get("type")) as (typeof placeTypes)[number],
        faith: String(formData.get("faith")) as (typeof faiths)[number],
        tradition: String(formData.get("tradition") || "Buddhist"),
        address: String(formData.get("address")),
        city: String(formData.get("city")),
        website: String(formData.get("website") || "") || null,
        description: String(formData.get("description") || "") || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create listing");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <p className="text-sm text-ink-secondary">
        New listings start as drafts. Our team reviews them before they appear in the public
        directory.
      </p>

      <FormField id="name" label="Place name">
        <input id="name" name="name" required className={fieldClassName} />
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

      <FormField id="faith" label="Faith tradition">
        <select
          id="faith"
          name="faith"
          required
          className={fieldClassName}
          value={faith}
          onChange={(event) => {
            const nextFaith = event.target.value as (typeof faiths)[number];
            setFaith(nextFaith);
            if (nextFaith === "Hindu" && tradition === "Buddhist") {
              setTradition("Hindu");
            }
            if (nextFaith === "Buddhist" && tradition === "Hindu") {
              setTradition("Buddhist");
            }
          }}
        >
          {faiths.map((faithOption) => (
            <option key={faithOption} value={faithOption}>
              {faithOption}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="tradition" label="Tradition / lineage">
        <TraditionPickerField
          id="tradition"
          name="tradition"
          value={tradition}
          onChange={setTradition}
          faith={faith}
          placeholder="e.g. Zen, Tibetan, Advaita Vedanta"
        />
      </FormField>

      <FormField id="address" label="Street address">
        <input id="address" name="address" required className={fieldClassName} />
      </FormField>

      <FormField id="city" label="City / region">
        <input id="city" name="city" required className={fieldClassName} />
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
  const [form, setForm] = useState<OwnerPlaceEditInput>({
    name: place.name,
    address: place.address,
    phone: place.phone ?? null,
    website: place.website ?? null,
    description: place.description ?? null,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateOwnerPlaceAction(place.id, form);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {place.isDraft && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This listing is still a draft and is not visible in the public directory until our team
          publishes it.
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

      <FormField id="address" label="Address">
        <input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={fieldClassName}
        />
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
        <Link
          href={`/place/${place.id}`}
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
        >
          View public page
        </Link>
        <Link
          href="/manage"
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted"
        >
          Back to dashboard
        </Link>
      </div>
    </form>
  );
}
