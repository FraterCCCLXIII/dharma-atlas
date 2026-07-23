import { redirect } from "next/navigation";
import { ownerPlaceEditPath } from "@/lib/manage-place";

export default async function EditManagedPlaceIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(ownerPlaceEditPath(id, "details"));
}
