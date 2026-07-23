"use client";

import {
  CaretDown,
  CaretUp,
  DotsSixVertical,
  Plus,
  Trash,
  UploadSimple,
  User,
} from "@phosphor-icons/react";
import { useId, useRef, useState, type DragEvent } from "react";
import {
  deletePlaceTeacherImageAction,
  savePlaceTeachersAction,
  uploadPlaceTeacherImageAction,
} from "@/app/manage/actions/place-profile";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import { MarkdownRichTextEditor } from "@/components/forms/MarkdownRichTextEditor";
import type { PlaceTeacher } from "@/types/place";
import type { PlaceTeacherInput } from "@/lib/validations/place-profile";

type DropMode = "before" | "after";

type TeacherDraft = PlaceTeacherInput & { clientKey: string };

function newClientKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toDraft(teacher: PlaceTeacher): TeacherDraft {
  return {
    id: teacher.id,
    displayName: teacher.displayName,
    title: teacher.title ?? null,
    bio: teacher.bio ?? null,
    imagePath: teacher.imagePath ?? null,
    teacherSlug: teacher.teacherSlug ?? null,
    sortOrder: teacher.sortOrder,
    clientKey: `saved-${teacher.id}`,
  };
}

function emptyTeacher(sortOrder: number): TeacherDraft {
  return {
    displayName: "",
    title: null,
    bio: null,
    imagePath: null,
    teacherSlug: null,
    sortOrder,
    clientKey: newClientKey(),
  };
}

function teacherLabel(teacher: TeacherDraft) {
  const name = teacher.displayName.trim();
  return name || "Untitled teacher";
}

function toPayload(teachers: TeacherDraft[]): PlaceTeacherInput[] {
  return teachers.map((teacher, index) => ({
    id: teacher.id,
    displayName: teacher.displayName,
    title: teacher.title,
    bio: teacher.bio,
    imagePath: teacher.imagePath,
    teacherSlug: teacher.teacherSlug,
    sortOrder: index,
  }));
}

function reorderTeachers(
  teachers: TeacherDraft[],
  draggedKey: string,
  targetKey: string,
  mode: DropMode,
): TeacherDraft[] {
  if (draggedKey === targetKey) return teachers;
  const from = teachers.findIndex((teacher) => teacher.clientKey === draggedKey);
  const to = teachers.findIndex((teacher) => teacher.clientKey === targetKey);
  if (from < 0 || to < 0) return teachers;

  const next = [...teachers];
  const [moved] = next.splice(from, 1);
  if (!moved) return teachers;

  let insertAt = next.findIndex((teacher) => teacher.clientKey === targetKey);
  if (insertAt < 0) return teachers;
  if (mode === "after") insertAt += 1;
  next.splice(insertAt, 0, moved);
  return next.map((teacher, index) => ({ ...teacher, sortOrder: index }));
}

function dropModeFromEvent(event: DragEvent): DropMode {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  return event.clientY < mid ? "before" : "after";
}

interface PlaceGuidingTeachersFieldProps {
  placeId: string;
  initialTeachers: PlaceTeacher[];
  /** When false, omit the field’s own heading (e.g. admin FormSection provides one). */
  showHeading?: boolean;
}

