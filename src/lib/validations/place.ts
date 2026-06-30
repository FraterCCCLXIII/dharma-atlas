import { z } from "zod";

const placeTypes = [
  "Center",
  "Temple",
  "Monastery",
  "Meditation Center",
  "Institute",
  "Ashram",
] as const;

const faiths = ["Buddhist", "Hindu"] as const;

const coordPrecisions = ["pin", "address", "city", "region", "unknown"] as const;

const photoSources = [
  "website",
  "google_places",
  "wikimedia",
  "osm",
  "generated",
  "admin",
] as const;

export const placeInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  tradition: z.string().min(1),
  faith: z.enum(faiths),
  type: z.enum(placeTypes),
  folder: z.string(),
  address: z.string(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionSource: z.string().optional().nullable(),
  coordPrecision: z.enum(coordPrecisions).default("unknown"),
  dataSource: z.string().optional().nullable(),
  verifiedFields: z.array(z.string()).default([]),
  qualityFlags: z.array(z.string()).default([]),
  photo: z.string().optional().nullable(),
  photoSource: z.enum(photoSources).optional().nullable(),
  googlePlaceId: z.string().optional().nullable(),
  googleMapsUri: z.string().optional().nullable(),
  openingHours: z
    .object({
      weekdayDescriptions: z.array(z.string()).optional(),
      openNow: z.boolean().optional(),
      source: z.literal("google_places").optional(),
    })
    .optional()
    .nullable(),
  googleRating: z.coerce.number().optional().nullable(),
  googleRatingCount: z.coerce.number().int().optional().nullable(),
  businessStatus: z.string().optional().nullable(),
  googlePrimaryType: z.string().optional().nullable(),
  schools: z.array(z.string()),
  isDraft: z.boolean().default(false),
});

export type PlaceInput = z.infer<typeof placeInputSchema>;

export { placeTypes, faiths, coordPrecisions, photoSources };
