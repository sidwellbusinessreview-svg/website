import { defineArrayMember, defineField, defineType } from "sanity";
import { FootnoteSourceInput } from "../../components/FootnoteSourceInput";
import { ArticleBodyInput } from "../../components/ArticleBodyInput";
import { FootnotePreview } from "../../components/FootnotePreview";

const richTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Paragraph", value: "normal" },
    { title: "Section heading", value: "h2" },
    { title: "Subheading", value: "h3" },
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

export const callout = defineType({
  name: "callout",
  title: "Callout box",
  type: "object",
  description: "Use for a short highlighted note, statistic, or explanatory aside.",
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
    defineField({
      name: "sourceKey", title: "Source citation", type: "string",
      description: "Optional. Choose a Source when the callout contains a claim that needs a footnote.",
      components: { input: FootnoteSourceInput },
      validation: (Rule) => Rule.custom(validateOptionalSourceReference),
    }),
  ],
  preview: {
    select: { title: "title", variant: "variant" },
    prepare: ({ title, variant }) => ({ title: title || "Callout", subtitle: variant }),
  },
});

export const articleBody = defineType({
  name: "articleBody",
  title: "Article body",
  type: "array",
  // Sanity's array-definition overload cannot infer Portable Text custom-input props here.
  components: { input: ArticleBodyInput as never },
  of: [
    richTextBlock,
    defineArrayMember({ type: "editorialImage" }),
    defineArrayMember({ type: "callout" }),
  ],
  validation: (Rule) => Rule.required().min(1).error("Add Article text before publishing."),
});

export const footnoteReference = defineType({
  name: "footnoteReference",
  title: "footnote",
  type: "object",
  options: { modal: { type: "popover", width: 1 } },
  components: { preview: FootnotePreview },
  description: "Choose the Source for this footnote. Published numbers follow reading order.",
  fields: [defineField({
    name: "sourceKey", title: "Source", type: "string",
    description: "Choose the citation this footnote should use. Do not type a number or brackets.",
    components: { input: FootnoteSourceInput },
    validation: (Rule) => Rule.required().custom(validateSourceReference),
  })],
  preview: { select: { title: "sourceKey", subtitle: "_key" } },
});

export function validateSourceReference(value: unknown, context: { document?: Record<string, unknown> }): true | string {
  if (!value || typeof value !== "string") return "Choose a Source.";
  const sources = Array.isArray(context.document?.sources) ? context.document.sources : [];
  return sources.some((source) => source && typeof source === "object" && (source as { _key?: string })._key === value) || "This Source no longer exists. Choose another Source or remove the footnote.";
}

export function validateOptionalSourceReference(value: unknown, context: { document?: Record<string, unknown> }): true | string {
  return value === undefined || value === null || value === "" ? true : validateSourceReference(value, context);
}
