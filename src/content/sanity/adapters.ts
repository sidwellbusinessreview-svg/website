import { siteConfig } from "@/config/site";
import { stegaClean } from "next-sanity";
import { articleSchema, contributorSchema, siteSettingsSchema, type Article, type ArticleContentBlock, type Contributor, type SiteSettings } from "../schemas";
import type { StaticPageContent, StaffEntry } from "../provider";

type RawSpan = { _type?: unknown; text?: unknown; marks?: unknown; sourceKey?: unknown };
type RawMark = { _key?: unknown; _type?: unknown; href?: unknown; internalSlug?: unknown; internalType?: unknown; sourceKey?: unknown };
type RawBlock = {
  _type?: unknown;
  style?: unknown;
  listItem?: unknown;
  level?: unknown;
  children?: unknown;
  markDefs?: unknown;
  text?: unknown;
  sourceText?: unknown;
  attribution?: unknown;
  sourceKey?: unknown;
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
type RawContributor = { slug?: unknown; name?: unknown; graduationYear?: unknown; active?: unknown };
export type RawSanityArticle = {
  _id?: unknown; slug?: unknown; title?: unknown; subtitle?: unknown; summary?: unknown; publicationMonth?: unknown; publicationDate?: unknown;
  pinned?: unknown; featuredRank?: unknown; contributors?: unknown; featuredImage?: RawImage | null;
  featuredImageAltText?: unknown; featuredImageCaption?: unknown; featuredImageCredit?: unknown; body?: unknown;
  sources?: unknown;
};

const text = (value: unknown) =>
  typeof value === "string" && stegaClean(value).trim() ? value.trim() : undefined;
const inlineText = (value: unknown) =>
  typeof value === "string" && stegaClean(value).trim() ? value : undefined;
const cleanText = (value: unknown) => text(stegaClean(value));
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

function spans(value: unknown): RawSpan[] {
  return Array.isArray(value) ? value.filter((span): span is RawSpan => Boolean(span) && typeof span === "object") : [];
}

function blockText(block: RawBlock): string {
  const value = spans(block.children).map((span) => typeof span.text === "string" ? span.text : "").join("");
  return text(value) ?? "";
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
  const href = cleanText(definition?.href);
  if (href && /^https?:\/\//.test(href)) return href;
  return undefined;
}

type RichListItem = Extract<ArticleContentBlock, { type: "bulletedList" | "numberedList" }>["items"][number];
type DomainInlineSpan = Extract<RichListItem, { content: unknown }>["content"][number];

function safeMarkHref(mark: RawMark | undefined): string | undefined {
  const href = cleanText(mark?.href);
  if (href && /^https?:\/\//.test(href)) return href;
  const slug = cleanText(mark?.internalSlug);
  if (!slug) return undefined;
  const internalType = cleanText(mark?.internalType);
  if (internalType === "article") return `/articles/${slug}`;
  if (internalType === "contributor") return `/authors/${slug}`;
  return undefined;
}

function inlineContent(block: RawBlock): Extract<RichListItem, { content: unknown }>["content"] {
  const definitions = markDefs(block.markDefs);
  return spans(block.children).flatMap<DomainInlineSpan>((span) => {
    if (span._type === "footnoteReference") {
      return [{ text: "", sourceKey: cleanText(span.sourceKey) ?? "__missing_source__" }];
    }
    const spanText = inlineText(span.text);
    if (!spanText) return [];
    const markKeys = Array.isArray(span.marks) ? span.marks.filter((mark): mark is string => typeof mark === "string") : [];
    const marks = [...new Set(markKeys.flatMap((mark) => mark === "strong" ? ["strong" as const] : mark === "em" ? ["em" as const] : []))];
    const definition = definitions.find((item) => markKeys.includes(String(item._key)));
    const href = safeMarkHref(definition);
    return [{ text: spanText, ...(marks.length ? { marks } : {}), ...(href ? { href } : {}) }];
  });
}

function listItemText(item: RichListItem): string {
  return typeof item === "string" ? item : item.content.map(({ text: itemText }) => itemText).join("");
}

function imageBlock(block: RawBlock, allowEmptyAlt = false): ArticleContentBlock | undefined {
  const image = block as RawBlock & RawImage;
  const src = image.asset && cleanText(image.asset.url);
  const alt = text(block.altText);
  if (!src || (!alt && !allowEmptyAlt)) return undefined;
  const dimensions = image.asset?.metadata?.dimensions;
  return {
    type: "image",
    src,
    alt: alt ?? "",
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
      else if (block.style === "blockquote") output.push({ type: "quote", text: valueText, content: inlineContent(block) });
      else output.push({ type: "paragraph", text: valueText, content: inlineContent(block) });
      continue;
    }
    flush();
    if (block._type === "editorialImage") { const mapped = imageBlock(block); if (mapped) output.push(mapped); }
    else if (block._type === "callout") {
      const calloutText = mapPortableText(block.body).flatMap((entry) => "text" in entry ? [entry.text] : "items" in entry ? entry.items.map(listItemText) : []).join(" ");
      if (calloutText) output.push({ type: "callout", ...(text(block.title) ? { title: text(block.title) } : {}), text: calloutText, ...(cleanText(block.sourceKey) ? { sourceKey: cleanText(block.sourceKey) } : {}) });
    } else if (block._type === "divider") output.push({ type: "divider" });
    else if (process.env.NODE_ENV !== "production") console.warn(`Unknown Sanity body block ignored: ${String(block._type ?? "missing type")}`);
  }
  flush();
  return output;
}

export function mapContributor(value: unknown): Contributor | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as RawContributor;
  const candidate = {
    slug: cleanText(raw.slug), name: text(raw.name),
    grade: number(raw.graduationYear) ? `Class of ${number(raw.graduationYear)}` : undefined,
  };
  const parsed = contributorSchema.safeParse(stegaClean(candidate));
  return parsed.success ? candidate as Contributor : undefined;
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
  const featured = raw.featuredImage ? imageBlock({ ...raw.featuredImage, altText: raw.featuredImageAltText, caption: raw.featuredImageCaption, credit: raw.featuredImageCredit }, true) : undefined;
  if (raw.featuredImage && !featured) failures.push("featuredImage: asset URL is required when an image is present");
  const sources = Array.isArray(raw.sources) ? raw.sources.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>; const key = cleanText(source.key); const citation = text(source.citation); const url = cleanText(source.url);
    return key && citation ? [{ key, citation, ...(url ? { url } : {}) }] : [];
  }) : [];
  const publicationMonth = cleanText(raw.publicationMonth) ?? cleanText(raw.publicationDate)?.slice(0, 7);
  const candidate = {
    slug: cleanText(raw.slug), title: text(raw.title), dek: text(raw.summary) ?? text(raw.subtitle),
    contributorSlugs: contributors.flatMap((contributor) => contributor ? [contributor.slug] : []),
    publicationMonth,
    status: "published",
    pinned: raw.pinned === true, featuredRank: number(raw.featuredRank), featuredImage: featured,
    content: body, sources,
  };
  const parsed = articleSchema.safeParse(stegaClean(candidate));
  if (!parsed.success) failures.push(...parsed.error.issues.map((issue) => `${issue.path.join(".") || "article"}: ${issue.message}`));
  return { candidate, failures: [...new Set(failures)] };
}

