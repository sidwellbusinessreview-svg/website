import { describe, expect, it } from "vitest";
import { footnoteSourceOptions, matchesFootnoteSource } from "./FootnoteSourceInput";

describe("footnote source selector", () => {
  it("accepts only complete source entries and preserves their order", () => {
    expect(footnoteSourceOptions([null, {}, { _key: "first", citation: " First citation " }, { _key: "", citation: "Missing key" }, { _key: "second", citation: "Second citation" }])).toEqual([
      { key: "first", citation: "First citation" },
      { key: "second", citation: "Second citation" },
    ]);
  });
  it("handles untrusted non-array values safely", () => expect(footnoteSourceOptions(undefined)).toEqual([]));
  it("searches by Source number or citation without changing stored values", () => {
    const option = { value: "source-key", number: "12", label: "Source 12 · Federal Reserve report" };
    expect(matchesFootnoteSource("12", option)).toBe(true);
    expect(matchesFootnoteSource("reserve", option)).toBe(true);
    expect(matchesFootnoteSource("13", option)).toBe(false);
  });
});
