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
