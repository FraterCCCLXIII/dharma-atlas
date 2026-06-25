import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlacePageView } from "@/components/place/PlacePageView";
import {
  getAllPlaceIds,
  getPlaceById,
  getSimilarPlaces,
} from "@/lib/dataset";

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllPlaceIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  const place = getPlaceById(id);

  if (!place) {
    return { title: "Place not found | Dharma Streams" };
  }

  return {
    title: `${place.name} | Dharma Streams`,
    description: `${place.name} — a ${place.type.toLowerCase()} in the ${place.tradition} tradition.`,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = getPlaceById(id);

  if (!place) {
    notFound();
  }

  const similar = getSimilarPlaces(place);

  return <PlacePageView place={place} similar={similar} />;
}
