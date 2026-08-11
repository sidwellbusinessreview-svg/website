import type { Article } from "./types";

export function selectLeadArticle(articles: Article[]): Article | undefined {
  return (
    articles
      .filter((article) => article.pinned)
      .sort(
        (a, b) =>
          (a.featuredRank ?? Number.MAX_SAFE_INTEGER) -
            (b.featuredRank ?? Number.MAX_SAFE_INTEGER) ||
          a.slug.localeCompare(b.slug),
      )[0] ?? articles[0]
  );
}

export function getPublicArticles(articles: Article[]): Article[] {
  return articles
    .filter((article) => article.status === "published")
    .sort((a, b) => {
      const dateDifference =
        b.publicationMonth.localeCompare(a.publicationMonth);
      return dateDifference || a.slug.localeCompare(b.slug);
    });
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
