import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { ac, roles } from "@/lib/permissions";
import { sendEmail } from "@/lib/email";

const requireEmailVerification =
  process.env.REQUIRE_EMAIL_VERIFICATION === "true";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Dharma Atlas email",
        text: `Verify your email to use claims and submissions:\n\n${url}`,
      });
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      adminRoles: ["owner"],
      defaultRole: "member",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
