import { describe, expect, it, vi } from "vitest";
import type { SanityClient } from "next-sanity";
import { ContentProviderError } from "../provider";
import { createSanityContentProvider, getSanityContentProvider } from "./provider";

vi.mock("@/sanity/lib/client", () => ({ getPublicSanityClient: () => null }));

const article = { slug: "test", title: "Published Test", summary: "A sufficiently complete published summary for testing.", publicationDate: "2026-01-01", contributors: [{ slug: "person", name: "Person" }], body: [{ _type: "block", style: "normal", children: [{ _type: "span", text: "Body content", marks: [] }] }] };

describe("Sanity content provider", () => {
  it("uses newest Article when no valid pinned Article exists", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce([article]);
    const provider = createSanityContentProvider({ fetch } as unknown as SanityClient);
    await expect(provider.getPinnedArticle()).resolves.toMatchObject({ slug: "test" });
  });
  it("returns undefined for not-found slugs", async () => {
    const provider = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(null) } as unknown as SanityClient);
    await expect(provider.getArticleBySlug("missing")).resolves.toBeUndefined();
  });
  it("converts query failure into a controlled public error", async () => {
    const provider = createSanityContentProvider({ fetch: vi.fn().mockRejectedValue(new Error("private detail")) } as unknown as SanityClient);
    await expect(provider.getArticles()).rejects.toBeInstanceOf(ContentProviderError);
  });
  it("never supplies a token or draft perspective through provider fetch options", async () => {
    const fetch = vi.fn().mockResolvedValue([]); const provider = createSanityContentProvider({ fetch } as unknown as SanityClient);
    await provider.getArticles();
    expect(fetch.mock.calls[0][2]).toEqual({ next: { revalidate: 300, tags: ["content", "articles"] } });
    expect(JSON.stringify(fetch.mock.calls[0][2])).not.toMatch(/token|perspective/);
  });
  it("applies shared Article and Contributor relationship tags to every dependent query", async () => {
    const fetch = vi.fn().mockResolvedValue([]);
    const provider = createSanityContentProvider({ fetch } as unknown as SanityClient);
    await provider.getArticleBySlug("test");
    await provider.getLatestArticles();
    await provider.getArticlesByContributor("person");
    await provider.getContributorBySlug("person");
    await provider.searchArticles("Published");
    await provider.getStaticPageBySlug("about");
    const cacheOptions = fetch.mock.calls.map((call) => call[2]);
    expect(cacheOptions).toEqual(expect.arrayContaining([
      { next: { revalidate: 300, tags: ["content", "articles", "article:test"] } },
      { next: { revalidate: 300, tags: ["content", "articles", "latest"] } },
      { next: { revalidate: 300, tags: ["content", "articles", "contributors", "contributor-articles:person"] } },
      { next: { revalidate: 300, tags: ["content", "contributors", "contributor:person"] } },
      { next: { revalidate: 300, tags: ["content", "articles", "contributors", "search"] } },
      { next: { revalidate: 300, tags: ["content", "pages", "page:about"] } },
    ]));
  });
  it("fails clearly instead of falling back when Sanity configuration is missing", () => {
    expect(() => getSanityContentProvider()).toThrow(/CONTENT_SOURCE=sanity/);
  });
  it("uses safe application settings when optional CMS settings are missing", async () => {
    const provider = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(null) } as unknown as SanityClient);
    await expect(provider.getSiteSettings()).resolves.toMatchObject({ name: "Sidwell Business Review" });
  });
});
