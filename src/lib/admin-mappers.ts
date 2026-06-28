import type { Teacher } from "@/types/teacher";
import type { TeacherInput } from "@/lib/validations/teacher";
import type { Place } from "@/types/place";
import type { PlaceInput } from "@/lib/validations/place";

export function teacherToInput(teacher: Teacher): TeacherInput {
  const relations = [
    ...(teacher.relations?.teachers?.map((r) => ({ ...r, type: "teacher" as const })) ?? []),
    ...(teacher.relations?.peers?.map((r) => ({ ...r, type: "peer" as const })) ?? []),
    ...(teacher.relations?.students?.map((r) => ({ ...r, type: "student" as const })) ?? []),
  ];
  return {
    slug: teacher.slug,
    name: teacher.name,
    tradition: teacher.tradition,
    lineage: teacher.lineage,
    location: teacher.location,
    base: teacher.base,
    yearsTeaching: teacher.yearsTeaching,
    birthYear: teacher.birthYear ?? null,
    deathYear: teacher.deathYear ?? null,
    languages: teacher.languages,
    shortBio: teacher.shortBio,
    biography: teacher.biography,
    topics: teacher.topics,
    photo: teacher.photo,
    heroPhoto: teacher.heroPhoto,
    website: teacher.website ?? undefined,
    socials: teacher.socials,
    bibliography: teacher.bibliography,
    retreats: teacher.retreats,
    relations,
    isDraft: teacher.isDraft ?? false,
  };
}

export function placeToInput(place: Place): PlaceInput {
  return {
    id: place.id,
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    tradition: place.tradition,
    faith: place.faith,
    type: place.type,
    folder: place.folder,
    address: place.address,
    phone: place.phone,
    website: place.website,
    schools: place.schools ?? [],
    isDraft: place.isDraft ?? false,
  };
}
