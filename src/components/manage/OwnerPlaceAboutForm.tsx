"use client";

import { useState } from "react";
import { FormField, submitButtonClassName } from "@/components/forms/FormField";
import { MarkdownRichTextEditor } from "@/components/forms/MarkdownRichTextEditor";
import { updateOwnerPlaceAction } from "@/app/manage/actions/places";
import { placeToOwnerEditInput } from "@/lib/manage-place";
import type { Place } from "@/types/place";

export function OwnerPlaceAboutForm({ place }: { place: Place }) {
  const base = placeToOwnerEditInput(place);
  const [description, setDescription] = useState(base.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await updateOwnerPlaceAction(place.id, {
        ...base,
        description: description.trim() || null,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">About</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tell visitors about this place — practice style, community, and what to expect.
        </p>
      </div>

      <FormField id="description" label="About this place">
        <MarkdownRichTextEditor
          id="description"
          value={description}
          onChange={(next) => {
            setDescription(next);
            setSaved(false);
          }}
          rows={12}
          placeholder="Describe the community, practice style, and what visitors can expect…"
        />
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={submitButtonClassName}>
          {saving ? "Saving…" : "Save about"}
        </button>
        {saved && (
          <span className="text-sm text-ink-muted">Saved</span>
        )}
      </div>
    </form>
  );
}
