import { z } from "zod";
import { getSubschoolLabelMap } from "@/lib/schools";
import { faiths, placeTypes } from "@/lib/validations/place";

function knownSchoolSlugs(): Set<string> {
  return new Set(Object.keys(getSubschoolLabelMap()));
}

/** Keep only ontology-known school slugs for member edits. */
export function filterKnownSchools(schools: string[]): string[] {
  const known = knownSchoolSlugs();
  return [...new Set(schools.filter((slug) => known.has(slug)))].sort();
}

export const ownerPlaceEditSchema = z.object({
  name: z.string().min(1),
  type: z.enum(placeTypes),
  faith: z.enum(faiths),
  tradition: z.string().min(1),
  address: z.string(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hoursText: z.string().optional().nullable(),
  schools: z.array(z.string()).default([]),
});

export type OwnerPlaceEditInput = z.infer<typeof ownerPlaceEditSchema>;

export const memberCreatePlaceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(placeTypes),
  faith: z.enum(faiths).default("Buddhist"),
  tradition: z.string().min(1).default("Buddhist"),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hoursText: z.string().optional().nullable(),
  schools: z.array(z.string()).default([]),
});

export type MemberCreatePlaceInput = z.infer<typeof memberCreatePlaceSchema>;
