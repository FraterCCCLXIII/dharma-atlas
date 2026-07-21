import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { PlacePageView } from "@/components/place/PlacePageView";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { placeMetaDescription } from "@/lib/place-description";
import {
  getPlaceById,
  getSimilarPlaces,
} from "@/lib/dataset";
import { getTeachersAtPlace } from "@/lib/data/teachers";

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    return { title: "Place not found | Dharma Atlas" };
  }

  const { traditionDefaultImages } = await getOntologySnapshot();
  const heroPhotos = getPlaceDisplayPhotos(place, traditionDefaultImages);

  return {
    title: `${place.name} | Dharma Atlas`,
    description: placeMetaDescription(place),
    openGraph:
      heroPhotos.length > 0 ? { images: heroPhotos.map((url) => ({ url })) } : undefined,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    notFound();
  }

  const [similar, linkedTeachers, ontology] = await Promise.all([
    getSimilarPlaces(place),
    getTeachersAtPlace(place.name),
    getOntologySnapshot(),
  ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <PlacePageView
        place={place}
        similar={similar}
        teachers={linkedTeachers}
        traditionDefaultImages={ontology.traditionDefaultImages}
      />
    </OntologyRuntimeProvider>
  );
}
