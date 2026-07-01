"use client";

import type { Teacher } from "@/types/teacher";
import { TeacherCarousel } from "./TeacherCarousel";

interface RememberingSanghaCarouselProps {
  teachers: Teacher[];
}

export function RememberingSanghaCarousel({
  teachers,
}: RememberingSanghaCarouselProps) {
  return (
    <TeacherCarousel
      teachers={teachers}
      ariaLabel="Remembering the Sangha"
      eyebrow="In memoriam"
      title="Remembering the Sangha"
      description="Teachers and friends of the path who passed within the last five years."
    />
  );
}
