"use client";

import { useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { TraditionPickerField } from "@/components/forms/TraditionPickerField";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { placeTypes } from "@/lib/validations/place";

type EntryType = "" | "location" | "teacher";

export function SubmitEntryPageView() {
  const [entryType, setEntryType] = useState<EntryType>("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locationTradition, setLocationTradition] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entryType) {
      setError("Select an entry type.");
      return;
    }

    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload =
      entryType === "location"
        ? {
            entryType: "location" as const,
            name: String(formData.get("name")),
            location: String(formData.get("location")),
            placeType: String(formData.get("placeType") || "") || undefined,
            tradition: String(formData.get("tradition") || ""),
            address: String(formData.get("address") || ""),
            website: String(formData.get("website") || ""),
            notes: String(formData.get("notes") || ""),
            submitterEmail: String(formData.get("submitterEmail")),
            submitterName: String(formData.get("submitterName") || formData.get("submitterEmail")),
          }
        : {
            entryType: "teacher" as const,
            name: String(formData.get("name")),
            location: String(formData.get("location") || ""),
            tradition: String(formData.get("tradition") || ""),
            lineage: String(formData.get("lineage") || ""),
            website: String(formData.get("website") || ""),
            notes: String(formData.get("notes") || ""),
            submitterEmail: String(formData.get("submitterEmail")),
            submitterName: String(formData.get("submitterName") || formData.get("submitterEmail")),
          };

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormPageShell
      title="Submit an entry"
      description={
        entryType === "location"
          ? "Suggest a meditation center, monastery, temple, or other place for the directory."
          : entryType === "teacher"
            ? "Suggest a person, guide, or lineage holder for the directory."
            : "Suggest a meditation center, monastery, or person for the directory."
      }
    >
      {submitted ? (
        <p className="text-base leading-relaxed text-ink-secondary">
          Thank you. We&apos;ve received your suggestion and will review it before
          publishing.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField id="submit-type" label="Entry type">
            <select
              id="submit-type"
              name="entryType"
              required
              value={entryType}
              onChange={(e) => {
                setEntryType(e.target.value as EntryType);
                setError("");
                setLocationTradition("");
              }}
              className={fieldClassName}
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="location">Location</option>
              <option value="teacher">Person</option>
            </select>
          </FormField>

          {entryType === "location" && (
            <>
              <FormField id="submit-name" label="Place name">
                <input
                  id="submit-name"
                  name="name"
                  type="text"
                  required
                  className={fieldClassName}
                  placeholder="e.g. San Francisco Zen Center"
                />
              </FormField>

              <FormField id="submit-place-type" label="Place type">
                <select
                  id="submit-place-type"
                  name="placeType"
                  className={fieldClassName}
                  defaultValue=""
                >
                  <option value="">Not sure / other</option>
                  {placeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField id="submit-location" label="City / region">
                <input
                  id="submit-location"
                  name="location"
                  type="text"
                  required
                  className={fieldClassName}
                  placeholder="e.g. San Francisco, CA"
                />
              </FormField>

              <FormField id="submit-address" label="Street address">
                <input
                  id="submit-address"
                  name="address"
                  type="text"
                  className={fieldClassName}
                  placeholder="Optional — helps us verify the listing"
                />
              </FormField>

              <FormField id="submit-tradition" label="Tradition / lineage">
                <TraditionPickerField
                  id="submit-tradition"
                  name="tradition"
                  value={locationTradition}
                  onChange={setLocationTradition}
                  placeholder="e.g. Zen, Tibetan, Theravada, Hindu"
                />
              </FormField>

              <FormField id="submit-website" label="Website">
                <input
                  id="submit-website"
                  name="website"
                  type="url"
                  className={fieldClassName}
                  placeholder="https://"
                />
              </FormField>

              <FormField id="submit-notes" label="Additional notes">
                <textarea
                  id="submit-notes"
                  name="notes"
                  rows={3}
                  className={`${fieldClassName} resize-y`}
                  placeholder="Programs, visiting teachers, anything else helpful"
                />
              </FormField>
            </>
          )}

          {entryType === "teacher" && (
            <>
              <FormField id="submit-name" label="Name">
                <input
                  id="submit-name"
                  name="name"
                  type="text"
                  required
                  className={fieldClassName}
                  placeholder="Full name or commonly used name"
                />
              </FormField>

              <FormField id="submit-location" label="Based in">
                <input
                  id="submit-location"
                  name="location"
                  type="text"
                  className={fieldClassName}
                  placeholder="City, region, or primary teaching location"
                />
              </FormField>

              <FormField id="submit-tradition" label="Tradition">
                <input
                  id="submit-tradition"
                  name="tradition"
                  type="text"
                  className={fieldClassName}
                  placeholder="e.g. Tibetan Buddhism, Advaita Vedanta"
                />
              </FormField>

              <FormField id="submit-lineage" label="Lineage / affiliation">
                <input
                  id="submit-lineage"
                  name="lineage"
                  type="text"
                  className={fieldClassName}
                  placeholder="School, teacher, or organization they're associated with"
                />
              </FormField>

              <FormField id="submit-website" label="Website">
                <input
                  id="submit-website"
                  name="website"
                  type="url"
                  className={fieldClassName}
                  placeholder="Personal site, center page, or profile link"
                />
              </FormField>

              <FormField id="submit-notes" label="Additional notes">
                <textarea
                  id="submit-notes"
                  name="notes"
                  rows={3}
                  className={`${fieldClassName} resize-y`}
                  placeholder="Teaching topics, languages, books, or why they'd be a good fit"
                />
              </FormField>
            </>
          )}

          {entryType && (
            <FormField id="submit-email" label="Your email">
              <input
                id="submit-email"
                name="submitterEmail"
                type="email"
                required
                className={fieldClassName}
                placeholder="you@example.com"
              />
            </FormField>
          )}

          {!entryType && (
            <p className="text-sm text-ink-muted">Choose a type above to see the relevant fields.</p>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !entryType}
            className={submitButtonClassName}
          >
            {submitting ? "Submitting…" : "Submit suggestion"}
          </button>
        </form>
      )}
    </FormPageShell>
  );
}
