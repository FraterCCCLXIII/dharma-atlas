import { describe, expect, it } from "vitest";
import {
  buildPlaceSlugCandidates,
  citySlugFromAddress,
  isValidPlaceSlug,
  normalizePlaceSlug,
  slugifyPlacePart,
} from "@/lib/place-slug";

describe("place-slug", () => {
  it("slugifies names", () => {
    expect(slugifyPlacePart("Sangha Test")).toBe("sangha-test");
    expect(slugifyPlacePart("St. Mary's Zen")).toBe("st-marys-zen");
  });

  it("extracts city from common address shapes", () => {
    expect(citySlugFromAddress("2148 Addison Street, Berkeley, CA 94704")).toBe(
      "berkeley",
    );
    expect(citySlugFromAddress("Berkeley, CA")).toBe("berkeley");
    expect(citySlugFromAddress("Online only")).toBe("online-only");
  });

  it("builds name then name-city candidates", () => {
    const candidates = buildPlaceSlugCandidates({
      name: "Zen Center",
      city: "Berkeley",
      fallbackId: "81cfff109874",
    });
    expect(candidates[0]).toBe("zen-center");
    expect(candidates[1]).toBe("zen-center-berkeley");
    expect(candidates).toContain("zen-center-berkeley-2");
    expect(candidates).toContain("zen-center-9874");
  });

  it("normalizes and validates editable slugs", () => {
    expect(normalizePlaceSlug("  Sangha Test!! ")).toBe("sangha-test");
    expect(isValidPlaceSlug("sangha-test")).toBe(true);
    expect(isValidPlaceSlug("Sangha")).toBe(false);
    expect(isValidPlaceSlug("a")).toBe(false);
  });
});
