"use client";

import { Trash, UploadSimple } from "@phosphor-icons/react";
import { useId, useRef, useState, type ClipboardEvent } from "react";
import { imageFromClipboard } from "@/lib/clipboard-image";
import { isLocalTraditionImagePath } from "@/lib/tradition-image-paths";

interface OntologyTraditionImageFieldProps {
  slug: string;
  value: string | null;
  onChange: (path: string | null) => void;
}

export function OntologyTraditionImageField({
  slug,
  value,
  onChange,
}: OntologyTraditionImageFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const slugReady = slug.trim().length > 0;

  async function handleUpload(file: File) {
    if (!slugReady) {
      setError("Save a slug before uploading.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("slug", slug.trim());
      formData.append("file", file);

      const response = await fetch("/api/admin/ontology/tradition-images", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { path?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed");
      }
      if (!payload.path) {
        throw new Error("Upload did not return a path.");
      }
      onChange(payload.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (busy || !slugReady) return;

    const file = imageFromClipboard(event);
    if (!file) return;

    event.preventDefault();
    void handleUpload(file);
  }

  async function handleDelete() {
    if (!value) return;
    if (!confirm("Remove this placeholder image?")) return;

    setBusy(true);
    setError("");

    try {
      if (isLocalTraditionImagePath(value)) {
        const response = await fetch("/api/admin/ontology/tradition-images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: value }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Delete failed");
        }
      }
      onChange(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        Location placeholder image
      </label>
      <p className="text-xs text-ink-muted">
        Shown on location cards and detail pages when no photo is uploaded. Maps to this
        node&apos;s filter ID and location tradition values.
      </p>

      <div
        ref={pasteRef}
        tabIndex={0}
        onPaste={handlePaste}
        className="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <div className="relative aspect-[16/10] bg-surface-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              No placeholder image
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy || !slugReady}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <button
            type="button"
            disabled={busy || !slugReady}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
          >
            <UploadSimple size={14} weight="bold" />
            {value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete()}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash size={14} weight="bold" />
              Remove
            </button>
          ) : null}
          {!slugReady ? (
            <span className="text-xs text-ink-muted">Enter a slug to upload.</span>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
