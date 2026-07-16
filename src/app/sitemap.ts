import type { MetadataRoute } from "next";
import { getArticles, getAuthors, getIssues } from "@/content";
import { absoluteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors, issues] = await Promise.all([
    getArticles(),
    getAuthors(),
    getIssues(),
  ]);
  const staticRoutes = [
    "",
    "/latest",
    "/archive",
    "/issues",
    "/authors",
    "/about",
    "/masthead",
  ];

  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path || "/") })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.publishedAt,
    })),
    ...issues.map((issue) => ({ url: absoluteUrl(`/issues/${issue.slug}`) })),
    ...authors.map((author) => ({ url: absoluteUrl(`/authors/${author.slug}`) })),
  ];
}
