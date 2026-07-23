"use client";

import { useState } from "react";
import { PlaceOfferingIcon } from "@/components/place/PlaceOfferingIcon";
import { submitButtonClassName } from "@/components/forms/FormField";
import { updateOwnerPlaceAction } from "@/app/manage/actions/places";
import { placeToOwnerEditInput } from "@/lib/manage-place";
import {
  PLACE_OFFERINGS,
  filterKnownOfferings,
  type PlaceOfferingId,
} from "@/lib/place-offerings";
import type { Place } from "@/types/place";

export function PlaceOfferingsField({ place }: { place: Place }) {
  const base = placeToOwnerEditInput(place);
  const [selected, setSelected] = useState<PlaceOfferingId[]>(() =>
    filterKnownOfferings(place.offerings ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: PlaceOfferingId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateOwnerPlaceAction(place.id, {
        ...base,
        offerings: selected,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save offerings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">What this place offers</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Choose the practices and visitor amenities that apply. These appear on your public listing.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {PLACE_OFFERINGS.map((offering) => {
          const checked = selected.includes(offering.id);
          return (
            <li key={offering.id}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                  checked
                    ? "border-brand/40 bg-brand/5 text-ink"
                    : "border-border bg-surface-elevated text-ink-secondary hover:bg-surface-muted/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(offering.id)}
                  className="sr-only"
                />
                <span className="text-ink-secondary">
                  <PlaceOfferingIcon name={offering.icon} />
                </span>
                <span className="font-medium">{offering.label}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className={submitButtonClassName}
        >
          {saving ? "Saving…" : "Save offerings"}
        </button>
        {saved && <span className="text-sm text-ink-muted">Saved</span>}
      </div>
    </div>
  );
}
