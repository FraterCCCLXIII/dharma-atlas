import { revalidatePath } from "next/cache";
import { PEOPLE_LIST_PATH, personProfilePath } from "@/lib/explore-routes";

export function revalidatePlacePaths(placeId: string) {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(`/place/${placeId}`);
  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/manage/places/${placeId}/edit`);
}

export function revalidateTeacherPaths(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath(personProfilePath(slug));
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(personProfilePath(previousSlug));
  }
  revalidatePath("/admin/teachers");
  revalidatePath(`/admin/teachers/${slug}/edit`);
}

export function revalidateAllContentPaths() {
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/places");
  revalidatePath("/admin/teachers");
}
