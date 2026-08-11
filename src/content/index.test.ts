import { describe, expect, it } from "vitest";
import { findDuplicateSlugs, getArticleBySlug, getArchiveArticles, getArticles, getArticlesByContributor, getPublicArticles, selectLeadArticle, type Article } from "./index";

const makeArticle = (overrides: Partial<Article>): Article => ({ slug: "default", title: "Default article", dek: "A sufficiently detailed test summary.", contributorSlugs: ["maya-chen"], publicationMonth: "2026-01", readTime: 3, status: "published", pinned: false, featuredImage: { src: "https://example.com/image.jpg", alt: "Test" }, content: [{ type: "paragraph", text: "Test content." }], sources: [], ...overrides });

describe("simplified content access", () => {
  it("looks up article slugs and rejects invalid ones", async () => { expect((await getArticleBySlug("reading-the-fed"))?.title).toContain("Reading the Fed"); await expect(getArticleBySlug("missing")).resolves.toBeUndefined(); });
  it("sorts articles newest first", async () => { const dates = (await getArticles()).map(({ publicationMonth }) => publicationMonth); expect(dates).toEqual([...dates].sort().reverse()); });
  it("lists articles by contributor", async () => { expect((await getArticlesByContributor("lena-brooks")).map(({ slug }) => slug)).toEqual(["semiconductors-and-the-geography-of-risk", "solar-club-capital-budget"]); });
  it("filters archive by contributor and school year", async () => { expect((await getArchiveArticles({ contributor: "maya-chen", schoolYear: "2025-2026" })).map(({ slug }) => slug)).toEqual(["the-new-economics-of-school-lunch", "reading-the-fed"]); });
  it("selects pinned lead and uses ranked order", () => { expect(selectLeadArticle([makeArticle({ slug: "two", pinned: true, featuredRank: 2 }), makeArticle({ slug: "one", pinned: true, featuredRank: 1 })])?.slug).toBe("one"); });
  it("excludes drafts and sorts same-date slugs deterministically", () => { expect(getPublicArticles([makeArticle({ slug: "zebra" }), makeArticle({ slug: "alpha" }), makeArticle({ slug: "draft", status: "draft" })]).map(({ slug }) => slug)).toEqual(["alpha", "zebra"]); });
  it("detects duplicate slugs", () => { expect(findDuplicateSlugs([{ slug: "b" }, { slug: "a" }, { slug: "b" }])).toEqual(["b"]); });
  it("preserves local-provider list blocks for the shared semantic renderer", async () => {
    const listBlocks = (await getArticles()).flatMap(({ content }) => content.flatMap((block) => "items" in block ? [block] : []));
    expect(listBlocks.length).toBeGreaterThan(0);
    expect(listBlocks.every(({ items }) => items.length > 0)).toBe(true);
  });
});
