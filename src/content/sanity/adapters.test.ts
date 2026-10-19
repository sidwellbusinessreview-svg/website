import { describe, expect, it, vi } from "vitest";
import { getArticleValidationFailures, mapArticle, mapContributor, mapPortableText, mapSiteSettings, mapStaticPage } from "./adapters";

const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: text, text, marks });
const paragraph = (text: string, overrides = {}) => ({ _type: "block", _key: text, style: "normal", children: [span(text)], markDefs: [], ...overrides });
const contributor = { slug: "maya-chen", name: "Maya Chen", graduationYear: 2027, active: true };
const rawArticle = (overrides = {}) => ({
  slug: "cms-test", title: "CMS Test Article", summary: "A sufficiently complete summary for the public article card.",
  publicationMonth: "2026-05", pinned: false, contributors: [contributor], body: [paragraph("A complete paragraph of test article content for adapter verification.")], ...overrides,
});
const stega = (value: string) => `${value}\u200b\u200c\u200d\ufeff\u200b\u200c\u200d\ufeff`;

describe("Sanity domain adapters", () => {
  it("maps published Article and Contributor records into the existing domain", () => {
    expect(mapContributor(contributor)).toEqual({ slug: "maya-chen", name: "Maya Chen", grade: "Class of 2027" });
    expect(mapArticle(rawArticle())).toMatchObject({ slug: "cms-test", contributorSlugs: ["maya-chen"], status: "published" });
  });
  it("uses publicationMonth and supports transitional legacy publicationDate", () => {
    expect(mapArticle(rawArticle())).toMatchObject({ publicationMonth: "2026-05" });
    expect(mapArticle(rawArticle({ publicationMonth: undefined, publicationDate: "2024-11-19" }))).toMatchObject({ publicationMonth: "2024-11" });
  });
  it("keeps featured images when alt text is omitted and preserves their separate metadata", () => {
    const raw = rawArticle({
      featuredImage: {
        asset: { url: "https://cdn.sanity.io/images/example/image/test.jpg", metadata: { dimensions: { width: 1600, height: 900 } } },
        hotspot: { x: 0.4, y: 0.6 },
        crop: { top: 0.1, right: 0.2, bottom: 0.1, left: 0.05 },
      },
      featuredImageCaption: "A caption for readers.",
      featuredImageCredit: "Photo by the Review.",
    });
    expect(getArticleValidationFailures(raw)).toEqual([]);
    expect(mapArticle(raw)?.featuredImage).toMatchObject({
      src: "https://cdn.sanity.io/images/example/image/test.jpg",
      alt: "",
      width: 1600,
      height: 900,
      hotspot: { x: 0.4, y: 0.6 },
      crop: { top: 0.1, right: 0.2, bottom: 0.1, left: 0.05 },
      caption: "A caption for readers.",
      credit: "Photo by the Review.",
    });
    const imageWithoutCaption = mapArticle(rawArticle({ featuredImage: { asset: { url: "https://cdn.sanity.io/images/example/image/no-caption.jpg" } } }))?.featuredImage;
    expect(imageWithoutCaption).toMatchObject({ alt: "" });
    expect(imageWithoutCaption).not.toHaveProperty("caption");
    expect(imageWithoutCaption).not.toHaveProperty("credit");
  });
  it("does not weaken required alt text for inline editorial images", () => {
    expect(mapPortableText([{
      _type: "editorialImage",
      asset: { url: "https://cdn.sanity.io/images/example/image/body.jpg" },
    }])).toEqual([]);
  });
  it("maps cursor-inserted inline footnotes without storing a visible number", () => {
    const mapped = mapArticle(rawArticle({
      sources: [{ key: "report", citation: "Researcher, “Report.”", url: "https://example.com/report" }],
      body: [paragraph("Supported claim.", { children: [span("Supported claim."), { _type: "footnoteReference", _key: "fn", sourceKey: "report" }] })],
    }));
    expect(mapped).toMatchObject({ sources: [{ key: "report", citation: "Researcher, “Report.”" }], content: [{ type: "paragraph", content: [{ text: "Supported claim." }, { text: "", sourceKey: "report" }] }] });
    expect(JSON.stringify(mapped?.content)).not.toContain('"number"');
  });
  it("maps footnotes in bulleted and numbered list items", () => {
    const body = mapPortableText([
      paragraph("Bullet.", { listItem: "bullet", children: [span("Bullet."), { _type: "footnoteReference", _key: "one", sourceKey: "report" }] }),
      paragraph("Numbered.", { listItem: "number", children: [span("Numbered."), { _type: "footnoteReference", _key: "two", sourceKey: "report" }] }),
    ]);
    expect(body).toMatchObject([
      { type: "bulletedList", items: [{ content: [{ text: "Bullet." }, { text: "", sourceKey: "report" }] }] },
      { type: "numberedList", items: [{ content: [{ text: "Numbered." }, { text: "", sourceKey: "report" }] }] },
    ]);
  });
  it("maps a Portable Text Block quote with inline emphasis and a normal footnote", () => {
    expect(mapPortableText([paragraph("Quoted evidence.", {
      style: "blockquote",
      children: [span("Quoted ", ["em"]), span("evidence."), { _type: "footnoteReference", _key: "quote-source", sourceKey: "report" }],
    })])).toEqual([{ type: "quote", text: "Quoted evidence.", content: [{ text: "Quoted ", marks: ["em"] }, { text: "evidence." }, { text: "", sourceKey: "report" }] }]);
  });
  it("maps a cited Callout", () => {
    expect(mapPortableText([
      { _type: "callout", title: "Context", body: [paragraph("Callout body")], sourceKey: "report" },
    ])).toEqual([
      { type: "callout", title: "Context", text: "Callout body", sourceKey: "report" },
    ]);
  });
  it("rejects broken Callout Sources publicly", () => {
    const raw = rawArticle({ body: [{ _type: "callout", body: [paragraph("Callout body")], sourceKey: "gone" }] });
    expect(mapArticle(raw)).toBeUndefined();
    expect(mapArticle(raw, { allowBrokenFootnotes: true })).toBeDefined();
  });
  it("rejects broken footnotes publicly but preserves a safe Preview fallback", () => {
    const raw = rawArticle({ body: [paragraph("Broken claim.", { children: [span("Broken claim."), { _type: "footnoteReference", _key: "fn", sourceKey: "missing" }] })] });
    expect(mapArticle(raw)).toBeUndefined();
    expect(mapArticle(raw, { allowBrokenFootnotes: true })?.content[0]).toMatchObject({ content: expect.arrayContaining([{ text: "", sourceKey: "missing" }]) });
  });
  it("does not silently drop an inline footnote with a missing source selection", () => {
    const raw = rawArticle({ body: [paragraph("Broken claim.", { children: [span("Broken claim."), { _type: "footnoteReference", _key: "fn" }] })] });
    expect(getArticleValidationFailures(raw)).toEqual(expect.arrayContaining([expect.stringContaining("footnote source __missing_source__ does not exist")]));
    expect(mapArticle(raw)).toBeUndefined();
    expect(mapArticle(raw, { allowBrokenFootnotes: true })).toBeDefined();
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
      publicationMonth: stega("2026-05"),
      contributors: [encodedContributor],
      body: [paragraph(stega("A complete paragraph of test article content for adapter verification."))],
    });
    const mapped = mapArticle(encoded);
    expect(getArticleValidationFailures(encoded)).toEqual([]);
    expect(mapped).toMatchObject({
      slug: "cms-test",
      title: expect.stringContaining("\u200b"),
      contributorSlugs: ["maya-chen"],
      publicationMonth: "2026-05",
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
      homepagePurposeQuote: stega("Good business writing clarifies choices."),
      homepagePurposeText: stega("We examine decisions shaping business and economics."),
    });
    expect(settings).toMatchObject({
      name: "Preview Publication",
      tagline: expect.stringContaining("\u200b"),
      contact: { email: "editors@example.com" },
      socialLinks: [{ href: "https://example.com" }],
      homepagePurposeQuote: expect.stringContaining("\u200b"),
      homepagePurposeText: expect.stringContaining("\u200b"),
      logo: { mode: "text" },
    });
  });
  it("fails closed when a required Contributor reference is missing", () => expect(mapArticle(rawArticle({ contributors: [null] }))).toBeUndefined());
  it("provides actionable developer diagnostics for invalid published records", () => {
    expect(getArticleValidationFailures(rawArticle({ contributors: [], summary: "short", body: [] }))).toEqual(expect.arrayContaining([
      expect.stringContaining("contributors"), expect.stringContaining("dek"), expect.stringContaining("content"),
    ]));
  });
  it("maps headings, lists, quotes, images, callouts, dividers, and whole-block links", () => {
    const body = mapPortableText([
      paragraph("Heading", { style: "h2" }),
      paragraph("One", { listItem: "bullet" }), paragraph("Two", { listItem: "bullet" }),
      paragraph("Quoted", { style: "blockquote" }),
      { _type: "editorialImage", asset: { url: "https://cdn.sanity.io/images/a/b/image.jpg", metadata: { dimensions: { width: 1200, height: 800 } } }, altText: "A chart", caption: "Caption", credit: "Credit", hotspot: { x: .4, y: .6 } },
      { _type: "callout", title: "Context", body: [paragraph("Callout body")] }, { _type: "divider" },
      paragraph("Source", { children: [span("Source", ["link"])], markDefs: [{ _key: "link", href: "https://example.com" }] }),
    ]);
    expect(body.map(({ type }) => type)).toEqual(["heading", "bulletedList", "quote", "image", "callout", "divider", "link"]);
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
    expect(mapStaticPage({ aboutTitle: "About", aboutBody: [paragraph("Mission statement")], editorsInChief: [{ contributor, displayedRole: "Editor-in-Chief" }] }))
      .toMatchObject({ slug: "about", staff: { editorsInChief: [{ contributorSlug: "maya-chen", displayedRole: "Editor-in-Chief" }] } });
  });
});
