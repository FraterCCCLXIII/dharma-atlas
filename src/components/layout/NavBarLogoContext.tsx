"use client";

import { createContext, useContext } from "react";

/** null = no collision detection (use breakpoint fallback). */
export const NavBarLogoContext = createContext<boolean | null>(null);

export function useNavBarLogoCompact() {
  return useContext(NavBarLogoContext);
}
