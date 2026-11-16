import { describe, expect, it } from "vitest";
import { findNavMatch } from "../app/components/dashboard/search";

describe("findNavMatch", () => {
  it("prefers a title that starts with the query", () => {
    expect(findNavMatch("sett")?.url).toBe("/dashboard/settings");
    expect(findNavMatch("  VUE ")?.url).toBe("/dashboard/app-vue");
  });

  it("falls back to a title or URL containing the query", () => {
    expect(findNavMatch("dashboard")?.url).toBe("/dashboard");
    expect(findNavMatch("app-solidjs")?.url).toBe("/dashboard/app-solidjs");
  });

  it("returns nothing for an empty or unknown query", () => {
    expect(findNavMatch("")).toBeUndefined();
    expect(findNavMatch("zzz")).toBeUndefined();
  });
});
