import { describe, expect, it, vi } from "vitest";
import { getArticleValidationFailures, mapArticle, mapContributor, mapPortableText, mapSiteSettings, mapStaticPage } from "./adapters";

const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: text, text, marks });
const paragraph = (text: string, overrides = {}) => ({ _type: "block", _key: text, style: "normal", children: [span(text)], markDefs: [], ...overrides });
const contributor = { slug: "maya-chen", name: "Maya Chen", role: "Editor", graduationYear: 2027, active: true };
const rawArticle = (overrides = {}) => ({
  slug: "cms-test", title: "CMS Test Article", summary: "A sufficiently complete summary for the public article card.",
  publicationDate: "2026-05-01", pinned: false, contributors: [contributor], body: [paragraph("A complete paragraph of test article content for adapter verification.")], ...overrides,
});
const stega = (value: string) => `${value}\u200b\u200c\u200d\ufeff\u200b\u200c\u200d\ufeff`;

describe("Sanity domain adapters", () => {
  it("maps published Article and Contributor records into the existing domain", () => {
    expect(mapContributor(contributor)).toEqual({ slug: "maya-chen", name: "Maya Chen", role: "Editor", grade: "Class of 2027" });
    expect(mapArticle(rawArticle())).toMatchObject({ slug: "cms-test", contributorSlugs: ["maya-chen"], status: "published" });
  });
  it("preserves month precision and defaults legacy records to day precision", () => {
    expect(mapArticle(rawArticle({ publicationDatePrecision: "month" }))).toMatchObject({ publicationDatePrecision: "month", publishedAt: "2026-05-01" });
    expect(mapArticle(rawArticle())).toMatchObject({ publicationDatePrecision: "day", publishedAt: "2026-05-01" });
  });
  it("uses the required summary for cards and routing instead of an optional short subtitle", () => {
    expect(mapArticle(rawArticle({
      subtitle: "Tiny",
      summary: "A complete required summary that remains valid for preview cards.",
    }))).toMatchObject({
      dek: "A complete required summary that remains valid for preview cards.",
    });
  });
  it("validates semantic content while preserving stega on visible preview fields", () => {
    const encodedContributor = { ...contributor, slug: stega(contributor.slug), name: stega(contributor.name) };
    const encoded = rawArticle({
      slug: stega("cms-test"),
      title: stega("CMS Test Article"),
      summary: stega("A sufficiently complete summary for the public article card."),
      publicationDate: stega("2026-05-01"),
      contributors: [encodedContributor],
      body: [paragraph(stega("A complete paragraph of test article content for adapter verification."))],
    });
    const mapped = mapArticle(encoded);
    expect(getArticleValidationFailures(encoded)).toEqual([]);
    expect(mapped).toMatchObject({
      slug: "cms-test",
      title: expect.stringContaining("\u200b"),
      contributorSlugs: ["maya-chen"],
      publishedAt: "2026-05-01",
    });
    expect(mapped?.content[0]).toMatchObject({ text: expect.stringContaining("\u200b") });
    expect(mapContributor(encodedContributor)).toMatchObject({ slug: "maya-chen", name: expect.stringContaining("\u200b") });
  });
  it("keeps stega out of routing, URLs, and strict settings validation", () => {
    const settings = mapSiteSettings({
      publicationName: stega("Preview Publication"),
      shortName: stega("PP"),
      description: stega("A sufficiently detailed preview publication description."),
      affiliationText: stega("A school publication"),
      tagline: stega("Business reporting"),
      contactLabel: stega("Contact"),
      contactTarget: stega("editors@example.com"),
      socialLinks: [{ label: stega("Social"), url: stega("https://example.com") }],
    });
    expect(settings).toMatchObject({
      name: "Preview Publication",
      tagline: expect.stringContaining("\u200b"),
      contact: { email: "editors@example.com" },
      socialLinks: [{ href: "https://example.com" }],
      logo: { mode: "text" },
    });
  });
  it("fails closed when a required Contributor reference is missing", () => expect(mapArticle(rawArticle({ contributors: [null] }))).toBeUndefined());
  it("provides actionable developer diagnostics for invalid published records", () => {
    expect(getArticleValidationFailures(rawArticle({ contributors: [], summary: "short", body: [] }))).toEqual(expect.arrayContaining([
      expect.stringContaining("contributors"), expect.stringContaining("dek"), expect.stringContaining("content"),
    ]));
  });
  it("maps headings, lists, quotes, pull quotes, images, callouts, dividers, and whole-block links", () => {
    const body = mapPortableText([
      paragraph("Heading", { style: "h2" }),
      paragraph("One", { listItem: "bullet" }), paragraph("Two", { listItem: "bullet" }),
      paragraph("Quoted", { style: "blockquote" }),
      { _type: "pullQuote", text: "A pull quote long enough to use." },
      { _type: "editorialImage", asset: { url: "https://cdn.sanity.io/images/a/b/image.jpg", metadata: { dimensions: { width: 1200, height: 800 } } }, altText: "A chart", caption: "Caption", credit: "Credit", hotspot: { x: .4, y: .6 } },
      { _type: "callout", title: "Context", body: [paragraph("Callout body")] }, { _type: "divider" },
      paragraph("Source", { children: [span("Source", ["link"])], markDefs: [{ _key: "link", href: "https://example.com" }] }),
    ]);
    expect(body.map(({ type }) => type)).toEqual(["heading", "bulletedList", "quote", "pullQuote", "image", "callout", "divider", "link"]);
    expect(body.find(({ type }) => type === "image")).toMatchObject({ width: 1200, height: 800, hotspot: { x: .4, y: .6 } });
  });
  it("groups consecutive list blocks and preserves levels, decorators, and links", () => {
    const body = mapPortableText([
      paragraph("Before"),
      paragraph("Bold link", {
        listItem: "bullet",
        level: 1,
        children: [span("Bold ", ["strong"]), span("link", ["external"])],
        markDefs: [{ _key: "external", href: "https://example.com/report" }],
      }),
      paragraph("Nested", { listItem: "bullet", level: 2 }),
      paragraph("After"),
    ]);
    expect(body.map(({ type }) => type)).toEqual(["paragraph", "bulletedList", "paragraph"]);
    expect(body[1]).toEqual({
      type: "bulletedList",
      items: [
        { level: 1, content: [{ text: "Bold ", marks: ["strong"] }, { text: "link", href: "https://example.com/report" }] },
        { level: 2, content: [{ text: "Nested" }] },
      ],
    });
  });
  it("keeps numbered lists separate from adjacent bullet lists", () => {
    expect(mapPortableText([
      paragraph("Bullet", { listItem: "bullet" }),
      paragraph("First", { listItem: "number" }),
      paragraph("Second", { listItem: "number" }),
    ])).toEqual([
      { type: "bulletedList", items: [{ level: 1, content: [{ text: "Bullet" }] }] },
      { type: "numberedList", items: [{ level: 1, content: [{ text: "First" }] }, { level: 1, content: [{ text: "Second" }] }] },
    ]);
  });
  it("warns in development and safely ignores unknown blocks", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(mapPortableText([{ _type: "unknown" }])).toEqual([]);
    expect(warning).toHaveBeenCalled(); warning.mockRestore();
  });
  it("maps static About staff references without provider shapes leaking", () => {
    expect(mapStaticPage({ slug: "about", title: "About", body: [paragraph("Mission statement")], editorsInChief: [{ contributor, displayedRole: "Editor-in-Chief" }] }))
      .toMatchObject({ slug: "about", staff: { editorsInChief: [{ contributorSlug: "maya-chen", displayedRole: "Editor-in-Chief" }] } });
  });
});
