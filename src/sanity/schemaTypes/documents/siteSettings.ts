import { defineArrayMember, defineField, defineType } from "sanity";
import { AboutStaffArrayInput } from "../../components/ContributorSelectors";
import { IMAGE_FORMAT_DESCRIPTION, requireAltWhenImagePresent, validateSupportedImage } from "../shared/mediaValidation";

export const SITE_SETTINGS_ID = "siteSettings";

type StaffEntryValue = { contributor?: { _ref?: string } };
export function validateUniqueStaff(settings: { editorsInChief?: StaffEntryValue[]; editors?: StaffEntryValue[]; facultyAdviser?: StaffEntryValue[] } | undefined): true | string {
  const refs = [settings?.editorsInChief, settings?.editors, settings?.facultyAdviser].flatMap((entries) => entries ?? []).flatMap((entry) => entry.contributor?._ref ? [entry.contributor._ref] : []);
  return new Set(refs).size === refs.length ? true : "Each contributor may appear only once across the About staff sections.";
}

async function validatePublishedStaffContributor(value: { _ref?: string } | undefined, context: { getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: { id: string }) => Promise<string | null> } }) {
  if (!value?._ref) return true;
  const id = value._ref.replace(/^drafts\./, "");
  const published = await context.getClient({ apiVersion: "2025-02-19" }).fetch('*[_type == "contributor" && _id == $id][0]._id', { id });
  return published ? true : "Publish this contributor before adding them to Publication Settings.";
}

