import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "Search and social metadata",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO title",
      type: "string",
      description: "Optional search title. Aim for 50–60 characters; the page title is the fallback.",
      validation: (Rule) => Rule.max(60).warning("Search results may truncate titles over 60 characters."),
    }),
    defineField({
      name: "description",
      title: "SEO description",
      type: "text",
      rows: 3,
      description: "Optional search summary. Aim for 50–160 characters; the content summary is the fallback.",
      validation: (Rule) => Rule.min(50).warning().max(160).warning("Search results may truncate this description."),
    }),
    defineField({
      name: "socialImage",
      title: "Social sharing image",
      type: "image",
      options: { hotspot: true },
      description: "Optional rights-cleared override for social previews.",
    }),
  ],
});
