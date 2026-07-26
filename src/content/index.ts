import type { Article, Contributor } from "./types";
import type { SearchResult } from "./search";
import { getContentProvider } from "./provider-selection";
import type { ArchiveFilters } from "./provider";

export type { Article, ArticleContentBlock, Contributor, SiteSettings } from "./types";
export type { SearchResult } from "./search";
export { findDuplicateSlugs, getPublicArticles, selectLeadArticle } from "./utils";
export { getSchoolYear } from "./provider";

export async function getArticles(): Promise<Article[]> { return (await getContentProvider()).getArticles(); }
export async function getPublishedArticles(): Promise<Article[]> { return (await getContentProvider({ publishedOnly: true })).getArticles(); }
export async function getArticleBySlug(slug: string): Promise<Article | undefined> { return (await getContentProvider()).getArticleBySlug(slug); }
export async function getContributors(): Promise<Contributor[]> { return (await getContentProvider()).getContributors(); }
export async function getPublishedContributors(): Promise<Contributor[]> { return (await getContentProvider({ publishedOnly: true })).getContributors(); }
export async function getContributorBySlug(slug: string): Promise<Contributor | undefined> { return (await getContentProvider()).getContributorBySlug(slug); }
export async function getArticlesByContributor(slug: string): Promise<Article[]> { return (await getContentProvider()).getArticlesByContributor(slug); }
export async function getPinnedArticle(): Promise<Article | undefined> { return (await getContentProvider()).getPinnedArticle(); }
export async function getLatestArticles(limit?: number): Promise<Article[]> { return (await getContentProvider()).getLatestArticles(limit); }
export async function getSiteSettings() { return (await getContentProvider()).getSiteSettings(); }
export async function getStaticPageBySlug(slug: string) { return (await getContentProvider()).getStaticPageBySlug(slug); }

export async function searchArticles(query: string): Promise<SearchResult[]> { return (await getContentProvider()).searchArticles(query); }

export async function getArchiveArticles(filters: ArchiveFilters = {}): Promise<Article[]> {
  return (await getContentProvider()).getArchiveArticles(filters);
}
