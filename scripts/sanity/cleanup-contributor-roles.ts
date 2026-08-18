import { getCliClient } from "sanity/cli";
import { getSanityEnvironment } from "../../src/sanity/env";
import { configureAuditClient } from "./audit-client";
import { applying, argument, assertExpectedTarget, assertRecentExport, writeReport } from "./cli-utils";
import { confirmationMatches } from "./content-operations";
import { planContributorRoleCleanup, valueChecksum, verifyContributorRoleCleanup, type ContributorRoleDocument } from "./contributor-role-cleanup";

const QUERY = `*[_type == "contributor" && !(_id in path("versions.**"))]{
  _id,_type,name,slug,role,graduationYear,active,migrationSourceId,importBatchId,
  roles,position,editorialRole
}|order(_id asc)`;

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const { client, mode } = configureAuditClient(getCliClient({ apiVersion: environment.apiVersion }));
  if (mode !== "authenticated" || !client.config().token) throw new Error("Contributor role cleanup requires an authenticated CLI client. Re-run with --with-user-token.");
  const config = client.config();
  if (config.projectId !== environment.projectId || config.dataset !== environment.dataset) throw new Error("The CLI target does not match the configured Sanity environment.");
  const documents = await client.fetch<ContributorRoleDocument[]>(QUERY);
  const plan = planContributorRoleCleanup(documents);
  const aboutReferences = await client.fetch<Array<{ _id: string; editorsInChief?: unknown; editors?: unknown; facultyAdviser?: unknown }>>('*[_type == "staticPage" && _id in ["about", "drafts.about"]]{_id,editorsInChief,editors,facultyAdviser}|order(_id asc)');
  const affectedIds = plan.map(({ id }) => id.replace(/^drafts\./, ""));
  const articleReferenceAudit = await client.fetch<Array<{ _id: string; contributors: Array<{ _ref?: string; resolved: boolean }> }>>('*[_type=="article" && references($ids)]{_id,"contributors":contributors[]{_ref,"resolved":defined(@->._id)}}|order(_id asc)', { ids: affectedIds });
  const articleReferenceCounts = { published: articleReferenceAudit.filter(({ _id }) => !_id.startsWith("drafts.")).length, drafts: articleReferenceAudit.filter(({ _id }) => _id.startsWith("drafts.")).length };
  const unresolvedArticleReferences = articleReferenceAudit.flatMap((article) => article.contributors.filter(({ resolved }) => !resolved).map(({ _ref }) => `${article._id}:${_ref ?? "missing"}`));
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}; API ${environment.apiVersion}; raw, CDN disabled`);
  console.log(`Exact query: ${QUERY.replace(/\s+/g, " ").trim()}`);
  console.log(plan.length ? `Contributor role fields found: ${plan.length}` : "Contributor role fields found: 0");
  for (const item of plan) console.log(`- ${item.id} — ${item.name}: role=${JSON.stringify(item.fields.role)}`);
  console.log(`About records inspected independently: ${aboutReferences.map(({ _id }) => _id).join(", ") || "none"}`);
  console.log(`Article references retained: ${articleReferenceCounts.published ?? 0} published; ${articleReferenceCounts.drafts ?? 0} drafts`);
  if (unresolvedArticleReferences.length) throw new Error(`Unresolved Article Contributor references found: ${unresolvedArticleReferences.join(", ")}`);

  let applied = false;
  let verification: ReturnType<typeof verifyContributorRoleCleanup> | undefined;
  if (applying()) {
    assertExpectedTarget(String(config.projectId), String(config.dataset));
    await assertRecentExport();
    if (!confirmationMatches(argument("--confirm"), "REMOVE CONTRIBUTOR ROLES")) throw new Error('Refusing to apply without --confirm "REMOVE CONTRIBUTOR ROLES".');
    let transaction = client.transaction();
    for (const item of plan) transaction = transaction.patch(item.id, { unset: ["role"] });
    if (plan.length) await transaction.commit({ visibility: "sync" });
    const after = await client.fetch<ContributorRoleDocument[]>(QUERY);
    verification = verifyContributorRoleCleanup(plan, after);
    const [aboutAfter, articleReferencesAfter] = await Promise.all([
      client.fetch<Array<{ _id: string; editorsInChief?: unknown; editors?: unknown; facultyAdviser?: unknown }>>('*[_type == "staticPage" && _id in ["about", "drafts.about"]]{_id,editorsInChief,editors,facultyAdviser}|order(_id asc)'),
      client.fetch<Array<{ _id: string; contributors: Array<{ _ref?: string; resolved: boolean }> }>>('*[_type=="article" && references($ids)]{_id,"contributors":contributors[]{_ref,"resolved":defined(@->._id)}}|order(_id asc)', { ids: affectedIds }),
    ]);
    if (valueChecksum(aboutAfter) !== valueChecksum(aboutReferences)) verification.failures.push("About staff references changed");
    if (valueChecksum(articleReferencesAfter) !== valueChecksum(articleReferenceAudit)) verification.failures.push("Article Contributor references changed or stopped resolving");
    verification.valid = verification.failures.length === 0;
    if (!verification.valid) throw new Error(`Post-cleanup verification failed: ${verification.failures.join("; ")}`);
    applied = plan.length > 0;
  }
  const report = await writeReport("contributor-role-cleanup", {
    target: { projectId: config.projectId, dataset: config.dataset, apiVersion: environment.apiVersion },
    query: QUERY, dryRun: !applying(), applied, plan, aboutReferences, articleReferenceCounts, unresolvedArticleReferences, verification,
  });
  console.log(`${applying() ? "Apply" : "Dry run"} complete. Rollback-inspection report: ${report}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Contributor role cleanup failed."); process.exitCode = 1; });
