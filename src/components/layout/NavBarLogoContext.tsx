"use client";

import { createContext, useContext } from "react";
import type { NavBarCollisionState } from "@/hooks/useNavLogoCompact";

/** null = no collision detection (use breakpoint fallback). */
export const NavBarLogoContext = createContext<NavBarCollisionState | null>(
  null,
);

export function useNavBarLogoCompact() {
  return useContext(NavBarLogoContext)?.logoCompact ?? null;
}

export function useNavLinksCollapsed() {
  return useContext(NavBarLogoContext)?.navLinksCollapsed ?? null;
}
