import { getCliClient } from "sanity/cli";
import { confirmationMatches, planLegacyCleanup, type RawDocument } from "./content-operations";
import { applying, argument, assertExpectedTarget, assertRecentExport, writeReport } from "./cli-utils";
import { getSanityEnvironment } from "../../src/sanity/env";
import { configureAuditClient } from "./audit-client";

async function main() {
const environment = getSanityEnvironment();
if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
const { client } = configureAuditClient(getCliClient({ apiVersion: environment.apiVersion }));
const config = client.config();
const documents = await client.fetch<RawDocument[]>("*[]");
const plan = planLegacyCleanup(documents);
console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
console.log(plan.deleteIds.length ? `Would delete:\n${plan.deleteIds.map((id) => `- ${id}`).join("\n")}` : "No legacy documents found.");
if (plan.blockedReferences.length) console.log(`Blocked by current-document references:\n${plan.blockedReferences.map((ref) => `- ${ref.sourceId} → ${ref.targetId} (${ref.path})`).join("\n")}`);
let applied = false;
if (applying()) {
  if (!client.config().token) throw new Error("Refusing to apply without an authenticated client. Re-run with --with-user-token after sanity login.");
  assertExpectedTarget(String(config.projectId), String(config.dataset));
  await assertRecentExport();
  if (!confirmationMatches(argument("--confirm"), "CLEAN LEGACY CONTENT")) throw new Error('Refusing to apply without --confirm "CLEAN LEGACY CONTENT".');
  if (plan.blockedReferences.length) throw new Error("Resolve references from current documents before deleting legacy targets.");
  if (plan.deleteIds.length) {
    let transaction = client.transaction();
    for (const id of plan.deleteIds) transaction = transaction.delete(id);
    await transaction.commit();
    applied = true;
  }
}
const report = await writeReport("cleanup-legacy", { target: { projectId: config.projectId, dataset: config.dataset }, dryRun: !applying(), applied, plan });
console.log(`${applying() ? "Apply" : "Dry run"} complete. Report: ${report}`);
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Legacy cleanup failed."); process.exitCode = 1; });
