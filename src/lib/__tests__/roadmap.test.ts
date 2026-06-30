import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/lib/permissions";
import { composeSubmissionNotes, parseSubmissionPayload } from "@/lib/validations/submission";

function hasValidCoords(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

describe("permissions", () => {
  it("recognizes admin roles", () => {
    expect(isAdminRole("owner")).toBe(true);
    expect(isAdminRole("editor")).toBe(true);
    expect(isAdminRole("member")).toBe(false);
  });
});

describe("submission notes", () => {
  it("round-trips structured location fields through notes", () => {
    const input = {
      entryType: "location" as const,
      submitterName: "A",
      submitterEmail: "a@example.com",
      name: "Temple",
      location: "Kyoto",
      placeType: "Temple" as const,
      tradition: "Zen",
      address: "1 Main St",
    };
    const notes = composeSubmissionNotes(input);
    const parsed = parseSubmissionPayload({
      entryType: "location",
      notes,
      location: "Kyoto",
    });
    expect(parsed.entryType).toBe("location");
    if (parsed.entryType === "location") {
      expect(parsed.tradition).toBe("Zen");
      expect(parsed.address).toBe("1 Main St");
    }
  });
});

describe("geocode helpers", () => {
  it("rejects null island", () => {
    expect(hasValidCoords(0, 0)).toBe(false);
    expect(hasValidCoords(35.6, 139.7)).toBe(true);
  });
});
