import { getCliClient } from "sanity/cli";
import { confirmationMatches, planFieldCleanup, type RawDocument } from "./content-operations";
import { applying, argument, assertExpectedTarget, assertRecentExport, writeReport } from "./cli-utils";

async function main() {
  const client = getCliClient({ apiVersion: "2025-02-19" }).withConfig({ perspective: "raw", useCdn: false });
  const config = client.config();
  const documents = await client.fetch<RawDocument[]>("*[]");
  const plan = planFieldCleanup(documents);
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
  console.log(plan.length ? `Would unset obsolete fields:\n${plan.map(({ id, unset }) => `- ${id}: ${unset.join(", ")}`).join("\n")}` : "No obsolete Phase 11 fields found.");
  let applied = false;
  if (applying()) {
    if (!client.config().token) throw new Error("Refusing to apply without an authenticated client. Re-run with --with-user-token after sanity login.");
    assertExpectedTarget(String(config.projectId), String(config.dataset));
    await assertRecentExport();
    if (!confirmationMatches(argument("--confirm"), "CLEAN OBSOLETE FIELDS")) throw new Error('Refusing to apply without --confirm "CLEAN OBSOLETE FIELDS".');
    let transaction = client.transaction();
    for (const patch of plan) transaction = transaction.patch(patch.id, { unset: patch.unset });
    if (plan.length) await transaction.commit();
    applied = plan.length > 0;
  }
  const report = await writeReport("cleanup-obsolete-fields", { target: { projectId: config.projectId, dataset: config.dataset }, dryRun: !applying(), applied, plan });
  console.log(`${applying() ? "Apply" : "Dry run"} complete. Report: ${report}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Field cleanup failed."); process.exitCode = 1; });
