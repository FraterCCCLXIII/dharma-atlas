import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";

export const metadata: Metadata = {
  title: "About | Dharma Atlas",
  description:
    "Learn about Dharma Atlas, an open directory of meditation centers, monasteries, and spiritual teachers.",
};

export default function AboutPage() {
  return <AboutPageView />;
}
