import { getCliClient } from "sanity/cli";
import { planMalformedContributorRepairs, type RawDocument } from "./content-operations";
import { writeReport } from "./cli-utils";
import { getSanityEnvironment } from "../../src/sanity/env";
import { configureAuditClient } from "./audit-client";

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const { client } = configureAuditClient(getCliClient({ apiVersion: environment.apiVersion }));
  const documents = await client.fetch<RawDocument[]>('*[_type == "article"]{_id,_type,title,contributors}');
  const plan = planMalformedContributorRepairs(documents);
  console.log(plan.length ? "Incomplete Contributor selections found:" : "No persisted incomplete Contributor selections found.");
  for (const item of plan) console.log(`- ${item.title} — ${item.state} — ${item.unsetPaths.length} incomplete ${item.unsetPaths.length === 1 ? "selection" : "selections"}`);
  const report = await writeReport("malformed-contributor-repair-dry-run", { dryRun: true, applied: false, plan });
  console.log(`Dry-run report: ${report}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Contributor reference audit failed."); process.exitCode = 1; });
