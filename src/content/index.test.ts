import { describe, expect, it } from "vitest";
import {
  findDuplicateSlugs,
  getPublicArticles,
  getArticleBySlug,
  getArchiveArticles,
  getArticles,
  getArticlesByAuthor,
  getArticlesByCategory,
  getArticlesByIssue,
  selectLeadArticle,
  type Article,
} from "./index";

describe("content access", () => {
  it("looks up an article by slug", async () => {
    const article = await getArticleBySlug("reading-the-fed");
    expect(article?.title).toBe("Reading the Fed Without Reading Tea Leaves");
  });

  it("returns undefined for an invalid slug", async () => {
    await expect(getArticleBySlug("not-a-real-article")).resolves.toBeUndefined();
  });

  it("sorts articles newest first", async () => {
    const articles = await getArticles();
    const timestamps = articles.map((article) =>
      new Date(article.publishedAt).getTime(),
    );
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("returns articles by author", async () => {
    const articles = await getArticlesByAuthor("lena-brooks");
    expect(articles.map((article) => article.slug)).toEqual([
      "semiconductors-and-the-geography-of-risk",
      "solar-club-capital-budget",
    ]);
  });

  it("returns an empty author result", async () => {
    await expect(getArticlesByAuthor("unknown-author")).resolves.toEqual([]);
  });

  it("returns issue articles in editorial issue order", async () => {
    const articles = await getArticlesByIssue("spring-2026");
    expect(articles.map((article) => article.slug)).toEqual([
      "the-new-economics-of-school-lunch",
      "semiconductors-and-the-geography-of-risk",
      "small-businesses-big-rates",
    ]);
  });

  it("returns an empty result for an invalid issue", async () => {
    await expect(getArticlesByIssue("unknown-issue")).resolves.toEqual([]);
  });

  it("returns articles by category", async () => {
    const articles = await getArticlesByCategory("Markets");
    expect(articles.map((article) => article.slug)).toEqual(["reading-the-fed"]);
  });

  it("filters the archive by issue, category, and author", async () => {
    const articles = await getArchiveArticles({
      issue: "winter-2025",
      category: "Markets",
      author: "maya-chen",
    });
    expect(articles.map(({ slug }) => slug)).toEqual(["reading-the-fed"]);
  });

  it("returns an empty archive result for unmatched filters", async () => {
    await expect(getArchiveArticles({ issue: "not-an-issue" })).resolves.toEqual([]);
  });
});

describe("content utilities", () => {
  const makeArticle = (overrides: Partial<Article>): Article => ({
    slug: "default",
    title: "Default article",
    dek: "A test summary.",
    category: "Markets",
    tags: [],
    authorSlugs: ["maya-chen"],
    issueSlug: "winter-2025",
    publishedAt: "2026-01-01",
    readTime: 3,
    status: "published",
    pinned: false,
    featuredImage: { src: "https://example.com/image.jpg", alt: "Test" },
    content: [{ type: "paragraph", text: "Test content." }],
    ...overrides,
  });

  it("selects the pinned article", () => {
    const articles = [
      makeArticle({ slug: "newest" }),
      makeArticle({ slug: "pinned", pinned: true }),
    ];
    expect(selectLeadArticle(articles)?.slug).toBe("pinned");
  });

  it("orders pinned articles by featured rank", () => {
    const articles = [
      makeArticle({ slug: "rank-two", pinned: true, featuredRank: 2 }),
      makeArticle({ slug: "rank-one", pinned: true, featuredRank: 1 }),
    ];
    expect(selectLeadArticle(articles)?.slug).toBe("rank-one");
  });

  it("falls back to the first article when none is pinned", () => {
    const articles = [
      makeArticle({ slug: "first" }),
      makeArticle({ slug: "second" }),
    ];
    expect(selectLeadArticle(articles)?.slug).toBe("first");
  });

  it("returns undefined for an empty article list", () => {
    expect(selectLeadArticle([])).toBeUndefined();
  });

  it("excludes drafts from public articles", () => {
    const articles = [
      makeArticle({ slug: "published", status: "published" }),
      makeArticle({ slug: "draft", status: "draft" }),
    ];
    expect(getPublicArticles(articles).map(({ slug }) => slug)).toEqual([
      "published",
    ]);
  });

  it("sorts same-date articles deterministically by slug", () => {
    const articles = [
      makeArticle({ slug: "zebra", publishedAt: "2026-01-01" }),
      makeArticle({ slug: "alpha", publishedAt: "2026-01-01" }),
    ];
    expect(getPublicArticles(articles).map(({ slug }) => slug)).toEqual([
      "alpha",
      "zebra",
    ]);
  });

  it("detects duplicate slugs once in sorted order", () => {
    expect(
      findDuplicateSlugs([
        { slug: "beta" },
        { slug: "alpha" },
        { slug: "beta" },
        { slug: "alpha" },
        { slug: "beta" },
      ]),
    ).toEqual(["alpha", "beta"]);
  });

  it("returns no duplicate slugs for unique records", () => {
    expect(findDuplicateSlugs([{ slug: "one" }, { slug: "two" }])).toEqual([]);
  });
});
