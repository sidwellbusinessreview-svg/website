export type RawDocument = Record<string, unknown> & { _id: string; _type: string; title?: string; name?: string };

export const currentDocumentTypes = new Set(["article", "contributor", "siteSettings"]);
export const legacyDocumentTypes = new Set(["masthead", "author", "issue", "category", "tag", "staticPage"]);
export const legacySingletonIds = new Set(["masthead", "about"]);
export const editorialTypes = new Set([...currentDocumentTypes, ...legacyDocumentTypes]);

const allowedFields: Record<string, Set<string>> = {
  article: new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt", "title", "slug", "subtitle", "summary", "contributors", "publicationMonth", "publicationDate", "publicationDatePrecision", "sources", "featuredImage", "featuredImageAltText", "featuredImageCaption", "featuredImageCredit", "body", "pinned", "featuredRank", "seoTitle", "seoDescription", "migrationSourceId", "importBatchId"]),
  contributor: new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt", "name", "slug", "graduationYear", "active", "migrationSourceId", "importBatchId"]),
  siteSettings: new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt", "publicationName", "shortName", "description", "affiliationText", "tagline", "location", "logoMode", "textWordmark", "logoImage", "logoImageAlt", "contactLabel", "contactTarget", "socialLinks", "defaultSeo", "homepageTagline", "aboutTitle", "aboutEyebrow", "aboutSummary", "aboutBody", "editorsInChief", "editors", "facultyAdviser", "aboutUpdatedDate", "aboutSeo"]),
};

export type Reference = { sourceId: string; targetId: string; path: string };
export function collectReferences(value: unknown, sourceId: string, path = ""): Reference[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => collectReferences(item, sourceId, `${path}[${index}]`));
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const own = typeof record._ref === "string" ? [{ sourceId, targetId: record._ref.replace(/^drafts\./, ""), path: path || "reference" }] : [];
  return own.concat(Object.entries(record).filter(([key]) => key !== "_ref").flatMap(([key, child]) => collectReferences(child, sourceId, path ? `${path}.${key}` : key)));
}

export type ContentAudit = {
  documents: Array<{ id: string; type: string; label: string; state: "draft" | "published" }>;
  legacyDocuments: string[];
  unregisteredTypes: string[];
  danglingReferences: Reference[];
  pairs: string[];
  obsoleteFields: Array<{ id: string; fields: string[] }>;
  legacyArticleDates: Array<{ id: string; fields: string[]; hasPublicationMonth: boolean }>;
  orphanedAssets: string[];
  valid: boolean;
};

export function auditDocuments(documents: RawDocument[]): ContentAudit {
  const isSystemDocument = ({ _type }: RawDocument) => _type.startsWith("sanity.") || _type.startsWith("system.");
  const baseIds = new Set(documents.map(({ _id }) => _id.replace(/^drafts\./, "")));
  const exactIds = new Set(documents.map(({ _id }) => _id));
  const references = documents.flatMap((document) => collectReferences(document, document._id));
  const legacyDocuments = documents.filter((document) => legacyDocumentTypes.has(document._type) || legacySingletonIds.has(document._id.replace(/^drafts\./, ""))).map(({ _id }) => _id).sort();
  const unregisteredTypes = [...new Set(documents.filter((document) => !isSystemDocument(document) && !currentDocumentTypes.has(document._type) && !legacyDocumentTypes.has(document._type)).map(({ _type }) => _type))].sort();
  const danglingReferences = references.filter(({ targetId }) => !baseIds.has(targetId));
  const pairs = documents.filter(({ _id }) => _id.startsWith("drafts.") && exactIds.has(_id.slice(7))).map(({ _id }) => _id.slice(7)).sort();
  const obsoleteFields = documents.flatMap((document) => {
    const allowed = allowedFields[document._type];
    if (!allowed) return [];
    const fields = Object.keys(document).filter((field) => !field.startsWith("_") && !allowed.has(field)).sort();
    return fields.length ? [{ id: document._id, fields }] : [];
  });
  const legacyArticleDates = documents.flatMap((document) => {
    if (document._type !== "article") return [];
    const fields = ["publicationDate", "publicationDatePrecision"].filter((field) => field in document);
    return fields.length ? [{ id: document._id, fields, hasPublicationMonth: typeof document.publicationMonth === "string" }] : [];
  }).sort((a, b) => a.id.localeCompare(b.id));
  const referencedAssets = new Set(references.filter(({ targetId }) => targetId.startsWith("image-") || targetId.startsWith("file-")).map(({ targetId }) => targetId));
  const orphanedAssets = documents.filter(({ _type, _id }) => _type.startsWith("sanity.") && (_id.startsWith("image-") || _id.startsWith("file-")) && !referencedAssets.has(_id)).map(({ _id }) => _id).sort();
  return {
    documents: documents.filter((document) => !isSystemDocument(document)).map<ContentAudit["documents"][number]>((document) => ({ id: document._id, type: document._type, label: document.title || document.name || "Untitled", state: document._id.startsWith("drafts.") ? "draft" : "published" })).sort((a, b) => a.id.localeCompare(b.id)),
    legacyDocuments, unregisteredTypes, danglingReferences, pairs, obsoleteFields, legacyArticleDates, orphanedAssets,
    valid: legacyDocuments.length === 0 && unregisteredTypes.length === 0 && danglingReferences.length === 0 && obsoleteFields.length === 0,
  };
}

