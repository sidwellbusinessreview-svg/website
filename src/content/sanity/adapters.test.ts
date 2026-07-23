import { describe, expect, it, vi } from "vitest";
import { getArticleValidationFailures, mapArticle, mapContributor, mapPortableText, mapStaticPage } from "./adapters";

const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: text, text, marks });
const paragraph = (text: string, overrides = {}) => ({ _type: "block", _key: text, style: "normal", children: [span(text)], markDefs: [], ...overrides });
const contributor = { slug: "maya-chen", name: "Maya Chen", role: "Editor", graduationYear: 2027, active: true };
const rawArticle = (overrides = {}) => ({
  slug: "cms-test", title: "CMS Test Article", summary: "A sufficiently complete summary for the public article card.",
  publicationDate: "2026-05-01", pinned: false, contributors: [contributor], body: [paragraph("A complete paragraph of test article content for adapter verification.")], ...overrides,
});

describe("Sanity domain adapters", () => {
  it("maps published Article and Contributor records into the existing domain", () => {
    expect(mapContributor(contributor)).toEqual({ slug: "maya-chen", name: "Maya Chen", role: "Editor", grade: "Class of 2027" });
    expect(mapArticle(rawArticle())).toMatchObject({ slug: "cms-test", contributorSlugs: ["maya-chen"], status: "published" });
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
