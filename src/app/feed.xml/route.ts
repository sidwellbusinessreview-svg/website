import { siteConfig } from "@/config/site";
import { getPublishedArticles, getPublishedContributors } from "@/content";
import { absoluteUrl } from "@/lib/metadata";
import { PUBLIC_CONTENT_REVALIDATE_SECONDS } from "@/content/sanity/cache";

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const [articles, authors] = await Promise.all([getPublishedArticles(), getPublishedContributors()]);
  const authorBySlug = new Map(authors.map((author) => [author.slug, author.name]));
  const items = articles.map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${absoluteUrl(`/articles/${article.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/articles/${article.slug}`)}</guid>
      <description>${escapeXml(article.dek)}</description>
      <pubDate>${new Date(`${article.publishedAt}T12:00:00Z`).toUTCString()}</pubDate>
      ${article.contributorSlugs.map((slug) => `<author>${escapeXml(authorBySlug.get(slug) ?? slug)}</author>`).join("")}
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${PUBLIC_CONTENT_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
    },
  });
}
