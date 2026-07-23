import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TraditionsHomeView } from "@/components/traditions/TraditionsHomeView";
import { getTraditionHubCards } from "@/lib/data/tradition-articles";
import { SHOW_TRADITIONS } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Traditions | Dharma Atlas",
  description:
    "Explore Buddhist lineages and related contemplative traditions — practices, texts, teachers, and places.",
};

export default async function TraditionsPage() {
  if (!SHOW_TRADITIONS) notFound();

  const { buddhistLineages, otherTraditions } = await getTraditionHubCards();

  return (
    <TraditionsHomeView
      buddhistLineages={buddhistLineages}
      otherTraditions={otherTraditions}
    />
  );
}
