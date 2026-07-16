import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import {
  getArchiveArticles,
  getArticles,
  getAuthors,
  getCategories,
  getIssues,
  getSchoolYear,
} from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Article Archive",
  description:
    "Browse all published Sidwell Business Review articles by school year, issue, category, or author.",
  path: "/archive",
});

type ArchiveSearchParams = {
  schoolYear?: string;
  issue?: string;
  category?: string;
  author?: string;
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<ArchiveSearchParams>;
}) {
  const params = await searchParams;
  const [allArticles, authors, issues, categories] = await Promise.all([
    getArticles(),
    getAuthors(),
    getIssues(),
    getCategories(),
  ]);
  const schoolYears = [...new Set(allArticles.map(({ publishedAt }) => getSchoolYear(publishedAt)))];
  const filters = {
    schoolYear: schoolYears.includes(params.schoolYear ?? "") ? params.schoolYear : undefined,
    issue: issues.some(({ slug }) => slug === params.issue) ? params.issue : undefined,
    category: categories.includes(params.category as (typeof categories)[number])
      ? params.category
      : undefined,
    author: authors.some(({ slug }) => slug === params.author) ? params.author : undefined,
  };
  const articles = await getArchiveArticles(filters);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="container page-shell">
      <header className="page-header">
        <p className="eyebrow">All published work</p>
        <h1>Article archive</h1>
        <p>
          Browse the Review’s reporting and analysis. Filters can be combined
          and results remain ordered newest first.
        </p>
      </header>
      <form className="archive-filters" action="/archive" method="get">
        <label>
          School year
          <select name="schoolYear" defaultValue={filters.schoolYear ?? ""}>
            <option value="">All years</option>
            {schoolYears.map((year) => <option key={year}>{year}</option>)}
          </select>
        </label>
        <label>
          Issue
          <select name="issue" defaultValue={filters.issue ?? ""}>
            <option value="">All issues</option>
            {issues.map((issue) => (
              <option key={issue.slug} value={issue.slug}>{issue.title}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          Author
          <select name="author" defaultValue={filters.author ?? ""}>
            <option value="">All authors</option>
            {authors.map((author) => (
              <option key={author.slug} value={author.slug}>{author.name}</option>
            ))}
          </select>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters && <Link href="/archive">Clear filters</Link>}
      </form>
      <div className="section-title-row">
        <h2 className="section-title">
          {articles.length} published {articles.length === 1 ? "article" : "articles"}
        </h2>
      </div>
      {articles.length > 0 ? (
        <div className="article-list">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              authors={authors.filter((author) =>
                article.authorSlugs.includes(author.slug),
              )}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No articles match these filters.</h2>
          <p>Clear one or more filters to broaden the archive.</p>
          <Link className="text-link" href="/archive">View all articles</Link>
        </div>
      )}
    </div>
  );
}
