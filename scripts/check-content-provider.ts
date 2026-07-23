import { loadEnvConfig } from "@next/env";
import { getSanityContentProvider } from "../src/content/sanity/provider";
import { getPublicSanityClient } from "../src/sanity/lib/client";
import { ALL_PUBLISHED_ARTICLES_QUERY } from "../src/content/sanity/queries";
import { getArticleValidationFailures, type RawSanityArticle } from "../src/content/sanity/adapters";

loadEnvConfig(process.cwd());

async function main() {
  const provider = getSanityContentProvider();
  const client = getPublicSanityClient();
  if (!client) throw new Error("Public Sanity configuration is incomplete.");
  const config = client.config();
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
  console.log(`API version: ${config.apiVersion}; perspective: published; CDN: enabled`);
  console.log("Audit scope: published-only public-provider diagnostic (draft state not checked)");
  const rawArticles = await client.fetch<RawSanityArticle[]>(ALL_PUBLISHED_ARTICLES_QUERY);
  const invalid = rawArticles.flatMap((article) => {
    const failures = getArticleValidationFailures(article);
    return failures.length ? [{ article, failures }] : [];
  });
  const [articles, contributors, about] = await Promise.all([
    provider.getArticles(), provider.getContributors(), provider.getStaticPageBySlug("about"),
  ]);
  console.log(`Sanity provider valid: ${articles.length} published articles, ${contributors.length} published contributors, About ${about ? "available" : "missing"}.`);
  const contributorNames = new Map(contributors.map((contributor) => [contributor.slug, contributor.name]));
  for (const article of articles) console.log(`- ${article.title} (${article.slug}) — ${article.contributorSlugs.map((slug) => contributorNames.get(slug) ?? slug).join(", ")}`);
  for (const { article, failures } of invalid) {
    console.error(`INVALID PUBLISHED ARTICLE: ${String(article.title ?? "Untitled")} (${String(article.slug ?? "missing slug")})`);
    for (const failure of failures) console.error(`  - ${failure}`);
  }
  if (invalid.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Sanity provider check failed.");
  process.exitCode = 1;
});
