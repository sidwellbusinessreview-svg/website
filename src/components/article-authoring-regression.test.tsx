import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mapArticle } from "@/content/sanity/adapters";
import { ArticleBody } from "./article-body";
import { ArticleMeta } from "./article-meta";

const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: crypto.randomUUID(), text, marks });
const block = (text: string, additions = {}) => ({ _type: "block", _key: crypto.randomUUID(), style: "normal", children: [span(text)], markDefs: [], ...additions });
const reference = (sourceKey: string) => ({ _type: "footnoteReference", _key: crypto.randomUUID(), sourceKey });

describe("complete Article authoring contract", () => {
  it("adapts and renders a realistic image-free two-Contributor Article", () => {
    const raw = {
      slug: "market-signals-and-school-budgets",
      title: "Market Signals and School Budgets",
      subtitle: "What changing rates mean for institutions",
      summary: "A student analysis of how interest rates shape budgets, borrowing, and long-term planning.",
      publicationMonth: "2026-03",
      contributors: [
        { slug: "maya-chen", name: "Maya Chen", active: true },
        { slug: "jonah-patel", name: "Jonah Patel", active: true },
      ],
      sources: [
        { key: "fed", citation: "Federal Reserve, “Policy Report.”", url: "https://example.com/fed" },
        { key: "budget", citation: "School Finance Association, “Budget Outlook.”" },
      ],
      body: [
        block("Rates changed after a policy shift.", { children: [span("Rates changed after "), span("a policy", ["strong"]), span(" shift."), reference("fed")] }),
        block("What schools should watch", { style: "h2" }),
        block("Normal prose resumes after the Section heading."),
        block("Borrowing costs increased.", { listItem: "bullet", children: [span("Borrowing costs increased."), reference("budget")] }),
        block("Review current obligations.", { listItem: "number" }),
        block("Good planning starts before rates change.", { style: "blockquote", children: [span("Good planning starts before rates change."), reference("fed")] }),
        { _type: "callout", title: "Context", body: [block("Budgets respond with a lag.")], sourceKey: "budget" },
      ],
    };
    const article = mapArticle(raw);
    expect(article).toBeDefined();
    expect(article).toMatchObject({ contributorSlugs: ["maya-chen", "jonah-patel"], publicationMonth: "2026-03", featuredImage: undefined });
    expect(JSON.stringify(article)).not.toMatch(/[\u200b\u200c\u200d\ufeff]/);

    const { container } = render(<>
      <ArticleMeta article={article!} authors={[{ slug: "maya-chen", name: "Maya Chen" }, { slug: "jonah-patel", name: "Jonah Patel" }]} />
      <ArticleBody blocks={article!.content} sources={article!.sources} />
    </>);
    expect(screen.getByText("March 2026")).toBeInTheDocument();
    expect(container.querySelector("time")?.textContent).not.toMatch(/\b\d{1,2},\b/);
    expect(container.querySelectorAll("sup.footnote-ref")).toHaveLength(4);
    for (const number of [1, 2, 3, 4]) expect(screen.getByRole("link", { name: `Footnote ${number}` })).toBeInTheDocument();
    expect(container.querySelectorAll(".article-notes li")).toHaveLength(4);
    expect(container.querySelector("blockquote")).toHaveTextContent("Good planning starts before rates change.3");
    expect(container.querySelector("strong")).toHaveTextContent("a policy");
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("p")?.innerHTML).toContain(' shift.<sup class="footnote-ref">');
  });
});
