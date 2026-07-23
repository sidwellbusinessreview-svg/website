import { siteConfig } from "@/config/site";
import { getSchoolYear, type ContentProvider } from "./provider";
import { searchPublicArticles } from "./search";
import { siteSettingsSchema } from "./schemas";
import { validatedContent } from "./validation";
import { getPublicArticles, selectLeadArticle } from "./utils";

export const localContentProvider: ContentProvider = {
  source: "local",
  async getSiteSettings() { return siteSettingsSchema.parse(siteConfig); },
  async getArticles() { return getPublicArticles(validatedContent.articles); },
  async getArticleBySlug(slug) { return (await this.getArticles()).find((article) => article.slug === slug); },
  async getPinnedArticle() { return selectLeadArticle(await this.getArticles()); },
  async getLatestArticles(limit = 10) { return (await this.getArticles()).slice(0, limit); },
  async getArchiveArticles(filters = {}) { return (await this.getArticles()).filter((article) => (!filters.schoolYear || getSchoolYear(article.publishedAt) === filters.schoolYear) && (!filters.contributor || article.contributorSlugs.includes(filters.contributor))); },
  async getArticlesByContributor(slug) { return (await this.getArticles()).filter((article) => article.contributorSlugs.includes(slug)); },
  async getContributors() { return [...validatedContent.contributors]; },
  async getContributorBySlug(slug) { return validatedContent.contributors.find((contributor) => contributor.slug === slug); },
  async searchArticles(query) { return searchPublicArticles(await this.getArticles(), await this.getContributors(), query); },
  async getStaticPageBySlug() { return undefined; },
};
