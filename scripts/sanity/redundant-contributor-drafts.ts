export type ContributorDocument = Record<string, unknown> & {
  _id: string;
  _type: "contributor";
  _rev: string;
  name?: string;
};

const SYSTEM_FIELDS = new Set(["_id", "_rev", "_createdAt", "_updatedAt", "_system"]);

function meaningfulValue(document: ContributorDocument): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(document)
      .filter(([key]) => !SYSTEM_FIELDS.has(key))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export interface ContributorDraftComparison {
  name: string;
  publishedId: string;
  draftId: string;
  publishedRev: string;
  draftRev: string;
  identical: boolean;
  differingFields: Array<{ field: string; published: unknown; draft: unknown }>;
  published: Record<string, unknown>;
  draft: Record<string, unknown>;
}

export function compareContributorDraftPairs(documents: ContributorDocument[]): ContributorDraftComparison[] {
  const byId = new Map(documents.map((document) => [document._id, document]));
  return documents
    .filter(({ _id }) => _id.startsWith("drafts."))
    .flatMap((draft) => {
      const publishedId = draft._id.slice("drafts.".length);
      const published = byId.get(publishedId);
      if (!published) return [];
      const publishedMeaningful = meaningfulValue(published);
      const draftMeaningful = meaningfulValue(draft);
      const fields = [...new Set([...Object.keys(publishedMeaningful), ...Object.keys(draftMeaningful)])].sort();
      const differingFields = fields.flatMap((field) =>
        stable(publishedMeaningful[field]) === stable(draftMeaningful[field])
          ? []
          : [{ field, published: publishedMeaningful[field], draft: draftMeaningful[field] }],
      );
      return [{
        name: String(draft.name ?? published.name ?? publishedId),
        publishedId,
        draftId: draft._id,
        publishedRev: published._rev,
        draftRev: draft._rev,
        identical: differingFields.length === 0,
        differingFields,
        published: publishedMeaningful,
        draft: draftMeaningful,
      }];
    })
    .sort((left, right) => left.publishedId.localeCompare(right.publishedId));
}

export function redundantDraftIds(comparisons: ContributorDraftComparison[]): string[] {
  return comparisons.filter(({ identical }) => identical).map(({ draftId }) => draftId);
}
