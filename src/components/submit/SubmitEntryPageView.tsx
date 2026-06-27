"use client";

import { useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { FormPageShell } from "@/components/layout/FormPageShell";

export function SubmitEntryPageView() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <FormPageShell
      title="Submit an entry"
      description="Suggest a meditation center, monastery, or teacher for the directory."
    >
      {submitted ? (
        <p className="text-base leading-relaxed text-ink-secondary">
          Thank you. We&apos;ve received your suggestion and will review it before
          publishing.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField id="submit-type" label="Entry type">
            <select id="submit-type" required className={fieldClassName} defaultValue="">
              <option value="" disabled>
                Select type
              </option>
              <option value="location">Location</option>
              <option value="teacher">Teacher</option>
            </select>
          </FormField>

          <FormField id="submit-name" label="Name">
            <input
              id="submit-name"
              type="text"
              required
              className={fieldClassName}
              placeholder="Center or teacher name"
            />
          </FormField>

          <FormField id="submit-location" label="City / region">
            <input
              id="submit-location"
              type="text"
              className={fieldClassName}
              placeholder="Where they are based"
            />
          </FormField>

          <FormField id="submit-website" label="Website">
            <input
              id="submit-website"
              type="url"
              className={fieldClassName}
              placeholder="https://"
            />
          </FormField>

          <FormField id="submit-notes" label="Notes">
            <textarea
              id="submit-notes"
              rows={3}
              className={`${fieldClassName} resize-y`}
              placeholder="Tradition, lineage, or anything else helpful"
            />
          </FormField>

          <FormField id="submit-email" label="Your email">
            <input
              id="submit-email"
              type="email"
              required
              className={fieldClassName}
              placeholder="you@example.com"
            />
          </FormField>

          <button type="submit" className={submitButtonClassName}>
            Submit suggestion
          </button>
        </form>
      )}
    </FormPageShell>
  );
}
