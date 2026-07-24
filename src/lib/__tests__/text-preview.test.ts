import { describe, expect, it } from "vitest";
import { firstDescriptionLine } from "@/lib/text-preview";

describe("firstDescriptionLine", () => {
  it("returns the first sentence", () => {
    expect(
      firstDescriptionLine(
        "Birthplace of the Buddha. Pilgrims visit the Maya Devi Temple.",
      ),
    ).toBe("Birthplace of the Buddha.");
  });

  it("falls back to the first line", () => {
    expect(firstDescriptionLine("A short circuit note\nSecond line")).toBe(
      "A short circuit note",
    );
  });
});
