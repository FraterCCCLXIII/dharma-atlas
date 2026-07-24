import { describe, expect, it } from "vitest";
import { searchPilgrimageCatalog } from "@/lib/pilgrimage-search";

describe("searchPilgrimageCatalog", () => {
  it("finds sites and routes by name", () => {
    const hits = searchPilgrimageCatalog("lumbini", 10);
    expect(hits.some((hit) => hit.slug === "lumbini" && hit.kind === "site")).toBe(
      true,
    );
  });

  it("returns empty for short queries", () => {
    expect(searchPilgrimageCatalog("l")).toEqual([]);
  });
});
