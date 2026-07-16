import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ArticleContentBlock } from "@/content";
import { ArticleBody } from "./article-body";

describe("ArticleBody", () => {
  it.each([
    ["paragraph", { type: "paragraph", text: "Paragraph copy" }, "Paragraph copy"],
    ["level-two heading", { type: "heading", level: 2, text: "Section heading" }, "Section heading"],
    ["level-three heading", { type: "heading", level: 3, text: "Subheading" }, "Subheading"],
    ["bulleted list", { type: "bulletedList", items: ["First bullet", "Second bullet"] }, "First bullet"],
    ["numbered list", { type: "numberedList", items: ["First step", "Second step"] }, "First step"],
    ["block quote", { type: "quote", text: "Quoted analysis", attribution: "SBR" }, "Quoted analysis"],
    ["pull quote", { type: "pullQuote", text: "A prominent quotation" }, "A prominent quotation"],
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

  it("fails explicitly for an unknown block", () => {
    expect(() =>
      render(
        <ArticleBody
          blocks={
            [{ type: "unknown", text: "Unsafe content" }] as unknown as ArticleContentBlock[]
          }
        />,
      ),
    ).toThrow(/Unsupported article block/);
  });
});
