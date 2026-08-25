import { loadEnvConfig } from "@next/env";
import { stegaClean } from "next-sanity";
import { getArticleValidationFailures, mapArticle, mapContributor, mapSiteSettings, mapStaticPage } from "../src/content/sanity/adapters";
import { createSanityContentProvider } from "../src/content/sanity/provider";
import {
  ALL_PUBLISHED_ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLES_BY_CONTRIBUTOR_QUERY,
  CONTRIBUTOR_BY_SLUG_QUERY,
  CONTRIBUTORS_QUERY,
  LATEST_ARTICLES_QUERY,
  SEARCH_ARTICLES_QUERY,
  SITE_SETTINGS_QUERY,
} from "../src/content/sanity/queries";
import { getDraftSanityClient, getPublicSanityClient } from "../src/sanity/lib/client";

loadEnvConfig(process.cwd());

const ARTICLE_SLUG = process.env.SANITY_TEST_ARTICLE_SLUG?.trim() || "cms-integration-test-article";
const CONTRIBUTOR_SLUG =
  process.env.SANITY_TEST_CONTRIBUTOR_SLUG?.trim() || "cms-integration-test-contributor";
const SEARCH_TERM = process.env.SANITY_TEST_ARTICLE_TITLE?.trim() || "CMS Integration Test Article";

type Mode = "published" | "drafts";
type Diagnostic = {
  query: string;
  rawCount: number;
  records: Array<{ _id: string; _type: string }>;
  perspective: Mode;
  stega: boolean;
  adapterCount: number;
  cleanValidationCount: number;
  finalCount: number;
  excluded: Array<{ _id: string; reasons: string[] }>;
};

function rows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  return value && typeof value === "object" ? [value as Record<string, unknown>] : [];
}

function identity(value: Record<string, unknown>): { _id: string; _type: string } {
  const clean = stegaClean(value);
  return {
    _id: typeof clean._id === "string" ? clean._id : "missing",
    _type: typeof clean._type === "string" ? clean._type : "missing",
  };
}

function articleDiagnostic(name: string, raw: unknown, mode: Mode, stega: boolean, finalCount: number): Diagnostic {
  const values = rows(raw);
  const excluded = values.flatMap((value) => {
    const reasons = getArticleValidationFailures(value);
    return reasons.length ? [{ _id: identity(value)._id, reasons }] : [];
  });
  return {
    query: name,
    rawCount: values.length,
    records: values.map(identity),
    perspective: mode,
    stega,
    adapterCount: values.filter((value) => mapArticle(value)).length,
    cleanValidationCount: values.filter((value) => mapArticle(stegaClean(value))).length,
    finalCount,
    excluded,
  };
}

function genericDiagnostic(
  name: string,
  raw: unknown,
  mode: Mode,
  stega: boolean,
  adapter: (value: unknown) => unknown,
  finalCount: number,
): Diagnostic {
  const values = rows(raw);
  return {
    query: name,
    rawCount: values.length,
    records: values.map(identity),
    perspective: mode,
    stega,
    adapterCount: values.filter((value) => adapter(value)).length,
    cleanValidationCount: values.filter((value) => adapter(stegaClean(value))).length,
    finalCount,
    excluded: [],
  };
}

async function runMode(mode: Mode) {
  const client = mode === "drafts" ? getDraftSanityClient() : getPublicSanityClient();
  if (!client) throw new Error("Public Sanity configuration is incomplete.");
  const provider = createSanityContentProvider(client, mode);
  const stega = mode === "drafts";
  const options = { perspective: mode, useCdn: false, cache: "no-store" as const };
  const [
    rawArticles,
    rawArticle,
    rawLatest,
    rawSearch,
    rawContributor,
    rawContributorArticles,
    rawContributors,
    rawAbout,
    rawSettings,
    finalArticles,
    finalArticle,
    finalLatest,
    finalArchive,
    finalSearch,
    finalContributor,
    finalContributorArticles,
    finalAbout,
    finalSettings,
  ] = await Promise.all([
    client.fetch(ALL_PUBLISHED_ARTICLES_QUERY, {}, options),
    client.fetch(ARTICLE_BY_SLUG_QUERY, { slug: ARTICLE_SLUG }, options),
    client.fetch(LATEST_ARTICLES_QUERY, { limit: 10 }, options),
    client.fetch(SEARCH_ARTICLES_QUERY, { term: `*${SEARCH_TERM}*` }, options),
    client.fetch(CONTRIBUTOR_BY_SLUG_QUERY, { slug: CONTRIBUTOR_SLUG }, options),
    client.fetch(ARTICLES_BY_CONTRIBUTOR_QUERY, { slug: CONTRIBUTOR_SLUG }, options),
    client.fetch(CONTRIBUTORS_QUERY, {}, options),
    client.fetch(SITE_SETTINGS_QUERY, {}, options),
    client.fetch(SITE_SETTINGS_QUERY, {}, options),
    provider.getArticles(),
    provider.getArticleBySlug(ARTICLE_SLUG),
    provider.getLatestArticles(),
    provider.getArchiveArticles(),
    provider.searchArticles(SEARCH_TERM),
    provider.getContributorBySlug(CONTRIBUTOR_SLUG),
    provider.getArticlesByContributor(CONTRIBUTOR_SLUG),
    provider.getStaticPageBySlug("about"),
    provider.getSiteSettings(),
  ]);

  const diagnostics = [
    articleDiagnostic("homepage/articles", rawArticles, mode, stega, finalArticles.length),
    articleDiagnostic("articleBySlug", rawArticle, mode, stega, finalArticle ? 1 : 0),
    articleDiagnostic("latest", rawLatest, mode, stega, finalLatest.length),
    articleDiagnostic("archive", rawArticles, mode, stega, finalArchive.length),
    articleDiagnostic("search", rawSearch, mode, stega, finalSearch.length),
    genericDiagnostic("contributorBySlug", rawContributor, mode, stega, mapContributor, finalContributor ? 1 : 0),
    articleDiagnostic("contributorArticles", rawContributorArticles, mode, stega, finalContributorArticles.length),
    genericDiagnostic("contributors", rawContributors, mode, stega, mapContributor, rows(rawContributors).length),
    genericDiagnostic("about", rawAbout, mode, stega, mapStaticPage, finalAbout ? 1 : 0),
    genericDiagnostic("siteSettings", rawSettings, mode, stega, mapSiteSettings, finalSettings ? 1 : 0),
  ];

  console.log(`\nPreview provider diagnostic (${mode})`);
  for (const diagnostic of diagnostics) console.log(JSON.stringify(diagnostic));
}

