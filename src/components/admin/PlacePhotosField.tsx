"use client";

import { Trash, UploadSimple } from "@phosphor-icons/react";
import { useId, useRef, useState, type ClipboardEvent } from "react";
import {
  deletePlacePhotoAction,
  uploadPlacePhotoAction,
} from "@/app/admin/actions/place-photo";
import { imageFromClipboard } from "@/lib/clipboard-image";
import { MAX_PLACE_PHOTOS } from "@/types/place";
import type { PlacePhoto } from "@/types/place";

interface PlacePhotosFieldProps {
  placeId: string;
  initialPhotos: PlacePhoto[];
}

export function PlacePhotosField({ placeId, initialPhotos }: PlacePhotosFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const idReady = placeId.trim().length > 0;
  const atLimit = photos.length >= MAX_PLACE_PHOTOS;

  async function handleUpload(file: File) {
    if (!idReady) {
      setError("Save the listing first to add photos.");
      return;
    }
    if (atLimit) {
      setError(`You can add up to ${MAX_PLACE_PHOTOS} photos.`);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { photo } = await uploadPlacePhotoAction(placeId.trim(), formData);
      setPhotos((current) => [...current, photo].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (busy || !idReady || atLimit) return;

    const file = imageFromClipboard(event);
    if (!file) return;

    event.preventDefault();
    void handleUpload(file);
  }

  async function handleDelete(photo: PlacePhoto) {
    if (!confirm("Remove this photo?")) return;

    setBusy(true);
    setError("");

    try {
      if (photo.id > 0) {
        await deletePlacePhotoAction(placeId, photo.id);
      }
      setPhotos((current) => current.filter((entry) => entry.id !== photo.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-ink-secondary">Photos</p>
        <p className="mt-1 text-xs text-ink-muted">
          Up to {MAX_PLACE_PHOTOS} images. The first photo is the cover shown in lists and on the map.
        </p>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id || photo.path}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.path} alt="" className="aspect-[4/3] h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  Cover
                </span>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete(photo)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
                aria-label="Remove photo"
              >
                <Trash size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-8 text-center text-sm text-ink-muted">
          No photos yet.
        </div>
      )}

      {!atLimit && (
        <div
          ref={pasteRef}
          tabIndex={idReady && !busy ? 0 : -1}
          role="button"
          aria-label="Photo paste target"
          onPaste={handlePaste}
          onClick={() => pasteRef.current?.focus()}
          className={`rounded-xl border border-dashed px-4 py-5 text-center outline-none transition ${
            idReady
              ? "cursor-pointer border-border hover:border-brand/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
              : "border-border text-ink-muted"
          }`}
        >
          <p className="text-sm text-ink-secondary">
            {idReady ? "Click here and paste an image (⌘V / Ctrl+V)" : "Save the listing first to add photos."}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={busy || !idReady || atLimit}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <button
          type="button"
          disabled={busy || !idReady || atLimit}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadSimple size={16} weight="bold" />
          {busy ? "Working…" : atLimit ? "Photo limit reached" : "Upload photo"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
