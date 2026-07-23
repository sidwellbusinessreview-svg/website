import { siteConfig } from "@/config/site";
import { articleSchema, contributorSchema, siteSettingsSchema, type Article, type ArticleContentBlock, type Contributor, type SiteSettings } from "../schemas";
import type { StaticPageContent, StaffEntry } from "../provider";

type RawSpan = { text?: unknown; marks?: unknown };
type RawMark = { _key?: unknown; href?: unknown; internalSlug?: unknown; internalType?: unknown };
type RawBlock = {
  _type?: unknown;
  style?: unknown;
  listItem?: unknown;
  level?: unknown;
  children?: unknown;
  markDefs?: unknown;
  text?: unknown;
  sourceText?: unknown;
  title?: unknown;
  body?: unknown;
  altText?: unknown;
  caption?: unknown;
  credit?: unknown;
  asset?: unknown;
  hotspot?: unknown;
  crop?: unknown;
};
type RawImage = {
  asset?: { url?: unknown; metadata?: { dimensions?: { width?: unknown; height?: unknown } } } | null;
  hotspot?: unknown;
  crop?: unknown;
};
type RawContributor = { slug?: unknown; name?: unknown; role?: unknown; graduationYear?: unknown; active?: unknown };
export type RawSanityArticle = {
  _id?: unknown; slug?: unknown; title?: unknown; subtitle?: unknown; summary?: unknown; publicationDate?: unknown;
  pinned?: unknown; featuredRank?: unknown; contributors?: unknown; featuredImage?: RawImage | null;
  featuredImageAltText?: unknown; featuredImageCaption?: unknown; featuredImageCredit?: unknown; body?: unknown;
};

const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

function spans(value: unknown): RawSpan[] {
  return Array.isArray(value) ? value.filter((span): span is RawSpan => Boolean(span) && typeof span === "object") : [];
}

function blockText(block: RawBlock): string {
  return spans(block.children).map((span) => typeof span.text === "string" ? span.text : "").join("").trim();
}

function markDefs(value: unknown): RawMark[] {
  return Array.isArray(value) ? value.filter((mark): mark is RawMark => Boolean(mark) && typeof mark === "object") : [];
}

