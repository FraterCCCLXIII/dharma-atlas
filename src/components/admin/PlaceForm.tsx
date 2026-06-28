"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import { DraftStatusField } from "@/components/admin/DraftStatusField";
import {
  getActiveOntologySnapshot,
  getBuddhistPlaceTraditionOptions,
  getSubschoolLabelMap,
  inferSchools,
  subschoolLabel,
} from "@/lib/schools";
import { faiths, placeTypes, type PlaceInput } from "@/lib/validations/place";
import {
  createPlaceAction,
  deletePlaceAction,
  updatePlaceAction,
} from "@/app/admin/actions/places";

const emptyPlace = (): PlaceInput => ({
  id: "",
  name: "",
  lat: 0,
  lng: 0,
  tradition: "Buddhist",
  faith: "Buddhist",
  type: "Center",
  folder: "",
  address: "",
  phone: null,
  website: null,
  schools: [],
  isDraft: false,
});

const KNOWN_SCHOOL_SLUGS = Object.keys(getSubschoolLabelMap()).sort((a, b) =>
  subschoolLabel(a).localeCompare(subschoolLabel(b)),
);

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface PlaceFormProps {
  initial?: PlaceInput;
  mode: "create" | "edit";
}

export function PlaceForm({ initial, mode }: PlaceFormProps) {
  const [place, setPlace] = useState<PlaceInput>(initial ?? emptyPlace());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const originalId = initial?.id ?? "";

  const traditionOptions = useMemo(() => {
    const options = new Set(getBuddhistPlaceTraditionOptions());
    const snapshot = getActiveOntologySnapshot();
    for (const tradition of snapshot.otherTraditions) {
      options.add(tradition.filterId);
    }
    if (place.tradition.trim()) options.add(place.tradition.trim());
    if (place.faith === "Hindu") options.add("Hindu");
    return [...options].sort((a, b) => a.localeCompare(b));
  }, [place.tradition, place.faith]);

  const customSchools = place.schools.filter((slug) => !KNOWN_SCHOOL_SLUGS.includes(slug));

  const inferredSchools = useMemo(
    () => inferSchools({ name: place.name, tradition: place.tradition }),
    [place.name, place.tradition],
  );

  function set<K extends keyof PlaceInput>(key: K, value: PlaceInput[K]) {
    setPlace((p) => ({ ...p, [key]: value }));
  }

  function toggleSchool(slug: string) {
    const next = new Set(place.schools);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    set("schools", [...next].sort());
  }

  function setCustomSchools(raw: string) {
    const customs = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const checked = place.schools.filter((slug) => KNOWN_SCHOOL_SLUGS.includes(slug));
    set("schools", [...new Set([...checked, ...customs])].sort());
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (mode === "create") {
        await createPlaceAction(place);
      } else {
        await updatePlaceAction(originalId, place);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!originalId || !confirm(`Delete ${place.name}?`)) return;
    setSaving(true);
    try {
      await deletePlaceAction(originalId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/places" className="text-xs text-ink-muted hover:text-ink">
            ← Locations
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
            {mode === "create" ? "Add location" : `Edit: ${place.name}`}
          </h1>
        </div>
        {mode === "edit" && originalId && (
          <Link
            href={`/place/${originalId}`}
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            View public profile →
          </Link>
        )}
      </div>

      <FormSection title="Identity">
        <FormField id="id" label="ID">
          <input
            id="id"
            value={place.id}
            onChange={(e) => set("id", e.target.value)}
            className={fieldClassName}
            disabled={mode === "edit"}
          />
        </FormField>
        <FormField id="name" label="Name">
          <input
            id="name"
            value={place.name}
            onChange={(e) => set("name", e.target.value)}
            className={fieldClassName}
          />
        </FormField>
        <FormField id="folder" label="Folder / source">
          <input
            id="folder"
            value={place.folder}
            onChange={(e) => set("folder", e.target.value)}
            className={fieldClassName}
            placeholder="BuddhaNet (United States of America)"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Classification"
        description="How this location appears in filters and on the public profile."
      >
        <FormField id="type" label="Type">
          <select
            id="type"
            value={place.type}
            onChange={(e) => set("type", e.target.value as PlaceInput["type"])}
            className={fieldClassName}
          >
            {placeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="faith" label="Faith">
          <select
            id="faith"
            value={place.faith}
            onChange={(e) => set("faith", e.target.value as PlaceInput["faith"])}
            className={fieldClassName}
          >
            {faiths.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="tradition" label="Tradition">
          <input
            id="tradition"
            list="place-tradition-options"
            value={place.tradition}
            onChange={(e) => set("tradition", e.target.value)}
            className={fieldClassName}
            placeholder="Theravada, Zen, Tibetan, …"
          />
          <datalist id="place-tradition-options">
            {traditionOptions.map((tradition) => (
              <option key={tradition} value={tradition} />
            ))}
          </datalist>
        </FormField>
      </FormSection>

      <FormSection
        title="Location"
        description="Coordinates power the map; address is shown on the profile."
      >
        <FormField id="address" label="Address">
          <textarea
            id="address"
            rows={2}
            value={place.address}
            onChange={(e) => set("address", e.target.value)}
            className={`${fieldClassName} resize-y`}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField id="lat" label="Latitude">
            <input
              id="lat"
              type="number"
              step="any"
              value={place.lat}
              onChange={(e) => set("lat", Number(e.target.value))}
              className={fieldClassName}
            />
          </FormField>
          <FormField id="lng" label="Longitude">
            <input
              id="lng"
              type="number"
              step="any"
              value={place.lng}
              onChange={(e) => set("lng", Number(e.target.value))}
              className={fieldClassName}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact">
        <FormField id="phone" label="Phone">
          <input
            id="phone"
            type="tel"
            value={place.phone ?? ""}
            onChange={(e) => set("phone", e.target.value || null)}
            className={fieldClassName}
          />
        </FormField>
        <FormField id="website" label="Website">
          <input
            id="website"
            type="url"
            value={place.website ?? ""}
            onChange={(e) => set("website", e.target.value || null)}
            className={fieldClassName}
            placeholder="https://"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Schools"
        description="Optional subschool tags. When empty, schools may still be inferred from the name on the public site."
      >
        {inferredSchools.length > 0 && (
          <p className="text-xs text-ink-muted">
            Inferred from name:{" "}
            {inferredSchools.map((slug) => subschoolLabel(slug)).join(", ")}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {KNOWN_SCHOOL_SLUGS.map((slug) => (
            <label
              key={slug}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                checked={place.schools.includes(slug)}
                onChange={() => toggleSchool(slug)}
                className="rounded border-border text-brand focus:ring-brand/30"
              />
              <span>{subschoolLabel(slug)}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-muted">{slug}</span>
            </label>
          ))}
        </div>
        <FormField id="custom-schools" label="Additional school slugs">
          <input
            id="custom-schools"
            value={customSchools.join(", ")}
            onChange={(e) => setCustomSchools(e.target.value)}
            className={fieldClassName}
            placeholder="custom-slug, another-slug"
          />
        </FormField>
      </FormSection>

      <FormSection title="Visibility">
        <DraftStatusField
          checked={place.isDraft}
          onChange={(isDraft) => set("isDraft", isDraft)}
        />
      </FormSection>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
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
