"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import {
  getKnownSchoolSlugs,
  SchoolTagsField,
} from "@/components/forms/SchoolTagsField";
import { TraditionPickerField } from "@/components/forms/TraditionPickerField";
import { DraftStatusField } from "@/components/admin/DraftStatusField";
import { PlacePhotosField } from "@/components/admin/PlacePhotosField";
import { MarkdownRichTextEditor } from "@/components/forms/MarkdownRichTextEditor";
import { PlaceEventsField } from "@/components/manage/PlaceEventsField";
import { PlaceGuidingTeachersField } from "@/components/manage/PlaceGuidingTeachersField";
import { PlaceSocialsField } from "@/components/manage/PlaceSocialsField";
import { PlaceOfferingIcon } from "@/components/place/PlaceOfferingIcon";
import {
  PLACE_OFFERINGS,
  filterKnownOfferings,
  type PlaceOfferingId,
} from "@/lib/place-offerings";
import { placeProfilePath } from "@/lib/explore-routes";
import {
  LOCATION_MODE_HINTS,
  LOCATION_MODE_LABELS,
  coordPrecisionForMode,
} from "@/lib/place-location";
import {
  faiths,
  locationModes,
  placeTypes,
  type PlaceInput,
} from "@/lib/validations/place";
import type { PlaceEvent, PlacePhoto, PlaceSocial, PlaceTeacher } from "@/types/place";
import {
  createPlaceAction,
  deletePlaceAction,
  permanentlyDeletePlaceAction,
  restorePlaceAction,
  updatePlaceAction,
  verifyPlaceFieldAction,
} from "@/app/admin/actions/places";

const emptyPlace = (): PlaceInput => ({
  id: "",
  slug: "",
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
  description: null,
  descriptionSource: null,
  notice: null,
  locationMode: "venue",
  coordPrecision: "unknown",
  dataSource: null,
  verifiedFields: [],
  qualityFlags: [],
  photo: null,
  photoSource: null,
  schools: [],
  offerings: [],
  isDraft: false,
});


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
        <h2 className="font-display text-xl font-semibold text-ink">
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
  initialPhotos?: PlacePhoto[];
  initialTeachers?: PlaceTeacher[];
  initialEvents?: PlaceEvent[];
  initialSocials?: PlaceSocial[];
  mode: "create" | "edit";
  isDeleted?: boolean;
}

