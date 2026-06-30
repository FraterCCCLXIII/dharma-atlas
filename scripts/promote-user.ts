#!/usr/bin/env tsx
/**
 * Promote an existing user to owner or editor.
 *
 * Usage:
 *   npm run auth:promote -- you@example.com owner
 *   npm run auth:promote -- you@example.com editor
 */

import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { user } from "../src/db/schema";

const email = (process.argv[2] ?? "").trim();
const roleArg = (process.argv[3] ?? "editor").trim().toLowerCase();

const ALLOWED_ROLES = ["owner", "editor"] as const;
type PromoteRole = (typeof ALLOWED_ROLES)[number];

function isPromoteRole(value: string): value is PromoteRole {
  return (ALLOWED_ROLES as readonly string[]).includes(value);
}

if (!email) {
  console.error(
    "Email required.\nUsage: npm run auth:promote -- <email> [owner|editor]",
  );
  process.exit(1);
}

if (!isPromoteRole(roleArg)) {
  console.error(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  process.exit(1);
}

async function main() {
  const existing = await db
    .select({ email: user.email, role: user.role })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  await db.update(user).set({ role: roleArg }).where(eq(user.email, email));
  console.log(`Promoted ${email} from ${existing[0].role} to ${roleArg}.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Failed to promote user:", e instanceof Error ? e.message : e);
    process.exit(1);
  });
