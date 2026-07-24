import { describe, expect, it } from "vitest";
import type { PilgrimageSite } from "@/data/pilgrimage";
import {
  inferPilgrimagePlaceType,
  isThinPilgrimageAddress,
  isWeakPilgrimageAddress,
  pilgrimageFaith,
  pilgrimagePlaceAddress,
  pilgrimagePlaceTradition,
} from "@/lib/seed/pilgrimage-place-type";
import { formatLocalityAddress } from "@/lib/seed/reverse-geocode-address";

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

describe("pilgrimagePlaceAddress", () => {
  it("formats name and country", () => {
    expect(
      pilgrimagePlaceAddress(site({ name: "Lumbini", country: "Nepal" })),
    ).toBe("Lumbini, Nepal");
  });

  it("treats country-only addresses as weak", () => {
    expect(isWeakPilgrimageAddress("Nepal", site({ name: "Lumbini", country: "Nepal" }))).toBe(
      true,
    );
    expect(
      isWeakPilgrimageAddress("Lumbini, Nepal", site({ name: "Lumbini", country: "Nepal" })),
    ).toBe(false);
  });

  it("treats name+country as thin (needs locality enrich)", () => {
    expect(
      isThinPilgrimageAddress("Lumbini, Nepal", site({ name: "Lumbini", country: "Nepal" })),
    ).toBe(true);
    expect(
      isThinPilgrimageAddress(
        "Lumbini, Rupandehi, Lumbini Province, Nepal",
        site({ name: "Lumbini", country: "Nepal" }),
      ),
    ).toBe(false);
  });
});

describe("formatLocalityAddress", () => {
  it("builds Lumbini locality line", () => {
    expect(
      formatLocalityAddress("Lumbini", "Nepal", {
        municipality: "Lumbini Sanskritik",
        county: "Rupandehi",
        state: "Lumbini Province",
        country: "Nepal",
      }),
    ).toBe("Lumbini, Rupandehi, Lumbini Province, Nepal");
  });
});
