import type { Article, ArticleContentBlock, Contributor, SiteSettings } from "./types";
import type { SearchResult } from "./search";

export type ContentSourceName = "local" | "sanity";
export type ArchiveFilters = { schoolYear?: string; contributor?: string };

export function getSchoolYear(publishedAt: string): string {
  const date = new Date(`${publishedAt}T12:00:00Z`);
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export type StaticPageContent = {
  slug: string;
  title: string;
  eyebrow?: string;
  summary?: string;
  body: ArticleContentBlock[];
  staff: {
    editorsInChief: StaffEntry[];
    editors: StaffEntry[];
    facultyAdviser: StaffEntry[];
  };
};

export type StaffEntry = {
  contributorSlug: string;
  displayedRole?: string;
};

export interface ContentProvider {
  readonly source: ContentSourceName;
  getSiteSettings(): Promise<SiteSettings>;
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getPinnedArticle(): Promise<Article | undefined>;
  getLatestArticles(limit?: number): Promise<Article[]>;
  getArchiveArticles(filters?: ArchiveFilters): Promise<Article[]>;
  getArticlesByContributor(slug: string): Promise<Article[]>;
  getContributors(): Promise<Contributor[]>;
  getContributorBySlug(slug: string): Promise<Contributor | undefined>;
  searchArticles(query: string): Promise<SearchResult[]>;
  getStaticPageBySlug(slug: string): Promise<StaticPageContent | undefined>;
}

export class ContentProviderError extends Error {
  constructor(message = "Published content is temporarily unavailable.", options?: ErrorOptions) {
    super(message, options);
    this.name = "ContentProviderError";
  }
}