export function PlaceForm({
  initial,
  initialPhotos = [],
  initialTeachers = [],
  initialEvents = [],
  initialSocials = [],
  mode,
  isDeleted = false,
}: PlaceFormProps) {
  const [place, setPlace] = useState<PlaceInput>(initial ?? emptyPlace());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const originalId = initial?.id ?? "";
  const knownSchoolSlugs = getKnownSchoolSlugs();

  const customSchools = place.schools.filter((slug) => !knownSchoolSlugs.includes(slug));

  function set<K extends keyof PlaceInput>(key: K, value: PlaceInput[K]) {
    setPlace((p) => ({ ...p, [key]: value }));
  }

  function setKnownSchools(known: string[]) {
    set("schools", [...new Set([...known, ...customSchools])].sort());
  }

  function setCustomSchools(raw: string) {
    const customs = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const checked = place.schools.filter((slug) => knownSchoolSlugs.includes(slug));
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
    if (
      !originalId ||
      !confirm(
        `Move “${place.name}” to deleted? It will be hidden from the directory and can be restored later.`,
      )
    ) {
      return;
    }
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
          <h1 className="mt-2 font-display text-3xl font-semibold">
            {mode === "create" ? "Add location" : `Edit: ${place.name}`}
          </h1>
        </div>
        {mode === "edit" && originalId && !isDeleted && (
          <Link
            href={placeProfilePath({ id: originalId, slug: place.slug })}
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            View public profile →
          </Link>
        )}
      </div>

      {isDeleted && originalId && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-sm font-medium text-rose-900">
            This listing is deleted. It is hidden from the public directory and owner dashboard.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={restorePlaceAction}>
              <input type="hidden" name="id" value={originalId} />
              <button
                type="submit"
                className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
              >
                Restore
              </button>
            </form>
            <form
              action={permanentlyDeletePlaceAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Permanently delete “${place.name}”? This cannot be undone.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={originalId} />
              <button
                type="submit"
                className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
              >
                Permanently delete
              </button>
            </form>
          </div>
        </div>
      )}

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
        <FormField id="slug" label="Public URL slug">
          <input
            id="slug"
            value={place.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
            className={fieldClassName}
            placeholder="Auto from name if left blank on create"
            autoComplete="off"
            spellCheck={false}
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
        <FormField id="tradition" label="Tradition / lineage">
          <TraditionPickerField
            id="tradition"
            value={place.tradition}
            onChange={(tradition) => set("tradition", tradition)}
            faith={place.faith}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Location"
        description="Choose how precisely visitors see where this group meets."
      >
        <FormField id="locationMode" label="Location mode">
          <select
            id="locationMode"
            value={place.locationMode}
            onChange={(e) => {
              const locationMode = e.target.value as PlaceInput["locationMode"];
              setPlace((current) => ({
                ...current,
                locationMode,
                coordPrecision: coordPrecisionForMode(locationMode),
                ...(locationMode === "online" ? { lat: 0, lng: 0 } : {}),
              }));
            }}
            className={fieldClassName}
          >
            {locationModes.map((mode) => (
              <option key={mode} value={mode}>
                {LOCATION_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-muted">
            {LOCATION_MODE_HINTS[place.locationMode]}
          </p>
        </FormField>
        <FormField
          id="address"
          label={
            place.locationMode === "online"
              ? "Service area (optional)"
              : place.locationMode === "area"
                ? "City / region"
                : "Address"
          }
        >
          <textarea
            id="address"
            rows={2}
            value={place.address}
            onChange={(e) => set("address", e.target.value)}
            className={`${fieldClassName} resize-y`}
            placeholder={
              place.locationMode === "venue"
                ? "Street address"
                : place.locationMode === "area"
                  ? "Berkeley, CA"
                  : "Optional region this online group serves"
            }
          />
        </FormField>
        {place.locationMode !== "online" ? (
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
        ) : (
          <p className="text-xs text-ink-muted">
            Online listings do not appear as map pins.
          </p>
        )}
      </FormSection>

      <FormSection title="Profile" description="Description and image shown on the public profile.">
        <FormField id="notice" label="Visitor notice">
          <textarea
            id="notice"
            value={place.notice ?? ""}
            onChange={(e) => set("notice", e.target.value || null)}
            rows={3}
            maxLength={500}
            placeholder="Optional short notice shown above About (closures, schedule changes)…"
            className={fieldClassName}
          />
        </FormField>
        <FormField id="description" label="About this place">
          <MarkdownRichTextEditor
            id="description"
            value={place.description ?? ""}
            onChange={(next) => set("description", next || null)}
            rows={8}
            placeholder="A short description of this center…"
          />
        </FormField>
        {mode === "edit" && originalId ? (
          <PlacePhotosField placeId={originalId} initialPhotos={initialPhotos} />
        ) : (
          <p className="text-sm text-ink-muted">Save the location first, then you can add up to 5 photos.</p>
        )}
        {mode === "edit" && originalId && place.qualityFlags && place.qualityFlags.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">Quality flags</p>
            <p className="mt-1 text-xs">{place.qualityFlags.join(", ")}</p>
            {place.description && !place.verifiedFields?.includes("description") && (
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-brand hover:underline"
                onClick={async () => {
                  await verifyPlaceFieldAction(originalId, "description");
                  set("verifiedFields", [...(place.verifiedFields ?? []), "description"]);
                  set(
                    "qualityFlags",
                    (place.qualityFlags ?? []).filter((f) => f !== "unverified_description"),
                  );
                }}
              >
                Approve description
              </button>
            )}
          </div>
        )}
      </FormSection>

      <FormSection
        title="Offerings"
        description="Practice and visitor amenities shown as “What this place offers”."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {PLACE_OFFERINGS.map((offering) => {
            const checked = (place.offerings ?? []).includes(offering.id);
            return (
              <li key={offering.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                    checked
                      ? "border-brand/40 bg-brand/5 text-ink"
                      : "border-border bg-surface-elevated text-ink-secondary hover:bg-surface-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const current = filterKnownOfferings(place.offerings ?? []);
                      const next = checked
                        ? current.filter((id) => id !== offering.id)
                        : [...current, offering.id as PlaceOfferingId];
                      set("offerings", next);
                    }}
                    className="sr-only"
                  />
                  <PlaceOfferingIcon name={offering.icon} />
                  <span className="font-medium">{offering.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </FormSection>

      {mode === "edit" && originalId ? (
        <>
          <FormSection
            title="Guiding teachers"
            description="People who teach or guide practice at this location."
          >
            <PlaceGuidingTeachersField
              placeId={originalId}
              initialTeachers={initialTeachers}
              showHeading={false}
            />
          </FormSection>
          <FormSection
            title="Recurring events & special events"
            description="Recurring practice times and one-time special events."
          >
            <PlaceEventsField
              placeId={originalId}
              initialEvents={initialEvents}
              showHeading={false}
            />
          </FormSection>
        </>
      ) : null}

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
        {mode === "edit" && originalId ? (
          <PlaceSocialsField
            placeId={originalId}
            initialSocials={initialSocials}
            showHeading
          />
        ) : (
          <p className="text-sm text-ink-muted">
            Save the place first to add social links.
          </p>
        )}
      </FormSection>

      <FormSection title="Schools">
        <SchoolTagsField
          name={place.name}
          tradition={place.tradition}
          value={place.schools.filter((slug) => knownSchoolSlugs.includes(slug))}
          onChange={setKnownSchools}
          showSlugs
        />
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
        {mode === "edit" && !isDeleted && (
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
