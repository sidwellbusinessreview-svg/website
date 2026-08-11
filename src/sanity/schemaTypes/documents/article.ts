import { defineArrayMember, defineField, defineType, type PreviewValue } from "sanity";
import { SummaryInput } from "../../components/SummaryInput";
import { ContributorArrayInput } from "../../components/ContributorSelectors";
import { PublicationMonthInput } from "../../components/PublicationMonthInput";
import { IMAGE_FORMAT_DESCRIPTION, requireAltWhenImagePresent, validateSupportedImage } from "../shared/mediaValidation";

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
  groups: [{ name: "article", title: "Article", default: true }, { name: "advanced", title: "Advanced / SEO" }],
  initialValue: { pinned: false },
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "article", validation: (Rule) => Rule.required().min(5).max(180) }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "article", options: { source: "title", maxLength: 120 }, description: "Generate from the title. Avoid changing it after publication.", validation: (Rule) => Rule.required() }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string", group: "article", validation: (Rule) => Rule.max(220) }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, group: "article", description: "Required. Write a concise description for article cards and search results (300 characters maximum).", components: { input: SummaryInput }, validation: (Rule) => Rule.required().max(300) }),
    defineField({ name: "contributors", title: "Contributors", type: "array", group: "article", description: "Add active published contributors in byline order. Archived contributors remain on existing articles.", components: { input: ContributorArrayInput }, of: [defineArrayMember({ type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" } })], validation: (Rule) => Rule.required().min(1).unique().custom(validatePublishedContributors) }),
    defineField({ name: "publicationMonth", title: "Publication month", type: "string", group: "article", description: "Choose a month and year. The website displays Month Year; no publication day is stored.", components: { input: PublicationMonthInput }, validation: (Rule) => Rule.required().regex(/^\d{4}-(0[1-9]|1[0-2])$/, { name: "publication month", invert: false }) }),
    defineField({ name: "featuredImage", title: "Featured image", type: "image", group: "article", options: { hotspot: true }, description: `Optional. ${IMAGE_FORMAT_DESCRIPTION}`, validation: (Rule) => Rule.custom(validateSupportedImage) }),
    defineField({ name: "featuredImageAltText", title: "Featured-image alt text", type: "string", group: "article", hidden: ({ document }) => !document?.featuredImage, description: "Required when a featured image is added. Describe its relevant visual information; do not repeat the caption.", validation: (Rule) => Rule.custom((value, context) => requireAltWhenImagePresent(value, context, "featuredImage")).max(300) }),
    defineField({ name: "featuredImageCaption", title: "Caption", type: "string", group: "article", validation: (Rule) => Rule.max(500) }),
    defineField({ name: "featuredImageCredit", title: "Photo credit", type: "string", group: "article", validation: (Rule) => Rule.max(300) }),
    defineField({ name: "body", title: "Article body", type: "articleBody", group: "article", description: "To cite a Source, place the cursor after the sentence or quotation and choose Add footnote. You do not need to highlight text.", validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: "sources", title: "Sources", type: "array", group: "article", description: "Add each source here first. Then place your cursor in the Article body and choose Add footnote. Source numbers are generated automatically.", of: [defineArrayMember({ type: "object", name: "articleSource", fields: [
      defineField({ name: "citation", title: "Citation", type: "string", validation: (Rule) => Rule.required().custom((value) => typeof value === "string" && value.trim() ? true : "Citation cannot be blank.") }),
      defineField({ name: "url", title: "URL", type: "url", validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }) }),
    ], preview: { select: { title: "citation", subtitle: "url" } } })], validation: (Rule) => Rule.unique() }),
    defineField({ name: "pinned", title: "Pin to homepage", type: "boolean", group: "article", initialValue: false, description: "Only one published article should be pinned." }),
    defineField({ name: "featuredRank", title: "Featured order", type: "number", group: "article", hidden: ({ document }) => !document?.pinned, validation: (Rule) => Rule.integer().positive().custom((value, context) => !value || context.document?.pinned ? true : "Featured order is only valid when pinned.") }),
    defineField({ name: "seoTitle", title: "SEO title override", type: "string", group: "advanced", description: "Optional. Most editors should leave this blank; the article title and publication name are used automatically.", validation: (Rule) => Rule.max(70) }),
    defineField({ name: "seoDescription", title: "SEO description override", type: "text", rows: 2, group: "advanced", description: "Optional. Most editors should leave this blank; the summary is used automatically.", validation: (Rule) => Rule.max(180) }),
    defineField({ name: "migrationSourceId", title: "Migration source ID", type: "string", group: "advanced", readOnly: true, hidden: true }),
    defineField({ name: "importBatchId", title: "Import batch ID", type: "string", group: "advanced", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title", firstContributor: "contributors.0.name", secondContributor: "contributors.1.name", id: "_id", pinned: "pinned", media: "featuredImage" }, prepare: prepareArticlePreview },
  orderings: [{ title: "Publication month", name: "publicationMonth", by: [{ field: "publicationMonth", direction: "desc" }, { field: "slug.current", direction: "asc" }] }],
});
