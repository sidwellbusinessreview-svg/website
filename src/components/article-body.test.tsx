import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ArticleContentBlock } from "@/content";
import { ArticleBody } from "./article-body";

describe("ArticleBody", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  it.each([
    ["paragraph", { type: "paragraph", text: "Paragraph copy" }, "Paragraph copy"],
    ["level-two heading", { type: "heading", level: 2, text: "Section heading" }, "Section heading"],
    ["level-three heading", { type: "heading", level: 3, text: "Subheading" }, "Subheading"],
    ["bulleted list", { type: "bulletedList", items: ["First bullet", "Second bullet"] }, "First bullet"],
    ["numbered list", { type: "numberedList", items: ["First step", "Second step"] }, "First step"],
    ["block quote", { type: "quote", text: "Quoted analysis", attribution: "SBR" }, "Quoted analysis"],
    ["callout", { type: "callout", title: "What to watch", text: "Callout copy" }, "Callout copy"],
    ["link", { type: "link", text: "Read more.", href: "https://example.com", label: "Source" }, "Source"],
  ] satisfies Array<[string, ArticleContentBlock, string]>)(
    "renders a %s block",
    (_name, block, expectedText) => {
      render(<ArticleBody blocks={[block]} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    },
  );

  it("renders a divider", () => {
    const { container } = render(<ArticleBody blocks={[{ type: "divider" }]} />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("renders a separate sequential Note and backlink for every repeated Source occurrence", () => {
    const { container } = render(<ArticleBody
      blocks={[{ type: "paragraph", text: "First claim. Second claim.", content: [{ text: "First claim.", sourceKey: "report" }, { text: " Second claim.", sourceKey: "report" }] }]}
      sources={[{ key: "report", citation: "Researcher, “A useful report.”", url: "https://example.com/report" }]}
    />);
    expect(container.querySelectorAll("sup.footnote-ref")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Footnote 1" })).toHaveAttribute("href", "#note-1");
    expect(screen.getByRole("link", { name: "Footnote 2" })).toHaveAttribute("href", "#note-2");
    expect(screen.getByText("Notes").closest("summary")).toHaveTextContent("Notes (2)");
    expect(container.querySelector(".article-notes details")).not.toHaveAttribute("open");
    expect(screen.getAllByRole("link", { name: "Researcher, “A useful report.”" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Back to footnote 1" })).toHaveAttribute("href", "#note-ref-1");
    expect(screen.getByRole("link", { name: "Back to footnote 2" })).toHaveAttribute("href", "#note-ref-2");
    expect(container.querySelectorAll(".article-notes li")).toHaveLength(2);
  });

  it("numbers paragraph, list, Block quote, and callout occurrences in reading order", () => {
    const { container } = render(<ArticleBody
      blocks={[
        { type: "paragraph", text: "Opening.", content: [{ text: "Opening.", sourceKey: "second" }] },
        { type: "bulletedList", items: [{ level: 1, content: [{ text: "List claim", sourceKey: "first" }] }] },
        { type: "quote", text: "Quoted claim", content: [{ text: "Quoted claim", sourceKey: "first" }], attribution: "Student researcher" },
        { type: "callout", title: "Context", text: "Callout claim", sourceKey: "second" },
      ]}
      sources={[{ key: "first", citation: "First source" }, { key: "second", citation: "Second source" }]}
    />);
    expect(container.querySelectorAll("sup.footnote-ref")).toHaveLength(4);
    expect([...container.querySelectorAll("sup.footnote-ref")].map(({ textContent }) => textContent)).toEqual(["1", "2", "3", "4"]);
    expect([...container.querySelectorAll(".article-notes li")].map(({ textContent }) => textContent?.replace("↩", "").trim())).toEqual(["Second source", "First source", "First source", "Second source"]);
    expect(screen.getByText("— Student researcher")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to footnote 4" })).toHaveAttribute("href", "#note-ref-4");
  });

  it("renders a normal Block quote with inline formatting and a normal footnote", () => {
    const { container } = render(<ArticleBody
      blocks={[{ type: "quote", text: "Quoted evidence.", content: [{ text: "Quoted ", marks: ["em"] }, { text: "evidence.", sourceKey: "report" }] }]}
      sources={[{ key: "report", citation: "Research report" }]}
    />);
    expect(container.querySelector("blockquote em")).toHaveTextContent("Quoted");
    expect(container.querySelector("blockquote")?.innerHTML).toContain('evidence.<sup class="footnote-ref">');
    expect(screen.getByRole("link", { name: "Footnote 1" })).toHaveAttribute("href", "#note-1");
  });

  it("renders adjacent list footnotes without exposing internal Source keys", () => {
    const { container } = render(<ArticleBody
      blocks={[{ type: "numberedList", items: [{ level: 1, content: [{ text: "Claim" }, { text: "", sourceKey: "one" }, { text: "", sourceKey: "two" }] }] }]}
      sources={[{ key: "one", citation: "One" }, { key: "two", citation: "Two" }]}
    />);
    expect(container.querySelector("li")?.textContent).toBe("Claim12");
    expect(container).not.toHaveTextContent("one");
  });

  it("keeps public numbering and Source identities stable when Sources are reordered", () => {
    const blocks: ArticleContentBlock[] = [{ type: "paragraph", text: "A. B.", content: [{ text: "A.", sourceKey: "a" }, { text: " B.", sourceKey: "b" }] }];
    const { rerender } = render(<ArticleBody blocks={blocks} sources={[{ key: "a", citation: "Source A" }, { key: "b", citation: "Source B" }]} />);
    expect(screen.getByText("Source A").closest("li")).toHaveAttribute("id", "note-1");
    rerender(<ArticleBody blocks={blocks} sources={[{ key: "b", citation: "Source B" }, { key: "a", citation: "Source A edited" }]} />);
    expect(screen.getByText("Source A edited").closest("li")).toHaveAttribute("id", "note-1");
    expect(screen.getByRole("link", { name: "Footnote 1" })).toBeInTheDocument();
  });

  it("renders a cursor-inserted footnote directly after punctuation with no whitespace gap", () => {
    const { container } = render(<ArticleBody
      blocks={[{ type: "paragraph", text: "Sentence.", content: [{ text: "Sentence. " }, { text: "", sourceKey: "source" }] }]}
      sources={[{ key: "source", citation: "A source" }]}
    />);
    const paragraph = container.querySelector(".article-body p")!;
    expect(paragraph.textContent).toBe("Sentence.1");
    expect(paragraph.innerHTML).toContain('Sentence.<sup class="footnote-ref">');
  });

  it("omits Notes without occurrences and preserves a broken occurrence in sequence", () => {
    const { container } = render(<ArticleBody blocks={[{ type: "paragraph", text: "Claim.", content: [{ text: "Claim.", sourceKey: "missing" }] }]} />);
    expect(screen.getByText("Notes").closest("summary")).toHaveTextContent("Notes (1)");
    expect(container.querySelector(".footnote-ref--missing")).toHaveTextContent("1");
    expect(screen.getByText("Missing Source: missing")).toBeInTheDocument();
    const empty = render(<ArticleBody blocks={[{ type: "paragraph", text: "No citation." }]} sources={[{ key: "unused", citation: "Unused" }]} />);
    expect(empty.container.querySelector(".article-notes")).not.toBeInTheDocument();
  });

  it("renders paragraphs around semantic bullet and numbered lists", () => {
    const { container } = render(<ArticleBody blocks={[
      { type: "paragraph", text: "Before the lists." },
      { type: "bulletedList", items: ["One bullet", "Two bullets"] },
      { type: "numberedList", items: ["First step", "Second step"] },
      { type: "paragraph", text: "After the lists." },
    ]} />);
    expect(container.querySelectorAll("ul")).toHaveLength(1);
    expect(container.querySelectorAll("ol")).toHaveLength(1);
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(container.querySelectorAll("ol > li")).toHaveLength(2);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("renders nested list levels with bold, italic, and safe links", () => {
    const { container } = render(<ArticleBody blocks={[{
      type: "bulletedList",
      items: [
        { level: 1, content: [{ text: "Parent " }, { text: "bold", marks: ["strong"] }] },
        { level: 2, content: [{ text: "Nested link", marks: ["em"], href: "https://example.com/report" }] },
        { level: 1, content: [{ text: "Second parent" }] },
      ],
    }]} />);
    expect(container.querySelectorAll(":scope .article-body > ul > li")).toHaveLength(2);
    expect(container.querySelectorAll("ul ul > li")).toHaveLength(1);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("Nested link").tagName).toBe("EM");
    expect(screen.getByRole("link", { name: "Nested link" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("announces external links and applies safe new-tab attributes", () => {
    render(
      <ArticleBody blocks={[{
        type: "link",
        text: "Read the source.",
        href: "https://example.com/report",
        label: "Example report",
      }]} />,
    );
    const link = screen.getByRole("link", { name: "Example report (opens in a new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders an inline image with caption and credit", () => {
    render(
      <ArticleBody
        blocks={[
          {
            type: "image",
            src: "https://example.com/image.jpg",
            alt: "A city skyline",
            caption: "The city at dusk.",
            credit: "Photo by Test",
          },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "A city skyline" })).toBeInTheDocument();
    expect(screen.getByText("The city at dusk.")).toBeInTheDocument();
    expect(screen.getByText("Photo by Test")).toBeInTheDocument();
  });

  it("safely omits optional caption and credit", () => {
    const { container } = render(
      <ArticleBody
        blocks={[
          {
            type: "image",
            src: "https://example.com/image.jpg",
            alt: "A circuit board",
          },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "A circuit board" })).toBeInTheDocument();
    expect(container.querySelector("figcaption")).not.toBeInTheDocument();
  });

  it("warns and renders nothing for an unknown block", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { container } = render(
      <ArticleBody
        blocks={
          [{ type: "unknown", html: "<script>unsafe()</script>" }] as unknown as ArticleContentBlock[]
        }
      />,
    );
    expect(warning).toHaveBeenCalledWith("Unsupported article block", "unknown");
    expect(container).not.toHaveTextContent("unsafe");
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("silently renders nothing for an unknown production block", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { container } = render(
      <ArticleBody
        blocks={
          [{ type: "unknown", html: "<strong>unsafe</strong>" }] as unknown as ArticleContentBlock[]
        }
      />,
    );
    expect(warning).not.toHaveBeenCalled();
    expect(container).not.toHaveTextContent("unsafe");
    expect(container.querySelector("strong")).not.toBeInTheDocument();
  });
});
