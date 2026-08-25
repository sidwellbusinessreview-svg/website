import { createSchema, type OnPasteFn, type PasteData, type PortableTextInputProps } from "sanity";
import { describe, expect, it, vi } from "vitest";
import { classifyArticleClipboard, createArticlePasteHandler, plainTextToArticleBlocks, richHtmlToArticleBlocks } from "./articlePaste";

const schemaType = createSchema({
  name: "paste-test",
  types: [{
    name: "articlePasteBody",
    type: "array",
    of: [{
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }, { title: "Block quote", value: "blockquote" }],
      lists: [{ title: "Bulleted", value: "bullet" }, { title: "Numbered", value: "number" }],
      marks: {
        decorators: [{ title: "Strong", value: "strong" }, { title: "Emphasis", value: "em" }],
        annotations: [{ name: "linkAnnotation", type: "object", fields: [{ name: "href", type: "url" }] }],
      },
    }],
  }],
}).get("articlePasteBody") as PortableTextInputProps["schemaType"];

const keys = () => { let index = 0; return () => `key-${++index}`; };

function pasteData(values: { plain?: string; html?: string }): PasteData {
  return {
    event: { clipboardData: { getData: (type: string) => type === "text/html" ? values.html ?? "" : values.plain ?? "" } },
    path: [], schemaTypes: {}, value: undefined,
  } as unknown as PasteData;
}

class FixtureDataTransfer {
  private values = new Map<string, string>();
  getData(type: string) { return this.values.get(type) ?? ""; }
  setData(type: string, value: string) { this.values.set(type, value); }
}

class FixtureClipboardEvent extends Event {
  constructor(type: string, readonly clipboardData: FixtureDataTransfer) { super(type); }
}

function browserPasteData(values: { plain?: string; html?: string }): PasteData {
  const clipboardData = new FixtureDataTransfer();
  if (values.plain !== undefined) clipboardData.setData("text/plain", values.plain);
  if (values.html !== undefined) clipboardData.setData("text/html", values.html);
  return { event: new FixtureClipboardEvent("paste", clipboardData), path: [], schemaTypes: {}, value: undefined } as unknown as PasteData;
}

const inserted = (result: ReturnType<OnPasteFn>) => (result as { insert?: Array<Record<string, unknown>> } | undefined)?.insert ?? [];
const blockText = (block: Record<string, unknown>) => ((block.children as Array<{ text?: string }> | undefined) ?? []).map(({ text }) => text ?? "").join("");

describe("Article clipboard classification", () => {
  it("classifies true text-only clipboard as plain prose", () => {
    expect(classifyArticleClipboard(pasteData({ plain: "One.\n\nTwo." }))).toBe("plainProse");
  });

  it.each([
    ["PRE viewer", '<pre>Paragraph one.\n\nParagraph two with <a href="https://example.com">viewer autolink</a>.\n\nParagraph three.</pre>'],
    ["generic DIV/SPAN viewer", "<div><span>Paragraph one.<br><br>Paragraph two.<br><br>Paragraph three.</span></div>"],
  ])("classifies %s HTML as plain prose even when HTML is present", (_name, html) => {
    const data = browserPasteData({ plain: "Paragraph one.\n\nParagraph two.\n\nParagraph three.", html });
    expect(classifyArticleClipboard(data)).toBe("plainProse");
    expect(inserted(createArticlePasteHandler(schemaType)(data)).map(blockText)).toEqual(["Paragraph one.", "Paragraph two.", "Paragraph three."]);
  });

  it("classifies meaningful document HTML as rich structured", () => {
    expect(classifyArticleClipboard(pasteData({ plain: "One. Two.", html: "<p>One.</p><p><strong>Two.</strong></p>" }))).toBe("richStructured");
  });

  it("classifies an empty or unsupported clipboard safely", () => {
    expect(classifyArticleClipboard(pasteData({ html: "<div><span></span></div>" }))).toBe("emptyUnsupported");
  });
});

