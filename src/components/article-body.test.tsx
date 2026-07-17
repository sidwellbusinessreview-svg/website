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
