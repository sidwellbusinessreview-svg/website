import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { getArticles, getContributors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Latest Articles",
  description: "Read the newest reporting and analysis from Sidwell Business Review.",
  path: "/latest",
});

export default async function LatestPage() {
  const [articles, contributors] = await Promise.all([getArticles(), getContributors()]);
  return (
    <div className="container page-shell">
      <header className="page-header">
        <p className="eyebrow">Reporting & analysis</p>
        <h1>Latest articles</h1>
        <p>New ideas, careful reporting, and student perspectives on the forces shaping business and economics.</p>
      </header>
      <div className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} authors={contributors.filter((a) => article.contributorSlugs.includes(a.slug))} />
        ))}
      </div>
    </div>
  );
}
