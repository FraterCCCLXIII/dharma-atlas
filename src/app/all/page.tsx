import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const metadata: Metadata = {
  title: "All | Dharma Streams",
  description:
    "Browse the full Dharma Streams directory of locations and teachers across spiritual traditions.",
};

export default function AllPage() {
  return <ExplorePage />;
}
