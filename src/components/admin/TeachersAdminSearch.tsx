"use client";

import { User } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from "react";
import { uploadTeacherPhotoAction } from "@/app/admin/actions/teacher-photo";
import { DraftBadge } from "@/components/admin/DraftStatusField";
import { imageFromClipboard } from "@/lib/clipboard-image";
import type { Teacher } from "@/types/teacher";

function TeacherRowPhoto({ teacher }: { teacher: Teacher }) {
  const pasteRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(teacher.photo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPhoto(teacher.photo);
  }, [teacher.photo]);

  async function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (busy) return;

    const file = imageFromClipboard(event);
    if (!file) return;

    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { path } = await uploadTeacherPhotoAction(teacher.slug, formData, "portrait");
      setPhoto(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <div
        ref={pasteRef}
        tabIndex={0}
        role="button"
        title={error || "Click to select, then paste an image (⌘V / Ctrl+V)"}
        aria-label={`${teacher.name} photo — click to select, then paste`}
        onPaste={handlePaste}
        onClick={() => pasteRef.current?.focus()}
        className={`h-9 w-9 overflow-hidden rounded-lg border bg-surface-muted outline-none transition ${
          error
            ? "border-red-300 ring-2 ring-red-200"
            : "border-border/60 hover:border-brand/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
        } ${busy ? "cursor-wait opacity-60" : "cursor-pointer"}`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="pointer-events-none h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <User size={16} weight="duotone" className="text-ink-muted/50" />
          </div>
        )}
      </div>
    </div>
  );
}

export function TeachersAdminSearch({ teachers }: { teachers: Teacher[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tradition.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q),
    );
  }, [teachers, query]);

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, tradition, location…"
        className="mb-6 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-muted focus:border-brand"
      />

      <p className="mb-4 text-xs text-ink-muted">
        Click a portrait in the list, then paste an image to upload and save (⌘V / Ctrl+V).
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Name
              </th>
              <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Tradition
              </th>
              <th className="py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Location
              </th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.slug} className="border-b border-border/60 hover:bg-surface-muted/50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <TeacherRowPhoto teacher={t} />
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-medium">{t.name}</span>
                      {t.isDraft && <DraftBadge />}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-ink-secondary">{t.tradition}</td>
                <td className="py-3 text-ink-secondary">{t.location}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/teachers/${t.slug}/edit`}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">No teachers match your search.</p>
      )}
    </>
  );
}
