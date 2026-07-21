import { ExplorePage } from "@/components/explore/ExplorePage";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  return <ExplorePage mode="locations" />;
}
