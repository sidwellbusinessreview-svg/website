import { defineArrayMember, defineField, defineType, type PreviewValue } from "sanity";
import { SummaryInput } from "../../components/SummaryInput";
import { ContributorArrayInput } from "../../components/ContributorSelectors";
import { PublicationMonthInput } from "../../components/PublicationMonthInput";
import { SourceUrlInput } from "../../components/SourceUrlInput";
import { ArticleSourcesInput } from "../../components/ArticleSourcesInput";
import { IMAGE_FORMAT_DESCRIPTION, requireAltWhenImagePresent, validateSupportedImage } from "../shared/mediaValidation";

type SourceRecord = { _key?: unknown; citation?: unknown; url?: unknown };

function normalizedSource(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase() : "";
}

export function duplicateSourceWarning(value: unknown): true | string {
  if (!Array.isArray(value)) return true;
  const citations = new Map<string, number>();
  const urls = new Map<string, number>();
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") continue;
    const source = item as SourceRecord;
    const citation = normalizedSource(source.citation);
    const url = normalizedSource(source.url);
    const prior = citations.get(citation) ?? urls.get(url);
    if (prior !== undefined && (citation || url)) return `Source ${index + 1} may duplicate Source ${prior + 1}. Combine them unless the entries are intentionally distinct.`;
    if (citation) citations.set(citation, index);
    if (url) urls.set(url, index);
  }
  return true;
}

function collectSourceKeys(value: unknown, keys: Set<string>) {
  if (Array.isArray(value)) { value.forEach((item) => collectSourceKeys(item, keys)); return; }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if ((record._type === "footnoteReference" || record._type === "callout") && typeof record.sourceKey === "string") keys.add(record.sourceKey);
  Object.values(record).forEach((item) => collectSourceKeys(item, keys));
}

export function unusedSourceWarning(value: unknown, context: { document?: Record<string, unknown> }): true | string {
  if (!Array.isArray(value) || !value.length) return true;
  const used = new Set<string>();
  collectSourceKeys(context.document?.body, used);
  const unused = value.flatMap((item, index) => item && typeof item === "object" && typeof (item as SourceRecord)._key === "string" && !used.has((item as SourceRecord)._key as string) ? [index + 1] : []);
  return unused.length ? `Unused ${unused.length === 1 ? "Source" : "Sources"}: ${unused.join(", ")}. Remove unused entries or add their footnote references.` : true;
}

export function validatePublicationMonth(value: unknown): true | string {
  if (typeof value !== "string" || !value) return "Choose a publication month and enter a four-digit year.";
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? true : "Choose a valid month and enter a four-digit year, such as March 2026.";
}

export function validateSourceUrl(value: unknown): true | string {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string" || value !== value.trim()) return "Remove spaces before or after the web address.";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? true : "Enter a full web address beginning with http:// or https://.";
  } catch {
    return "Enter a full web address beginning with http:// or https://.";
  }
}

export async function validateArticleSlug(value: { current?: string } | undefined, context: { document?: { _id?: string }; getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: Record<string, string>) => Promise<string | null> } }): Promise<true | string> {
  const slug = value?.current?.trim();
  if (!slug) return "Generate or enter a slug.";
  const id = context.document?._id?.replace(/^drafts\./, "") ?? "";
  const match = await context.getClient({ apiVersion: "2025-02-19" }).fetch('*[_type == "article" && slug.current == $slug && !(_id in [$id, "drafts." + $id])][0]._id', { slug, id });
  return match ? "Another Article already uses this slug. Adjust the slug before publishing." : true;
}

export type ArticlePreviewSelection = { title?: string; firstContributor?: string; secondContributor?: string; id?: string; pinned?: boolean; media?: unknown };
export function prepareArticlePreview(selection: ArticlePreviewSelection): PreviewValue {
  const contributors = [selection.firstContributor, selection.secondContributor].filter(Boolean).join(" & ");
  const status = selection.id?.startsWith("drafts.") ? "Draft" : "Published";
  return { title: selection.title || "Untitled article", subtitle: [status, selection.pinned ? "Pinned" : "", contributors].filter(Boolean).join(" · "), media: selection.media as PreviewValue["media"] };
}

export async function validatePublishedContributors(value: unknown[] | undefined, context: { getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: { ids: string[] }) => Promise<string[]> } }): Promise<true | string> {
  if (!value?.length) return true;
  const ids = [...new Set(value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const reference = (entry as Record<string, unknown>)._ref;
    return typeof reference === "string" && reference.trim() ? [reference.trim().replace(/^drafts\./, "")] : [];
  }))];
  if (!ids.length) return "Remove the incomplete contributor selection and choose the contributor again.";
  const published = await context.getClient({ apiVersion: "2025-02-19" }).fetch('*[_type == "contributor" && _id in $ids && !(_id in path("drafts.**"))]._id', { ids });
  const missing = ids.filter((id) => !published.includes(id));
  return missing.length ? "Publish every selected contributor before publishing this article." : true;
}

