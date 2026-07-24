import { describe, expect, it } from "vitest";
import { buildTrustedOrigins } from "@/lib/auth-trusted-origins";

describe("buildTrustedOrigins", () => {
  it("always includes local development hosts", () => {
    expect(buildTrustedOrigins(undefined)).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });

  it("adds the www sibling for an apex BETTER_AUTH_URL", () => {
    expect(buildTrustedOrigins("https://dharmaatlas.com")).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://dharmaatlas.com",
      "https://www.dharmaatlas.com",
    ]);
  });

  it("adds the apex sibling for a www BETTER_AUTH_URL", () => {
    expect(buildTrustedOrigins("https://www.dharmaatlas.com")).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://www.dharmaatlas.com",
      "https://dharmaatlas.com",
    ]);
  });

  it("normalizes path/trailing slash via URL.origin", () => {
    expect(buildTrustedOrigins("https://dharmaatlas.com/")).toContain(
      "https://dharmaatlas.com",
    );
    expect(buildTrustedOrigins("https://dharmaatlas.com/")).toContain(
      "https://www.dharmaatlas.com",
    );
  });

  it("does not invent a www host for localhost", () => {
    expect(buildTrustedOrigins("http://localhost:3000")).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });
});
