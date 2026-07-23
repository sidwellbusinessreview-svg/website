export type SingletonDocumentState =
  | "neverCreated"
  | "draftOnly"
  | "publishedOnly"
  | "publishedWithChanges"
  | "deletedRestorable"
  | "deletedNoHistory"
  | "draftDiscardedNoPublished"
  | "draftDiscardedWithPublished"
  | "restoredPendingPublication"
  | "historyIndeterminate";

export type SingletonHistoryState = {
  available: boolean;
  restorableRevision: boolean;
  latestEvent?: string;
  restoredDraft?: boolean;
  probeComplete?: boolean;
};

export function singletonDocumentState(
  draft: unknown,
  published: unknown,
  history: SingletonHistoryState = { available: false, restorableRevision: false },
): SingletonDocumentState {
  if (draft && history.restoredDraft) return "restoredPendingPublication";
  if (draft && published) return "publishedWithChanges";
  if (draft) return "draftOnly";
  if (published && history.latestEvent === "discard") return "draftDiscardedWithPublished";
  if (published) return "publishedOnly";
  if (history.latestEvent === "discard" && !history.restorableRevision) return "draftDiscardedNoPublished";
  if (history.restorableRevision) return "deletedRestorable";
  if (history.available) return "deletedNoHistory";
  if (history.probeComplete === false) return "historyIndeterminate";
  return "neverCreated";
}

export function singletonStatusLabel(draft: unknown, published: unknown): string {
  const state = singletonDocumentState(draft, published);
  if (state === "publishedWithChanges") return "Published with unpublished changes";
  if (state === "publishedOnly") return "Published";
  if (state === "draftOnly") return "Draft only";
  if (state === "restoredPendingPublication") return "Restored revision awaiting publication";
  if (state === "draftDiscardedWithPublished") return "Published; latest draft was discarded";
  if (state === "deletedRestorable") return "Deleted; revision available for recovery";
  if (state === "deletedNoHistory") return "Deleted; no restorable revision found";
  if (state === "draftDiscardedNoPublished") return "Draft discarded; no published version";
  if (state === "historyIndeterminate") return "No current version; retained history could not be determined";
  return "Not published";
}
