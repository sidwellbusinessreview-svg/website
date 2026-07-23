import { afterEach, describe, expect, it } from "vitest";
import { getConfiguredContentSource, getContentProvider } from "./provider-selection";

describe("content provider selection", () => {
  afterEach(() => { delete process.env.CONTENT_SOURCE; });
  it("keeps local mode as the documented temporary default", () => expect(getConfiguredContentSource(undefined)).toBe("local"));
  it.each(["local", "sanity"])("accepts %s", (source) => expect(getConfiguredContentSource(source)).toBe(source));
  it("rejects ambiguous configuration", () => expect(() => getConfiguredContentSource("automatic")).toThrow(/CONTENT_SOURCE/));
  it("selects the local provider without requiring Sanity configuration", async () => {
    process.env.CONTENT_SOURCE = "local";
    await expect(getContentProvider()).resolves.toMatchObject({ source: "local" });
  });
});
