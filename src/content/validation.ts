import { siteConfig } from "@/config/site";
import { articles, contributors } from "./data";
import {
  articleSchema,
  contributorSchema,
  siteSettingsSchema,
  type Article,
  type Contributor,
  type SiteSettings,
} from "./schemas";

export interface ContentSource {
  articles: unknown[];
  contributors: unknown[];
  siteSettings: unknown;
}

export interface ValidatedContent {
  articles: Article[];
  contributors: Contributor[];
  siteSettings: SiteSettings;
}

export class ContentValidationError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Content validation failed:\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
    this.name = "ContentValidationError";
    this.problems = problems;
  }
}

function parseCollection<T>(label: string, values: unknown[], schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } } }, problems: string[]): T[] {
  return values.flatMap((value, index) => {
    const result = schema.safeParse(value);
    if (result.success) return [result.data];
    for (const issue of result.error.issues) {
      const path = issue.path.length ? `.${issue.path.join(".")}` : "";
      problems.push(`${label}[${index}]${path}: ${issue.message}`);
    }
    return [];
  });
}

function sourceSlugs(values: unknown[]): string[] {
  return values.flatMap((value) => typeof value === "object" && value !== null && "slug" in value && typeof value.slug === "string" ? [value.slug] : []);
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  return [...new Set(values.filter((value) => seen.has(value) || !seen.add(value)))].sort();
}

export function validateContentSource(source: ContentSource, now = new Date()): ValidatedContent {
  const problems: string[] = [];
  const parsedArticles = parseCollection("articles", source.articles, articleSchema, problems);
  const parsedContributors = parseCollection("contributors", source.contributors, contributorSchema, problems);
  const siteResult = siteSettingsSchema.safeParse(source.siteSettings);
  if (!siteResult.success) for (const issue of siteResult.error.issues) problems.push(`siteSettings${issue.path.length ? `.${issue.path.join(".")}` : ""}: ${issue.message}`);

  for (const duplicate of duplicateValues(sourceSlugs(source.articles))) problems.push(`duplicate article slug: ${duplicate}`);
  for (const duplicate of duplicateValues(sourceSlugs(source.contributors))) problems.push(`duplicate contributor slug: ${duplicate}`);
  const contributorSlugs = new Set(sourceSlugs(source.contributors));
  for (const article of parsedArticles) {
    for (const slug of article.contributorSlugs) if (!contributorSlugs.has(slug)) problems.push(`article "${article.slug}" references missing contributor "${slug}"`);
    if (article.status === "published" && new Date(`${article.publicationMonth}-01T23:59:59Z`).getTime() > now.getTime()) problems.push(`published article "${article.slug}" has a future publication month`);
  }
  const pinned = parsedArticles.filter((article) => article.status === "published" && article.pinned);
  if (pinned.length > 1) problems.push(`multiple published lead articles are pinned: ${pinned.map(({ slug }) => slug).join(", ")}`);
  for (const duplicate of duplicateValues(pinned.flatMap((article) => article.featuredRank === undefined ? [] : [String(article.featuredRank)]))) problems.push(`duplicate featured rank ${duplicate}`);
  if (problems.length || !siteResult.success) throw new ContentValidationError(problems);
  return { articles: parsedArticles, contributors: parsedContributors, siteSettings: siteResult.data };
}

export const validatedContent = validateContentSource({ articles, contributors, siteSettings: siteConfig });
