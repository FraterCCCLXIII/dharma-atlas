import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";

export const metadata: Metadata = {
  title: "About | Dharma Atlas",
  description:
    "Mission, manifesto, and roadmap for Dharma Atlas — an open directory of meditation centers, monasteries, and spiritual teachers, created by Paul Bloch.",
};

export default function AboutPage() {
  return <AboutPageView />;
}
