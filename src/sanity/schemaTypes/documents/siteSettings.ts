import { defineArrayMember, defineField, defineType } from "sanity";
import { IMAGE_FORMAT_DESCRIPTION, requireAltWhenImagePresent, validateSupportedImage } from "../shared/mediaValidation";

export const SITE_SETTINGS_ID = "siteSettings";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "identity", title: "Publication identity", default: true },
    { name: "logo", title: "Logo" },
    { name: "contact", title: "Contact and social" },
    { name: "seo", title: "Default SEO" },
    { name: "homepage", title: "Homepage" },
  ],
  fields: [
    defineField({ name: "publicationName", title: "Publication name", type: "string", group: "identity", validation: (Rule) => Rule.required().max(100) }),
    defineField({ name: "shortName", title: "Short name", type: "string", group: "identity", description: "A compact abbreviation such as SBR.", validation: (Rule) => Rule.required().max(20) }),
    defineField({ name: "description", title: "Publication description", type: "text", rows: 3, group: "identity", description: "Optional longer description of the publication." }),
    defineField({ name: "affiliationText", title: "Affiliation text", type: "string", group: "identity", description: "Use school-approved public wording.", validation: (Rule) => Rule.required().max(160) }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "identity", validation: (Rule) => Rule.max(160) }),
    defineField({ name: "location", title: "Location", type: "string", group: "identity", validation: (Rule) => Rule.max(120) }),
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
    defineField({ name: "homepageTagline", title: "Homepage tagline", type: "text", rows: 2, group: "homepage", description: "Optional short line displayed near the homepage introduction." }),
  ],
  preview: { prepare: () => ({ title: "Site settings", subtitle: "Singleton publication configuration" }) },
});
