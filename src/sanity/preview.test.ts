import { afterEach, describe, expect, it } from "vitest";
import { matchesConfiguredPreviewSecret, safePreviewPath } from "./preview";

describe("preview security helpers", () => {
  afterEach(() => { delete process.env.SANITY_PREVIEW_SECRET; });

  it.each([
    ["/articles/example?mode=preview", "/articles/example?mode=preview"],
    ["https://evil.example/steal", "/"],
    ["//evil.example/steal", "/"],
    ["/\\evil", "/"],
    ["/studio", "/"],
    ["/studio/structure/about", "/"],
    ["/api/draft-mode/enable", "/"],
    ["/feed.xml", "/"],
    ["/articles/example?sanity-preview-secret=remove&view=full", "/articles/example?view=full"],
    [null, "/"],
  ])("restricts redirect %s to %s", (value, expected) => {
    expect(safePreviewPath(value)).toBe(expected);
  });

  it("rejects missing and incorrect secrets and accepts an exact configured secret", () => {
    process.env.SANITY_PREVIEW_SECRET = "test-preview-secret";
    expect(matchesConfiguredPreviewSecret(null)).toBe(false);
    expect(matchesConfiguredPreviewSecret("wrong")).toBe(false);
    expect(matchesConfiguredPreviewSecret("test-preview-secret")).toBe(true);
  });
});
