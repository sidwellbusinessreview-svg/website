import {createHash} from "node:crypto";

export const ABOUT_DESTINATION_FIELDS = [
  "aboutTitle", "aboutEyebrow", "aboutSummary", "aboutBody", "editorsInChief",
  "editors", "facultyAdviser", "aboutUpdatedDate", "aboutSeo",
] as const;

export type RawSanityDocument = Record<string, unknown> & {_id: string; _type: string; _rev?: string};

function normalizeLeadership(value: unknown) {
  if (!Array.isArray(value)) return value;
  return value.map((entry) => entry && typeof entry === "object"
    ? {...entry as Record<string, unknown>, _type: "editorInChiefEntry"}
    : entry);
}

export function mapAboutFields(about: RawSanityDocument | undefined) {
  if (!about) return {};
  return {
    ...(about.title !== undefined ? {aboutTitle: about.title} : {}),
    ...(about.eyebrow !== undefined ? {aboutEyebrow: about.eyebrow} : {}),
    ...(about.summary !== undefined ? {aboutSummary: about.summary} : {}),
    ...(about.body !== undefined ? {aboutBody: about.body} : {}),
    ...(about.editorsInChief !== undefined ? {editorsInChief: normalizeLeadership(about.editorsInChief)} : {}),
    ...(about.editors !== undefined ? {editors: about.editors} : {}),
    ...(about.facultyAdviser !== undefined ? {facultyAdviser: about.facultyAdviser} : {}),
    ...(about.updatedDate !== undefined ? {aboutUpdatedDate: about.updatedDate} : {}),
    ...(about.seo !== undefined ? {aboutSeo: about.seo} : {}),
  };
}

export function findPublicationSettingsCollisions(settings: RawSanityDocument, mapped: Record<string, unknown>) {
  return Object.keys(mapped).filter((field) => settings[field] !== undefined);
}

export function documentAttributes(document: RawSanityDocument) {
  return Object.fromEntries(Object.entries(document).filter(([field]) => !["_rev", "_createdAt", "_updatedAt", "_system"].includes(field)));
}

export function checksum(value: unknown) {
  const stable = (item: unknown): string => Array.isArray(item)
    ? `[${item.map(stable).join(",")}]`
    : item && typeof item === "object"
      ? `{${Object.entries(item as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(",")}}`
      : JSON.stringify(item);
  return createHash("sha256").update(stable(value)).digest("hex");
}
