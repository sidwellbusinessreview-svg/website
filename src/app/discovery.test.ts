import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GET as getFeed } from "./feed.xml/route";
import { escapeXml } from "@/lib/xml";
import sitemap from "./sitemap";
import { getArticles, selectLeadArticle } from "@/content";
import { createPageMetadata } from "@/lib/metadata";
import HomePage from "./page";

describe("metadata and discovery", () => {
  it("keeps the homepage focused on the featured article and latest analysis", async () => {
    const view = await HomePage();
    const { container } = render(view);
    const lead = selectLeadArticle(await getArticles());
    expect(lead).toBeDefined();
    expect(screen.getByRole("heading", { name: lead!.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Latest analysis", level: 2 })).toBeInTheDocument();
    expect(container.querySelector(".purpose-section")).toBeNull();
  });
  it("creates canonical and social page metadata", () => {
    const metadata = createPageMetadata({
      title: "Archive",
      description: "Browse published work.",
      path: "/archive",
    });
    expect(metadata.alternates).toEqual({ canonical: "/archive" });
    expect(metadata.openGraph).toMatchObject({
      title: "Archive",
      url: "/archive",
    });
  });

  it("includes only public article routes in the sitemap", async () => {
    const [entries, articles] = await Promise.all([sitemap(), getArticles()]);
    const articleUrls = entries
      .map(({ url }) => url)
      .filter((url) => url.includes("/articles/"));
    expect(articleUrls).toHaveLength(articles.length);
    expect(articleUrls.every((url) =>
      articles.some(({ slug }) => url.endsWith(`/articles/${slug}`)),
    )).toBe(true);
  });

  it("includes only public articles in the RSS feed", async () => {
    const [response, articles] = await Promise.all([getFeed(), getArticles()]);
    const xml = await response.text();
    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
    expect((xml.match(/<item>/g) ?? [])).toHaveLength(articles.length);
    for (const article of articles) expect(xml).toContain(article.title);
  });

  it("escapes XML-sensitive publication values", async () => {
    expect(escapeXml(`Markets & "Money" <Today> O'Reilly`)).toBe("Markets &amp; &quot;Money&quot; &lt;Today&gt; O&apos;Reilly");
  });
});
