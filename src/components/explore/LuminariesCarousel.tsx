"use client";

import type { Teacher } from "@/types/teacher";
import { TeacherCarousel } from "./TeacherCarousel";

interface LuminariesCarouselProps {
  teachers: Teacher[];
}

export function LuminariesCarousel({ teachers }: LuminariesCarouselProps) {
  return (
    <TeacherCarousel
      teachers={teachers}
      ariaLabel="Luminaries across the traditions"
      eyebrow="Across the traditions"
      title="Luminaries"
    />
  );
}
