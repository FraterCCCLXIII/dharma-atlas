import type { Metadata } from "next";
import { SubmitEntryPageView } from "@/components/submit/SubmitEntryPageView";

export const metadata: Metadata = {
  title: "Submit an entry | Dharma Streams",
  description:
    "Suggest a meditation center, monastery, or teacher for the Dharma Streams directory.",
};

export default function SubmitPage() {
  return <SubmitEntryPageView />;
}
