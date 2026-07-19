import { getCliClient } from "sanity/cli";
import { confirmationMatches, planEditorialReset, type RawDocument } from "./content-operations";
import { applying, argument, assertExpectedTarget, writeReport } from "./cli-utils";

async function main() {
const client = getCliClient({ apiVersion: "2025-02-19" }).withConfig({ perspective: "raw", useCdn: false });
const config = client.config();
const documents = await client.fetch<RawDocument[]>("*[]");
const deleteIds = planEditorialReset(documents);
console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
console.log(deleteIds.length ? `Editorial documents selected:\n${deleteIds.map((id) => `- ${id}`).join("\n")}` : "No editorial documents found. Assets are preserved.");
let applied = false;
if (applying()) {
  if (!client.config().token) throw new Error("Refusing to apply without an authenticated client. Re-run with --with-user-token after sanity login.");
  assertExpectedTarget(String(config.projectId), String(config.dataset));
  if (!confirmationMatches(argument("--confirm"), "RESET TEST CONTENT")) throw new Error('Refusing to apply without --confirm "RESET TEST CONTENT".');
  if (process.env.NODE_ENV === "production" && argument("--production-override") !== "I ACCEPT PRODUCTION DATA LOSS") throw new Error("Refusing to reset in production mode without the additional production override.");
  if (deleteIds.length) {
    let transaction = client.transaction();
    for (const id of deleteIds) transaction = transaction.delete(id);
    await transaction.commit();
    applied = true;
  }
}
const report = await writeReport("reset-test-content", { target: { projectId: config.projectId, dataset: config.dataset }, dryRun: !applying(), assetsPreserved: true, applied, deleteIds });
console.log(`${applying() ? "Apply" : "Dry run"} complete. Report: ${report}`);
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Test-content reset failed."); process.exitCode = 1; });