function wholeBlockLink(block: RawBlock): string | undefined {
  const contentSpans = spans(block.children).filter((span) => typeof span.text === "string" && span.text.length > 0);
  if (!contentSpans.length) return undefined;
  const markKeys = contentSpans.map((span) => Array.isArray(span.marks) ? span.marks.filter((mark): mark is string => typeof mark === "string") : []);
  const shared = markKeys[0].find((key) => markKeys.every((keys) => keys.includes(key)));
  if (!shared) return undefined;
  const definition = markDefs(block.markDefs).find((mark) => mark._key === shared);
  if (typeof definition?.href === "string" && /^https?:\/\//.test(definition.href)) return definition.href;
  return undefined;
}

type RichListItem = Extract<ArticleContentBlock, { type: "bulletedList" | "numberedList" }>["items"][number];

function safeMarkHref(mark: RawMark | undefined): string | undefined {
  if (typeof mark?.href === "string" && /^https?:\/\//.test(mark.href)) return mark.href;
  const slug = text(mark?.internalSlug);
  if (!slug) return undefined;
  if (mark?.internalType === "article") return `/articles/${slug}`;
  if (mark?.internalType === "contributor") return `/authors/${slug}`;
  if (mark?.internalType === "staticPage") return `/${slug}`;
  return undefined;
}

function inlineContent(block: RawBlock): Extract<RichListItem, { content: unknown }>["content"] {
  const definitions = markDefs(block.markDefs);
  return spans(block.children).flatMap((span) => {
    const spanText = typeof span.text === "string" && span.text.trim() ? span.text : undefined;
    if (!spanText) return [];
    const markKeys = Array.isArray(span.marks) ? span.marks.filter((mark): mark is string => typeof mark === "string") : [];
    const marks = [...new Set(markKeys.flatMap((mark) => mark === "strong" ? ["strong" as const] : mark === "em" ? ["em" as const] : []))];
    const href = safeMarkHref(definitions.find((definition) => markKeys.includes(String(definition._key))));
    return [{ text: spanText, ...(marks.length ? { marks } : {}), ...(href ? { href } : {}) }];
  });
}

function listItemText(item: RichListItem): string {
  return typeof item === "string" ? item : item.content.map(({ text: itemText }) => itemText).join("");
}

function imageBlock(block: RawBlock): ArticleContentBlock | undefined {
  const image = block as RawBlock & RawImage;
  const src = image.asset && text(image.asset.url);
  const alt = text(block.altText);
  if (!src || !alt) return undefined;
  const dimensions = image.asset?.metadata?.dimensions;
  return {
    type: "image",
    src,
    alt,
    ...(text(block.caption) ? { caption: text(block.caption) } : {}),
    ...(text(block.credit) ? { credit: text(block.credit) } : {}),
    ...(number(dimensions?.width) ? { width: number(dimensions?.width) } : {}),
    ...(number(dimensions?.height) ? { height: number(dimensions?.height) } : {}),
    ...(image.hotspot && typeof image.hotspot === "object" ? { hotspot: image.hotspot as { x: number; y: number } } : {}),
    ...(image.crop && typeof image.crop === "object" ? { crop: image.crop as { top: number; right: number; bottom: number; left: number } } : {}),
  } as ArticleContentBlock;
}

export function mapPortableText(value: unknown): ArticleContentBlock[] {
  if (!Array.isArray(value)) return [];
  const output: ArticleContentBlock[] = [];
  let list: { kind: "bullet" | "number"; items: RichListItem[] } | undefined;
  const flush = () => {
    if (!list) return;
    output.push({ type: list.kind === "bullet" ? "bulletedList" : "numberedList", items: list.items });
    list = undefined;
  };
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const block = item as RawBlock;
    if (block._type === "block") {
      const valueText = blockText(block);
      if (!valueText) continue;
      if (block.listItem === "bullet" || block.listItem === "number") {
        if (!list || list.kind !== block.listItem) { flush(); list = { kind: block.listItem, items: [] }; }
        const content = inlineContent(block);
        if (content.length) list.items.push({ content, level: number(block.level) ?? 1 });
        continue;
      }
      flush();
      const link = wholeBlockLink(block);
      if (link) output.push({ type: "link", text: valueText, label: valueText, href: link });
      else if (block.style === "h2" || block.style === "h3") output.push({ type: "heading", level: block.style === "h2" ? 2 : 3, text: valueText });
      else if (block.style === "blockquote") output.push({ type: "quote", text: valueText });
      else output.push({ type: "paragraph", text: valueText });
      continue;
    }
    flush();
    if (block._type === "pullQuote" && text(block.text)) output.push({ type: "pullQuote", text: text(block.text)! });
    else if (block._type === "editorialImage") { const mapped = imageBlock(block); if (mapped) output.push(mapped); }
    else if (block._type === "callout") {
      const calloutText = mapPortableText(block.body).flatMap((entry) => "text" in entry ? [entry.text] : "items" in entry ? entry.items.map(listItemText) : []).join(" ");
      if (calloutText) output.push({ type: "callout", ...(text(block.title) ? { title: text(block.title) } : {}), text: calloutText });
    } else if (block._type === "divider") output.push({ type: "divider" });
    else if (process.env.NODE_ENV !== "production") console.warn(`Unknown Sanity body block ignored: ${String(block._type ?? "missing type")}`);
  }
  flush();
  return output;
}

export function mapContributor(value: unknown): Contributor | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as RawContributor;
  const parsed = contributorSchema.safeParse({
    slug: text(raw.slug), name: text(raw.name), role: text(raw.role),
    grade: number(raw.graduationYear) ? `Class of ${number(raw.graduationYear)}` : undefined,
  });
  return parsed.success ? parsed.data : undefined;
}

