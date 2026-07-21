import { revalidatePath, revalidateTag } from "next/cache";
import { EXPLORE_MARKERS_CACHE_TAG } from "@/lib/data/places";
import { PEOPLE_LIST_PATH, personProfilePath } from "@/lib/explore-routes";

export function revalidateExploreMarkers() {
  revalidateTag(EXPLORE_MARKERS_CACHE_TAG, "max");
}

export function revalidatePlacePaths(placeId: string) {
  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${placeId}`);
  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/manage/places/${placeId}/edit`);
  revalidateExploreMarkers();
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
  revalidatePath("/places");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/places");
  revalidatePath("/admin/teachers");
  revalidateExploreMarkers();
}
