import "server-only";

import nodemailer from "nodemailer";
import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { user } from "@/db/schema";

function emailConfigured() {
  return Boolean(
    process.env.BREVO_SMTP_USER &&
      process.env.BREVO_SMTP_KEY &&
      process.env.EMAIL_FROM,
  );
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  if (!emailConfigured()) {
    console.warn("[email] Skipped — Brevo SMTP not configured:", options.subject);
    return { sent: false as const };
  }

  const from = process.env.EMAIL_FROM!;
  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });

  return { sent: true as const };
}

export async function getAdminNotifyEmails(): Promise<string[]> {
  if (process.env.ADMIN_NOTIFY_EMAIL?.trim()) {
    return [process.env.ADMIN_NOTIFY_EMAIL.trim()];
  }

  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(inArray(user.role, ["owner", "editor"]));

  return rows.map((row) => row.email).filter(Boolean);
}

export async function notifyAdmins(subject: string, text: string) {
  const recipients = await getAdminNotifyEmails();
  if (recipients.length === 0) return { sent: false as const };
  return sendEmail({ to: recipients, subject, text });
}

export async function notifyClaimReviewed(options: {
  to: string;
  placeName: string;
  approved: boolean;
}) {
  const status = options.approved ? "approved" : "rejected";
  return sendEmail({
    to: options.to,
    subject: `Your Dharma Atlas claim was ${status}`,
    text: `Your claim for "${options.placeName}" was ${status}. Sign in at ${process.env.BETTER_AUTH_URL ?? "https://dharmaatlas.com"}/manage to view your listings.`,
  });
}

export async function notifySubmissionReviewed(options: {
  to: string;
  name: string;
  approved: boolean;
}) {
  const status = options.approved ? "approved" : "rejected";
  return sendEmail({
    to: options.to,
    subject: `Your Dharma Atlas submission was ${status}`,
    text: `Your submission "${options.name}" was ${status}. Thank you for contributing to Dharma Atlas.`,
  });
}

export async function notifyNewSubmission(options: {
  entryType: string;
  name: string;
  submitterEmail: string;
}) {
  return notifyAdmins(
    `New ${options.entryType} submission: ${options.name}`,
    `${options.submitterEmail} submitted "${options.name}" (${options.entryType}). Review in the admin panel.`,
  );
}

export async function notifyNewClaim(options: {
  placeName: string;
  userEmail: string;
}) {
  return notifyAdmins(
    `New location claim: ${options.placeName}`,
    `${options.userEmail} claimed "${options.placeName}". Review in the admin panel.`,
  );
}

export async function notifyNewReport(options: {
  entityName: string;
  reason: string;
  submitterEmail: string;
}) {
  return notifyAdmins(
    `New report: ${options.entityName}`,
    `${options.submitterEmail} reported "${options.entityName}" (${options.reason}). Review in the admin panel.`,
  );
}
