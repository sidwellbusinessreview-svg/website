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
});

export const categoryNames = [
  "Markets",
  "Economics",
  "Technology",
  "Entrepreneurship",
  "Policy",
  "Campus",
] as const;

export const categoryNameSchema = z.enum(categoryNames);

export const categorySchema = z.object({
  slug: slugSchema,
  name: categoryNameSchema,
  description: z.string().trim().min(10).max(500),
});

const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: nonEmptyText,
});

const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: nonEmptyText,
});

const bulletedListBlockSchema = z.object({
  type: z.literal("bulletedList"),
  items: z.array(nonEmptyText).min(1),
});

const numberedListBlockSchema = z.object({
  type: z.literal("numberedList"),
  items: z.array(nonEmptyText).min(1),
});

const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  text: nonEmptyText,
  attribution: z.string().trim().min(1).optional(),
});

const pullQuoteBlockSchema = z.object({
  type: z.literal("pullQuote"),
  text: nonEmptyText,
});

const imageBlockSchema = imageFieldsSchema.extend({
  type: z.literal("image"),
});

const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  title: z.string().trim().min(1).optional(),
  text: nonEmptyText,
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
  pullQuoteBlockSchema,
  imageBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  linkBlockSchema,
]);

const publicationDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "must be a valid calendar date");

export const articleSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(5).max(180),
    dek: z.string().trim().min(20).max(320),
    category: categoryNameSchema,
    tags: z.array(z.string().trim().min(1).max(60)).default([]),
    authorSlugs: z.array(slugSchema).min(1).refine(
      (values) => new Set(values).size === values.length,
      "authors must not be duplicated",
    ),
    issueSlug: slugSchema,
    publishedAt: publicationDateSchema,
    readTime: z.number().int().positive(),
    status: z.enum(["draft", "published"]).default("published"),
    pinned: z.boolean().default(false),
    featuredRank: z.number().int().positive().optional(),
    featuredImage: imageFieldsSchema,
    content: z.array(articleContentBlockSchema).min(1),
  })
  .superRefine((article, context) => {
    if (article.featuredRank !== undefined && !article.pinned) {
      context.addIssue({
        code: "custom",
        path: ["featuredRank"],
        message: "featured rank is only valid for a pinned article",
      });
    }
  });

export const authorSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(100),
  bio: z.string().trim().min(20).max(1000),
  initials: z.string().trim().min(1).max(4),
});

export const issueSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(140),
  number: z.number().int().positive(),
  season: z.string().trim().min(1).max(30),
  year: z.number().int().min(2000).max(2200),
  description: z.string().trim().min(20).max(500),
  editorNote: z.string().trim().min(20).max(2000),
  articleSlugs: z.array(slugSchema).refine(
    (values) => new Set(values).size === values.length,
    "issue articles must not be duplicated",
  ),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "must be a six-digit hexadecimal color"),
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
    imageSrc: z.string().regex(/^\/[a-z0-9/_.-]+$/i),
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
export type Author = z.infer<typeof authorSchema>;
export type Category = z.infer<typeof categoryNameSchema>;
export type CategoryRecord = z.infer<typeof categorySchema>;
export type Issue = z.infer<typeof issueSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