export function getArticleValidationFailures(value: unknown): string[] {
  return articleCandidate(value).failures;
}

export function mapArticle(value: unknown, options: { allowBrokenFootnotes?: boolean } = {}): Article | undefined {
  const result = articleCandidate(value);
  const blocking = options.allowBrokenFootnotes
    ? result.failures.filter((failure) => !failure.includes("footnote source") && !failure.includes("source key is required"))
    : result.failures;
  if (blocking.length) return undefined;
  return result.candidate as Article;
}

export function mapSiteSettings(value: unknown): SiteSettings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const logoImage = raw.logoImage as RawImage | undefined;
  const logoImageSrc = cleanText(logoImage?.asset?.url);
  const candidate = {
    name: cleanText(raw.publicationName), shortName: cleanText(raw.shortName), description: cleanText(raw.description) ?? siteConfig.description,
    affiliation: cleanText(raw.affiliationText), tagline: text(raw.homepageTagline) ?? text(raw.tagline) ?? siteConfig.tagline,
    contact: { label: cleanText(raw.contactLabel), email: cleanText(raw.contactTarget) },
    socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks.flatMap((item) => item && typeof item === "object" && cleanText((item as Record<string, unknown>).label) && cleanText((item as Record<string, unknown>).url) ? [{ label: cleanText((item as Record<string, unknown>).label)!, href: cleanText((item as Record<string, unknown>).url)! }] : []) : [],
    logo: { mode: cleanText(raw.logoMode) === "image" && logoImageSrc ? "image" : "text", textWordmark: cleanText(raw.textWordmark) ?? cleanText(raw.publicationName), imageSrc: logoImageSrc ?? siteConfig.logo.imageSrc, imageAlt: cleanText(raw.logoImageAlt) ?? cleanText(raw.publicationName), imageWidth: number(logoImage?.asset?.metadata?.dimensions?.width) ?? siteConfig.logo.imageWidth, imageHeight: number(logoImage?.asset?.metadata?.dimensions?.height) ?? siteConfig.logo.imageHeight },
    school: siteConfig.school, location: cleanText(raw.location) ?? siteConfig.location, siteUrl: siteConfig.siteUrl,
    navigation: siteConfig.navigation.map((item) => ({ ...item })),
    homepagePurposeQuote: text(raw.homepagePurposeQuote),
    homepagePurposeText: text(raw.homepagePurposeText),
  };
  const parsed = siteSettingsSchema.safeParse(stegaClean(candidate));
  return parsed.success ? candidate as SiteSettings : undefined;
}

function staff(value: unknown): StaffEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>; const contributor = record.contributor as Record<string, unknown> | undefined;
    const slug = cleanText(contributor?.slug); if (!slug) return [];
    return [{ contributorSlug: slug, ...(text(record.displayedRole) ? { displayedRole: text(record.displayedRole) } : {}) }];
  });
}

export function mapStaticPage(value: unknown): StaticPageContent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>; const title = text(raw.aboutTitle); const body = mapPortableText(raw.aboutBody);
  if (!title || !body.length) return undefined;
  return { slug: "about", title, ...(text(raw.aboutEyebrow) ? { eyebrow: text(raw.aboutEyebrow) } : {}), ...(text(raw.aboutSummary) ? { summary: text(raw.aboutSummary) } : {}), body, staff: { editorsInChief: staff(raw.editorsInChief), editors: staff(raw.editors), facultyAdviser: staff(raw.facultyAdviser) } };
}
