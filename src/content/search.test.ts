import { describe, expect, it } from "vitest";
import type { Article, Contributor } from "./types";
import { searchPublicArticles } from "./search";
const contributors: Contributor[] = [{ slug: "maya-chen", name: "Maya Chen" }];
const article = (overrides: Partial<Article> = {}): Article => ({ slug: "market-signals", title: "How Markets Read Signals", dek: "A practical guide to interpreting policy and market information.", contributorSlugs: ["maya-chen"], publicationMonth: "2026-05", status: "published", pinned: false, featuredImage: { src: "https://example.com/image.jpg", alt: "Chart lines" }, content: [{ type: "paragraph", text: "Interest rates shape borrowing decisions." }], sources: [], ...overrides });
describe("article search", () => {
  it.each([["title", "markets"], ["summary", "interpreting policy"], ["contributor", "MAYA CHEN"], ["body", "borrowing decisions"]])("matches %s case-insensitively", (_field, query) => { expect(searchPublicArticles([article()], contributors, query)[0]?.article.slug).toBe("market-signals"); });
  it("ranks headline above body matches", () => { expect(searchPublicArticles([article({ slug: "headline", title: "Interest Rates Explained" }), article({ slug: "body", title: "A Different Topic" })], contributors, "interest rates").map(({ article }) => article.slug)).toEqual(["headline", "body"]); });
  it("returns no empty, unmatched, or draft results", () => { expect(searchPublicArticles([article()], contributors, "")).toEqual([]); expect(searchPublicArticles([article()], contributors, "volcano")).toEqual([]); expect(searchPublicArticles([article({ status: "draft" })], contributors, "markets")).toEqual([]); });
  it("maps every Contributor name only to that Contributor's Articles", () => {
    const people: Contributor[] = ["Evan Tan", "Steven Huang", "Felix Pacheco Lynch", "Areg Devoyans", "Julia Marks", "Norah Smith"].map((name) => ({ name, slug: name.toLowerCase().replaceAll(" ", "-") }));
    const articles = [
      article({ slug: "mass-deportations", title: "Mass Deportations", dek: "Immigration and labor markets.", contributorSlugs: people.slice(0, 3).map(({ slug }) => slug) }),
      article({ slug: "trump-memecoin", title: "$Trump: The Memecoin From the Guy Who Lives Down the Street", dek: "A cryptocurrency analysis.", contributorSlugs: [people[3].slug] }),
      article({ slug: "third", title: "A Third Article", dek: "Another summary.", contributorSlugs: people.slice(4).map(({ slug }) => slug) }),
    ];
    const expected = new Map([["evan", "mass-deportations"], ["steven", "mass-deportations"], ["felix", "mass-deportations"], ["areg", "trump-memecoin"], ["julia", "third"], ["norah", "third"]]);
    for (const [query, slug] of expected) expect(searchPublicArticles(articles, people, query).map(({ article }) => article.slug)).toEqual([slug]);
    expect(searchPublicArticles(articles, people, "Areg").map(({ article }) => article.slug)).toEqual(["trump-memecoin"]);
  });
  it("does not treat a Contributor name as a substring inside an unrelated word", () => {
    const evan: Contributor = { name: "Evan Tan", slug: "evan-tan" };
    const authored = article({ slug: "authored", contributorSlugs: [evan.slug] });
    const unrelated = article({ slug: "unrelated", title: "A relevant market story", contributorSlugs: [] });
    expect(searchPublicArticles([authored, unrelated], [evan], "evan").map(({ article }) => article.slug)).toEqual(["authored"]);
  });
});
