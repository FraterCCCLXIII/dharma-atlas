import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const metadata: Metadata = {
  title: "All | Dharma Atlas",
  description:
    "Browse the full Dharma Atlas directory of locations and teachers across spiritual traditions.",
};

export default function AllPage() {
  return <ExplorePage />;
}
