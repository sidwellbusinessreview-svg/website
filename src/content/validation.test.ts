import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { articles, contributors } from "./data";
import { articleContentBlockSchema } from "./schemas";
import { type ContentSource, validateContentSource } from "./validation";
const validSource = (): ContentSource => structuredClone({ articles, contributors, siteSettings: siteConfig });
const expectProblem = (change: (source: ContentSource) => void, expected: RegExp) => { const source = validSource(); change(source); expect(() => validateContentSource(source, new Date("2026-07-16T12:00:00Z"))).toThrow(expected); };
describe("runtime content validation", () => {
  it.each([{ type: "paragraph", text: "Paragraph" }, { type: "heading", level: 2, text: "Heading" }, { type: "bulletedList", items: ["Item"] }, { type: "numberedList", items: ["Item"] }, { type: "quote", text: "Quote" }, { type: "image", src: "https://example.com/a.jpg", alt: "Alt" }, { type: "callout", text: "Callout" }, { type: "divider" }, { type: "link", text: "More", href: "https://example.com", label: "Source" }])("accepts $type", (block) => expect(articleContentBlockSchema.safeParse(block).success).toBe(true));
  it("accepts rich nested list items without raw HTML", () => {
    expect(articleContentBlockSchema.safeParse({
      type: "bulletedList",
      items: [{ level: 1, content: [{ text: "Bold link", marks: ["strong"], href: "https://example.com" }] }, { level: 2, content: [{ text: "Nested" }] }],
    }).success).toBe(true);
  });
  it("accepts local content without contributor biographies", () => { const result = validateContentSource(validSource(), new Date("2026-07-16T12:00:00Z")); expect(result.articles).toHaveLength(6); expect(result.contributors).toHaveLength(4); expect(result.contributors.every((contributor) => !("bio" in contributor))).toBe(true); });
  it("keeps Contributor records free of publication-role metadata", () => { const result = validateContentSource(validSource(), new Date("2026-07-16T12:00:00Z")); expect(result.contributors.every((contributor) => !("role" in contributor))).toBe(true); });
  it("keeps local Contributor identity text-only", () => {
    const result = validateContentSource(validSource(), new Date("2026-07-16T12:00:00Z"));
    expect(result.contributors.every((contributor) => !["initials", "photo", "portrait", "image", "avatar"].some((field) => field in contributor))).toBe(true);
  });
  it("detects duplicate article and contributor slugs", () => { expectProblem((source) => source.articles.push(structuredClone(source.articles[0])), /duplicate article slug/); expectProblem((source) => source.contributors.push(structuredClone(source.contributors[0])), /duplicate contributor slug/); });
  it("detects missing contributors", () => expectProblem((source) => { source.contributors = source.contributors.slice(1); }, /missing contributor/));
  it("detects invalid, missing, and future publication months", () => { expectProblem((source) => { (source.articles[0] as { publicationMonth: string }).publicationMonth = "2026-13"; }, /YYYY-MM/); expectProblem((source) => { delete (source.articles[0] as { publicationMonth?: string }).publicationMonth; }, /publication month is required/); expectProblem((source) => { (source.articles[0] as { publicationMonth: string }).publicationMonth = "2027-01"; }, /future publication month/); });
  it("validates structured Sources and footnote references", () => {
    const source = validSource();
    Object.assign(source.articles[0] as Record<string, unknown>, { sources: [{ key: "source-a", citation: "A valid citation", url: "https://example.com/report" }], content: [{ type: "paragraph", text: "Claim.", content: [{ text: "Claim.", sourceKey: "source-a" }] }] });
    expect(() => validateContentSource(source, new Date("2026-07-16T12:00:00Z"))).not.toThrow();
    (source.articles[0] as { sources: Array<{ key: string }> }).sources[0].key = "different";
    expect(() => validateContentSource(source, new Date("2026-07-16T12:00:00Z"))).toThrow(/does not exist/);
  });
  it("rejects duplicate source keys, blank citations, and non-HTTP source URLs", () => {
    expectProblem((source) => { (source.articles[0] as Record<string, unknown>).sources = [{ key: "same", citation: "One" }, { key: "same", citation: "Two" }]; }, /source keys must be unique/);
    expectProblem((source) => { (source.articles[0] as Record<string, unknown>).sources = [{ key: "blank", citation: "" }]; }, /citation/);
    expectProblem((source) => { (source.articles[0] as Record<string, unknown>).sources = [{ key: "unsafe", citation: "Citation", url: "javascript:alert(1)" }]; }, /must use http or https/);
  });
  it("detects missing required values and image alt text", () => { expectProblem((source) => { delete (source.articles[0] as { title?: string }).title; }, /articles\[0\]\.title/); expectProblem((source) => { (source.articles[0] as { featuredImage: { alt: string } }).featuredImage.alt = ""; }, /alt text is required/); });
  it("detects multiple pinned articles", () => expectProblem((source) => { (source.articles[1] as { pinned: boolean }).pinned = true; }, /multiple published lead/));
});
