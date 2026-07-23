import { getCliClient } from "sanity/cli";
import { auditSingletonDocuments, type SingletonHistoryEvidence } from "../../src/sanity/singletonAudit";
import { singletonDefinitions } from "../../src/sanity/singletons";
import { getSanityEnvironment } from "../../src/sanity/env";
import { CURRENT_PAGE_QUERY, type CurrentPageVersion } from "../../src/sanity/pageExistence";
import type { RawDocument } from "./content-operations";
import { writeReport } from "./cli-utils";
import { configureAuditClient } from "./audit-client";

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const { client, mode } = configureAuditClient(getCliClient({ apiVersion: environment.apiVersion }));
  const config = client.config();
  if (config.projectId !== environment.projectId || config.dataset !== environment.dataset) {
    throw new Error("The CLI target does not match the public Sanity environment configuration.");
  }
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}`);
  console.log(`API version: ${environment.apiVersion}; perspective: ${mode === "authenticated" ? "raw" : "published"}; CDN: disabled`);
  console.log(`Exact ${mode === "authenticated" ? "raw current-record" : "published-only"} query:\n${CURRENT_PAGE_QUERY}`);
  const documents = await client.fetch<RawDocument[]>("*[]");
  const exactCurrentResponses = Object.fromEntries(await Promise.all(singletonDefinitions.map(async ({ documentId, schemaType }) => [
    documentId,
    await client.fetch<CurrentPageVersion[]>(CURRENT_PAGE_QUERY, {
      publishedId: documentId,
      draftId: `drafts.${documentId}`,
      schemaType,
    }, { perspective: "raw", tag: "singleton-audit-existence" }),
  ] as const)));
  const dataset = client.config().dataset;
  const historyEntries = mode === "authenticated" ? await Promise.all(singletonDefinitions.map(async ({ documentId }) => {
    const ids = [documentId, `drafts.${documentId}`];
    const transactionRequest = client.request<Buffer | string>({
      url: `/data/history/${dataset}/transactions/${ids.join(",")}`,
      query: { excludeContent: "true", includeIdentifiedDocumentsOnly: "true" },
      tag: "singleton-audit-transactions",
    }).then((value) => ({ value, available: true })).catch(() => ({ value: "", available: false }));
    const [revisionResponse, transactionResult, ...eventResponses] = await Promise.all([
      client.request<{ documents?: RawDocument[] }>({
        url: `/data/history/${dataset}/documents/${ids.join(",")}?lastRevision=true`,
        tag: "singleton-audit-history",
      }),
      transactionRequest,
      ...ids.map((id) => client.request<{ events?: Record<string, Array<{ type?: string }> | undefined> }>({
        url: `/data/history/${dataset}/events/documents/${id}?limit=100`,
        tag: "singleton-audit-events",
      })),
    ]);
    const revisions = revisionResponse.documents ?? [];
    const transactionLines = transactionResult.value.toString().split("\n").filter(Boolean);
    const transactionTypes = transactionLines.flatMap((line) => {
      try {
        const transaction = JSON.parse(line) as { mutations?: Array<Record<string, unknown>> };
        return (transaction.mutations ?? []).flatMap((mutation) => Object.keys(mutation));
      } catch { return ["unparsedTransaction"]; }
    });
    const eventTypes = eventResponses.flatMap((response, index) =>
      (response.events?.[ids[index]] ?? []).flatMap((event) => event.type ? [event.type] : []),
    );
    const latestEventType = eventTypes[0];
    const history: SingletonHistoryEvidence = {
      available: eventTypes.length > 0 || revisions.length > 0 || transactionLines.length > 0,
      restorableRevision: revisions.length > 0,
      revisionIds: revisions.map(({ _id }) => _id).sort(),
      eventTypes,
      transactionTypes,
      probeComplete: transactionResult.available,
      ...(latestEventType?.toLowerCase().includes("discard") || transactionTypes.includes("delete") ? { latestEvent: "discard" } : {}),
    };
    return [documentId, history] as const;
  })) : singletonDefinitions.map(({ documentId }) => [documentId, {
    available: false, restorableRevision: false, revisionIds: [], eventTypes: [], transactionTypes: [], probeComplete: false,
  }] as const);
  const audit = auditSingletonDocuments(documents, Object.fromEntries(historyEntries));
  const report = await writeReport("singleton-audit", audit);
  for (const singleton of audit.singletons) {
    console.log(`${singleton.documentId} (${singleton.schemaType})`);
    console.log(`  expected ID: ${singleton.documentId}`);
    console.log(`  published: ${singleton.publishedPresent ? "present" : "absent"}`);
    console.log(`  draft: ${mode === "authenticated" ? (singleton.draftPresent ? "present" : "absent") : "not checked (published-only audit)"}`);
    console.log(`  history: ${singleton.history.restorableRevision ? (singleton.publishedPresent || singleton.draftPresent ? "retained revision available" : "deleted revision available") : singleton.history.available ? "events found; no restorable revision" : "no retained history found through available APIs"}`);
    if (!singleton.history.probeComplete) console.log("  history probe: partial (transaction history is not available to this CLI session)");
    console.log(`  state: ${mode === "authenticated" ? singleton.state : singleton.publishedPresent ? "published present; draft state not checked" : "published absent; draft state not checked"}`);
    console.log(`  exact ${mode === "authenticated" ? "raw current" : "published-only"} response: ${JSON.stringify(exactCurrentResponses[singleton.documentId])}`);
    if (singleton.history.eventTypes.length) console.log(`  history event types: ${[...new Set(singleton.history.eventTypes)].join(", ")}`);
    if (singleton.history.transactionTypes.length) console.log(`  history transaction types: ${[...new Set(singleton.history.transactionTypes)].join(", ")}`);
    if (singleton.state === "deletedRestorable") console.log("  Studio recovery: inspect the latest revision or create a clean draft");
    if (singleton.expectedIdType) console.log(`  ERROR expected ID is occupied by type: ${singleton.expectedIdType}`);
    for (const id of singleton.incorrectIds) console.log(`  ERROR incorrectly named singleton: ${id}`);
  }
  for (const id of audit.legacySingletonIds) console.log(`ERROR legacy singleton ID: ${id}`);
  for (const reference of audit.obsoleteSingletonReferences) console.log(`ERROR obsolete singleton reference: ${reference.sourceId} → ${reference.targetId} at ${reference.path}`);
  console.log(`Report: ${report}`);
  if (!audit.valid) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Singleton audit failed."); process.exitCode = 1; });
