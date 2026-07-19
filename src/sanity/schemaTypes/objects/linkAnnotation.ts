import { defineField, defineType } from "sanity";
import { safeLink } from "../shared/validation";

export const linkAnnotation = defineType({
  name: "linkAnnotation",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      initialValue: "external",
      options: {
        layout: "radio",
        list: [
          { title: "External or typed URL", value: "external" },
          { title: "Internal publication content", value: "internal" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "string",
      description: "Use https for external links or an internal path beginning with /.",
      hidden: ({ parent }) => parent?.linkType === "internal",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string } | undefined;
          return parent?.linkType === "internal" ? true : safeLink(value);
        }),
    }),
    defineField({
      name: "internalReference",
      title: "Internal destination",
      type: "reference",
      to: [
        { type: "article" },
        { type: "contributor" },
        { type: "staticPage" },
      ],
      hidden: ({ parent }) => parent?.linkType !== "internal",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string } | undefined;
          return parent?.linkType !== "internal" || value
            ? true
            : "Choose the internal destination.";
        }),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
      description: "Use sparingly. The public renderer must announce new-window behavior.",
    }),
  ],
});
