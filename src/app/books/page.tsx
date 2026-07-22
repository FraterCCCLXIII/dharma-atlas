import type { Metadata } from "next";
import { BooksPageView } from "@/components/books/BooksPageView";

export const metadata: Metadata = {
  title: "Books (Beta) | Dharma Atlas",
  description:
    "Popular and foundational books on Buddhism, Hinduism, mindfulness, and contemplative practice — with covers and links on Amazon.",
};

export default function BooksPage() {
  return <BooksPageView />;
}
