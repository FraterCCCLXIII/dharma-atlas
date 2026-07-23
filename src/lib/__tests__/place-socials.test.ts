import { describe, expect, it } from "vitest";
import {
  getPlaceSocialPlatformDef,
  isPlaceSocialPlatform,
  placeSocialDisplayLabel,
} from "@/lib/place-socials";
import { placeSocialInputSchema, placeSocialsReplaceSchema } from "@/lib/validations/place-profile";

describe("place-socials helpers", () => {
  it("recognizes known platforms", () => {
    expect(isPlaceSocialPlatform("youtube")).toBe(true);
    expect(isPlaceSocialPlatform("x")).toBe(true);
    expect(isPlaceSocialPlatform("myspace")).toBe(false);
  });

  it("returns display labels", () => {
    expect(placeSocialDisplayLabel({ platform: "instagram" })).toBe("Instagram");
    expect(placeSocialDisplayLabel({ platform: "other", label: "Bluesky" })).toBe(
      "Bluesky",
    );
    expect(placeSocialDisplayLabel({ platform: "other" })).toBe("Other");
  });

  it("falls back to Other for unknown platforms", () => {
    expect(getPlaceSocialPlatformDef("unknown").id).toBe("other");
  });
});

describe("place social validation", () => {
  it("accepts a platform URL", () => {
    const parsed = placeSocialInputSchema.parse({
      platform: "youtube",
      url: "https://youtube.com/@sangha",
      sortOrder: 0,
    });
    expect(parsed.platform).toBe("youtube");
  });

  it("requires a label for Other", () => {
    const result = placeSocialInputSchema.safeParse({
      platform: "other",
      url: "https://example.com",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-http URLs", () => {
    const result = placeSocialInputSchema.safeParse({
      platform: "facebook",
      url: "facebook.com/page",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("replaces a list of socials", () => {
    const parsed = placeSocialsReplaceSchema.parse({
      socials: [
        {
          platform: "other",
          url: "https://bsky.app/profile/sangha",
          label: "Bluesky",
          sortOrder: 0,
        },
      ],
    });
    expect(parsed.socials).toHaveLength(1);
  });
});
