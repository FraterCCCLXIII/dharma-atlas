import type { Metadata } from "next";
import { AddPlacePageView } from "@/components/add/AddPlacePageView";

export const metadata: Metadata = {
  title: "Add a place | Dharma Atlas",
  description:
    "Add a meditation center or temple to Dharma Atlas — manage it as admin, or suggest a listing for review.",
};

export default function AddPlacePage() {
  return <AddPlacePageView />;
}
