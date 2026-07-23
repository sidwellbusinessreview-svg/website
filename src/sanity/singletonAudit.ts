import { collectReferences, type RawDocument } from "../../scripts/sanity/content-operations";
import { singletonDefinitions } from "./singletons";
import { singletonDocumentState, type SingletonDocumentState, type SingletonHistoryState } from "./singletonState";

export type SingletonHistoryEvidence = SingletonHistoryState & {
  revisionIds: string[];
  eventTypes: string[];
  transactionTypes: string[];
  probeComplete: boolean;
};
export type SingletonAuditEntry = {
  schemaType: string;
  documentId: string;
  state: SingletonDocumentState;
  publishedPresent: boolean;
  draftPresent: boolean;
  history: SingletonHistoryEvidence;
  publishedId: string;
  draftId: string;
  incorrectIds: string[];
  expectedIdType?: string;
};

export type SingletonAudit = {
  singletons: SingletonAuditEntry[];
  legacySingletonIds: string[];
  obsoleteSingletonReferences: Array<{ sourceId: string; targetId: string; path: string }>;
  valid: boolean;
};

const noHistory: SingletonHistoryEvidence = { available: false, restorableRevision: false, revisionIds: [], eventTypes: [], transactionTypes: [], probeComplete: false };

export function auditSingletonDocuments(
  documents: RawDocument[],
  historyById: Readonly<Record<string, SingletonHistoryEvidence>> = {},
): SingletonAudit {
  const byId = new Map(documents.map((document) => [document._id, document]));
  const expectedIds: ReadonlySet<string> = new Set(singletonDefinitions.map(({ documentId }) => documentId));
  const singletons = singletonDefinitions.map(({ schemaType, documentId }) => {
    const draftId = `drafts.${documentId}`;
    const published = byId.get(documentId);
    const draft = byId.get(draftId);
    const incorrectIds = documents
      .filter((document) => document._type === schemaType && ![documentId, draftId].includes(document._id))
      .map(({ _id }) => _id)
      .sort();
    const history = historyById[documentId] ?? noHistory;
    const state = singletonDocumentState(draft, published, history);
    const wrongAtExpectedId = published && published._type !== schemaType ? published._type : draft && draft._type !== schemaType ? draft._type : undefined;
    return {
      schemaType,
      documentId,
      state,
      publishedPresent: Boolean(published),
      draftPresent: Boolean(draft),
      history,
      publishedId: documentId,
      draftId,
      incorrectIds,
      ...(wrongAtExpectedId ? { expectedIdType: wrongAtExpectedId } : {}),
    };
  });
  const legacySingletonIds = documents.filter(({ _id }) => ["masthead", "drafts.masthead"].includes(_id)).map(({ _id }) => _id).sort();
  const obsoleteTargets = new Set([...legacySingletonIds.map((id) => id.replace(/^drafts\./, "")), ...singletons.flatMap(({ incorrectIds }) => incorrectIds.map((id) => id.replace(/^drafts\./, ""))).filter((id) => !expectedIds.has(id))]);
  const obsoleteSingletonReferences = documents.flatMap((document) => collectReferences(document, document._id)).filter(({ targetId }) => obsoleteTargets.has(targetId));
  const valid = !legacySingletonIds.length && !obsoleteSingletonReferences.length && singletons.every(({ incorrectIds, expectedIdType }) => !incorrectIds.length && !expectedIdType);
  return { singletons, legacySingletonIds, obsoleteSingletonReferences, valid };
}
