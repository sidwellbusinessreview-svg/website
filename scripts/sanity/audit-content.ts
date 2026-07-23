import { getCliClient } from "sanity/cli";
import { auditDocuments, type RawDocument } from "./content-operations";
import { writeReport } from "./cli-utils";
import { ALL_PUBLISHED_ARTICLES_QUERY } from "../../src/content/sanity/queries";
import { getArticleValidationFailures, type RawSanityArticle } from "../../src/content/sanity/adapters";
import { getSanityEnvironment } from "../../src/sanity/env";
import { configureAuditClient } from "./audit-client";

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const { client, mode } = configureAuditClient(getCliClient({ apiVersion: environment.apiVersion }));
  const config = client.config();
  if (config.projectId !== environment.projectId || config.dataset !== environment.dataset) throw new Error("The CLI target does not match the public Sanity environment configuration.");
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
  console.log(`API version: ${environment.apiVersion}; perspective: ${mode === "authenticated" ? "raw" : "published"}; CDN: disabled`);
  const documents = await client.fetch<RawDocument[]>("*[]");
  const audit = auditDocuments(documents);
  const projectedArticles = await client.fetch<RawSanityArticle[]>(ALL_PUBLISHED_ARTICLES_QUERY);
  const invalidPublishedArticles = projectedArticles.flatMap((article) => {
    const failures = getArticleValidationFailures(article);
    return failures.length ? [{ id: String(article._id ?? "missing id"), title: String(article.title ?? "Untitled"), slug: String(article.slug ?? "missing slug"), failures }] : [];
  });
  const draftOnlyArticles = audit.documents.filter(({ type, state, id }) => type === "article" && state === "draft" && !audit.pairs.includes(id.replace(/^drafts\./, "")));
  const report = await writeReport("audit", { ...audit, draftOnlyArticles, invalidPublishedArticles, valid: audit.valid && invalidPublishedArticles.length === 0 });
  for (const document of audit.documents) console.log(`${document.state.padEnd(9)} ${document.type.padEnd(14)} ${document.id} — ${document.label}`);
  console.log(mode === "authenticated" ? `Draft/published pairs: ${audit.pairs.length}` : "Draft/published pairs: not checked (published-only audit)");
  console.log(mode === "authenticated" ? `Draft-only Articles: ${draftOnlyArticles.length}` : "Draft-only Articles: not checked (published-only audit)");
  console.log(`Invalid published Articles: ${invalidPublishedArticles.length}`);
  for (const article of invalidPublishedArticles) {
    console.log(`  ${article.title} (${article.slug}; ${article.id})`);
    for (const failure of article.failures) console.log(`    - ${failure}`);
  }
  console.log(`Legacy documents: ${audit.legacyDocuments.length}`);
  console.log(`Unregistered types: ${audit.unregisteredTypes.length}`);
  console.log(`Dangling references: ${audit.danglingReferences.length}`);
  console.log(`Documents with obsolete fields: ${audit.obsoleteFields.length}`);
  console.log(`Possibly orphaned assets (informational): ${audit.orphanedAssets.length}`);
  console.log(`Report: ${report}`);
  if (!audit.valid || invalidPublishedArticles.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Dataset audit failed."); process.exitCode = 1; });
