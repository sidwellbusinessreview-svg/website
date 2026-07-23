export type CurrentPageVersion = {
  _id: string;
  _type: string;
  _createdAt?: string;
  _updatedAt?: string;
};

export const CURRENT_PAGE_QUERY = `*[
  _id in [$publishedId, $draftId] &&
  _type == $schemaType
]{
  _id,
  _type,
  _createdAt,
  _updatedAt
}`;

export function exactCurrentPageVersions(
  value: unknown,
  documentId: string,
  schemaType: string,
): CurrentPageVersion[] {
  if (!Array.isArray(value)) return [];
  const allowedIds = new Set([documentId, `drafts.${documentId}`]);
  return value.filter((item): item is CurrentPageVersion => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<CurrentPageVersion>;
    return typeof candidate._id === "string" && allowedIds.has(candidate._id) && candidate._type === schemaType;
  });
}
