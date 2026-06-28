"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";

export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: redirectTo,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setSubmitting(false);
      return;
    }

    window.location.assign(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="email" label="Email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClassName}
        />
      </FormField>

      <FormField id="password" label="Password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClassName}
        />
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={submitButtonClassName}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
