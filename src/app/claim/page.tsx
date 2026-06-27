import type { Metadata } from "next";
import { ClaimLocationPageView } from "@/components/claim/ClaimLocationPageView";

export const metadata: Metadata = {
  title: "Claim a location | Dharma Streams",
  description:
    "Request to manage or update a listed center on Dharma Streams.",
};

export default function ClaimPage() {
  return <ClaimLocationPageView />;
}
