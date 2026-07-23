import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PilgrimagePageView } from "@/components/pilgrimage/PilgrimagePageView";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Pilgrimage | Dharma Atlas",
  description:
    "Sacred pilgrimage locations and routes across Buddhist and related contemplative traditions — from the Buddha’s life circuit to mountain koras and temple paths.",
};

export default function PilgrimagePage() {
  if (!SHOW_PILGRIMAGE) notFound();
  return <PilgrimagePageView />;
}