export const article = defineType({
  name: "article", title: "Article", type: "document",
  groups: [
    { name: "article", title: "Article", default: true },
    { name: "homepage", title: "Homepage" },
    { name: "advanced", title: "Advanced / SEO" },
  ],
  initialValue: { pinned: false },
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "article", validation: (Rule) => Rule.required().min(5).max(180) }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "article", options: { source: "title", maxLength: 120 }, description: "Generate from the title. This becomes the Article URL; avoid changing it after publication.", validation: (Rule) => Rule.required().custom(validateArticleSlug) }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string", group: "article", description: "Optional. Add a deck only when it gives readers useful context beyond the title. It is not the card summary.", validation: (Rule) => Rule.max(220) }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, group: "article", description: "Required. Write a concise description for article cards and search results (300 characters maximum).", components: { input: SummaryInput }, validation: (Rule) => Rule.required().max(300) }),
    defineField({ name: "contributors", title: "Contributors", type: "array", group: "article", description: "Add active published contributors in byline order. Archived contributors remain on existing articles.", components: { input: ContributorArrayInput }, of: [defineArrayMember({ type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" } })], validation: (Rule) => Rule.required().min(1).unique().custom(validatePublishedContributors) }),
    defineField({ name: "publicationMonth", title: "Publication month", type: "string", group: "article", description: "Choose a month and year. The website displays Month Year; no publication day is stored.", components: { input: PublicationMonthInput }, validation: (Rule) => Rule.required().custom(validatePublicationMonth) }),
    defineField({ name: "featuredImage", title: "Featured image", type: "image", group: "article", options: { hotspot: true }, description: `Optional. ${IMAGE_FORMAT_DESCRIPTION}`, validation: (Rule) => Rule.custom(validateSupportedImage) }),
    defineField({ name: "featuredImageAltText", title: "Featured-image alt text", type: "string", group: "article", hidden: ({ document }) => !document?.featuredImage, description: "Required when a featured image is added. Describe the image for someone who cannot see it; do not repeat the caption.", validation: (Rule) => Rule.custom((value, context) => requireAltWhenImagePresent(value, context, "featuredImage")).max(300) }),
    defineField({ name: "featuredImageCaption", title: "Caption", type: "string", group: "article", description: "Optional. Explain what the image shows or why it matters; do not repeat the alt text.", validation: (Rule) => Rule.max(500) }),
    defineField({ name: "featuredImageCredit", title: "Photo credit", type: "string", group: "article", description: "Optional unless rights or editorial policy require a credit. Use the approved photographer or source wording.", validation: (Rule) => Rule.max(300) }),
    defineField({ name: "body", title: "Article body", type: "articleBody", group: "article", description: "Write or paste the Article below. Use the toolbar for formatting and citations.", validation: (Rule) => [Rule.required().min(1).error("Add Article text before publishing."), Rule.custom(articleBodyMigrationMarkerWarning).warning()] }),
    defineField({ name: "sources", title: "Sources", type: "array", group: "article", description: "Add each Source once. You can cite it multiple times. Published footnote numbers are assigned automatically in reading order; Source-list numbers are lookup aids only.", components: { input: ArticleSourcesInput as never }, of: [defineArrayMember({ type: "object", name: "articleSource", fields: [
      defineField({ name: "citation", title: "Citation", type: "string", validation: (Rule) => Rule.required().custom((value) => typeof value === "string" && value.trim() ? true : "Citation cannot be blank.") }),
      defineField({ name: "url", title: "URL", type: "url", components: { input: SourceUrlInput }, validation: (Rule) => Rule.custom(validateSourceUrl) }),
    ], preview: { select: { title: "citation", subtitle: "url" } } })], validation: (Rule) => Rule.unique().custom(duplicateSourceWarning).warning().custom(unusedSourceWarning).warning() }),
    defineField({ name: "pinned", title: "Pin to homepage", type: "boolean", group: "homepage", initialValue: false, description: "Only one published article should be pinned." }),
    defineField({ name: "featuredRank", title: "Featured order", type: "number", group: "homepage", hidden: ({ document }) => !document?.pinned, validation: (Rule) => Rule.integer().positive().custom((value, context) => !value || context.document?.pinned ? true : "Featured order is only valid when pinned.") }),
    defineField({ name: "seoTitle", title: "SEO title override", type: "string", group: "advanced", description: "Optional. Most editors should leave this blank; the article title and publication name are used automatically.", validation: (Rule) => Rule.max(70) }),
    defineField({ name: "seoDescription", title: "SEO description override", type: "text", rows: 2, group: "advanced", description: "Optional. Most editors should leave this blank; the summary is used automatically.", validation: (Rule) => Rule.max(180) }),
    defineField({ name: "migrationSourceId", title: "Migration source ID", type: "string", group: "advanced", readOnly: true, hidden: true }),
    defineField({ name: "importBatchId", title: "Import batch ID", type: "string", group: "advanced", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title", firstContributor: "contributors.0.name", secondContributor: "contributors.1.name", id: "_id", pinned: "pinned", media: "featuredImage" }, prepare: prepareArticlePreview },
  orderings: [{ title: "Publication month", name: "publicationMonth", by: [{ field: "publicationMonth", direction: "desc" }, { field: "slug.current", direction: "asc" }] }],
});

export function articleBodyMigrationMarkerWarning(value: unknown): true | string {
  if (!Array.isArray(value)) return true;
  const count = value.reduce((total, block) => {
    if (!block || typeof block !== "object" || (block as { _type?: string })._type !== "block") return total;
    const children = (block as { children?: unknown }).children;
    if (!Array.isArray(children)) return total;
    return total + children.reduce((childTotal, child) => {
      if (!child || typeof child !== "object" || (child as { _type?: string })._type !== "span") return childTotal;
      const text = (child as { text?: unknown }).text;
      return childTotal + (typeof text === "string" ? (text.match(/\[\d+\]/g) ?? []).length : 0);
    }, 0);
  }, 0);
  return count === 0
    ? true
    : `Found ${count} bracketed citation marker${count === 1 ? "" : "s"} such as [1]. Replace migration markers with Add footnote before publishing.`;
}
