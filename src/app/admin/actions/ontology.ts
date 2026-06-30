"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { replaceOntologyNodes } from "@/lib/data/ontology";
import { requirePermission } from "@/lib/auth-server";
import { syncOntologyNodeTypes } from "@/lib/ontology/sync-node-types";
import { PEOPLE_LIST_PATH } from "@/lib/explore-routes";
import { ontologyInputSchema } from "@/lib/validations/ontology";

export async function saveOntologyAction(input: unknown) {
  await requirePermission("ontology", "update");
  const data = ontologyInputSchema.parse(input);
  await replaceOntologyNodes(syncOntologyNodeTypes(data.nodes));

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/ontology");
  redirect("/admin/ontology");
}

export async function resetOntologyAction() {
  await requirePermission("ontology", "update");
  const { buildDefaultOntologyNodes } = await import("@/lib/ontology/defaults");
  await replaceOntologyNodes(buildDefaultOntologyNodes());

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/ontology");
  redirect("/admin/ontology");
}

export async function seedOntologyAction() {
  await requirePermission("ontology", "update");
  const { seedOntologyIfEmpty } = await import("@/lib/data/ontology");
  const count = await seedOntologyIfEmpty();
  if (count === 0) {
    throw new Error("Ontology is already seeded");
  }

  revalidatePath("/admin/ontology");
}
