import { siteConfig } from "@/config/site";
import { articles, authors, categories, issues } from "./data";
import {
  articleSchema,
  authorSchema,
  categorySchema,
  issueSchema,
  siteSettingsSchema,
  type Article,
  type Author,
  type CategoryRecord,
  type Issue,
  type SiteSettings,
} from "./schemas";

export interface ContentSource {
  articles: unknown[];
  authors: unknown[];
  issues: unknown[];
  categories: unknown[];
  siteSettings: unknown;
}

export interface ValidatedContent {
  articles: Article[];
  authors: Author[];
  issues: Issue[];
  categories: CategoryRecord[];
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

function parseCollection<T>(
  label: string,
  values: unknown[],
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } } },
  problems: string[],
): T[] {
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

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function sourceSlugs(values: unknown[]): string[] {
  return values.flatMap((value) => {
    if (
      typeof value === "object" &&
      value !== null &&
      "slug" in value &&
      typeof value.slug === "string"
    ) {
      return [value.slug];
    }
    return [];
  });
}

export function validateContentSource(
  source: ContentSource,
  now = new Date(),
): ValidatedContent {
  const problems: string[] = [];
  const parsedArticles = parseCollection("articles", source.articles, articleSchema, problems);
  const parsedAuthors = parseCollection("authors", source.authors, authorSchema, problems);
  const parsedIssues = parseCollection("issues", source.issues, issueSchema, problems);
  const parsedCategories = parseCollection("categories", source.categories, categorySchema, problems);

  const siteResult = siteSettingsSchema.safeParse(source.siteSettings);
  if (!siteResult.success) {
    for (const issue of siteResult.error.issues) {
      const path = issue.path.length ? `.${issue.path.join(".")}` : "";
      problems.push(`siteSettings${path}: ${issue.message}`);
    }
  }

  for (const duplicate of duplicateValues(sourceSlugs(source.articles))) {
    problems.push(`duplicate article slug: ${duplicate}`);
  }
  for (const duplicate of duplicateValues(sourceSlugs(source.authors))) {
    problems.push(`duplicate author slug: ${duplicate}`);
  }
  for (const duplicate of duplicateValues(sourceSlugs(source.issues))) {
    problems.push(`duplicate issue slug: ${duplicate}`);
  }
  for (const duplicate of duplicateValues(sourceSlugs(source.categories))) {
    problems.push(`duplicate category slug: ${duplicate}`);
  }

  const authorSlugs = new Set(sourceSlugs(source.authors));
  const issueSlugs = new Set(sourceSlugs(source.issues));
  const categoryNames = new Set(parsedCategories.map(({ name }) => name));
  const articleSlugs = new Set(sourceSlugs(source.articles));

  for (const article of parsedArticles) {
    for (const authorSlug of article.authorSlugs) {
      if (!authorSlugs.has(authorSlug)) {
        problems.push(`article "${article.slug}" references missing author "${authorSlug}"`);
      }
    }
    if (!issueSlugs.has(article.issueSlug)) {
      problems.push(`article "${article.slug}" references missing issue "${article.issueSlug}"`);
    }
    if (!categoryNames.has(article.category)) {
      problems.push(`article "${article.slug}" references missing category "${article.category}"`);
    }
    if (
      article.status === "published" &&
      new Date(`${article.publishedAt}T23:59:59Z`).getTime() > now.getTime()
    ) {
      problems.push(`published article "${article.slug}" has a future publication date`);
    }
  }

  for (const issue of parsedIssues) {
    for (const articleSlug of issue.articleSlugs) {
      if (!articleSlugs.has(articleSlug)) {
        problems.push(`issue "${issue.slug}" references missing article "${articleSlug}"`);
      }
    }
  }

  const pinnedArticles = parsedArticles.filter(
    (article) => article.status === "published" && article.pinned,
  );
  if (pinnedArticles.length > 1) {
    problems.push(
      `multiple published lead articles are pinned: ${pinnedArticles
        .map(({ slug }) => slug)
        .join(", ")}`,
    );
  }

  const ranks = pinnedArticles.flatMap((article) =>
    article.featuredRank === undefined
      ? []
      : [{ rank: article.featuredRank, slug: article.slug }],
  );
  for (const duplicate of duplicateValues(ranks.map(({ rank }) => String(rank)))) {
    problems.push(`duplicate featured rank ${duplicate}`);
  }

  if (problems.length > 0 || !siteResult.success) {
    throw new ContentValidationError(problems);
  }

  return {
    articles: parsedArticles,
    authors: parsedAuthors,
    issues: parsedIssues,
    categories: parsedCategories,
    siteSettings: siteResult.data,
  };
}

export const validatedContent = validateContentSource({
  articles,
  authors,
  issues,
  categories,
  siteSettings: siteConfig,
});
