import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Books — Coming soon | Dharma Atlas",
  description:
    "A curated contemplative library is on the way — books across Buddhist, Hindu, and mindfulness traditions.",
  robots: { index: false, follow: true },
};

export default function BooksPage() {
  return <ComingSoonPage variant="books" />;
}
