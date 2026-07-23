import { z } from "zod";
import { PLACE_SOCIAL_PLATFORMS } from "@/lib/place-socials";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    return trimmed;
  })
  .refine((value) => value == null || /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

const requiredUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value?.trim() || null);

export const placeTeacherInputSchema = z.object({
  id: z.number().int().positive().optional(),
  displayName: z.string().trim().min(1, "Name is required").max(120),
  title: optionalText(160),
  bio: optionalText(4000),
  imagePath: optionalText(500),
  teacherSlug: optionalText(120),
  sortOrder: z.number().int().min(0).default(0),
});

export const placeTeachersReplaceSchema = z.object({
  teachers: z.array(placeTeacherInputSchema).max(24),
});

const weekdaySchema = z.number().int().min(0).max(6);
const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24-hour)");

export const placeScheduleRuleSchema = z.discriminatedUnion("freq", [
  z.object({
    freq: z.literal("weekly"),
    daysOfWeek: z.array(weekdaySchema).min(1).max(7),
  }),
  z.object({
    freq: z.literal("monthlyNth"),
    week: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(-1),
    ]),
    weekday: weekdaySchema,
  }),
]);

const sharedEventFields = {
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(2000),
  timezone: z.string().trim().min(1).max(80).default("America/Los_Angeles"),
  url: optionalUrl,
  isCancelled: z.boolean().default(false),
};

export const placeEventInputSchema = z.discriminatedUnion("kind", [
  z.object({
    ...sharedEventFields,
    kind: z.literal("event"),
    startsAt: z.string().min(1, "Start date is required"),
    endsAt: optionalText(40),
  }),
  z.object({
    ...sharedEventFields,
    kind: z.literal("schedule"),
    startTime: timeSchema,
    endTime: timeSchema.optional().nullable().transform((value) => value || null),
    rule: placeScheduleRuleSchema,
  }),
]);

export const placeEventsReplaceSchema = z.object({
  events: z.array(placeEventInputSchema).max(100),
});

export const placeSocialInputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    platform: z.enum(PLACE_SOCIAL_PLATFORMS),
    url: requiredUrl,
    label: optionalText(80),
    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((value, ctx) => {
    if (value.platform === "other" && !value.label?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a label for Other links",
        path: ["label"],
      });
    }
  });

export const placeSocialsReplaceSchema = z.object({
  socials: z.array(placeSocialInputSchema).max(20),
});

export type PlaceTeacherInput = z.infer<typeof placeTeacherInputSchema>;
export type PlaceEventInput = z.infer<typeof placeEventInputSchema>;
export type PlaceScheduleRuleInput = z.infer<typeof placeScheduleRuleSchema>;
export type PlaceSocialInput = z.infer<typeof placeSocialInputSchema>;
