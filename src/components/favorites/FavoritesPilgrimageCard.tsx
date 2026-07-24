import Link from "next/link";
import { Path, Signpost } from "@phosphor-icons/react/dist/ssr";
import { PilgrimageFavoriteButton } from "@/components/pilgrimage/PilgrimageFavoriteButton";
import {
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
import { traditionGradient } from "@/lib/places";

export function FavoritesPilgrimageCard({
  kind,
  href,
  slug,
  name,
  summary,
  meta,
  image,
  tradition,
}: {
  kind: "route" | "site";
  href: string;
  slug: string;
  name: string;
  summary: string;
  meta: string;
  image?: string;
  tradition: string;
}) {
  const KindIcon = kind === "route" ? Path : Signpost;

  return (
    <article className={`relative rounded-2xl ${cardLiftClassName}`}>
      <Link href={href} className="group block text-left">
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
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="relative m-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              <KindIcon size={12} weight="bold" />
              {kind === "route" ? "Route" : "Site"}
            </span>
          </div>
        </div>
        <div className="space-y-1 px-4 pb-4 pt-1">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
            {name}
          </h3>
          <p className="text-xs text-ink-muted">{meta}</p>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-secondary">
            {summary}
          </p>
        </div>
      </Link>
      <div className="absolute right-5 top-5 z-10">
        <PilgrimageFavoriteButton kind={kind} slug={slug} variant="overlay" />
      </div>
    </article>
  );
}
