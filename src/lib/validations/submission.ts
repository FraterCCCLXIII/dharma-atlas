import { z } from "zod";
import { placeTypes } from "@/lib/validations/place";

const submitterFields = {
  submitterName: z.string().min(1).max(200),
  submitterEmail: z.string().email(),
  name: z.string().min(1).max(300),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(5000).optional(),
};

export const locationSubmissionSchema = z.object({
  entryType: z.literal("location"),
  ...submitterFields,
  location: z.string().min(1, "City or region is required").max(300),
  placeType: z.enum(placeTypes).optional(),
  tradition: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
});

export const teacherSubmissionSchema = z.object({
  entryType: z.literal("teacher"),
  ...submitterFields,
  location: z.string().max(300).optional(),
  tradition: z.string().max(200).optional(),
  lineage: z.string().max(500).optional(),
});

export const publicSubmissionSchema = z.discriminatedUnion("entryType", [
  locationSubmissionSchema,
  teacherSubmissionSchema,
]);

export type PublicSubmissionInput = z.infer<typeof publicSubmissionSchema>;

export function composeSubmissionNotes(data: PublicSubmissionInput): string | undefined {
  const parts: string[] = [];

  if (data.entryType === "location") {
    if (data.placeType) parts.push(`Type: ${data.placeType}`);
    if (data.tradition?.trim()) parts.push(`Tradition: ${data.tradition.trim()}`);
    if (data.address?.trim()) parts.push(`Address: ${data.address.trim()}`);
  } else {
    if (data.tradition?.trim()) parts.push(`Tradition: ${data.tradition.trim()}`);
    if (data.lineage?.trim()) parts.push(`Lineage: ${data.lineage.trim()}`);
  }

  if (data.notes?.trim()) parts.push(data.notes.trim());

  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

const NOTE_FIELD_PATTERN = /^(Type|Tradition|Address|Lineage):\s*(.+)$/;

/** Parse structured fields from legacy notes or supplement jsonb payload. */
export function parseSubmissionPayload(
  row: {
    entryType: string;
    payload?: unknown;
    notes?: string | null;
    location?: string | null;
  },
): Partial<PublicSubmissionInput> {
  if (row.payload && typeof row.payload === "object") {
    const parsed = publicSubmissionSchema.safeParse(row.payload);
    if (parsed.success) return parsed.data;
  }

  const fields: Record<string, string> = {};
  for (const block of (row.notes ?? "").split("\n\n")) {
    const line = block.trim();
    const match = line.match(NOTE_FIELD_PATTERN);
    if (match) fields[match[1]] = match[2].trim();
  }

  if (row.entryType === "location") {
    const placeType = fields.Type;
    return {
      entryType: "location",
      location: row.location ?? "",
      ...(placeType && placeTypes.includes(placeType as (typeof placeTypes)[number])
        ? { placeType: placeType as (typeof placeTypes)[number] }
        : {}),
      ...(fields.Tradition ? { tradition: fields.Tradition } : {}),
      ...(fields.Address ? { address: fields.Address } : {}),
    };
  }

  if (row.entryType === "teacher") {
    return {
      entryType: "teacher",
      ...(row.location ? { location: row.location } : {}),
      ...(fields.Tradition ? { tradition: fields.Tradition } : {}),
      ...(fields.Lineage ? { lineage: fields.Lineage } : {}),
    };
  }

  return {};
}

export function submissionLocationAddress(
  data: Partial<PublicSubmissionInput> & { location?: string | null },
): string {
  if (data.entryType === "location") {
    const address =
      "address" in data && typeof data.address === "string" ? data.address : undefined;
    const city =
      "location" in data && typeof data.location === "string" ? data.location : undefined;
    return [address, city].filter(Boolean).join(", ");
  }
  return data.location?.trim() ?? "";
}
