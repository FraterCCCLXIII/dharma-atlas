import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const metadata: Metadata = {
  title: "Dharma Streams | People, Temples & Paths of Practice",
  description:
    "Discover meditation centers, monasteries, and spiritual guides across traditions in one living directory.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  return <ExplorePage />;
}
