import { getCliClient } from "sanity/cli";
import { auditDocuments, type RawDocument } from "./content-operations";
import { writeReport } from "./cli-utils";

async function main() {
  const client = getCliClient({ apiVersion: "2025-02-19" }).withConfig({ perspective: "raw", useCdn: false });
  const documents = await client.fetch<RawDocument[]>("*[]");
  const audit = auditDocuments(documents);
  const report = await writeReport("audit", audit);
  for (const document of audit.documents) console.log(`${document.state.padEnd(9)} ${document.type.padEnd(14)} ${document.id} — ${document.label}`);
  console.log(`Draft/published pairs: ${audit.pairs.length}`);
  console.log(`Legacy documents: ${audit.legacyDocuments.length}`);
  console.log(`Unregistered types: ${audit.unregisteredTypes.length}`);
  console.log(`Dangling references: ${audit.danglingReferences.length}`);
  console.log(`Documents with obsolete fields: ${audit.obsoleteFields.length}`);
  console.log(`Possibly orphaned assets (informational): ${audit.orphanedAssets.length}`);
  console.log(`Report: ${report}`);
  if (!audit.valid) process.exitCode = 1;
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Dataset audit failed."); process.exitCode = 1; });
