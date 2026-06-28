#!/usr/bin/env tsx
/**
 * Bootstrap the first admin account with the owner role.
 *
 * Usage:
 *   npm run auth:create-owner -- you@example.com password123 "Your Name"
 */

import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { user } from "../src/db/schema";
import { auth } from "../src/lib/auth";

const email = (process.argv[2] ?? process.env.OWNER_EMAIL ?? "").trim();
const password = process.argv[3] ?? process.env.OWNER_PASSWORD ?? "";
const name = (process.argv[4] ?? process.env.OWNER_NAME ?? "Owner").trim();

if (!email || !password) {
  console.error(
    "Email and password required.\nUsage: npm run auth:create-owner -- <email> <password> [name]",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function promoteToOwner() {
  await db.update(user).set({ role: "owner" }).where(eq(user.email, email));
}

async function main() {
  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (existing.length > 0) {
    await promoteToOwner();
    console.log(`${email} already existed — role set to owner.`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  await promoteToOwner();
  console.log(`Created owner account: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Failed to create owner:", e instanceof Error ? e.message : e);
    process.exit(1);
  });
