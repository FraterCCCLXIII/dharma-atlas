import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Lineages — Coming soon | Dharma Atlas",
  description:
    "Lineage guides connecting schools, practices, and living communities are coming soon to Dharma Atlas.",
  robots: { index: false, follow: true },
};

export default function LineagesPage() {
  return <ComingSoonPage variant="lineages" />;
}
