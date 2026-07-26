import type { SanityClient } from "next-sanity";
import { getPublicSanityClient } from "@/sanity/lib/client";
import { siteConfig } from "@/config/site";
import { siteSettingsSchema } from "../schemas";
import type { Article, Contributor } from "../types";
import { ContentProviderError, getSchoolYear, type ContentProvider } from "../provider";
import { searchPublicArticles } from "../search";
import { mapArticle, mapContributor, mapSiteSettings, mapStaticPage } from "./adapters";
import { PUBLIC_CACHE_TAGS, publicQueryCacheOptions } from "./cache";
import {
  ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, ARTICLES_BY_CONTRIBUTOR_QUERY,
  CONTRIBUTOR_BY_SLUG_QUERY, CONTRIBUTORS_QUERY,
  LATEST_ARTICLES_QUERY, PINNED_ARTICLE_QUERY, SEARCH_ARTICLES_QUERY,
  SITE_SETTINGS_QUERY, STATIC_PAGE_BY_SLUG_QUERY,
} from "./queries";

type QueryOptions = { tag: string; relatedTags?: string[]; params?: Record<string, unknown> };
type ProviderMode = "published" | "drafts";

async function fetchContent<T>(client: SanityClient, mode: ProviderMode, query: string, { tag, relatedTags = [], params = {} }: QueryOptions): Promise<T> {
  try {
    return await client.fetch<T>(
      query,
      params,
      mode === "drafts"
        ? { cache: "no-store", perspective: "drafts", useCdn: false }
        : publicQueryCacheOptions(tag, relatedTags),
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(`Sanity public query failed (${tag})`, error);
    throw new ContentProviderError(undefined, { cause: error });
  }
}

function articles(values: unknown): Article[] {
  if (!Array.isArray(values)) return [];
  const mapped = values.map(mapArticle);
  if (process.env.NODE_ENV !== "production" && mapped.some((article) => !article)) console.warn("One or more Sanity articles were excluded because required fields or references were invalid.");
  return mapped.filter((article): article is Article => Boolean(article));
}

function contributors(values: unknown): Contributor[] {
  return Array.isArray(values) ? values.map(mapContributor).filter((contributor): contributor is Contributor => Boolean(contributor)) : [];
}

export function createSanityContentProvider(client: SanityClient, mode: ProviderMode = "published"): ContentProvider {
  const fetch = <T>(query: string, options: QueryOptions) => fetchContent<T>(client, mode, query, options);
  return {
    source: "sanity",
    async getSiteSettings() {
      const mapped = mapSiteSettings(await fetch(SITE_SETTINGS_QUERY, { tag: "settings" }));
      return mapped ?? siteSettingsSchema.parse(siteConfig);
    },
    async getArticles() { return articles(await fetch(ALL_PUBLISHED_ARTICLES_QUERY, { tag: "articles" })); },
    async getArticleBySlug(slug) { return mapArticle(await fetch(ARTICLE_BY_SLUG_QUERY, { tag: `article:${slug}`, relatedTags: [PUBLIC_CACHE_TAGS.articles], params: { slug } })); },
    async getPinnedArticle() {
      const pinned = mapArticle(await fetch(PINNED_ARTICLE_QUERY, { tag: "lead", relatedTags: [PUBLIC_CACHE_TAGS.articles] }));
      return pinned ?? (await this.getLatestArticles(1))[0];
    },
    async getLatestArticles(limit = 10) { return articles(await fetch(LATEST_ARTICLES_QUERY, { tag: "latest", relatedTags: [PUBLIC_CACHE_TAGS.articles], params: { limit: Math.max(1, Math.floor(limit)) } })); },
    async getArchiveArticles(filters = {}) { return (await this.getArticles()).filter((article) => (!filters.schoolYear || getSchoolYear(article.publishedAt) === filters.schoolYear) && (!filters.contributor || article.contributorSlugs.includes(filters.contributor))); },
    async getArticlesByContributor(slug) { return articles(await fetch(ARTICLES_BY_CONTRIBUTOR_QUERY, { tag: `contributor-articles:${slug}`, relatedTags: [PUBLIC_CACHE_TAGS.articles, PUBLIC_CACHE_TAGS.contributors], params: { slug } })); },
    async getContributors() { return contributors(await fetch(CONTRIBUTORS_QUERY, { tag: "contributors" })); },
    async getContributorBySlug(slug) { return mapContributor(await fetch(CONTRIBUTOR_BY_SLUG_QUERY, { tag: `contributor:${slug}`, relatedTags: [PUBLIC_CACHE_TAGS.contributors], params: { slug } })); },
    async searchArticles(query) {
      const normalized = query.trim(); if (!normalized) return [];
      const matches = articles(await fetch(SEARCH_ARTICLES_QUERY, { tag: "search", relatedTags: [PUBLIC_CACHE_TAGS.articles, PUBLIC_CACHE_TAGS.contributors], params: { term: `*${normalized}*` } }));
      return searchPublicArticles(matches, await this.getContributors(), normalized);
    },
    async getStaticPageBySlug(slug) { return mapStaticPage(await fetch(STATIC_PAGE_BY_SLUG_QUERY, { tag: `page:${slug}`, relatedTags: [PUBLIC_CACHE_TAGS.pages], params: { slug } })); },
  };
}

export function getSanityContentProvider(): ContentProvider {
  const client = getPublicSanityClient();
  if (!client) throw new Error("CONTENT_SOURCE=sanity requires the complete public Sanity environment configuration.");
  return createSanityContentProvider(client);
}
