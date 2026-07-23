"use client";

import { useState } from "react";
import { FormField, fieldClassName, submitButtonClassName } from "@/components/forms/FormField";
import { updateOwnerPlaceAction } from "@/app/manage/actions/places";
import { placeToOwnerEditInput } from "@/lib/manage-place";
import type { Place } from "@/types/place";

const NOTICE_MAX = 500;

export function OwnerPlaceNoticesForm({ place }: { place: Place }) {
  const base = placeToOwnerEditInput(place);
  const [notice, setNotice] = useState(base.notice ?? "");
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
        notice: notice.trim() || null,
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
        <h2 className="font-display text-xl font-semibold text-ink">Notices</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Optional short message shown at the top of your public listing, above About.
          Use it for temporary updates like closures, schedule changes, or visitor tips.
        </p>
      </div>

      <FormField id="notice" label="Visitor notice">
        <textarea
          id="notice"
          value={notice}
          onChange={(e) => {
            setNotice(e.target.value);
            setSaved(false);
          }}
          rows={4}
          maxLength={NOTICE_MAX}
          placeholder="e.g. Closed for renovations through August. Walk-ins welcome again September 1."
          className={fieldClassName}
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          {notice.length}/{NOTICE_MAX} characters. Leave blank to hide the notice.
        </p>
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={submitButtonClassName}>
          {saving ? "Saving…" : "Save notice"}
        </button>
        {saved && <span className="text-sm text-ink-muted">Saved</span>}
      </div>
    </form>
  );
}
