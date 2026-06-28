"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { DraftStatusField } from "@/components/admin/DraftStatusField";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import type { TeacherInput } from "@/lib/validations/teacher";
import {
  createTeacherAction,
  deleteTeacherAction,
  updateTeacherAction,
} from "@/app/admin/actions/teachers";

const emptyTeacher = (): TeacherInput => ({
  slug: "",
  name: "",
  tradition: "",
  lineage: "",
  location: "",
  base: "",
  yearsTeaching: 0,
  birthYear: null,
  deathYear: null,
  languages: [],
  shortBio: "",
  biography: [],
  topics: [],
  photo: "",
  heroPhoto: "",
  website: "",
  socials: [],
  bibliography: [],
  retreats: [],
  relations: [],
  isDraft: false,
});

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function moveBibliographyEntry(books: TeacherInput["bibliography"], from: number, to: number) {
  if (to < 0 || to >= books.length) return books;
  const next = [...books];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

interface TeacherFormProps {
  initial?: TeacherInput;
  mode: "create" | "edit";
}

export function TeacherForm({ initial, mode }: TeacherFormProps) {
  const [teacher, setTeacher] = useState<TeacherInput>(initial ?? emptyTeacher());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const originalSlug = initial?.slug ?? "";

  function set<K extends keyof TeacherInput>(key: K, value: TeacherInput[K]) {
    setTeacher((t) => ({ ...t, [key]: value }));
  }

  function prepareForSave(data: TeacherInput): TeacherInput {
    return {
      ...data,
      bibliography: data.bibliography.filter((b) => b.title.trim() && b.publisher.trim()).map((b) => ({
        ...b,
        url: b.url?.trim() || undefined,
      })),
    };
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = prepareForSave(teacher);
      if (mode === "create") {
        await createTeacherAction(payload);
      } else {
        await updateTeacherAction(originalSlug, payload);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!originalSlug || !confirm(`Delete ${teacher.name}?`)) return;
    setSaving(true);
    try {
      await deleteTeacherAction(originalSlug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/teachers" className="text-xs text-ink-muted hover:text-ink">
            ← Teachers
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
            {mode === "create" ? "Add teacher" : `Edit: ${teacher.name}`}
          </h1>
        </div>
      </div>

      <FormSection title="Identity">
        <FormField id="slug" label="Slug">
          <input
            id="slug"
            value={teacher.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={fieldClassName}
            disabled={mode === "edit"}
          />
        </FormField>
        <FormField id="name" label="Name">
          <input id="name" value={teacher.name} onChange={(e) => set("name", e.target.value)} className={fieldClassName} />
        </FormField>
      </FormSection>

      <FormSection title="Tradition & location">
        <FormField id="tradition" label="Tradition">
          <input id="tradition" value={teacher.tradition} onChange={(e) => set("tradition", e.target.value)} className={fieldClassName} />
        </FormField>
        <FormField id="lineage" label="Lineage">
          <input id="lineage" value={teacher.lineage} onChange={(e) => set("lineage", e.target.value)} className={fieldClassName} />
        </FormField>
        <FormField id="location" label="Location">
          <input id="location" value={teacher.location} onChange={(e) => set("location", e.target.value)} className={fieldClassName} />
        </FormField>
        <FormField id="base" label="Base / home center">
          <input id="base" value={teacher.base ?? ""} onChange={(e) => set("base", e.target.value || undefined)} className={fieldClassName} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField id="birthYear" label="Birth year">
            <input
              id="birthYear"
              type="number"
              value={teacher.birthYear ?? ""}
              onChange={(e) => set("birthYear", e.target.value ? Number(e.target.value) : null)}
              className={fieldClassName}
            />
          </FormField>
          <FormField id="deathYear" label="Death year">
            <input
              id="deathYear"
              type="number"
              value={teacher.deathYear ?? ""}
              onChange={(e) => set("deathYear", e.target.value ? Number(e.target.value) : null)}
              className={fieldClassName}
            />
          </FormField>
        </div>
        <FormField id="yearsTeaching" label="Years teaching">
          <input
            id="yearsTeaching"
            type="number"
            value={teacher.yearsTeaching}
            onChange={(e) => set("yearsTeaching", Number(e.target.value))}
            className={fieldClassName}
          />
        </FormField>
        <FormField id="languages" label="Languages">
          <input
            id="languages"
            value={teacher.languages.join(", ")}
            onChange={(e) =>
              set(
                "languages",
                e.target.value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
              )
            }
            className={fieldClassName}
            placeholder="English, Tibetan"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="About"
        description="Short summary shown under the name on the public profile."
      >
        <FormField id="shortBio" label="About / short bio">
          <textarea
            id="shortBio"
            rows={3}
            value={teacher.shortBio}
            onChange={(e) => set("shortBio", e.target.value)}
            className={`${fieldClassName} resize-y`}
            placeholder="One or two sentences introducing this teacher."
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Biography"
        description="Full bio on the profile. Separate paragraphs with a blank line."
      >
        <FormField id="biography" label="Biography paragraphs">
          <textarea
            id="biography"
            rows={10}
            value={teacher.biography.join("\n\n")}
            onChange={(e) =>
              set(
                "biography",
                e.target.value
                  .split(/\n{2,}/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className={`${fieldClassName} resize-y`}
            placeholder={"First paragraph…\n\nSecond paragraph…"}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Bibliography"
        description="Books listed on the public profile."
      >
        <div className="space-y-3">
          {teacher.bibliography.map((book, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-muted">Book {index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Move book up"
                    disabled={index === 0}
                    onClick={() => set("bibliography", moveBibliographyEntry(teacher.bibliography, index, index - 1))}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move book down"
                    disabled={index === teacher.bibliography.length - 1}
                    onClick={() => set("bibliography", moveBibliographyEntry(teacher.bibliography, index, index + 1))}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField id={`book-title-${index}`} label="Title">
                  <input
                    id={`book-title-${index}`}
                    value={book.title}
                    onChange={(e) => {
                      const next = [...teacher.bibliography];
                      next[index] = { ...book, title: e.target.value };
                      set("bibliography", next);
                    }}
                    className={fieldClassName}
                  />
                </FormField>
                <FormField id={`book-year-${index}`} label="Year">
                  <input
                    id={`book-year-${index}`}
                    type="number"
                    value={book.year}
                    onChange={(e) => {
                      const next = [...teacher.bibliography];
                      next[index] = { ...book, year: Number(e.target.value) || 0 };
                      set("bibliography", next);
                    }}
                    className={fieldClassName}
                  />
                </FormField>
              </div>
              <FormField id={`book-publisher-${index}`} label="Publisher">
                <input
                  id={`book-publisher-${index}`}
                  value={book.publisher}
                  onChange={(e) => {
                    const next = [...teacher.bibliography];
                    next[index] = { ...book, publisher: e.target.value };
                    set("bibliography", next);
                  }}
                  className={fieldClassName}
                />
              </FormField>
              <FormField id={`book-url-${index}`} label="Link">
                <input
                  id={`book-url-${index}`}
                  type="url"
                  value={book.url ?? ""}
                  onChange={(e) => {
                    const next = [...teacher.bibliography];
                    next[index] = { ...book, url: e.target.value || undefined };
                    set("bibliography", next);
                  }}
                  className={fieldClassName}
                  placeholder="https://"
                />
              </FormField>
              <button
                type="button"
                onClick={() => set("bibliography", teacher.bibliography.filter((_, i) => i !== index))}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove book
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("bibliography", [
                ...teacher.bibliography,
                { title: "", year: new Date().getFullYear(), publisher: "", url: "" },
              ])
            }
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
          >
            + Add book
          </button>
        </div>
      </FormSection>

      <FormSection title="Teachings & topics">
        <FormField id="topics" label="Topics">
          <input
            id="topics"
            value={teacher.topics.join(", ")}
            onChange={(e) =>
              set(
                "topics",
                e.target.value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
              )
            }
            className={fieldClassName}
            placeholder="Mindfulness, Non-duality, …"
          />
        </FormField>
      </FormSection>

      <FormSection title="Visibility">
        <DraftStatusField
          checked={teacher.isDraft}
          onChange={(isDraft) => set("isDraft", isDraft)}
        />
      </FormSection>

      <FormSection title="Photos & links">
        <AdminImageField
          label="Portrait"
          slug={teacher.slug}
          value={teacher.photo}
          onChange={(path) => set("photo", path)}
        />
        <AdminImageField
          label="Hero photo (optional)"
          slug={teacher.slug}
          value={teacher.heroPhoto ?? ""}
          onChange={(path) => set("heroPhoto", path || undefined)}
          aspectClassName="aspect-[16/9]"
          variant="hero"
        />
        <FormField id="website" label="Website">
          <input id="website" value={teacher.website ?? ""} onChange={(e) => set("website", e.target.value || undefined)} className={fieldClassName} />
        </FormField>
      </FormSection>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
