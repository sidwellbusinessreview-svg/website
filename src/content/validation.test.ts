import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { articles, authors, categories, issues } from "./data";
import { articleContentBlockSchema } from "./schemas";
import {
  ContentValidationError,
  type ContentSource,
  validateContentSource,
} from "./validation";

function validSource(): ContentSource {
  return structuredClone({
    articles,
    authors,
    categories,
    issues,
    siteSettings: siteConfig,
  });
}

function expectProblem(
  change: (source: ContentSource) => void,
  expected: RegExp,
): void {
  const source = validSource();
  change(source);
  expect(() =>
    validateContentSource(source, new Date("2026-07-16T12:00:00Z")),
  ).toThrow(expected);
}

describe("runtime block schemas", () => {
  const validBlocks = [
    { type: "paragraph", text: "Paragraph" },
    { type: "heading", level: 2, text: "Heading" },
    { type: "bulletedList", items: ["Item"] },
    { type: "numberedList", items: ["Item"] },
    { type: "quote", text: "Quote" },
    { type: "pullQuote", text: "Pull quote" },
    {
      type: "image",
      src: "https://example.com/image.jpg",
      alt: "Descriptive alt text",
      caption: "Caption",
      credit: "Photo credit",
    },
    { type: "callout", text: "Callout" },
    { type: "divider" },
    {
      type: "link",
      text: "Further reading.",
      href: "https://example.com",
      label: "Read the source",
    },
  ];

  it.each(validBlocks)("accepts the $type block", (block) => {
    expect(articleContentBlockSchema.safeParse(block).success).toBe(true);
  });

  it("rejects a caption without an image block", () => {
    expect(
      articleContentBlockSchema.safeParse({
        type: "caption",
        text: "An unattached caption",
      }).success,
    ).toBe(false);
  });
});

describe("cross-document validation", () => {
  it("accepts the local content source", () => {
    const result = validateContentSource(
      validSource(),
      new Date("2026-07-16T12:00:00Z"),
    );
    expect(result.articles).toHaveLength(6);
    expect(result.articles.every((article) => article.status === "published")).toBe(
      true,
    );
  });

  it("supports long headlines and multiple authors", () => {
    const result = validateContentSource(
      validSource(),
      new Date("2026-07-16T12:00:00Z"),
    );
    expect(
      result.articles.find(
        ({ slug }) => slug === "semiconductors-and-the-geography-of-risk",
      )?.title.length,
    ).toBeGreaterThan(80);
    expect(
      result.articles.find(
        ({ slug }) => slug === "the-new-economics-of-school-lunch",
      )?.authorSlugs,
    ).toHaveLength(2);
  });

  it("allows missing optional captions and credits", () => {
    const result = validateContentSource(
      validSource(),
      new Date("2026-07-16T12:00:00Z"),
    );
    expect(result.articles[1].featuredImage.caption).toBeUndefined();
  });

  it("detects duplicate article slugs", () => {
    expectProblem(
      (source) => source.articles.push(structuredClone(source.articles[0])),
      /duplicate article slug/,
    );
  });

  it("detects duplicate author slugs", () => {
    expectProblem(
      (source) => source.authors.push(structuredClone(source.authors[0])),
      /duplicate author slug/,
    );
  });

  it("detects duplicate issue slugs", () => {
    expectProblem(
      (source) => source.issues.push(structuredClone(source.issues[0])),
      /duplicate issue slug/,
    );
  });

  it("detects missing referenced authors", () => {
    expectProblem(
      (source) => {
        source.authors = source.authors.slice(1);
      },
      /references missing author/,
    );
  });

  it("detects missing referenced issues", () => {
    expectProblem(
      (source) => {
        source.issues = source.issues.slice(1);
      },
      /references missing issue/,
    );
  });

  it("detects missing referenced categories", () => {
    expectProblem(
      (source) => {
        source.categories = source.categories.slice(1);
      },
      /references missing category/,
    );
  });

  it("detects issue references to missing articles", () => {
    expectProblem(
      (source) => {
        (source.issues[0] as { articleSlugs: string[] }).articleSlugs.push(
          "missing-article",
        );
      },
      /references missing article/,
    );
  });

  it("detects invalid publication dates", () => {
    expectProblem(
      (source) => {
        (source.articles[0] as { publishedAt: string }).publishedAt = "2026-02-31";
      },
      /valid calendar date/,
    );
  });

  it("detects future dates on published articles", () => {
    expectProblem(
      (source) => {
        (source.articles[0] as { publishedAt: string }).publishedAt = "2027-01-01";
      },
      /future publication date/,
    );
  });

  it("detects missing required article values", () => {
    expectProblem(
      (source) => {
        delete (source.articles[0] as { title?: string }).title;
      },
      /articles\[0\]\.title/,
    );
  });

  it("detects images missing alt text", () => {
    expectProblem(
      (source) => {
        (source.articles[0] as { featuredImage: { alt: string } }).featuredImage.alt =
          "";
      },
      /image alt text is required/,
    );
  });

  it("detects inline images missing alt text", () => {
    expectProblem(
      (source) => {
        (source.articles[0] as { content: unknown[] }).content.push({
          type: "image",
          src: "https://example.com/inline.jpg",
          alt: "",
        });
      },
      /image alt text is required/,
    );
  });

  it("does not treat an empty alt attribute as valid decorative content", () => {
    expect(
      articleContentBlockSchema.safeParse({
        type: "image",
        src: "https://example.com/decorative.jpg",
        alt: "",
      }).success,
    ).toBe(false);
  });

  it("validates site settings", () => {
    expectProblem(
      (source) => {
        (
          source.siteSettings as { contact: { email: string } }
        ).contact.email = "not-an-email";
      },
      /siteSettings\.contact\.email/,
    );
  });

  it("detects invalid featured ranks", () => {
    expectProblem(
      (source) => {
        Object.assign(source.articles[1] as object, { featuredRank: 0 });
      },
      /too small|greater than 0/i,
    );
  });

  it("detects featured ranks on unpinned articles", () => {
    expectProblem(
      (source) => {
        Object.assign(source.articles[1] as object, { featuredRank: 2 });
      },
      /only valid for a pinned article/,
    );
  });

  it("detects multiple lead articles", () => {
    expectProblem(
      (source) => {
        Object.assign(source.articles[1] as object, { pinned: true });
      },
      /multiple published lead articles/,
    );
  });

  it("returns understandable validation problems", () => {
    try {
      validateContentSource(
        { ...validSource(), articles: [{}] },
        new Date("2026-07-16T12:00:00Z"),
      );
      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).problems[0]).toMatch(
        /^articles\[0\]\./,
      );
    }
  });
});
