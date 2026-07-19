import type { MetadataRoute } from "next";
import { getArticles, getContributors } from "@/content";
import { absoluteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors] = await Promise.all([
    getArticles(),
    getContributors(),
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
      lastModified: article.publishedAt,
    })),
    ...authors.map((author) => ({ url: absoluteUrl(`/authors/${author.slug}`) })),
  ];
}
