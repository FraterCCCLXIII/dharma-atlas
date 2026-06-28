"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>(), adminClient({ ac, roles })],
});

export type SessionUser = (typeof authClient.$Infer.Session)["user"];
