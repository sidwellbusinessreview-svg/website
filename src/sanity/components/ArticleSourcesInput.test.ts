import { describe, expect, it } from "vitest";
import { moveArticleSource, normalizedArticleSources, sourceRowWarnings } from "./ArticleSourcesInput";

describe("ArticleSourcesInput helpers", () => {
  const sources = [
    { _key: "a", _type: "articleSource" as const, citation: "First" },
    { _key: "b", _type: "articleSource" as const, citation: "Second", url: "https://example.com" },
  ];

  it("normalizes untrusted Source values without exposing incomplete members", () => {
    expect(normalizedArticleSources([null, {}, ...sources])).toEqual(sources);
  });

  it("reorders Sources without changing their stable keys", () => {
    expect(moveArticleSource(sources, 1, 0).map(({ _key }) => _key)).toEqual(["b", "a"]);
    expect(moveArticleSource(sources, -1, 0)).toBe(sources);
  });

  it("keeps duplicate and unused warnings attached to their Source rows", () => {
    const warnings = sourceRowWarnings([
      ...sources,
      { _key: "c", _type: "articleSource", citation: " first " },
    ], [{ _type: "footnoteReference", sourceKey: "a" }]);
    expect(warnings.get("a")).toBeUndefined();
    expect(warnings.get("b")).toContain("Not currently cited.");
    expect(warnings.get("c")).toEqual(["Possibly duplicates Source 1.", "Not currently cited."]);
  });
});
