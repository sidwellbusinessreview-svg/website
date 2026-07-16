import { articles, authors, issues } from "./data";
import type { Article, Author, Category, Issue } from "./types";

export type { Article, ArticleContentBlock, Author, Category, Issue } from "./types";

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return articles.find((article) => article.slug === slug);
}

export async function getIssues(): Promise<Issue[]> {
  return [...issues].sort((a, b) => b.year - a.year || b.number - a.number);
}

export async function getIssueBySlug(slug: string): Promise<Issue | undefined> {
  return issues.find((issue) => issue.slug === slug);
}

export async function getAuthors(): Promise<Author[]> {
  return [...authors];
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  return authors.find((author) => author.slug === slug);
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  const allArticles = await getArticles();
  return allArticles.filter((article) => article.authorSlugs.includes(authorSlug));
}

export async function getArticlesByIssue(issueSlug: string): Promise<Article[]> {
  const issue = await getIssueBySlug(issueSlug);
  if (!issue) return [];
  return issue.articleSlugs
    .map((slug) => articles.find((article) => article.slug === slug))
    .filter((article): article is Article => Boolean(article));
}

export async function getCategories(): Promise<Category[]> {
  return [...new Set(articles.map((article) => article.category))];
}
