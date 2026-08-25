import { siteConfig } from "@/config/site";
import { getSchoolYear, type ContentProvider, type StaticPageContent } from "./provider";
import { searchPublicArticles } from "./search";
import { siteSettingsSchema } from "./schemas";
import { validatedContent } from "./validation";
import { getPublicArticles, selectLeadArticle } from "./utils";

const localAboutPage: StaticPageContent = {
  slug: "about",
  title: "Serious curiosity, clearly expressed.",
  eyebrow: "About the Review",
  body: [
    { type: "paragraph", text: "Sidwell Business Review is a student-run publication examining business, economics, markets, technology, and public policy." },
    { type: "heading", level: 2, text: "Our mission" },
    { type: "paragraph", text: "We give student writers space to ask ambitious questions, report carefully, and make clear arguments. Business journalism is strongest when it treats companies and markets as human institutions—not abstractions." },
    { type: "heading", level: 2, text: "Our standards" },
    { type: "paragraph", text: "Writers distinguish reporting from opinion, identify sources, disclose relevant conflicts, and correct errors transparently. Editors work with every contributor on evidence, structure, fairness, and clarity." },
  ],
  staff: {
    editorsInChief: [{ contributorSlug: "maya-chen" }],
    editors: [{ contributorSlug: "jonah-patel" }, { contributorSlug: "lena-brooks" }],
    facultyAdviser: [],
  },
};

export const localContentProvider: ContentProvider = {
  source: "local",
  async getSiteSettings() { return siteSettingsSchema.parse(siteConfig); },
  async getArticles() { return getPublicArticles(validatedContent.articles); },
  async getArticleBySlug(slug) { return (await this.getArticles()).find((article) => article.slug === slug); },
  async getPinnedArticle() { return selectLeadArticle(await this.getArticles()); },
  async getLatestArticles(limit = 10) { return (await this.getArticles()).slice(0, limit); },
  async getArchiveArticles(filters = {}) { return (await this.getArticles()).filter((article) => (!filters.schoolYear || getSchoolYear(article.publicationMonth) === filters.schoolYear) && (!filters.contributor || article.contributorSlugs.includes(filters.contributor))); },
  async getArticlesByContributor(slug) { return (await this.getArticles()).filter((article) => article.contributorSlugs.includes(slug)); },
  async getContributors() { return [...validatedContent.contributors]; },
  async getContributorBySlug(slug) { return validatedContent.contributors.find((contributor) => contributor.slug === slug); },
  async searchArticles(query) { return searchPublicArticles(await this.getArticles(), await this.getContributors(), query); },
  async getStaticPageBySlug(slug) { return slug === "about" ? localAboutPage : undefined; },
};
