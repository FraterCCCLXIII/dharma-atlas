"use client";

import { permanentlyDeletePlaceAction } from "@/app/admin/actions/places";

export function PermanentDeleteForm({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) {
  return (
    <form
      action={permanentlyDeletePlaceAction}
      onSubmit={(e) => {
        if (
          !confirm(`Permanently delete “${placeName}”? This cannot be undone.`)
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={placeId} />
      <button
        type="submit"
        className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
      >
        Permanently delete
      </button>
    </form>
  );
}
