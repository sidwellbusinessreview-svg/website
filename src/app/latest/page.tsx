import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { getArticles, getAuthors, getCategories } from "@/content";

export const metadata: Metadata = { title: "Latest Articles" };

export default async function LatestPage() {
  const [articles, authors, categories] = await Promise.all([getArticles(), getAuthors(), getCategories()]);
  return (
    <div className="container page-shell">
      <header className="page-header">
        <p className="eyebrow">Reporting & analysis</p>
        <h1>Latest articles</h1>
        <p>New ideas, careful reporting, and student perspectives on the forces shaping business and economics.</p>
      </header>
      <div className="category-list" aria-label="Article categories">
        <span>All</span>
        {categories.map((category) => <span key={category}>{category}</span>)}
      </div>
      <div className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} authors={authors.filter((a) => article.authorSlugs.includes(a.slug))} />
        ))}
      </div>
    </div>
  );
}
