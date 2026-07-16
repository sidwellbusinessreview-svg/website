import { describe, expect, it } from "vitest";
import type { Article, Author, Issue } from "./types";
import { searchPublicArticles } from "./search";

const authors: Author[] = [{
  slug: "maya-chen",
  name: "Maya Chen",
  role: "Editor",
  grade: "Class of 2026",
  bio: "Maya writes about markets and institutions.",
  initials: "MC",
}];

const issues: Issue[] = [{
  slug: "spring-2026",
  title: "The Resilience Issue",
  number: 2,
  season: "Spring",
  year: 2026,
  description: "A complete issue description for testing search behavior.",
  editorNote: "A complete editor note for testing search behavior.",
  articleSlugs: ["market-signals"],
  accent: "#234e70",
}];

function article(overrides: Partial<Article> = {}): Article {
  return {
    slug: "market-signals",
    title: "How Markets Read Signals",
    dek: "A practical guide to interpreting policy and market information.",
    category: "Markets",
    tags: ["Federal Reserve", "investing"],
    authorSlugs: ["maya-chen"],
    issueSlug: "spring-2026",
    publishedAt: "2026-05-01",
    readTime: 5,
    status: "published",
    pinned: false,
    featuredImage: { src: "https://example.com/image.jpg", alt: "Chart lines" },
    content: [{ type: "paragraph", text: "Interest rates shape borrowing decisions." }],
    ...overrides,
  };
}

describe("article search", () => {
  it.each([
    ["title", "markets"],
    ["summary", "interpreting policy"],
    ["author", "MAYA CHEN"],
    ["category", "markets"],
    ["tag", "federal reserve"],
    ["issue", "resilience"],
    ["body", "borrowing decisions"],
  ])("matches %s text case-insensitively", (_field, query) => {
    expect(searchPublicArticles([article()], authors, issues, query)[0]?.article.slug)
      .toBe("market-signals");
  });

  it("ranks a headline match above a body-only match", () => {
    const results = searchPublicArticles([
      article({ slug: "headline", title: "Interest Rates Explained" }),
      article({
        slug: "body",
        title: "A Different Topic",
        content: [{ type: "paragraph", text: "Interest rates appear here." }],
      }),
    ], authors, issues, "interest rates");
    expect(results.map(({ article }) => article.slug)).toEqual(["headline", "body"]);
  });

  it("returns no results for an empty or unmatched query", () => {
    expect(searchPublicArticles([article()], authors, issues, "")).toEqual([]);
    expect(searchPublicArticles([article()], authors, issues, "volcano")).toEqual([]);
  });

  it("excludes draft content", () => {
    expect(
      searchPublicArticles([article({ status: "draft" })], authors, issues, "markets"),
    ).toEqual([]);
  });
});
