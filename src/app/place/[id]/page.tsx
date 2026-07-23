import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { PlacePageView } from "@/components/place/PlacePageView";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";
import { placeMetaDescription } from "@/lib/place-description";
import { getPlaceById, getPlaceBySlug, getSimilarPlaces } from "@/lib/dataset";
import { placeHasManager } from "@/lib/data/memberships";
import { getPlaceEvents } from "@/lib/data/place-events";
import { getPlaceSocials } from "@/lib/data/place-socials";
import { getPlaceTeachersForDisplay } from "@/lib/data/place-teachers";
import { getTeachersAtPlace } from "@/lib/data/teachers";
import { placeProfilePath } from "@/lib/explore-routes";

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

// Return [] so nothing is prerendered at build (the Docker build has no DB) but
// the route still opts into the full-route cache: each place is rendered on its
// first request and cached, then revalidated hourly. Without this, a dynamic
// param route renders on every request and `revalidate` has no effect.
export async function generateStaticParams() {
  return [];
}

async function resolvePublicPlace(param: string) {
  const bySlug = await getPlaceBySlug(param);
  if (bySlug) return { place: bySlug, canonicalMismatch: false as const };

  const byId = await getPlaceById(param);
  if (!byId) return null;

  const shouldRedirect = Boolean(byId.slug && byId.slug !== param);
  return { place: byId, canonicalMismatch: shouldRedirect };
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  const resolved = await resolvePublicPlace(id);

  if (!resolved) {
    return { title: "Place not found | Dharma Atlas" };
  }

  const { place } = resolved;
  const { traditionDefaultImages } = await getOntologySnapshot();
  const heroPhotos = getPlaceDisplayPhotos(place, traditionDefaultImages);

  return {
    title: `${place.name} | Dharma Atlas`,
    description: placeMetaDescription(place),
    openGraph:
      heroPhotos.length > 0 ? { images: heroPhotos.map((url) => ({ url })) } : undefined,
    alternates: {
      canonical: placeProfilePath(place),
    },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const resolved = await resolvePublicPlace(id);

  if (!resolved) {
    notFound();
  }

  const { place } = resolved;
  if (resolved.canonicalMismatch) {
    permanentRedirect(placeProfilePath(place));
  }

  const [similar, guidingTeachers, events, socials, linkedTeachers, ontology, hasManager] =
    await Promise.all([
      getSimilarPlaces(place),
      getPlaceTeachersForDisplay(place.id),
      getPlaceEvents(place.id),
      getPlaceSocials(place.id),
      getTeachersAtPlace(place.name),
      getOntologySnapshot(),
      placeHasManager(place.id),
    ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <PlacePageView
        place={place}
        similar={similar}
        guidingTeachers={guidingTeachers}
        events={events}
        socials={socials}
        teachers={linkedTeachers}
        traditionDefaultImages={ontology.traditionDefaultImages}
        showClaim={!hasManager}
      />
    </OntologyRuntimeProvider>
  );
}
