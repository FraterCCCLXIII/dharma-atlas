"use client";

import Image from "next/image";
import { useState } from "react";
import { PlacePhotoLightbox } from "./PlacePhotoLightbox";

interface PlacePhotoGridProps {
  photos: string[];
  placeName: string;
  gradient: string;
}

function PhotoCell({
  src,
  alt,
  className,
  priority,
  sizes,
  gradient,
  onOpen,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  gradient: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${alt}`}
      className={`group relative block cursor-zoom-in overflow-hidden border-0 bg-gradient-to-br p-0 ${gradient} ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized
        quality={65}
        sizes={sizes}
        className="object-cover transition duration-200 group-hover:scale-[1.02]"
      />
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/35" />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100">
        <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-ink shadow-sm">
          View
        </span>
      </span>
    </button>
  );
}

/**
 * Fills the hero mosaic for 2–5+ photos without empty placeholder cells.
 * 4 photos: large left, wide top-right, two bottom-right.
 * Click opens a modal carousel of all photos.
 */
export function PlacePhotoGrid({
  photos,
  placeName,
  gradient,
}: PlacePhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = photos.length;
  const shell =
    "grid h-[240px] gap-2 overflow-hidden rounded-2xl sm:h-[360px] sm:gap-3 lg:h-[420px]";

  const openAt = (index: number) => setLightboxIndex(index);

  const lightbox =
    lightboxIndex !== null ? (
      <PlacePhotoLightbox
        photos={photos}
        placeName={placeName}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    ) : null;

  if (count === 2) {
    return (
      <>
        <div className={`${shell} grid-cols-2`}>
          <PhotoCell
            src={photos[0]}
            alt={placeName}
            priority
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(0)}
          />
          <PhotoCell
            src={photos[1]}
            alt={`${placeName} photo 2`}
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(1)}
          />
        </div>
        {lightbox}
      </>
    );
  }

  if (count === 3) {
    return (
      <>
        <div className={`${shell} grid-cols-2 grid-rows-2`}>
          <PhotoCell
            src={photos[0]}
            alt={placeName}
            className="row-span-2"
            priority
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(0)}
          />
          <PhotoCell
            src={photos[1]}
            alt={`${placeName} photo 2`}
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(1)}
          />
          <PhotoCell
            src={photos[2]}
            alt={`${placeName} photo 3`}
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(2)}
          />
        </div>
        {lightbox}
      </>
    );
  }

  if (count === 4) {
    return (
      <>
        <div className={`${shell} grid-cols-4 grid-rows-2`}>
          <PhotoCell
            src={photos[0]}
            alt={placeName}
            className="col-span-2 row-span-2"
            priority
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(0)}
          />
          <PhotoCell
            src={photos[1]}
            alt={`${placeName} photo 2`}
            className="col-span-2"
            sizes="(min-width: 1152px) 560px, 50vw"
            gradient={gradient}
            onOpen={() => openAt(1)}
          />
          <PhotoCell
            src={photos[2]}
            alt={`${placeName} photo 3`}
            sizes="(min-width: 1152px) 280px, 25vw"
            gradient={gradient}
            onOpen={() => openAt(2)}
          />
          <PhotoCell
            src={photos[3]}
            alt={`${placeName} photo 4`}
            sizes="(min-width: 1152px) 280px, 25vw"
            gradient={gradient}
            onOpen={() => openAt(3)}
          />
        </div>
        {lightbox}
      </>
    );
  }

  // 5+ — large left + four equal tiles on the right (lightbox still includes all photos)
  return (
    <>
      <div className={`${shell} grid-cols-4 grid-rows-2`}>
        <PhotoCell
          src={photos[0]}
          alt={placeName}
          className="col-span-2 row-span-2"
          priority
          sizes="(min-width: 1152px) 560px, 50vw"
          gradient={gradient}
          onOpen={() => openAt(0)}
        />
        {[1, 2, 3, 4].map((index) =>
          photos[index] ? (
            <PhotoCell
              key={index}
              src={photos[index]}
              alt={`${placeName} photo ${index + 1}`}
              sizes="(min-width: 1152px) 280px, 25vw"
              gradient={gradient}
              onOpen={() => openAt(index)}
            />
          ) : null,
        )}
      </div>
      {lightbox}
    </>
  );
}
