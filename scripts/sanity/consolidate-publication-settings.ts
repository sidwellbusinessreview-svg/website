import {createDraftId} from "@sanity/id-utils";
import {getCliClient} from "sanity/cli";
import {getSanityEnvironment} from "../../src/sanity/env";
import {applying, argument, assertExpectedTarget, assertRecentExport, writeReport} from "./cli-utils";
import {confirmationMatches} from "./content-operations";
import {checksum, findPublicationSettingsCollisions, mapAboutFields, type RawSanityDocument} from "./publication-settings-consolidation";

const RECORD_QUERY = '*[_id in ["about","drafts.about","siteSettings","drafts.siteSettings"]]{...}|order(_id asc)';
const ARTICLE_REVISIONS_QUERY = '*[_type == "article" && !(_id in path("versions.**"))]{_id,_rev}|order(_id asc)';

function byId(documents: RawSanityDocument[]) { return new Map(documents.map((document) => [document._id, document])); }

async function main() {
  const environment = getSanityEnvironment();
  if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");
  const client = getCliClient({apiVersion: environment.apiVersion}).withConfig({perspective: "raw", useCdn: false});
  if (!client.config().token) throw new Error("Publication Settings consolidation requires an authenticated CLI user. Run it through the package script, which supplies --with-user-token.");
  console.log("Mutation authentication: signed-in Sanity CLI user (token value hidden)");
  const config = client.config();
  if (config.projectId !== environment.projectId || config.dataset !== environment.dataset) throw new Error("CLI and application Sanity targets do not match.");
  const documents = await client.fetch<RawSanityDocument[]>(RECORD_QUERY);
  const current = byId(documents);
  const publishedAbout = current.get("about");
  const draftAbout = current.get("drafts.about");
  const publishedSettings = current.get("siteSettings");
  const draftSettings = current.get("drafts.siteSettings");
  if (!publishedSettings) throw new Error("Published Publication Settings is required before consolidation.");
  if (!publishedAbout && !draftAbout) throw new Error("No current About document exists to consolidate.");
  const publishedFields = mapAboutFields(publishedAbout ?? draftAbout);
  const draftFields = mapAboutFields(draftAbout ?? publishedAbout);
  const collisions = [
    ...findPublicationSettingsCollisions(publishedSettings, publishedFields).map((field) => `siteSettings.${field}`),
    ...(draftSettings ? findPublicationSettingsCollisions(draftSettings, draftFields).map((field) => `drafts.siteSettings.${field}`) : []),
  ];
  if (collisions.length) throw new Error(`Refusing to overwrite existing destination fields: ${collisions.join(", ")}`);
  const articleRevisions = await client.fetch<Array<{_id: string; _rev: string}>>(ARTICLE_REVISIONS_QUERY);
  const plan = {
    sourceIds: [publishedAbout?._id, draftAbout?._id].filter(Boolean), destinationIds: ["siteSettings", "drafts.siteSettings"],
    publishedFields, draftFields, collisions, articleRevisions,
  };
  console.log(`Target: project ${config.projectId}, dataset ${config.dataset}; raw, CDN disabled`);
  console.log(`Sources: ${plan.sourceIds.join(", ")}; destinations: ${plan.destinationIds.join(", ")}`);
  console.log(`Published destination fields: ${Object.keys(publishedFields).join(", ")}`);
  console.log(`Draft destination fields: ${Object.keys(draftFields).join(", ")}`);
  console.log(`Editors-in-Chief: published ${Array.isArray(publishedFields.editorsInChief) ? publishedFields.editorsInChief.length : 0}; draft ${Array.isArray(draftFields.editorsInChief) ? draftFields.editorsInChief.length : 0}`);
  const preflightReport = await writeReport("publication-settings-consolidation-preflight", {target: {projectId: config.projectId, dataset: config.dataset, apiVersion: environment.apiVersion}, documents, plan});
  console.log(`Pre-mutation backup/audit artifact: ${preflightReport}`);
  if (!applying()) { console.log("Dry run complete. Sanity mutations: 0."); return; }

  assertExpectedTarget(String(config.projectId), String(config.dataset));
  await assertRecentExport();
  if (!confirmationMatches(argument("--confirm"), "CONSOLIDATE PUBLICATION SETTINGS")) throw new Error('Refusing to apply without --confirm "CONSOLIDATE PUBLICATION SETTINGS".');

  if (!draftSettings) {
    const draftId = createDraftId("siteSettings");
    await client.action({
      actionType: "sanity.action.document.edit",
      publishedId: "siteSettings",
      draftId,
      patch: {set: draftFields},
    });
  } else {
    await client.patch(draftSettings._id).ifRevisionId(String(draftSettings._rev)).set(draftFields).commit({visibility: "sync"});
  }
  await client.patch(publishedSettings._id).ifRevisionId(String(publishedSettings._rev)).set(publishedFields).commit({visibility: "sync"});

  const merged = byId(await client.fetch<RawSanityDocument[]>(RECORD_QUERY));
  const mergedPublished = merged.get("siteSettings");
  const mergedDraft = merged.get("drafts.siteSettings");
  if (!mergedPublished || !mergedDraft) throw new Error("Both published and draft Publication Settings must exist before retiring About.");
  for (const [field, value] of Object.entries(publishedFields)) if (checksum(mergedPublished[field]) !== checksum(value)) throw new Error(`Published field verification failed: ${field}`);
  for (const [field, value] of Object.entries(draftFields)) if (checksum(mergedDraft[field]) !== checksum(value)) throw new Error(`Draft field verification failed: ${field}`);
  const beforeDeleteArticleRevisions = await client.fetch<Array<{_id: string; _rev: string}>>(ARTICLE_REVISIONS_QUERY);
  if (checksum(beforeDeleteArticleRevisions) !== checksum(articleRevisions)) throw new Error("An Article revision changed during consolidation; About documents were not deleted.");

  let transaction = client.transaction();
  if (draftAbout) transaction = transaction.delete(draftAbout._id);
  if (publishedAbout) transaction = transaction.delete(publishedAbout._id);
  await transaction.commit({visibility: "sync"});

  const finalDocuments = await client.fetch<RawSanityDocument[]>(RECORD_QUERY);
  const finalArticleRevisions = await client.fetch<Array<{_id: string; _rev: string}>>(ARTICLE_REVISIONS_QUERY);
  if (finalDocuments.some(({_id}) => _id === "about" || _id === "drafts.about")) throw new Error("Obsolete About documents remain after deletion.");
  if (checksum(finalArticleRevisions) !== checksum(articleRevisions)) throw new Error("An Article revision changed during consolidation.");
  const report = await writeReport("publication-settings-consolidation-applied", {target: {projectId: config.projectId, dataset: config.dataset}, sourceBackup: documents, finalDocuments, articleRevisionsBefore: articleRevisions, articleRevisionsAfter: finalArticleRevisions});
  console.log(`Apply complete. About retired; Article revisions unchanged. Report: ${report}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Publication Settings consolidation failed."); process.exitCode = 1; });
