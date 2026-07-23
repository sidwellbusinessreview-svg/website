import { loadEnvConfig } from "@next/env";
import { createClient } from "next-sanity";
import { getSanityEnvironment } from "../src/sanity/env";
import { createSanityContentProvider } from "../src/content/sanity/provider";
import { ALL_PUBLISHED_ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY } from "../src/content/sanity/queries";
import type { RawSanityArticle } from "../src/content/sanity/adapters";

loadEnvConfig(process.cwd());

const environment = getSanityEnvironment();
if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
const { projectId, dataset, apiVersion } = environment;

const slug = process.env.CMS_TEST_ARTICLE_SLUG?.trim() || "cms-integration-test-article";
const baseConfig = {
  projectId,
  dataset,
  apiVersion,
  perspective: "published" as const,
};
const originClient = createClient({ ...baseConfig, useCdn: false });
const cdnClient = createClient({ ...baseConfig, useCdn: true });

async function main() {
  const [originDetail, originCollection, cdnDetail, cdnCollection] = await Promise.all([
    originClient.fetch<RawSanityArticle | null>(ARTICLE_BY_SLUG_QUERY, { slug }),
    originClient.fetch<RawSanityArticle[]>(ALL_PUBLISHED_ARTICLES_QUERY),
    cdnClient.fetch<RawSanityArticle | null>(ARTICLE_BY_SLUG_QUERY, { slug }),
    cdnClient.fetch<RawSanityArticle[]>(ALL_PUBLISHED_ARTICLES_QUERY),
  ]);
  const provider = createSanityContentProvider(cdnClient);
  const [providerDetail, providerCollection] = await Promise.all([
    provider.getArticleBySlug(slug),
    provider.getArticles(),
  ]);
  const collectionTitle = (values: RawSanityArticle[]) => values.find((article) => article.slug === slug)?.title;
  const results = {
    originDetail: originDetail?.title,
    originCollection: collectionTitle(originCollection),
    cdnDetail: cdnDetail?.title,
    cdnCollection: collectionTitle(cdnCollection),
    providerDetail: providerDetail?.title,
    providerCollection: providerCollection.find((article) => article.slug === slug)?.title,
  };

  console.log(`Target: project ${projectId}, dataset ${dataset}, API ${apiVersion}`);
  console.log(`Published Article slug: ${slug}`);
  for (const [source, title] of Object.entries(results)) console.log(`${source}: ${String(title ?? "missing")}`);
  const authoritative = results.originDetail;
  let mismatch = false;
  for (const [source, title] of Object.entries(results)) {
    if (source !== "originDetail" && title !== authoritative) {
      mismatch = true;
      console.log(`STALE OR MISMATCHED: ${source}`);
    }
  }
  console.log("This read-only CLI comparison can distinguish Sanity origin/CDN/provider results. It cannot inspect a browser cache or a running Next.js page cache.");
  if (mismatch) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Cache diagnostic failed.");
  process.exitCode = 1;
});
