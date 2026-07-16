import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getAuthors, searchArticles } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const query = (await searchParams).q?.trim();
  return createPageMetadata({
    title: query ? `Search results for “${query}”` : "Search",
    description: query
      ? `Search results for ${query} in the Sidwell Business Review archive.`
      : "Search published Sidwell Business Review articles.",
    path: "/search",
    noIndex: Boolean(query),
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";
  const [results, authors] = await Promise.all([
    searchArticles(query),
    getAuthors(),
  ]);

  return (
    <div className="container page-shell search-page">
      <header className="page-header">
        <p className="eyebrow">Explore the archive</p>
        <h1>Search</h1>
        <p>
          Search reporting and analysis by topic, author, category, issue, or
          words from the article.
        </p>
      </header>
      <form className="search-form" action="/search" method="get" role="search">
        <label htmlFor="site-search">Search the Review</label>
        <div>
          <input
            id="site-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Try “Federal Reserve” or “Maya Chen”"
          />
          <button type="submit">Search</button>
        </div>
      </form>

      {!query ? (
        <div className="empty-state">
          <h2>Start with a person, topic, or issue.</h2>
          <p>
            Search is case-insensitive and includes headlines, summaries,
            bylines, categories, tags, issues, and article text.
          </p>
          <Link className="text-link" href="/archive">
            Browse the full archive <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state" aria-live="polite">
          <h2>No results for “{query}”</h2>
          <p>Try a broader term, check the spelling, or browse the archive.</p>
          <Link className="text-link" href="/archive">
            Browse all articles <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <section aria-labelledby="search-results-heading">
          <div className="section-title-row">
            <h2 className="section-title" id="search-results-heading">
              {results.length} {results.length === 1 ? "result" : "results"} for
              “{query}”
            </h2>
          </div>
          <div className="article-list">
            {results.map(({ article }) => (
              <ArticleCard
                key={article.slug}
                article={article}
                authors={authors.filter((author) =>
                  article.authorSlugs.includes(author.slug),
                )}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
