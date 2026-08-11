import type { Article, ArticleContentBlock, Contributor } from "./types";

export interface SearchResult {
  article: Article;
  score: number;
}

function blockText(block: ArticleContentBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "pullQuote":
      return block.text;
    case "bulletedList":
    case "numberedList":
      return block.items.join(" ");
    case "quote":
      return `${block.text} ${block.attribution ?? ""}`;
    case "image":
      return `${block.alt} ${block.caption ?? ""} ${block.credit ?? ""}`;
    case "callout":
      return `${block.title ?? ""} ${block.text}`;
    case "link":
      return `${block.text} ${block.label}`;
    case "divider":
      return "";
  }
}

function occurrences(value: string, query: string): number {
  let count = 0;
  let start = 0;
  while ((start = value.indexOf(query, start)) !== -1) {
    count += 1;
    start += query.length;
  }
  return count;
}

export function searchPublicArticles(
  articles: Article[],
  contributors: Contributor[],
  rawQuery: string,
): SearchResult[] {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return [];

  const contributorBySlug = new Map(contributors.map((contributor) => [contributor.slug, contributor]));

  return articles
    .filter((article) => article.status === "published")
    .map((article) => {
      const contributorText = article.contributorSlugs
        .map((slug) => contributorBySlug.get(slug)?.name ?? "")
        .join(" ")
        .toLocaleLowerCase();
      const fields = [
        [article.title, 12],
        [article.dek, 7],
        [contributorText, 6],
        [article.content.map(blockText).join(" "), 1],
      ] as const;
      const score = fields.reduce(
        (total, [value, weight]) =>
          total + occurrences(value.toLocaleLowerCase(), query) * weight,
        0,
      );
      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.article.publicationMonth.localeCompare(a.article.publicationMonth) ||
        a.article.slug.localeCompare(b.article.slug),
    );
}
