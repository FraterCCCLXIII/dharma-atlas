import Link from "next/link";
import { Path, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import {
  getPilgrimageImage,
  getPilgrimageRoute,
} from "@/data/pilgrimage";
import {
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
import type { UserPilgrimageRouteRow } from "@/db/schema";
import { traditionGradient } from "@/lib/places";

function coverForUserRoute(route: UserPilgrimageRouteRow): string | undefined {
  if (route.baseRouteSlug) {
    const baseImage = getPilgrimageImage(route.baseRouteSlug);
    if (baseImage) return baseImage;
  }
  for (const ref of route.stopSlugs) {
    if (ref.startsWith("place:")) continue;
    const image = getPilgrimageImage(ref);
    if (image) return image;
  }
  return undefined;
}

export function FavoritesUserRouteCard({
  route,
}: {
  route: UserPilgrimageRouteRow;
}) {
  const base = route.baseRouteSlug
    ? getPilgrimageRoute(route.baseRouteSlug)
    : undefined;
  const image = coverForUserRoute(route);
  const tradition = base?.tradition ?? "Buddhist";
  const stopCount = route.stopSlugs.length;
  const updated = route.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(route.updatedAt)
    : null;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
    >
      <Link href={`/pilgrimage/my/${route.id}`} className="group block text-left">
        <div className={cardImagePaddingClassName}>
          <div
            className={`relative flex h-36 items-end bg-gradient-to-br ${cardImageFrameClassName} ${traditionGradient(tradition)}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full rounded-xl object-cover"
              />
            ) : null}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span className="relative m-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              <Path size={12} weight="bold" />
              My route
            </span>
          </div>
        </div>
        <div className="space-y-1 px-4 pb-3 pt-1">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
            {route.title}
          </h3>
          <p className="text-xs text-ink-muted">
            {stopCount} {stopCount === 1 ? "stop" : "stops"}
            {base ? ` · based on ${base.name}` : ""}
            {updated ? ` · updated ${updated}` : ""}
          </p>
          {route.notes ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              {route.notes}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="flex items-center gap-3 border-t border-border px-4 py-2.5">
        <Link
          href={`/pilgrimage/my/${route.id}`}
          className="text-xs font-semibold text-brand hover:underline"
        >
          Open →
        </Link>
        <Link
          href={`/pilgrimage/my/${route.id}/edit`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-secondary transition hover:text-ink"
        >
          <PencilSimple size={12} weight="bold" />
          Edit
        </Link>
      </div>
    </article>
  );
}
