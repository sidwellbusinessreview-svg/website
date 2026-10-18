import { describe, expect, it } from "vitest";
import { GET as getFeed } from "./feed.xml/route";
import { escapeXml } from "@/lib/xml";
import sitemap from "./sitemap";
import { getArticles } from "@/content";
import { createPageMetadata } from "@/lib/metadata";
import HomePage from "./page";
import { isValidElement } from "react";

describe("metadata and discovery", () => {
  it("renders the homepage purpose statement from provider settings with a readable default", async () => {
    const view = await HomePage();
    const children = view.props.children as unknown[];
    const section = children.find((child) => isValidElement(child) && child.type === "section" && (child.props as { className?: string }).className === "purpose-section");
    if (!isValidElement(section)) throw new Error("Purpose section missing");
    const sectionProps = section.props as { children: React.ReactElement };
    const container = sectionProps.children;
    const statement = (container.props as { children: React.ReactElement[] }).children;
    expect((statement[1].props as { children: string }).children).toContain("Good business writing makes complicated choices legible.");
    const supporting = (statement[2].props as { children: React.ReactElement[] }).children;
    expect((supporting[0].props as { children: string }).children).toContain("We report, analyze, and debate the forces shaping business and economics");
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
