import { revalidatePath, revalidateTag } from "next/cache";
import { EXPLORE_MARKERS_CACHE_TAG } from "@/lib/data/places";
import { EXPLORE_TEACHERS_CACHE_TAG } from "@/lib/data/teachers";
import {
  PEOPLE_LIST_PATH,
  personProfilePath,
  placeProfilePath,
} from "@/lib/explore-routes";

export function revalidateExploreMarkers() {
  revalidateTag(EXPLORE_MARKERS_CACHE_TAG, "max");
}

export function revalidateExploreTeachers() {
  revalidateTag(EXPLORE_TEACHERS_CACHE_TAG, "max");
}

export function revalidatePlacePaths(
  placeId: string,
  slug?: string | null,
  previousSlug?: string | null,
) {
  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(`/place/${placeId}`);
  if (slug && slug !== placeId) {
    revalidatePath(placeProfilePath({ id: placeId, slug }));
  }
  if (previousSlug && previousSlug !== slug && previousSlug !== placeId) {
    revalidatePath(placeProfilePath({ id: placeId, slug: previousSlug }));
  }
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
  revalidateExploreTeachers();
}

export function revalidateAllContentPaths() {
  revalidatePath("/");
  revalidatePath("/places");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/places");
  revalidatePath("/admin/teachers");
  revalidateExploreMarkers();
  revalidateExploreTeachers();
}
