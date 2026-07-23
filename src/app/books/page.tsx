import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BooksPageView } from "@/components/books/BooksPageView";
import { SHOW_BOOKS } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Books (Beta) | Dharma Atlas",
  description:
    "Popular and foundational books on Buddhism, Hinduism, mindfulness, and contemplative practice — with covers and links on Amazon.",
};

export default function BooksPage() {
  if (!SHOW_BOOKS) notFound();
  return <BooksPageView />;
}
