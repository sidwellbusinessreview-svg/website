import { describe, expect, it, vi } from "vitest";
import type { SanityClient } from "next-sanity";
import { createSanityContentProvider } from "./provider";

const contributor = { slug: "preview-person", name: "Preview Person" };
const article = (title: string) => ({
  slug: "draft-story",
  title,
  summary: "A complete draft summary used to verify isolated preview behavior.",
  publicationDate: "2026-07-23",
  contributors: [contributor],
  body: [{ _type: "block", style: "normal", children: [{ _type: "span", text: "Draft body", marks: [] }] }],
});

describe("draft provider isolation", () => {
  it("can adapt a draft-only Article while the published provider returns not found", async () => {
    const draft = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(article("Draft-only Article")) } as unknown as SanityClient, "drafts");
    const published = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(null) } as unknown as SanityClient);
    await expect(draft.getArticleBySlug("draft-story")).resolves.toMatchObject({ title: "Draft-only Article" });
    await expect(published.getArticleBySlug("draft-story")).resolves.toBeUndefined();
  });

  it("keeps the old public version separate from unpublished Article changes", async () => {
    const draft = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(article("Unpublished new title")) } as unknown as SanityClient, "drafts");
    const published = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue(article("Published old title")) } as unknown as SanityClient);
    await expect(draft.getArticleBySlug("draft-story")).resolves.toMatchObject({ title: "Unpublished new title" });
    await expect(published.getArticleBySlug("draft-story")).resolves.toMatchObject({ title: "Published old title" });
  });

  it("uses uncached draft results for About and Site Settings", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({
        title: "Draft About",
        slug: "about",
        body: [{ _type: "block", style: "normal", children: [{ _type: "span", text: "Draft mission", marks: [] }] }],
        editorsInChief: [], editors: [], facultyAdviser: [],
      })
      .mockResolvedValueOnce({
        publicationName: "Draft Publication",
        shortName: "DP",
        affiliationText: "Draft affiliation",
        tagline: "Draft tagline",
        contactLabel: "Contact",
        contactTarget: "editors@example.com",
      });
    const provider = createSanityContentProvider({ fetch } as unknown as SanityClient, "drafts");
    await expect(provider.getStaticPageBySlug("about")).resolves.toMatchObject({ title: "Draft About" });
    await expect(provider.getSiteSettings()).resolves.toMatchObject({ name: "Draft Publication" });
    expect(fetch.mock.calls.every((call) => call[2].cache === "no-store")).toBe(true);
  });

  it("routes a complete draft-only Article by its clean slug", async () => {
    const draftOnly = article("Draft-only Article");
    const fetch = vi.fn().mockResolvedValue({
      ...draftOnly,
      subtitle: "Tiny",
      summary: "A complete required summary for the draft-only Article.",
    });
    const provider = createSanityContentProvider({ fetch } as unknown as SanityClient, "drafts");
    await expect(provider.getArticleBySlug("draft-story")).resolves.toMatchObject({
      slug: "draft-story",
      dek: "A complete required summary for the draft-only Article.",
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "draft-story" },
      expect.objectContaining({ perspective: "drafts", useCdn: false, cache: "no-store" }),
    );
  });

  it("preserves month precision in Preview", async () => {
    const provider = createSanityContentProvider({ fetch: vi.fn().mockResolvedValue({ ...article("Month Article"), publicationDate: "2025-03-01", publicationDatePrecision: "month" }) } as unknown as SanityClient, "drafts");
    await expect(provider.getArticleBySlug("draft-story")).resolves.toMatchObject({ publishedAt: "2025-03-01", publicationDatePrecision: "month" });
  });
});
