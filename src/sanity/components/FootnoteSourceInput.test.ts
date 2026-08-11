import { describe, expect, it } from "vitest";
import { footnoteSourceOptions } from "./FootnoteSourceInput";

describe("footnote source selector", () => {
  it("accepts only complete source entries and preserves their order", () => {
    expect(footnoteSourceOptions([null, {}, { _key: "first", citation: " First citation " }, { _key: "", citation: "Missing key" }, { _key: "second", citation: "Second citation" }])).toEqual([
      { key: "first", citation: "First citation" },
      { key: "second", citation: "Second citation" },
    ]);
  });
  it("handles untrusted non-array values safely", () => expect(footnoteSourceOptions(undefined)).toEqual([]));
});
