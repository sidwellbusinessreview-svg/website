import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Article, Author } from "@/content";
import { ArticleCard } from "./article-card";
import { ArticleMeta } from "./article-meta";

const article: Article = {
  slug: "test-article",
  title: "A Test Article",
  dek: "A summary that does not require an optional subtitle.",
  category: "Markets",
  authorSlugs: ["maya-chen", "jonah-patel"],
  issueSlug: "winter-2025",
  publishedAt: "2026-01-26",
  readTime: 5,
  status: "published",
  pinned: false,
  featuredImage: {
    src: "https://example.com/image.jpg",
    alt: "A test image",
  },
  content: [{ type: "paragraph", text: "Body." }],
};

const authors: Author[] = [
  {
    slug: "maya-chen",
    name: "Maya Chen",
    role: "Editor in Chief",
    grade: "Class of 2026",
    bio: "Test biography.",
    initials: "MC",
  },
  {
    slug: "jonah-patel",
    name: "Jonah Patel",
    role: "Economics Editor",
    grade: "Class of 2027",
    bio: "Test biography.",
    initials: "JP",
  },
];

describe("article presentation", () => {
  it("renders multiple authors in byline order", () => {
    render(<ArticleMeta article={article} authors={authors} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Maya Chen", "Jonah Patel"]);
    expect(screen.getByText(/and/)).toBeInTheDocument();
  });

  it("renders an article card when the optional contract subtitle is absent", () => {
    render(<ArticleCard article={article} authors={authors} />);
    expect(screen.getByRole("heading", { name: "A Test Article" })).toBeInTheDocument();
    expect(
      screen.getByText("A summary that does not require an optional subtitle."),
    ).toBeInTheDocument();
  });
});
