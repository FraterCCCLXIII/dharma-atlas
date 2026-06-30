"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  redirectTo: string;
  alternateHref: string;
  alternateLabel: string;
}

export function AuthForm({ mode, redirectTo, alternateHref, alternateLabel }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (mode === "signup") {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email.split("@")[0] || "Member",
        callbackURL: redirectTo,
      });

      if (signUpError) {
        setError(signUpError.message || "Could not create account.");
        setSubmitting(false);
        return;
      }
    } else {
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
    }

    window.location.assign(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <FormField id="name" label="Name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClassName}
            placeholder="Your name"
          />
        </FormField>
      )}

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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={8}
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
        {submitting
          ? mode === "signup"
            ? "Creating account…"
            : "Signing in…"
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        <Link href={alternateHref} className="font-medium text-brand hover:underline">
          {alternateLabel}
        </Link>
      </p>
    </form>
  );
}