const staffEntry = (name: "editorInChiefEntry" | "editorEntry" | "facultyAdviserEntry", title: string) => defineArrayMember({
  name, title, type: "object",
  fields: [
    defineField({ name: "contributor", title: "Contributor", type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" }, validation: (Rule) => Rule.required().custom(validatePublishedStaffContributor) }),
    defineField({ name: "displayedRole", title: "Displayed role", type: "string", description: "Optional label used on About; leave blank to use the section heading.", validation: (Rule) => Rule.max(100) }),
  ],
  preview: { select: { title: "contributor.name", subtitle: "displayedRole" } },
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Publication Settings",
  type: "document",
  validation: (Rule) => Rule.custom((value) => validateUniqueStaff(value as Parameters<typeof validateUniqueStaff>[0])),
  groups: [
    { name: "general", title: "General", default: true },
    { name: "about", title: "About" },
    { name: "leadership", title: "Leadership" },
    { name: "logo", title: "Logo" },
    { name: "contact", title: "Contact and social" },
    { name: "seo", title: "SEO / Advanced" },
    { name: "homepage", title: "Homepage" },
  ],
  fields: [
    defineField({ name: "publicationName", title: "Publication name", type: "string", group: "general", validation: (Rule) => Rule.required().max(100) }),
    defineField({ name: "shortName", title: "Short name", type: "string", group: "general", description: "A compact abbreviation such as SBR.", validation: (Rule) => Rule.required().max(20) }),
    defineField({ name: "description", title: "Publication description", type: "text", rows: 3, group: "general", description: "Optional longer description of the publication." }),
    defineField({ name: "affiliationText", title: "Affiliation text", type: "string", group: "general", description: "Use school-approved public wording.", validation: (Rule) => Rule.required().max(160) }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "general", validation: (Rule) => Rule.max(160) }),
    defineField({ name: "location", title: "Location", type: "string", group: "general", validation: (Rule) => Rule.max(120) }),
    defineField({ name: "aboutTitle", title: "Page title", type: "string", group: "about", validation: (Rule) => Rule.required().max(140) }),
    defineField({ name: "aboutEyebrow", title: "Eyebrow", type: "string", group: "about", validation: (Rule) => Rule.max(80) }),
    defineField({ name: "aboutSummary", title: "Summary", type: "text", rows: 3, group: "about", description: "Plain-language About page summary used as metadata fallback.", validation: (Rule) => Rule.max(320) }),
    defineField({ name: "aboutBody", title: "About page body", type: "articleBody", group: "about", validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: "aboutUpdatedDate", title: "Last substantive About update", type: "datetime", group: "about", description: "Update when institutional information materially changes." }),
    defineField({ name: "editorsInChief", title: "Editors-in-Chief", type: "array", group: "leadership", description: "Select the current Editors-in-Chief in display order.", components: { input: AboutStaffArrayInput }, of: [staffEntry("editorInChiefEntry", "Editor-in-Chief")], validation: (Rule) => Rule.unique() }),
    defineField({ name: "editors", title: "Editors", type: "array", group: "leadership", components: { input: AboutStaffArrayInput }, of: [staffEntry("editorEntry", "Editor")], validation: (Rule) => Rule.unique() }),
    defineField({ name: "facultyAdviser", title: "Faculty Adviser", type: "array", group: "leadership", components: { input: AboutStaffArrayInput }, of: [staffEntry("facultyAdviserEntry", "Faculty Adviser")], validation: (Rule) => Rule.max(1).unique() }),
    defineField({ name: "logoMode", title: "Logo display", type: "string", group: "logo", initialValue: "text", options: { layout: "radio", list: [
      { title: "Text wordmark", value: "text" },
      { title: "Image logo", value: "image" },
    ] }, validation: (Rule) => Rule.required() }),
    defineField({ name: "textWordmark", title: "Text wordmark", type: "string", group: "logo", hidden: ({ document }) => document?.logoMode === "image", validation: (Rule) => Rule.custom((value, context) => context.document?.logoMode === "image" || (typeof value === "string" && value.trim()) ? true : "Enter the text wordmark.").max(100) }),
    defineField({ name: "logoImage", title: "Logo image", type: "image", group: "logo", options: { hotspot: true }, hidden: ({ document }) => document?.logoMode !== "image", description: `Optional. The text wordmark is used when no image is supplied. ${IMAGE_FORMAT_DESCRIPTION}`, validation: (Rule) => Rule.custom(validateSupportedImage) }),
    defineField({ name: "logoImageAlt", title: "Logo alternative text", type: "string", group: "logo", hidden: ({ document }) => !document?.logoImage, description: "Required when a logo image is added; usually the full publication name.", validation: (Rule) => Rule.custom((value, context) => requireAltWhenImagePresent(value, context, "logoImage")).max(120) }),
    defineField({ name: "contactLabel", title: "Contact link label", type: "string", group: "contact", validation: (Rule) => Rule.required().max(80) }),
    defineField({ name: "contactTarget", title: "Contact email or path", type: "string", group: "contact", description: "Use the publication account or an approved internal contact page—not a student's personal address.", validation: (Rule) => Rule.required().max(200) }),
    defineField({ name: "socialLinks", title: "Approved social links", type: "array", group: "contact", description: "Add only publication-owned accounts approved for public display.", of: [defineArrayMember({ type: "object", name: "socialLink", fields: [
      defineField({ name: "label", title: "Platform label", type: "string", validation: (Rule) => Rule.required().max(40) }),
      defineField({ name: "url", title: "Profile URL", type: "url", validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }) }),
    ], preview: { select: { title: "label", subtitle: "url" } } })], validation: (Rule) => Rule.unique() }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo", group: "seo" }),
    defineField({ name: "aboutSeo", title: "About page SEO overrides", type: "seo", group: "seo" }),
    defineField({ name: "homepageTagline", title: "Homepage tagline", type: "text", rows: 2, group: "homepage", description: "Optional short line displayed near the homepage introduction." }),
    defineField({ name: "homepagePurposeQuote", title: "Purpose statement headline", type: "string", group: "homepage", description: "Optional quoted statement in the Homepage Our purpose section.", validation: (Rule) => Rule.max(240) }),
    defineField({ name: "homepagePurposeText", title: "Purpose statement", type: "text", rows: 3, group: "homepage", description: "Optional supporting text in the Homepage Our purpose section.", validation: (Rule) => Rule.max(500) }),
  ],
  preview: { prepare: () => ({ title: "Publication Settings", subtitle: "Site identity, About page, and leadership" }) },
});
