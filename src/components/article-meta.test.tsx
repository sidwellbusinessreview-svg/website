import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Article, Contributor } from "@/content";
import { ArticleCard } from "./article-card";
import { ArticleMeta } from "./article-meta";

const article: Article = {
  slug: "test-article",
  title: "A Test Article",
  dek: "A summary that does not require an optional subtitle.",
  contributorSlugs: ["maya-chen", "jonah-patel"],
  publicationMonth: "2026-01",
  status: "published",
  pinned: false,
  featuredImage: {
    src: "https://example.com/image.jpg",
    alt: "A test image",
  },
  content: [{ type: "paragraph", text: "Body." }],
  sources: [],
};

const authors: Contributor[] = [
  {
    slug: "maya-chen",
    name: "Maya Chen",
    role: "Editor in Chief",
    grade: "Class of 2026",
  },
  {
    slug: "jonah-patel",
    name: "Jonah Patel",
    role: "Economics Editor",
    grade: "Class of 2027",
  },
];

describe("article presentation", () => {
  it("renders multiple authors in byline order", () => {
    const { container } = render(<ArticleMeta article={article} authors={authors} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Maya Chen", "Jonah Patel"]);
    expect(screen.getByText(/and/)).toBeInTheDocument();
    expect(screen.getByText("January 2026")).toBeInTheDocument();
    expect(screen.getByText("January 2026")).not.toHaveTextContent("January 26");
    expect(container).not.toHaveTextContent(/min read|minute read|words/i);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });

  it("renders the canonical month without exposing a numerical day", () => {
    render(<ArticleMeta article={{ ...article, publicationMonth: "2025-03" }} authors={authors} />);
    const time = screen.getByText("March 2025");
    expect(time).toHaveAttribute("datetime", "2025-03");
    expect(time).not.toHaveTextContent("1");
  });

  it("renders an article card when the optional contract subtitle is absent", () => {
    render(<ArticleCard article={article} authors={authors} />);
    expect(screen.getByRole("heading", { name: "A Test Article" })).toBeInTheDocument();
    expect(
      screen.getByText("A summary that does not require an optional subtitle."),
    ).toBeInTheDocument();
  });

  it("renders an article card safely without a featured image", () => {
    render(<ArticleCard article={{ ...article, featuredImage: undefined }} authors={authors} />);
    expect(screen.getByRole("heading", { name: "A Test Article" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
