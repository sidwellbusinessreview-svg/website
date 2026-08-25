import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase URL-safe slug");

const nonEmptyText = z.string().trim().min(1);
const httpUrlSchema = z
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "must use http or https",
  });

const imageFieldsSchema = z.object({
  src: httpUrlSchema,
  alt: z.string().trim().min(1, "image alt text is required"),
  caption: z.string().trim().min(1).max(500).optional(),
  credit: z.string().trim().min(1).max(300).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  hotspot: z.object({ x: z.number(), y: z.number() }).passthrough().optional(),
  crop: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }).optional(),
});

const paragraphInlineSchema = z.object({
  text: z.string(),
  marks: z.array(z.enum(["strong", "em"])).optional(),
  href: z.union([httpUrlSchema, z.string().regex(/^\/[a-z0-9/_-]*(?:#[a-z0-9_-]+)?$/i)]).optional(),
  sourceKey: z.string().trim().min(1).optional(),
});

const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: nonEmptyText,
  content: z.array(paragraphInlineSchema).min(1).optional(),
});

const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: nonEmptyText,
});

const inlineContentSchema = z.object({
  text: z.string(),
  marks: z.array(z.enum(["strong", "em"])).optional(),
  href: z.union([
    httpUrlSchema,
    z.string().regex(/^\/[a-z0-9/_-]*(?:#[a-z0-9_-]+)?$/i, "must be a safe internal path"),
  ]).optional(),
  sourceKey: z.string().trim().min(1).optional(),
}).refine(({ text, sourceKey }) => text.trim().length > 0 || Boolean(sourceKey), "must contain text or a footnote reference");

const richListItemSchema = z.object({
  content: z.array(inlineContentSchema).min(1),
  level: z.number().int().min(1).max(10).default(1),
});

const bulletedListBlockSchema = z.object({
  type: z.literal("bulletedList"),
  items: z.array(z.union([nonEmptyText, richListItemSchema])).min(1),
});

const numberedListBlockSchema = z.object({
  type: z.literal("numberedList"),
  items: z.array(z.union([nonEmptyText, richListItemSchema])).min(1),
});

const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  text: nonEmptyText,
  content: z.array(paragraphInlineSchema).min(1).optional(),
  attribution: z.string().trim().min(1).optional(),
});

const imageBlockSchema = imageFieldsSchema.extend({
  type: z.literal("image"),
});

const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  title: z.string().trim().min(1).optional(),
  text: nonEmptyText,
  sourceKey: z.string().trim().min(1).optional(),
});

const dividerBlockSchema = z.object({
  type: z.literal("divider"),
});

const linkBlockSchema = z.object({
  type: z.literal("link"),
  text: nonEmptyText,
  href: httpUrlSchema,
  label: nonEmptyText,
});

export const articleContentBlockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  bulletedListBlockSchema,
  numberedListBlockSchema,
  quoteBlockSchema,
  imageBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  linkBlockSchema,
]);

const publicationMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must use YYYY-MM");
const legacyPublicationDateSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/).optional();
const articleSourceSchema = z.object({ key: z.string().trim().min(1), citation: z.string().trim().min(1), url: httpUrlSchema.optional() });

export const articleSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(5).max(180),
    dek: z.string().trim().min(20).max(300),
    contributorSlugs: z.array(slugSchema).min(1).refine(
      (values) => new Set(values).size === values.length,
      "contributors must not be duplicated",
    ),
    publicationMonth: publicationMonthSchema.optional(),
    publishedAt: legacyPublicationDateSchema,
    status: z.enum(["draft", "published"]).default("published"),
    pinned: z.boolean().default(false),
    featuredRank: z.number().int().positive().optional(),
    featuredImage: imageFieldsSchema.optional(),
    content: z.array(articleContentBlockSchema).min(1),
    sources: z.array(articleSourceSchema).default([]),
  })
  .superRefine((article, context) => {
    if (!article.publicationMonth && !article.publishedAt) context.addIssue({ code: "custom", path: ["publicationMonth"], message: "publication month is required" });
    const sourceKeys = article.sources.map(({ key }) => key);
    if (new Set(sourceKeys).size !== sourceKeys.length) context.addIssue({ code: "custom", path: ["sources"], message: "source keys must be unique" });
    const referenced = article.content.flatMap((block) => {
      if (block.type === "paragraph" || block.type === "quote") return (block.content ?? []).flatMap(({ sourceKey }) => sourceKey ? [sourceKey] : []);
      if (block.type === "bulletedList" || block.type === "numberedList") return block.items.flatMap((item) => typeof item === "string" ? [] : item.content.flatMap(({ sourceKey }) => sourceKey ? [sourceKey] : []));
      if (block.type === "callout") return block.sourceKey ? [block.sourceKey] : [];
      return [];
    });
    for (const key of referenced) if (!sourceKeys.includes(key)) context.addIssue({ code: "custom", path: ["content"], message: `footnote source ${key} does not exist` });
    if (article.featuredRank !== undefined && !article.pinned) {
      context.addIssue({
        code: "custom",
        path: ["featuredRank"],
        message: "featured rank is only valid for a pinned article",
      });
    }
  }).transform((article) => ({ ...article, publicationMonth: article.publicationMonth ?? article.publishedAt!.slice(0, 7) }));

export const contributorSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(100).optional(),
});

export const siteSettingsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  shortName: z.string().trim().min(1).max(20),
  description: z.string().trim().min(20).max(300),
  affiliation: z.string().trim().min(1).max(160),
  tagline: z.string().trim().min(1).max(160),
  contact: z.object({
    label: z.string().trim().min(1).max(80),
    email: z.email(),
  }),
  socialLinks: z.array(
    z.object({
      label: z.string().trim().min(1).max(40),
      href: httpUrlSchema,
    }),
  ),
  logo: z.object({
    mode: z.enum(["text", "image"]),
    textWordmark: z.string().trim().min(1).max(100),
    imageSrc: z.union([z.string().regex(/^\/[a-z0-9/_.-]+$/i), httpUrlSchema]),
    imageAlt: z.string().trim().min(1).max(120),
    imageWidth: z.number().int().positive(),
    imageHeight: z.number().int().positive(),
  }),
  school: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  siteUrl: z.url(),
  navigation: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        href: z.string().regex(/^\/[a-z0-9/-]*$/, "must be an internal path"),
      }),
    )
    .min(1),
});

export type ArticleContentBlock = z.infer<typeof articleContentBlockSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleInput = z.input<typeof articleSchema>;
export type Contributor = z.infer<typeof contributorSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
