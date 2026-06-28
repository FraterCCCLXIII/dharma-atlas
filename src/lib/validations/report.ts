import { z } from "zod";
import {
  locationReportReasons,
  teacherReportReasons,
} from "@/lib/report-reasons";

const reportBase = {
  entityId: z.string().min(1).max(200),
  entityName: z.string().min(1).max(300),
  entityPath: z.string().min(1).max(500),
  submitterEmail: z.string().email(),
  details: z.string().max(5000).optional(),
};

export const locationReportSchema = z
  .object({
    entityType: z.literal("location"),
    reason: z.enum(locationReportReasons),
    ...reportBase,
  })
  .superRefine((data, ctx) => {
    if (data.reason === "other" && !data.details?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please describe the issue",
        path: ["details"],
      });
    }
  });

export const teacherReportSchema = z
  .object({
    entityType: z.literal("teacher"),
    reason: z.enum(teacherReportReasons),
    ...reportBase,
  })
  .superRefine((data, ctx) => {
    if (data.reason === "other" && !data.details?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please describe the issue",
        path: ["details"],
      });
    }
  });

export const publicReportSchema = z.discriminatedUnion("entityType", [
  locationReportSchema,
  teacherReportSchema,
]);

export type PublicReportInput = z.infer<typeof publicReportSchema>;
