import { describe, expect, it } from "vitest";
import {
  ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, ARTICLES_BY_CONTRIBUTOR_QUERY,
  CONTRIBUTORS_QUERY, SEARCH_ARTICLES_QUERY, STATIC_PAGE_BY_SLUG_QUERY,
  articleProjectionForTests,
} from "./queries";

describe("public Sanity queries", () => {
  it.each([ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, ARTICLES_BY_CONTRIBUTOR_QUERY, SEARCH_ARTICLES_QUERY, CONTRIBUTORS_QUERY, STATIC_PAGE_BY_SLUG_QUERY])("delegates visibility to the client perspective", (query) => {
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
  it("uses deterministic article ordering", () => expect(ALL_PUBLISHED_ARTICLES_QUERY).toContain("publicationDate desc, slug.current asc"));
});
