import { z } from "zod";
import { filterKnownOfferings } from "@/lib/place-offerings";
import { getSubschoolLabelMap } from "@/lib/schools";
import { faiths, locationModes, placeTypes } from "@/lib/validations/place";

function knownSchoolSlugs(): Set<string> {
  return new Set(Object.keys(getSubschoolLabelMap()));
}

/** Keep only ontology-known school slugs for member edits. */
export function filterKnownSchools(schools: string[]): string[] {
  const known = knownSchoolSlugs();
  return [...new Set(schools.filter((slug) => known.has(slug)))].sort();
}

export { filterKnownOfferings };

export const ownerPlaceEditSchema = z
  .object({
    name: z.string().min(1),
    /** Public URL slug (`/place/[slug]`). Normalized on save. */
    slug: z.string().min(1, "Slug is required"),
    type: z.enum(placeTypes),
    faith: z.enum(faiths),
    tradition: z.string().min(1),
    locationMode: z.enum(locationModes).default("venue"),
    address: z.string(),
    phone: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    notice: z
      .string()
      .trim()
      .max(500, "Notice must be 500 characters or fewer")
      .optional()
      .nullable()
      .transform((value) => value?.trim() || null),
    hoursText: z.string().optional().nullable(),
    schools: z.array(z.string()).default([]),
    offerings: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.locationMode === "venue" && !data.address.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Street address is required for a fixed venue",
      });
    }
    if (data.locationMode === "area" && !data.address.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "City or region is required for area-only listings",
      });
    }
  });

export type OwnerPlaceEditInput = z.infer<typeof ownerPlaceEditSchema>;

export const memberCreatePlaceSchema = z
  .object({
    name: z.string().min(1),
    type: z.enum(placeTypes),
    faith: z.enum(faiths).default("Buddhist"),
    tradition: z.string().min(1).default("Buddhist"),
    locationMode: z.enum(locationModes).default("venue"),
    address: z.string().default(""),
    city: z.string().default(""),
    phone: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    hoursText: z.string().optional().nullable(),
    schools: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.locationMode === "venue") {
      if (!data.address.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Street address is required",
        });
      }
      if (!data.city.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["city"],
          message: "City / region is required",
        });
      }
    }
    if (data.locationMode === "area" && !data.city.trim() && !data.address.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "City or region is required for area-only listings",
      });
    }
  });

export type MemberCreatePlaceInput = z.infer<typeof memberCreatePlaceSchema>;