describe("Article plain-text paste", () => {
  it.each([
    ["single paragraph", "One paragraph.", ["One paragraph."]],
    ["three single-newline paragraphs", "First.\nSecond.\nThird.", ["First.", "Second.", "Third."]],
    ["blank lines", "First.\n\nSecond.\n\nThird.", ["First.", "Second.", "Third."]],
    ["several blank lines", "First.\n\n\n\nSecond.", ["First.", "Second."]],
    ["CRLF", "First.\r\nSecond.", ["First.", "Second."]],
    ["old Mac returns", "First.\rSecond.", ["First.", "Second."]],
    ["tabs", "First\tparagraph.\nSecond.", ["First paragraph.", "Second."]],
    ["whitespace-only lines", "First.\n \t \nSecond.", ["First.", "Second."]],
    ["markers and URLs", "Claim [1].\nhttps://example.com/a?b=1", ["Claim [1].", "https://example.com/a?b=1"]],
    ["Unicode and punctuation", "“Markets aren’t static”—they move 2–3% ($5).\nJosé’s view remains.", ["“Markets aren’t static”—they move 2–3% ($5).", "José’s view remains."]],
    ["intentional outer spaces", "  Indented wording remains.  \nNext.", ["  Indented wording remains.  ", "Next."]],
  ])("converts %s into normal paragraph blocks", (_name, input, expected) => {
    const blocks = plainTextToArticleBlocks(input, keys());
    expect(blocks.map((block) => block.children[0].text)).toEqual(expected);
    expect(blocks.every((block) => block._type === "block" && block.style === "normal")).toBe(true);
    expect(new Set(blocks.flatMap((block) => [block._key, block.children[0]._key])).size).toBe(blocks.length * 2);
  });

  it("handles an AI-Article-scale browser-viewer clipboard without collapse or duplication", () => {
    const paragraphs = Array.from({ length: 20 }, (_, index) => `Paragraph ${index + 1}: ${"synthetic migration prose ".repeat(11)}[${index + 1}].`);
    const plain = paragraphs.join("\n\n");
    const html = `<pre>${plain}</pre>`;
    expect(plain.length).toBeGreaterThan(5_000);
    const result = inserted(createArticlePasteHandler(schemaType)(pasteData({ plain, html })));
    expect(result).toHaveLength(20);
    expect(result.map(blockText)).toEqual(paragraphs);
    expect(blockText(result[10])).toContain("[11]");
  });

  it("keeps a very long line as one paragraph rather than splitting sentences", () => {
    const text = `${"One long paragraph sentence. ".repeat(180)}Final sentence.`;
    const blocks = plainTextToArticleBlocks(text, keys());
    expect(blocks).toHaveLength(1);
    expect(blocks[0].children[0].text).toBe(text);
  });

  it("returns exactly one insertion fragment for text-only or paste-without-formatting input", () => {
    const result = createArticlePasteHandler(schemaType)(pasteData({ plain: "First.\nSecond." }));
    expect(result).toEqual({ insert: expect.arrayContaining([
      expect.objectContaining({ _type: "block", children: [expect.objectContaining({ text: "First." })] }),
      expect.objectContaining({ _type: "block", children: [expect.objectContaining({ text: "Second." })] }),
    ]) });
  });

  it("falls through for an empty clipboard instead of inserting an empty block", () => {
    const fallback = vi.fn<OnPasteFn>(() => undefined);
    expect(createArticlePasteHandler(schemaType, fallback)(pasteData({ plain: " \n\t " }))).toBeUndefined();
    expect(fallback).toHaveBeenCalledOnce();
  });
});

describe("Article rich HTML paste", () => {
  it("uses schema-aware Block Tools for paragraphs, marks, links, and lists", () => {
    const html = '<p>Paragraph one with <strong>bold</strong>.</p><p>Paragraph two with <em>italic</em>.</p><ul><li>Item one</li><li>Item two</li></ul><p>Paragraph three with <a href="https://example.com">link</a>.</p>';
    const blocks = richHtmlToArticleBlocks(html, schemaType) as Array<Record<string, unknown>>;
    expect(blocks.map(blockText)).toEqual(["Paragraph one with bold.", "Paragraph two with italic.", "Item one", "Item two", "Paragraph three with link."]);
    expect(blocks[0]).toMatchObject({ children: expect.arrayContaining([expect.objectContaining({ text: "bold", marks: ["strong"] })]) });
    expect(blocks[1]).toMatchObject({ children: expect.arrayContaining([expect.objectContaining({ text: "italic", marks: ["em"] })]) });
    expect(blocks[2]).toMatchObject({ listItem: "bullet" });
    expect(blocks[3]).toMatchObject({ listItem: "bullet" });
    expect(blocks[4]).toMatchObject({ markDefs: [expect.objectContaining({ _type: "linkAnnotation", href: "https://example.com" })] });
    expect(inserted(createArticlePasteHandler(schemaType)(pasteData({ plain: "fallback text", html })))).toHaveLength(5);
  });

  it("preserves a supported block quote as its own styled block", () => {
    const blocks = richHtmlToArticleBlocks("<p>Before.</p><blockquote>Quoted analysis.</blockquote><p>After.</p>", schemaType) as Array<Record<string, unknown>>;
    expect(blocks.map(blockText)).toEqual(["Before.", "Quoted analysis.", "After."]);
    expect(blocks[1]).toMatchObject({ style: "blockquote" });
  });

  it("preserves numbered-list structure", () => {
    const blocks = richHtmlToArticleBlocks("<ol><li>First item</li><li>Second item</li></ol>", schemaType) as Array<Record<string, unknown>>;
    expect(blocks.map(blockText)).toEqual(["First item", "Second item"]);
    expect(blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ listItem: "number" }),
      expect.objectContaining({ listItem: "number" }),
    ]));
  });
});
