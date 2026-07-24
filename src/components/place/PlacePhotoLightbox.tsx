"use client";

import Image from "next/image";
import { useEffect, useId } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

interface PlacePhotoLightboxProps {
  photos: string[];
  placeName: string;
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PlacePhotoLightbox({
  photos,
  placeName,
  index,
  onClose,
  onIndexChange,
}: PlacePhotoLightboxProps) {
  const titleId = useId();
  const count = photos.length;
  const safeIndex = ((index % count) + count) % count;
  const src = photos[safeIndex];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (count < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange((safeIndex - 1 + count) % count);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange((safeIndex + 1) % count);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [count, onClose, onIndexChange, safeIndex]);

  if (!src) return null;

  const goPrev = () => onIndexChange((safeIndex - 1 + count) % count);
  const goNext = () => onIndexChange((safeIndex + 1) % count);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close photo viewer"
        className="absolute inset-0 bg-ink/80 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full max-h-[min(92dvh,900px)] w-full max-w-5xl flex-col"
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3 text-white">
          <p id={titleId} className="min-w-0 truncate text-sm font-medium">
            {placeName}
            {count > 1 ? (
              <span className="ml-2 text-white/70">
                {safeIndex + 1} / {count}
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="relative h-full overflow-hidden rounded-2xl bg-black/40">
            <Image
              src={src}
              alt={`${placeName} photo ${safeIndex + 1}`}
              fill
              priority
              unoptimized
              quality={85}
              sizes="(min-width: 1152px) 1024px, 100vw"
              className="object-contain"
            />
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65 sm:left-3"
                aria-label="Previous photo"
              >
                <CaretLeft size={22} weight="bold" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65 sm:right-3"
                aria-label="Next photo"
              >
                <CaretRight size={22} weight="bold" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
