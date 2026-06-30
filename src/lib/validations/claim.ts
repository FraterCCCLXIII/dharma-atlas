import { z } from "zod";

export const createClaimSchema = z.object({
  placeId: z.string().min(1).optional(),
  placeName: z.string().min(1),
  listingUrl: z.string().url().optional().or(z.literal("")),
  affiliationRole: z.string().min(1),
  message: z.string().min(10),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