async function main() {
  await runMode("published");
  await runMode("drafts");
  await runLifecycleDiagnostics();
}

async function runLifecycleDiagnostics() {
  const client = getDraftSanityClient();
  const rawClient = client.withConfig({ perspective: "raw", useCdn: false, stega: { enabled: false } });
  const rawArticles = await rawClient.fetch<Array<Record<string, unknown>>>(`*[
    _type == "article"
  ]{
    _id,_type,"slug":slug.current,subtitle,summary,publicationDate,
    "referenceIds":contributors[]._ref
  }`, {}, { cache: "no-store", perspective: "raw", useCdn: false });
  const currentIds = new Set(rawArticles.map(({ _id }) => String(_id)));
  const draftOnly = rawArticles.filter(({ _id }) => {
    const id = String(_id);
    return id.startsWith("drafts.") && !currentIds.has(id.replace(/^drafts\./, ""));
  });
  const provider = createSanityContentProvider(client, "drafts");
  const previewArticles = await client.fetch<Array<Record<string, unknown>>>(
    ALL_PUBLISHED_ARTICLES_QUERY,
    {},
    { cache: "no-store", perspective: "drafts", useCdn: false },
  );

  console.log("\nDraft-only Article routing diagnostic");
  for (const record of draftOnly) {
    const clean = stegaClean(record);
    const slug = typeof clean.slug === "string" ? clean.slug : "";
    const projected = previewArticles.find((article) => stegaClean(article).slug === slug);
    const failures = projected ? getArticleValidationFailures(projected) : ["query: draft was not projected"];
    const final = slug ? await provider.getArticleBySlug(slug) : undefined;
    const required = ["slug", "summary", "publicationDate", "referenceIds"].filter((field) => {
      const value = clean[field];
      return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    });
    console.log(JSON.stringify({
      _id: clean._id,
      _type: clean._type,
      slug,
      lifecycle: "draftOnly",
      missingRequiredFields: required,
      referenceIds: Array.isArray(clean.referenceIds) ? clean.referenceIds : [],
      subtitleLength: typeof clean.subtitle === "string" ? clean.subtitle.length : 0,
      summaryLength: typeof clean.summary === "string" ? clean.summary.length : 0,
      rawQueryResult: projected ? "present" : "absent",
      adapterResult: projected && mapArticle(projected) ? "valid" : "excluded",
      cleanValidationResult: failures.length ? "invalid" : "valid",
      finalProviderResult: final ? "present" : "absent",
      exclusionReasons: failures,
    }));
  }

  const rawSettings = await rawClient.fetch<Array<Record<string, unknown>>>(`*[
    _id in ["siteSettings", "drafts.siteSettings"] && _type == "siteSettings"
  ]`, {}, { cache: "no-store", perspective: "raw", useCdn: false });
  const published = rawSettings.find(({ _id }) => _id === "siteSettings");
  const draft = rawSettings.find(({ _id }) => _id === "drafts.siteSettings");
  const finalSettings = await provider.getSiteSettings();
  const publishedTagline = published && (published.homepageTagline ?? published.tagline);
  const draftTagline = draft && (draft.homepageTagline ?? draft.tagline);

  console.log("\nSite Settings preview diagnostic");
  console.log(JSON.stringify({
    variants: rawSettings.map(({ _id, _type }) => ({ _id, _type })),
    lifecycle: draft && published ? "publishedWithChanges" : draft ? "draftOnly" : published ? "publishedOnly" : "absent",
    draftAdapterResult: draft && mapSiteSettings(draft) ? "valid" : "excluded",
    publishedAdapterResult: published && mapSiteSettings(published) ? "valid" : "excluded",
    finalProviderResult: finalSettings ? "present" : "absent",
    finalMatchesDraftTagline: Boolean(draftTagline) && stegaClean(finalSettings.tagline) === stegaClean(draftTagline),
    finalMatchesPublishedTagline: Boolean(publishedTagline) && stegaClean(finalSettings.tagline) === stegaClean(publishedTagline),
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Preview provider diagnostic failed.");
  process.exitCode = 1;
});
