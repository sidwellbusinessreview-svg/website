import { describe, expect, it } from "vitest";
import {
  ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, ARTICLES_BY_CONTRIBUTOR_QUERY,
  CONTRIBUTORS_QUERY, SEARCH_ARTICLES_QUERY, SITE_SETTINGS_QUERY,
  articleProjectionForTests,
} from "./queries";

describe("public Sanity queries", () => {
  it.each([ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, ARTICLES_BY_CONTRIBUTOR_QUERY, SEARCH_ARTICLES_QUERY, CONTRIBUTORS_QUERY, SITE_SETTINGS_QUERY])("delegates visibility to the client perspective", (query) => {
    expect(query).not.toContain('path("drafts.**")');
  });
  it("projects only public image metadata and resolved contributors", () => {
    expect(articleProjectionForTests).toContain("contributors[]->");
    expect(articleProjectionForTests).toContain("metadata{dimensions");
    expect(articleProjectionForTests).not.toContain("rightsNote");
  });
  it("preserves byline order and includes archived Contributors for historical work", () => {
    expect(articleProjectionForTests).toContain('"contributors": contributors[]->');
    expect(articleProjectionForTests).not.toContain("contributors[active");
    expect(CONTRIBUTORS_QUERY).not.toMatch(/active\s*==\s*true/);
  });
  it("does not project publication-role metadata from Contributors", () => {
    for (const query of [articleProjectionForTests, CONTRIBUTORS_QUERY, SITE_SETTINGS_QUERY]) {
      expect(query).not.toMatch(/(?:^|[,\s{])role(?:[,\s}])/);
    }
    expect(SITE_SETTINGS_QUERY).toContain("displayedRole");
  });
  it("uses deterministic month ordering with the transitional legacy fallback", () => expect(ALL_PUBLISHED_ARTICLES_QUERY).toContain("coalesce(publicationMonth,publicationDate) desc, slug.current asc"));
});
