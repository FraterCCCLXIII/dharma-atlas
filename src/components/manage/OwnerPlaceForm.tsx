"use client";

import Link from "next/link";
import { useState } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { MarkdownRichTextEditor } from "@/components/forms/MarkdownRichTextEditor";
import { PlaceLineageField } from "@/components/forms/PlaceLineageField";
import { createMemberPlaceAction } from "@/app/manage/actions/places";
import { rethrowNextNavigation } from "@/lib/next-errors";
import {
  LOCATION_MODE_HINTS,
  LOCATION_MODE_LABELS,
} from "@/lib/place-location";
import { locationModes, placeTypes } from "@/lib/validations/place";
import type { PlaceLineageValue } from "@/lib/schools";
import type { LocationMode } from "@/types/place";

export function MemberCreatePlaceForm() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("venue");
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
        locationMode,
        address: String(formData.get("address") || ""),
        city: String(formData.get("city") || ""),
        phone: String(formData.get("phone") || "") || null,
        website: String(formData.get("website") || "") || null,
        description: description.trim() || null,
        hoursText: hoursText.trim() || null,
        schools: lineage.schools,
      });
    } catch (e) {
      rethrowNextNavigation(e);
      setError(e instanceof Error ? e.message : "Could not create listing");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <FormField id="locationMode" label="Where do you meet?">
        <select
          id="locationMode"
          value={locationMode}
          onChange={(e) => setLocationMode(e.target.value as LocationMode)}
          className={fieldClassName}
        >
          {locationModes.map((mode) => (
            <option key={mode} value={mode}>
              {LOCATION_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink-muted">{LOCATION_MODE_HINTS[locationMode]}</p>
      </FormField>

      {locationMode === "venue" ? (
        <>
          <FormField id="address" label="Street address">
            <input id="address" name="address" required className={fieldClassName} />
          </FormField>
          <FormField id="city" label="City / region">
            <input id="city" name="city" required className={fieldClassName} />
          </FormField>
        </>
      ) : null}

      {locationMode === "area" ? (
        <FormField id="city" label="City / region">
          <input
            id="city"
            name="city"
            required
            className={fieldClassName}
            placeholder="Berkeley, CA"
          />
        </FormField>
      ) : null}

      {locationMode === "online" ? (
        <FormField id="city" label="Service area (optional)">
          <input
            id="city"
            name="city"
            className={fieldClassName}
            placeholder="Bay Area, California"
          />
          <input type="hidden" name="address" value="" />
        </FormField>
      ) : null}

      <FormField id="phone" label="Phone">
        <input id="phone" name="phone" type="tel" className={fieldClassName} />
      </FormField>

      <FormField id="website" label="Website">
        <input
          id="website"
          name="website"
          type="url"
          className={fieldClassName}
          placeholder="https://"
        />
      </FormField>

      <FormField id="description" label="About this place">
        <MarkdownRichTextEditor
          id="description"
          value={description}
          onChange={setDescription}
          rows={5}
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
