import type { Article, Author, Category, Issue } from "./types";
import { validatedContent } from "./validation";

export type {
  Article,
  ArticleContentBlock,
  Author,
  Category,
  CategoryRecord,
  Issue,
  SiteSettings,
} from "./types";
export { findDuplicateSlugs, getPublicArticles, selectLeadArticle } from "./utils";
import { getPublicArticles } from "./utils";

export async function getArticles(): Promise<Article[]> {
  return getPublicArticles(validatedContent.articles);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getIssues(): Promise<Issue[]> {
  return [...validatedContent.issues].sort(
    (a, b) =>
      b.year - a.year ||
      b.number - a.number ||
      a.slug.localeCompare(b.slug),
  );
}

export async function getIssueBySlug(slug: string): Promise<Issue | undefined> {
  return validatedContent.issues.find((issue) => issue.slug === slug);
}

export async function getAuthors(): Promise<Author[]> {
  return [...validatedContent.authors];
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  return validatedContent.authors.find((author) => author.slug === slug);
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  const allArticles = await getArticles();
  return allArticles.filter((article) => article.authorSlugs.includes(authorSlug));
}

export async function getArticlesByIssue(issueSlug: string): Promise<Article[]> {
  const issue = await getIssueBySlug(issueSlug);
  if (!issue) return [];
  const publicArticles = await getArticles();
  return issue.articleSlugs
    .map((slug) => publicArticles.find((article) => article.slug === slug))
    .filter((article): article is Article => Boolean(article));
}

export async function getCategories(): Promise<Category[]> {
  return validatedContent.categories.map(({ name }) => name);
}

export async function getArticlesByCategory(category: Category): Promise<Article[]> {
  const allArticles = await getArticles();
  return allArticles.filter((article) => article.category === category);
}
