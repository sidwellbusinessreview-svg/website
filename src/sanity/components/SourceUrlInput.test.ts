import { describe, expect, it } from "vitest";
import { normalizeSourceUrl } from "./SourceUrlInput";

describe("Source URL input", () => {
  it("trims surrounding whitespace without inventing a scheme", () => {
    expect(normalizeSourceUrl("  https://example.com/report  ")).toBe("https://example.com/report");
    expect(normalizeSourceUrl("example.com")).toBe("example.com");
  });
});
