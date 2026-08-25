import { getCliClient } from "sanity/cli";
import { getSanityEnvironment } from "../../src/sanity/env";
import { applying, argument, assertExpectedTarget, assertRecentExport, writeReport } from "./cli-utils";
import { valueChecksum } from "./contributor-role-cleanup";
import { compareContributorDraftPairs, redundantDraftIds, type ContributorDocument } from "./redundant-contributor-drafts";

const CONTRIBUTOR_QUERY = '*[_type == "contributor" && !(_id in path("versions.**"))]{...}|order(_id asc)';
const ARTICLE_REVISIONS_QUERY = '*[_type == "article" && !(_id in path("versions.**"))]{_id,_rev}|order(_id asc)';
const ARTICLE_REFERENCES_QUERY = '*[_type == "article" && !(_id in path("versions.**"))]{_id,"contributors":contributors[]{_ref,"resolved":defined(@->._id)}}|order(_id asc)';
const SETTINGS_REFERENCES_QUERY = '*[_type == "siteSettings" && !(_id in path("versions.**"))]{_id,editorsInChief[]{contributor->{_id}},editors[]{contributor->{_id}},facultyAdviser[]{contributor->{_id}}}|order(_id asc)';

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const client = getCliClient({ apiVersion: environment.apiVersion }).withConfig({ perspective: "raw", useCdn: false });
  if (!client.config().token) throw new Error("Contributor draft cleanup requires the signed-in CLI user. Use the package script; it supplies --with-user-token.");
  const config = client.config();
  if (config.projectId !== environment.projectId || config.dataset !== environment.dataset) throw new Error("The CLI target does not match the configured Sanity environment.");

  const [documents, articleRevisions, articleReferences, settingsReferences] = await Promise.all([
    client.fetch<ContributorDocument[]>(CONTRIBUTOR_QUERY, {}, { cache: "no-store" }),
    client.fetch<Array<{ _id: string; _rev: string }>>(ARTICLE_REVISIONS_QUERY, {}, { cache: "no-store" }),
    client.fetch<Array<{ _id: string; contributors: Array<{ _ref?: string; resolved: boolean }> }>>(ARTICLE_REFERENCES_QUERY, {}, { cache: "no-store" }),
    client.fetch<unknown[]>(SETTINGS_REFERENCES_QUERY, {}, { cache: "no-store" }),
  ]);
  const comparisons = compareContributorDraftPairs(documents);
  const deleteIds = redundantDraftIds(comparisons);
  const unresolved = articleReferences.flatMap((article) => article.contributors.filter(({ resolved }) => !resolved).map(({ _ref }) => `${article._id}:${_ref ?? "missing"}`));
  if (unresolved.length) throw new Error(`Refusing cleanup: unresolved Article Contributor references: ${unresolved.join(", ")}`);

  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}; API ${environment.apiVersion}; raw, CDN disabled`);
  console.log(`Contributor draft/published pairs: ${comparisons.length}`);
  for (const comparison of comparisons) {
    console.log(`- ${comparison.name}: ${comparison.identical ? "SEMANTICALLY IDENTICAL" : "MEANINGFULLY DIFFERENT"}`);
    for (const difference of comparison.differingFields) console.log(`  ${difference.field}: published=${JSON.stringify(difference.published)} draft=${JSON.stringify(difference.draft)}`);
  }

  const beforeReport = await writeReport("redundant-contributor-drafts-before", {
    target: { projectId: config.projectId, dataset: config.dataset, apiVersion: environment.apiVersion },
    dryRun: !applying(), comparisons, deleteIds, articleRevisions, articleReferences, settingsReferences,
  });
  console.log(`Pre-mutation audit/backup: ${beforeReport}`);

  if (!applying()) {
    console.log(`Dry run complete. Eligible redundant drafts: ${deleteIds.length}`);
    return;
  }

  assertExpectedTarget(String(config.projectId), String(config.dataset));
  await assertRecentExport();
  if (argument("--confirm") !== "DELETE REDUNDANT CONTRIBUTOR DRAFTS") throw new Error('Refusing to apply without --confirm "DELETE REDUNDANT CONTRIBUTOR DRAFTS".');
  if (!deleteIds.length) { console.log("Nothing eligible to delete."); return; }
  let transaction = client.transaction();
  for (const id of deleteIds) transaction = transaction.delete(id);
  await transaction.commit({ visibility: "sync" });

  const [afterDocuments, afterArticleRevisions, afterArticleReferences, afterSettingsReferences] = await Promise.all([
    client.fetch<ContributorDocument[]>(CONTRIBUTOR_QUERY, {}, { cache: "no-store" }),
    client.fetch<Array<{ _id: string; _rev: string }>>(ARTICLE_REVISIONS_QUERY, {}, { cache: "no-store" }),
    client.fetch<unknown[]>(ARTICLE_REFERENCES_QUERY, {}, { cache: "no-store" }),
    client.fetch<unknown[]>(SETTINGS_REFERENCES_QUERY, {}, { cache: "no-store" }),
  ]);
  const afterById = new Map(afterDocuments.map((document) => [document._id, document]));
  const failures: string[] = [];
  for (const comparison of comparisons.filter(({ identical }) => identical)) {
    if (afterById.has(comparison.draftId)) failures.push(`${comparison.draftId} still exists`);
    const published = afterById.get(comparison.publishedId);
    if (!published || published._rev !== comparison.publishedRev) failures.push(`${comparison.publishedId} changed`);
  }
  if (valueChecksum(afterArticleRevisions) !== valueChecksum(articleRevisions)) failures.push("Article revisions changed");
  if (valueChecksum(afterArticleReferences) !== valueChecksum(articleReferences)) failures.push("Article Contributor references changed");
  if (valueChecksum(afterSettingsReferences) !== valueChecksum(settingsReferences)) failures.push("Publication Settings references changed");
  if (failures.length) throw new Error(`Post-cleanup verification failed: ${failures.join("; ")}`);
  const afterReport = await writeReport("redundant-contributor-drafts-after", { deleteIds, afterArticleRevisions, afterArticleReferences, afterSettingsReferences, failures });
  console.log(`Apply complete. Deleted ${deleteIds.length} redundant drafts. Verification report: ${afterReport}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Contributor draft cleanup failed."); process.exitCode = 1; });
