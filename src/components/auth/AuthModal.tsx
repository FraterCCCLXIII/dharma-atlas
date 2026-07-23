"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Modal } from "@/components/ui/Modal";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo: string;
  title?: string;
  description?: string;
  initialMode?: AuthMode;
  onSuccess?: () => void | Promise<void>;
}

export function AuthModal({
  open,
  onClose,
  redirectTo,
  title,
  description,
  initialMode = "signup",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const isSignup = mode === "signup";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (isSignup ? "Create an account" : "Sign in")}
      description={
        description ??
        (isSignup
          ? "Save places, manage listings, and pick up where you left off."
          : "Welcome back — continue with your Dharma Atlas account.")
      }
      size="md"
    >
      <AuthForm
        key={mode}
        mode={mode}
        redirectTo={redirectTo}
        alternateHref="#"
        alternateLabel={
          isSignup ? "Already have an account? Sign in" : "Need an account? Create one"
        }
        onAlternateClick={() => setMode(isSignup ? "signin" : "signup")}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