export type CleanupPlan = { deleteIds: string[]; blockedReferences: Reference[] };
export function planLegacyCleanup(documents: RawDocument[]): CleanupPlan {
  const deleteIds = documents.filter((document) => legacyDocumentTypes.has(document._type) || legacySingletonIds.has(document._id.replace(/^drafts\./, ""))).map(({ _id }) => _id).sort();
  const deleting = new Set(deleteIds.map((id) => id.replace(/^drafts\./, "")));
  const blockedReferences = documents.filter(({ _id }) => !deleteIds.includes(_id)).flatMap((document) => collectReferences(document, document._id)).filter(({ targetId }) => deleting.has(targetId));
  return { deleteIds, blockedReferences };
}

export function planEditorialReset(documents: RawDocument[]): string[] {
  return documents.filter(({ _type }) => editorialTypes.has(_type)).map(({ _id }) => _id).sort();
}

export type FieldCleanupPatch = { id: string; unset: string[] };
export function planFieldCleanup(documents: RawDocument[]): FieldCleanupPatch[] {
  const obsoleteByType: Record<string, string[]> = {
    contributor: ["photo", "bio", "biography"],
    siteSettings: ["recentArticleCount", "homepageIntro"],
  };
  return documents.flatMap((document) => {
    const unset = (obsoleteByType[document._type] ?? []).filter((field) => field in document);
    if (document._type === "siteSettings") {
      for (const field of ["editorsInChief", "editors", "facultyAdviser"]) {
        const entries = document[field];
        if (!Array.isArray(entries)) continue;
        entries.forEach((entry, index) => {
          if (!entry || typeof entry !== "object") return;
          const record = entry as Record<string, unknown>;
          const selector = typeof record._key === "string" && record._key ? `[_key=="${record._key}"]` : `[${index}]`;
          if ("portrait" in record) unset.push(`${field}${selector}.portrait`);
          if ("portraitAltText" in record) unset.push(`${field}${selector}.portraitAltText`);
        });
      }
    }
    return unset.length ? [{ id: document._id, unset }] : [];
  }).sort((a, b) => a.id.localeCompare(b.id));
}

export type MalformedContributorRepair = { id: string; title: string; state: "draft" | "published"; unsetPaths: string[] };
export function planMalformedContributorRepairs(documents: RawDocument[]): MalformedContributorRepair[] {
  return documents.flatMap((document) => {
    if (document._type !== "article" || document.contributors === undefined) return [];
    if (!Array.isArray(document.contributors)) return [{ id: document._id, title: document.title || "Untitled article", state: document._id.startsWith("drafts.") ? "draft" as const : "published" as const, unsetPaths: ["contributors"] }];
    const seen = new Set<string>();
    const invalidIndices = document.contributors.flatMap((entry, index) => {
      if (!entry || typeof entry !== "object") return [index];
      const reference = (entry as Record<string, unknown>)._ref;
      if (typeof reference !== "string" || !reference.trim()) return [index];
      const normalized = reference.trim().replace(/^drafts\./, "");
      if (seen.has(normalized)) return [index];
      seen.add(normalized);
      return [];
    });
    return invalidIndices.length ? [{ id: document._id, title: document.title || "Untitled article", state: document._id.startsWith("drafts.") ? "draft" as const : "published" as const, unsetPaths: invalidIndices.map((index) => `contributors[${index}]`) }] : [];
  }).sort((a, b) => a.title.localeCompare(b.title) || a.state.localeCompare(b.state));
}

export function replaceContributorReferences(refs: Array<{ _key?: string; _ref: string }>, fromId: string, toId: string) {
  const seen = new Set<string>();
  return refs.flatMap((ref) => {
    const id = ref._ref.replace(/^drafts\./, "") === fromId ? toId : ref._ref.replace(/^drafts\./, "");
    if (seen.has(id)) return [];
    seen.add(id);
    return [{ ...ref, _ref: id }];
  });
}

export function contributorDeletionCase(references: Array<{ _type: string }>): "none" | "aboutOnly" | "articles" {
  if (references.some(({ _type }) => _type === "article")) return "articles";
  if (references.some(({ _type }) => _type === "siteSettings")) return "aboutOnly";
  return "none";
}

export function confirmationMatches(actual: string | undefined, expected: string): boolean { return actual === expected; }
