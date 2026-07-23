import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlaceCard } from "@/components/explore/PlaceCard";
import { getSession } from "@/lib/auth-server";
import { getFavoritePlaces } from "@/lib/data/place-favorites";

export const metadata: Metadata = {
  title: "Favorites | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/favorites");
  }

  const places = await getFavoritePlaces(session.user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Favorites</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Places you&apos;ve saved to come back to later.
      </p>

      {places.length === 0 ? (
        <div className="mt-12 max-w-md space-y-3">
          <p className="text-sm leading-relaxed text-ink-secondary">
            You haven&apos;t saved any places yet. Tap the heart on a listing to
            add it here.
          </p>
          <Link
            href="/places"
            className="inline-flex text-sm font-medium text-brand hover:underline"
          >
            Browse places
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
