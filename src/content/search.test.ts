import { describe, expect, it } from "vitest";
import type { Article, Contributor } from "./types";
import { searchPublicArticles } from "./search";
const contributors: Contributor[] = [{ slug: "maya-chen", name: "Maya Chen" }];
const article = (overrides: Partial<Article> = {}): Article => ({ slug: "market-signals", title: "How Markets Read Signals", dek: "A practical guide to interpreting policy and market information.", contributorSlugs: ["maya-chen"], publicationMonth: "2026-05", readTime: 5, status: "published", pinned: false, featuredImage: { src: "https://example.com/image.jpg", alt: "Chart lines" }, content: [{ type: "paragraph", text: "Interest rates shape borrowing decisions." }], sources: [], ...overrides });
describe("article search", () => {
  it.each([["title", "markets"], ["summary", "interpreting policy"], ["contributor", "MAYA CHEN"], ["body", "borrowing decisions"]])("matches %s case-insensitively", (_field, query) => { expect(searchPublicArticles([article()], contributors, query)[0]?.article.slug).toBe("market-signals"); });
  it("ranks headline above body matches", () => { expect(searchPublicArticles([article({ slug: "headline", title: "Interest Rates Explained" }), article({ slug: "body", title: "A Different Topic" })], contributors, "interest rates").map(({ article }) => article.slug)).toEqual(["headline", "body"]); });
  it("returns no empty, unmatched, or draft results", () => { expect(searchPublicArticles([article()], contributors, "")).toEqual([]); expect(searchPublicArticles([article()], contributors, "volcano")).toEqual([]); expect(searchPublicArticles([article({ status: "draft" })], contributors, "markets")).toEqual([]); });
});