function articleCandidate(value: unknown): { candidate?: Record<string, unknown>; failures: string[] } {
  if (!value || typeof value !== "object") return { failures: ["document: expected an object"] };
  const raw = value as RawSanityArticle;
  const rawContributors = Array.isArray(raw.contributors) ? raw.contributors : [];
  const contributors = rawContributors.map(mapContributor);
  const failures: string[] = [];
  if (!rawContributors.length) failures.push("contributors: at least one published Contributor is required");
  if (contributors.some((contributor) => !contributor)) failures.push("contributors: one or more references are missing or invalid");
  const body = mapPortableText(raw.body);
  const featured = raw.featuredImage ? imageBlock({ ...raw.featuredImage, altText: raw.featuredImageAltText, caption: raw.featuredImageCaption, credit: raw.featuredImageCredit }) : undefined;
  if (raw.featuredImage && !featured) failures.push("featuredImage: asset URL and alternative text are required when an image is present");
  const wordCount = body.flatMap((block) => "text" in block ? block.text.split(/\s+/) : "items" in block ? block.items.flatMap((item) => listItemText(item).split(/\s+/)) : []).filter(Boolean).length;
  const candidate = {
    slug: text(raw.slug), title: text(raw.title), dek: text(raw.subtitle) ?? text(raw.summary),
    contributorSlugs: contributors.flatMap((contributor) => contributor ? [contributor.slug] : []),
    publishedAt: text(raw.publicationDate), readTime: Math.max(1, Math.ceil(wordCount / 220)), status: "published",
    pinned: raw.pinned === true, featuredRank: number(raw.featuredRank), featuredImage: featured,
    content: body,
  };
  const parsed = articleSchema.safeParse(candidate);
  if (!parsed.success) failures.push(...parsed.error.issues.map((issue) => `${issue.path.join(".") || "article"}: ${issue.message}`));
  return { candidate: parsed.success ? parsed.data : candidate, failures: [...new Set(failures)] };
}

export function getArticleValidationFailures(value: unknown): string[] {
  return articleCandidate(value).failures;
}

export function mapArticle(value: unknown): Article | undefined {
  const result = articleCandidate(value);
  if (result.failures.length) return undefined;
  const parsed = articleSchema.safeParse(result.candidate);
  return parsed.success ? parsed.data : undefined;
}

export function mapSiteSettings(value: unknown): SiteSettings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const logoImage = raw.logoImage as RawImage | undefined;
  const parsed = siteSettingsSchema.safeParse({
    name: text(raw.publicationName), shortName: text(raw.shortName), description: text(raw.description) ?? siteConfig.description,
    affiliation: text(raw.affiliationText), tagline: text(raw.homepageTagline) ?? text(raw.tagline) ?? siteConfig.tagline,
    contact: { label: text(raw.contactLabel), email: text(raw.contactTarget) },
    socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks.flatMap((item) => item && typeof item === "object" && text((item as Record<string, unknown>).label) && text((item as Record<string, unknown>).url) ? [{ label: text((item as Record<string, unknown>).label)!, href: text((item as Record<string, unknown>).url)! }] : []) : [],
    logo: { mode: raw.logoMode === "image" ? "image" : "text", textWordmark: text(raw.textWordmark) ?? text(raw.publicationName), imageSrc: text(logoImage?.asset?.url) ?? siteConfig.logo.imageSrc, imageAlt: text(raw.logoImageAlt) ?? text(raw.publicationName), imageWidth: number(logoImage?.asset?.metadata?.dimensions?.width) ?? siteConfig.logo.imageWidth, imageHeight: number(logoImage?.asset?.metadata?.dimensions?.height) ?? siteConfig.logo.imageHeight },
    school: siteConfig.school, location: text(raw.location) ?? siteConfig.location, siteUrl: siteConfig.siteUrl,
    navigation: siteConfig.navigation,
  });
  return parsed.success ? parsed.data : undefined;
}

function staff(value: unknown): StaffEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>; const contributor = record.contributor as Record<string, unknown> | undefined;
    const slug = text(contributor?.slug); if (!slug) return [];
    return [{ contributorSlug: slug, ...(text(record.displayedRole) ? { displayedRole: text(record.displayedRole) } : {}) }];
  });
}

export function mapStaticPage(value: unknown): StaticPageContent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>; const slug = text(raw.slug); const title = text(raw.title); const body = mapPortableText(raw.body);
  if (!slug || !title || !body.length) return undefined;
  return { slug, title, ...(text(raw.eyebrow) ? { eyebrow: text(raw.eyebrow) } : {}), ...(text(raw.summary) ? { summary: text(raw.summary) } : {}), body, staff: { editorsInChief: staff(raw.editorsInChief), editors: staff(raw.editors), facultyAdviser: staff(raw.facultyAdviser) } };
}
