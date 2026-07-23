import { describe, expect, it } from "vitest";
import type { PilgrimageSite } from "@/data/pilgrimage";
import {
  inferPilgrimagePlaceType,
  pilgrimageFaith,
  pilgrimagePlaceTradition,
} from "@/lib/seed/pilgrimage-place-type";

function site(partial: Partial<PilgrimageSite> & Pick<PilgrimageSite, "name">): PilgrimageSite {
  return {
    slug: "test",
    kind: "site",
    region: "India & Nepal",
    tradition: "Buddhist",
    country: "India",
    lat: 0,
    lng: 0,
    summary: "",
    significance: "",
    ...partial,
  };
}

describe("inferPilgrimagePlaceType", () => {
  it("marks mountains and lakes as sacred landscape", () => {
    expect(
      inferPilgrimagePlaceType(
        site({ name: "Mount Kailash", summary: "Sacred mountain and kora." }),
      ),
    ).toBe("Sacred Landscape");
  });

  it("marks monasteries", () => {
    expect(
      inferPilgrimagePlaceType(
        site({ name: "Ganden", summary: "A major Gelug monastery." }),
      ),
    ).toBe("Monastery");
  });

  it("marks numbered temples", () => {
    expect(
      inferPilgrimagePlaceType(site({ name: "Ryozen-ji", templeNumber: 1 })),
    ).toBe("Temple");
  });
});

describe("pilgrimageFaith / tradition", () => {
  it("maps Hindu and Buddhist traditions", () => {
    expect(pilgrimageFaith("Hindu")).toBe("Hindu");
    expect(pilgrimageFaith("Zen")).toBe("Buddhist");
    expect(pilgrimagePlaceTradition("Interfaith")).toBe("Buddhist");
    expect(pilgrimagePlaceTradition("Tibetan")).toBe("Tibetan");
  });
});
