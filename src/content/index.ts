import type { Article, Contributor } from "./types";
import { searchPublicArticles, type SearchResult } from "./search";
import { validatedContent } from "./validation";
import { getPublicArticles } from "./utils";

export type { Article, ArticleContentBlock, Contributor, SiteSettings } from "./types";
export type { SearchResult } from "./search";
export { findDuplicateSlugs, getPublicArticles, selectLeadArticle } from "./utils";

export async function getArticles(): Promise<Article[]> { return getPublicArticles(validatedContent.articles); }
export async function getArticleBySlug(slug: string): Promise<Article | undefined> { return (await getArticles()).find((article) => article.slug === slug); }
export async function getContributors(): Promise<Contributor[]> { return [...validatedContent.contributors]; }
export async function getContributorBySlug(slug: string): Promise<Contributor | undefined> { return validatedContent.contributors.find((contributor) => contributor.slug === slug); }
export async function getArticlesByContributor(slug: string): Promise<Article[]> { return (await getArticles()).filter((article) => article.contributorSlugs.includes(slug)); }

export async function searchArticles(query: string): Promise<SearchResult[]> { return searchPublicArticles(await getArticles(), await getContributors(), query); }

export interface ArchiveFilters { schoolYear?: string; contributor?: string; }
export function getSchoolYear(publishedAt: string): string {
  const date = new Date(`${publishedAt}T12:00:00Z`);
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}
export async function getArchiveArticles(filters: ArchiveFilters = {}): Promise<Article[]> {
  const contributor = filters.contributor;
  return (await getArticles()).filter((article) =>
    (!filters.schoolYear || getSchoolYear(article.publishedAt) === filters.schoolYear) &&
    (!contributor || article.contributorSlugs.includes(contributor)),
  );
}
