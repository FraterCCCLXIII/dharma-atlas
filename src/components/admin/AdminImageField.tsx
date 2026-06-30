"use client";

import { Trash, UploadSimple, User } from "@phosphor-icons/react";
import { useId, useRef, useState, type ClipboardEvent } from "react";
import {
  deleteTeacherPhotoAction,
  uploadTeacherPhotoAction,
} from "@/app/admin/actions/teacher-photo";
import { isLocalPeoplePhotoPath } from "@/lib/people-photo-paths";
import { imageFromClipboard } from "@/lib/clipboard-image";

interface AdminImageFieldProps {
  label: string;
  slug: string;
  value: string;
  onChange: (path: string) => void;
  aspectClassName?: string;
  variant?: "portrait" | "hero";
}

export function AdminImageField({
  label,
  slug,
  value,
  onChange,
  aspectClassName = "aspect-[4/5]",
  variant = "portrait",
}: AdminImageFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const slugReady = slug.trim().length > 0;

  async function handleUpload(file: File) {
    if (!slugReady) {
      setError("Enter a slug before uploading.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { path } = await uploadTeacherPhotoAction(slug.trim(), formData, variant);
      onChange(path);
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
    if (!confirm("Remove this image?")) return;

    setBusy(true);
    setError("");

    try {
      if (slugReady && isLocalPeoplePhotoPath(value)) {
        await deleteTeacherPhotoAction(slug.trim(), value);
      }
      onChange("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-secondary">{label}</p>

      <div
        ref={pasteRef}
        tabIndex={slugReady && !busy ? 0 : -1}
        role="button"
        aria-label={`${label} paste target`}
        onPaste={handlePaste}
        onClick={() => pasteRef.current?.focus()}
        className={`relative max-w-xs overflow-hidden rounded-xl border bg-surface-muted outline-none transition ${
          slugReady
            ? "cursor-pointer border-border hover:border-brand/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
            : "border-border"
        } ${aspectClassName}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="pointer-events-none h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center text-ink-muted">
            <User size={40} weight="duotone" className="opacity-40" />
            <span className="text-xs">No image</span>
            {slugReady && (
              <span className="text-[11px] leading-snug text-ink-muted/80">
                Click here, then paste
              </span>
            )}
          </div>
        )}
      </div>

      {value && (
        <p className="max-w-xs truncate text-xs text-ink-muted" title={value}>
          {value}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={busy || !slugReady}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <button
          type="button"
          disabled={busy || !slugReady}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadSimple size={16} weight="bold" />
          {busy ? "Working…" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleDelete()}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash size={16} weight="bold" />
            Remove
          </button>
        )}
      </div>

      {!slugReady && (
        <p className="text-xs text-ink-muted">Set a slug first, then upload or paste a portrait.</p>
      )}

      {slugReady && (
        <p className="max-w-xs text-xs text-ink-muted">
          Click the preview and paste from your clipboard (⌘V / Ctrl+V), or use Upload.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
