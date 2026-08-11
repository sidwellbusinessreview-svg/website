import { defineArrayMember, defineField, defineType } from "sanity";
import { FootnoteSourceInput } from "../../components/FootnoteSourceInput";

const richTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Paragraph", value: "normal" },
    { title: "Heading 2", value: "h2" },
    { title: "Heading 3", value: "h3" },
    { title: "Block quote", value: "blockquote" },
  ],
  lists: [
    { title: "Bulleted list", value: "bullet" },
    { title: "Numbered list", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Strong", value: "strong" },
      { title: "Emphasis", value: "em" },
    ],
    annotations: [{ type: "linkAnnotation" }],
  },
  of: [defineArrayMember({ type: "footnoteReference" })],
});

export const simplePortableText = defineType({
  name: "simplePortableText",
  title: "Formatted text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }],
      lists: [
        { title: "Bulleted list", value: "bullet" },
        { title: "Numbered list", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [{ type: "linkAnnotation" }],
      },
    }),
  ],
});

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Quote text",
      type: "text",
      rows: 3,
      description: "Use a concise excerpt that already appears in or is supported by the article.",
      validation: (Rule) => Rule.required().min(10).max(300),
    }),
    defineField({
      name: "sourceText",
      title: "Source or context",
      type: "string",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: { select: { title: "text", subtitle: "sourceText" } },
});

export const callout = defineType({
  name: "callout",
  title: "Callout box",
  type: "object",
  fields: [
    defineField({
      name: "variant",
      title: "Callout type",
      type: "string",
      initialValue: "context",
      options: {
        layout: "radio",
        list: [
          { title: "Context", value: "context" },
          { title: "Definition", value: "definition" },
          { title: "Data note", value: "data" },
          { title: "Editor's note", value: "note" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Heading", type: "string", validation: (Rule) => Rule.max(100) }),
    defineField({ name: "body", title: "Body", type: "simplePortableText", validation: (Rule) => Rule.required().min(1) }),
  ],
  preview: {
    select: { title: "title", variant: "variant" },
    prepare: ({ title, variant }) => ({ title: title || "Callout", subtitle: variant }),
  },
});

export const divider = defineType({
  name: "divider",
  title: "Divider",
  type: "object",
  fields: [
    defineField({
      name: "style",
      title: "Divider style",
      type: "string",
      initialValue: "rule",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: { prepare: () => ({ title: "Divider" }) },
});

export const articleBody = defineType({
  name: "articleBody",
  title: "Article body",
  type: "array",
  of: [
    richTextBlock,
    defineArrayMember({ type: "pullQuote" }),
    defineArrayMember({ type: "editorialImage" }),
    defineArrayMember({ type: "callout" }),
    defineArrayMember({ type: "divider" }),
  ],
  validation: (Rule) => Rule.required().min(1).error("Add at least one substantive body block."),
});

export const footnoteReference = defineType({
  name: "footnoteReference",
  title: "Add footnote",
  type: "object",
  description: "Choose an item from this Article’s Sources list. The website generates its number.",
  fields: [defineField({
    name: "sourceKey", title: "Source", type: "string",
    description: "Choose the citation this footnote should use. Do not type a number or brackets.",
    components: { input: FootnoteSourceInput },
    validation: (Rule) => Rule.required().custom((value, context) => {
      if (!value || typeof value !== "string") return "Choose a source key.";
      const sources = Array.isArray(context.document?.sources) ? context.document.sources : [];
      return sources.some((source) => source && typeof source === "object" && (source as { _key?: string })._key === value) || "This source key does not exist in Sources.";
    }),
  })],
  preview: { prepare: () => ({ title: "Footnote" }) },
});
