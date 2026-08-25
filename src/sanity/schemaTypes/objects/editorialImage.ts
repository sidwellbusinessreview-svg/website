import { defineField, defineType } from "sanity";
import { contextualImageAlt } from "../shared/validation";
import { IMAGE_FORMAT_DESCRIPTION, validateSupportedImage } from "../shared/mediaValidation";

export const editorialImage = defineType({
  name: "editorialImage",
  title: "Editorial image",
  type: "image",
  options: { hotspot: true },
  description: IMAGE_FORMAT_DESCRIPTION,
  validation: (Rule) => Rule.custom(validateSupportedImage),
  fields: [
    defineField({
      name: "altText",
      title: "Alternative text",
      type: "string",
      description: "Describe the image for someone who cannot see it. Do not repeat the caption.",
      validation: (Rule) => Rule.custom(contextualImageAlt).max(240),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
      description: "Optional text displayed below the image. Do not use the caption as alt text.",
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: "credit",
      title: "Photo credit",
      type: "string",
      description: "Photographer, publication, organization, or source. Required only when rights or editorial policy call for attribution.",
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "rightsNote",
      title: "Rights note",
      type: "text",
      rows: 2,
      description: "Internal permission or license record. This field is not for public display.",
      validation: (Rule) => Rule.max(500),
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "credit", media: "asset" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Editorial image",
      subtitle: subtitle || "No public credit entered",
      media,
    }),
  },
});
