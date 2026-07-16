import type { Article } from "./types";

export function selectLeadArticle(articles: Article[]): Article | undefined {
  return articles.find((article) => article.pinned) ?? articles[0];
}

export function findDuplicateSlugs(
  items: ReadonlyArray<{ slug: string }>,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.slug)) duplicates.add(item.slug);
    seen.add(item.slug);
  }

  return [...duplicates].sort();
}