export function PlaceGuidingTeachersField({
  placeId,
  initialTeachers,
  showHeading = true,
}: PlaceGuidingTeachersFieldProps) {
  const listId = useId();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [teachers, setTeachers] = useState<TeacherDraft[]>(
    initialTeachers.map(toDraft),
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: string;
    mode: DropMode;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const editingIndex =
    editingKey == null
      ? null
      : teachers.findIndex((teacher) => teacher.clientKey === editingKey);

  function markDirty() {
    setSaved(false);
    setDirty(true);
  }

  function updateTeacher(index: number, patch: Partial<PlaceTeacherInput>) {
    setTeachers((current) =>
      current.map((teacher, i) => (i === index ? { ...teacher, ...patch } : teacher)),
    );
    markDirty();
  }

  function addTeacher() {
    setTeachers((current) => {
      const next = [...current, emptyTeacher(current.length)];
      setEditingKey(next[next.length - 1]!.clientKey);
      return next;
    });
    markDirty();
  }

  function removeTeacher(index: number) {
    const removed = teachers[index];
    setTeachers((current) => current.filter((_, i) => i !== index));
    setEditingKey((current) => (current === removed?.clientKey ? null : current));
    markDirty();
  }

  function moveTeacher(draggedKey: string, targetKey: string, mode: DropMode) {
    setTeachers((current) => reorderTeachers(current, draggedKey, targetKey, mode));
    markDirty();
  }

  async function handleUpload(index: number, file: File) {
    const teacher = teachers[index];
    if (!teacher) return;
    setBusy(true);
    setError("");
    try {
      const previous = teacher.imagePath;
      const formData = new FormData();
      formData.append("file", file);
      const { path } = await uploadPlaceTeacherImageAction(placeId, formData);
      updateTeacher(index, { imagePath: path });
      if (previous?.includes("-teacher-")) {
        try {
          await deletePlaceTeacherImageAction(placeId, previous);
        } catch {
          // Best-effort cleanup of replaced image.
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      const input = fileRefs.current[teacher.clientKey];
      if (input) input.value = "";
    }
  }

  async function handleSave() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const payload = toPayload(teachers).filter((teacher) => teacher.displayName.trim());
      const savedTeachers = await savePlaceTeachersAction(placeId, payload);
      setTeachers(savedTeachers.map(toDraft));
      setEditingKey(null);
      setSaved(true);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save teachers");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {showHeading ? (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Guiding teachers</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {teachers.length === 0
                ? "No teachers yet. Add people who teach or guide practice here."
                : `${teachers.length} teacher${teachers.length === 1 ? "" : "s"} on this listing. Drag to reorder.`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            {teachers.length === 0
              ? "No teachers yet."
              : `${teachers.length} teacher${teachers.length === 1 ? "" : "s"} · drag to reorder`}
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={addTeacher}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
        >
          <Plus size={14} weight="bold" />
          Add teacher
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-8 text-center">
          <p className="text-sm text-ink-muted">This list is empty.</p>
          <button
            type="button"
            disabled={busy}
            onClick={addTeacher}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
          >
            <Plus size={14} weight="bold" />
            Add first teacher
          </button>
        </div>
      ) : (
        <ul
          id={listId}
          className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-elevated"
        >
          {teachers.map((teacher, index) => {
            const open = editingKey === teacher.clientKey;
            const isDragging = draggingKey === teacher.clientKey;
            const showBefore =
              dropTarget?.key === teacher.clientKey && dropTarget.mode === "before";
            const showAfter =
              dropTarget?.key === teacher.clientKey && dropTarget.mode === "after";

            return (
              <li
                key={teacher.clientKey}
                className={`relative ${isDragging ? "opacity-40" : ""}`}
                onDragOver={(event) => {
                  if (!draggingKey || draggingKey === teacher.clientKey) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  const mode = dropModeFromEvent(event);
                  setDropTarget((current) =>
                    current?.key === teacher.clientKey && current.mode === mode
                      ? current
                      : { key: teacher.clientKey, mode },
                  );
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setDropTarget((current) =>
                      current?.key === teacher.clientKey ? null : current,
                    );
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedKey =
                    draggingKey ?? event.dataTransfer.getData("text/plain");
                  const mode = dropModeFromEvent(event);
                  if (draggedKey && draggedKey !== teacher.clientKey) {
                    moveTeacher(draggedKey, teacher.clientKey, mode);
                  }
                  setDraggingKey(null);
                  setDropTarget(null);
                }}
              >
                {showBefore ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 top-0 z-10 h-0.5 -translate-y-1/2 rounded-full bg-brand"
                  />
                ) : null}
                {showAfter ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 z-10 h-0.5 translate-y-1/2 rounded-full bg-brand"
                  />
                ) : null}

                <div className="flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-3">
                  <button
                    type="button"
                    draggable={!busy}
                    disabled={busy}
                    aria-label={`Drag to reorder ${teacherLabel(teacher)}`}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", teacher.clientKey);
                      setDraggingKey(teacher.clientKey);
                      setDropTarget(null);
                    }}
                    onDragEnd={() => {
                      setDraggingKey(null);
                      setDropTarget(null);
                    }}
                    className="inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <DotsSixVertical size={16} weight="bold" />
                  </button>

                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-muted">
                    {teacher.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.imagePath}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-muted">
                        <User size={18} weight="duotone" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingKey(open ? null : teacher.clientKey)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-ink">
                      {teacherLabel(teacher)}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {[
                        teacher.title?.trim() || null,
                        teacher.bio?.trim() ? "Has bio" : null,
                        teacher.teacherSlug ? `Linked: ${teacher.teacherSlug}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No title"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingKey(open ? null : teacher.clientKey)
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                    aria-expanded={open}
                    aria-label={open ? "Collapse teacher" : "Edit teacher"}
                  >
                    {open ? (
                      <CaretUp size={16} weight="bold" />
                    ) : (
                      <CaretDown size={16} weight="bold" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeTeacher(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    aria-label="Remove teacher"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>

                {open && editingIndex === index ? (
                  <div className="space-y-3 border-t border-border bg-surface px-3 py-4">
                    <FormField id={`teacher-name-${teacher.clientKey}`} label="Name">
                      <input
                        id={`teacher-name-${teacher.clientKey}`}
                        value={teacher.displayName}
                        onChange={(e) =>
                          updateTeacher(index, { displayName: e.target.value })
                        }
                        className={fieldClassName}
                        placeholder="Teacher name"
                      />
                    </FormField>
                    <FormField
                      id={`teacher-title-${teacher.clientKey}`}
                      label="Title / role"
                    >
                      <input
                        id={`teacher-title-${teacher.clientKey}`}
                        value={teacher.title ?? ""}
                        onChange={(e) =>
                          updateTeacher(index, { title: e.target.value || null })
                        }
                        className={fieldClassName}
                        placeholder="Abbot, Guiding teacher, Resident teacher…"
                      />
                    </FormField>

                    <FormField id={`teacher-bio-${teacher.clientKey}`} label="Bio">
                      <MarkdownRichTextEditor
                        id={`teacher-bio-${teacher.clientKey}`}
                        value={teacher.bio ?? ""}
                        onChange={(next) =>
                          updateTeacher(index, { bio: next.trim() || null })
                        }
                        rows={5}
                        placeholder="Short bio shown when visitors click this teacher on the place page…"
                      />
                    </FormField>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-ink-secondary">Photo</p>
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-muted">
                          {teacher.imagePath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={teacher.imagePath}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-muted">
                              <User size={24} weight="duotone" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={(el) => {
                              fileRefs.current[teacher.clientKey] = el;
                            }}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUpload(index, file);
                            }}
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              fileRefs.current[teacher.clientKey]?.click()
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
                          >
                            <UploadSimple size={14} weight="bold" />
                            {teacher.imagePath ? "Replace photo" : "Add photo"}
                          </button>
                          {teacher.imagePath ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                updateTeacher(index, { imagePath: null })
                              }
                              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
                            >
                              Remove photo
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <FormField
                      id={`teacher-slug-${teacher.clientKey}`}
                      label="Link teacher profile (optional)"
                    >
                      <input
                        id={`teacher-slug-${teacher.clientKey}`}
                        value={teacher.teacherSlug ?? ""}
                        onChange={(e) =>
                          updateTeacher(index, {
                            teacherSlug: e.target.value || null,
                          })
                        }
                        className={fieldClassName}
                        placeholder="teacher-slug"
                      />
                      <p className="mt-1 text-xs text-ink-muted">
                        Matches /person/[slug]. Leave blank for a stub until a full profile
                        exists.
                      </p>
                    </FormField>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => void handleSave()}
          className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save teachers"}
        </button>
        {saved ? (
          <span className="inline-flex items-center text-sm text-ink-muted">
            Saved — visible on the public page
          </span>
        ) : null}
      </div>
      {dirty ? (
        <p className="text-xs text-amber-800">
          You have unsaved teacher changes. Click Save teachers to publish them on the
          listing.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
