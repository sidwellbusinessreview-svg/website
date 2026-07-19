import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { articles, contributors } from "./data";
import { articleContentBlockSchema } from "./schemas";
import { type ContentSource, validateContentSource } from "./validation";
const validSource = (): ContentSource => structuredClone({ articles, contributors, siteSettings: siteConfig });
const expectProblem = (change: (source: ContentSource) => void, expected: RegExp) => { const source = validSource(); change(source); expect(() => validateContentSource(source, new Date("2026-07-16T12:00:00Z"))).toThrow(expected); };
describe("runtime content validation", () => {
  it.each([{ type: "paragraph", text: "Paragraph" }, { type: "heading", level: 2, text: "Heading" }, { type: "bulletedList", items: ["Item"] }, { type: "numberedList", items: ["Item"] }, { type: "quote", text: "Quote" }, { type: "pullQuote", text: "Pull quote" }, { type: "image", src: "https://example.com/a.jpg", alt: "Alt" }, { type: "callout", text: "Callout" }, { type: "divider" }, { type: "link", text: "More", href: "https://example.com", label: "Source" }])("accepts $type", (block) => expect(articleContentBlockSchema.safeParse(block).success).toBe(true));
  it("accepts local content without contributor biographies", () => { const result = validateContentSource(validSource(), new Date("2026-07-16T12:00:00Z")); expect(result.articles).toHaveLength(6); expect(result.contributors).toHaveLength(4); expect(result.contributors.every((contributor) => !("bio" in contributor))).toBe(true); });
  it("keeps local Contributor identity text-only", () => {
    const result = validateContentSource(validSource(), new Date("2026-07-16T12:00:00Z"));
    expect(result.contributors.every((contributor) => !["initials", "photo", "portrait", "image", "avatar"].some((field) => field in contributor))).toBe(true);
  });
  it("detects duplicate article and contributor slugs", () => { expectProblem((source) => source.articles.push(structuredClone(source.articles[0])), /duplicate article slug/); expectProblem((source) => source.contributors.push(structuredClone(source.contributors[0])), /duplicate contributor slug/); });
  it("detects missing contributors", () => expectProblem((source) => { source.contributors = source.contributors.slice(1); }, /missing contributor/));
  it("detects invalid and future dates", () => { expectProblem((source) => { (source.articles[0] as { publishedAt: string }).publishedAt = "2026-02-31"; }, /valid calendar date/); expectProblem((source) => { (source.articles[0] as { publishedAt: string }).publishedAt = "2027-01-01"; }, /future publication date/); });
  it("detects missing required values and image alt text", () => { expectProblem((source) => { delete (source.articles[0] as { title?: string }).title; }, /articles\[0\]\.title/); expectProblem((source) => { (source.articles[0] as { featuredImage: { alt: string } }).featuredImage.alt = ""; }, /alt text is required/); });
  it("detects multiple pinned articles", () => expectProblem((source) => { (source.articles[1] as { pinned: boolean }).pinned = true; }, /multiple published lead/));
});
