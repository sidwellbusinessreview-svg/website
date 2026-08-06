import type { MetadataRoute } from "next";
import { getPublishedArticles, getPublishedContributors } from "@/content";
import { absoluteUrl } from "@/lib/metadata";
import { sitemapArticleLastModified } from "@/lib/article-date";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors] = await Promise.all([
    getPublishedArticles(),
    getPublishedContributors(),
  ]);
  const staticRoutes = [
    "",
    "/latest",
    "/archive",
    "/about",
  ];

  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path || "/") })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      ...(sitemapArticleLastModified(article.publishedAt, article.publicationDatePrecision) ? { lastModified: sitemapArticleLastModified(article.publishedAt, article.publicationDatePrecision) } : {}),
    })),
    ...authors.map((author) => ({ url: absoluteUrl(`/authors/${author.slug}`) })),
  ];
}
