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
  schools: z.array(z.string()),
});

export type PlaceInput = z.infer<typeof placeInputSchema>;

export { placeTypes, faiths };
