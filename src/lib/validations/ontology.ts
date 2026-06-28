import { z } from "zod";

export const ontologyNodeTypes = [
  "buddhist_root",
  "lineage",
  "subschool",
  "tradition",
] as const;

export const ontologyNodeSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase slug format"),
  label: z.string().min(1),
  parentSlug: z.string().nullable(),
  sortOrder: z.coerce.number().int().min(0),
  nodeType: z.enum(ontologyNodeTypes),
  filterId: z.string().min(1),
  placeTraditions: z.array(z.string()),
  inferPattern: z.string().nullable(),
  appliesToLocations: z.boolean(),
  appliesToPeople: z.boolean(),
});

export const ontologyInputSchema = z.object({
  nodes: z.array(ontologyNodeSchema).min(1),
});

export type OntologyNodeInput = z.infer<typeof ontologyNodeSchema>;
