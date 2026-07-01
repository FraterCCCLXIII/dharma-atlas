"use client";

import { useMemo } from "react";
import { getPeoplePageCarousels } from "@/lib/luminaries";
import type { Teacher } from "@/types/teacher";
import { LuminariesCarousel } from "./LuminariesCarousel";
import { RememberingSanghaCarousel } from "./RememberingSanghaCarousel";

interface PeopleCarouselsProps {
  teachers: Teacher[];
}

export function PeopleCarousels({ teachers }: PeopleCarouselsProps) {
  const { luminaries, remembering } = useMemo(
    () => getPeoplePageCarousels(teachers),
    [teachers],
  );

  return (
    <>
      <LuminariesCarousel teachers={luminaries} />
      <RememberingSanghaCarousel teachers={remembering} />
    </>
  );
}
