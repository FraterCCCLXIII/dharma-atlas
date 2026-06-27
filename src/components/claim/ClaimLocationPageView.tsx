"use client";

import { useState, type FormEvent } from "react";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import { FormPageShell } from "@/components/layout/FormPageShell";

export function ClaimLocationPageView() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <FormPageShell
      title="Claim a location"
      description="Are you affiliated with a listed center? Request to manage or update its profile."
    >
      {submitted ? (
        <p className="text-base leading-relaxed text-ink-secondary">
          Thank you. We&apos;ll verify your affiliation and follow up by email.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField id="claim-location" label="Location name">
            <input
              id="claim-location"
              type="text"
              required
              className={fieldClassName}
              placeholder="As it appears in the directory"
            />
          </FormField>

          <FormField id="claim-url" label="Listing URL">
            <input
              id="claim-url"
              type="url"
              className={fieldClassName}
              placeholder="Link to the listing, if you have it"
            />
          </FormField>

          <FormField id="claim-role" label="Your role">
            <input
              id="claim-role"
              type="text"
              required
              className={fieldClassName}
              placeholder="Director, resident, authorized teacher, etc."
            />
          </FormField>

          <FormField id="claim-message" label="Message">
            <textarea
              id="claim-message"
              rows={3}
              required
              className={`${fieldClassName} resize-y`}
              placeholder="Tell us about your connection to this place"
            />
          </FormField>

          <FormField id="claim-email" label="Your email">
            <input
              id="claim-email"
              type="email"
              required
              className={fieldClassName}
              placeholder="you@example.com"
            />
          </FormField>

          <button type="submit" className={submitButtonClassName}>
            Send claim request
          </button>
        </form>
      )}
    </FormPageShell>
  );
}
