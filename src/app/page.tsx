import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getArticleContributors, getArticles, getContributors, selectLeadArticle } from "@/content";

export default async function HomePage() {
  const [articles, contributors] = await Promise.all([
    getArticles(),
    getContributors(),
  ]);
  const lead = selectLeadArticle(articles);
  if (!lead) {
    return (
      <div className="container page-shell empty-state">
        <p className="eyebrow">Sidwell Business Review</p>
        <h1>New reporting is on the way.</h1>
        <p>Learn about the publication while the next edition is prepared.</p>
        <Link className="button-link" href="/about">About the Review</Link>
      </div>
    );
  }
  const remaining = articles.filter((article) => article.slug !== lead.slug);
  return (
    <>
      <section className="container hero-section">
        <div className="section-heading">
          <p className="eyebrow">
            Latest reporting
          </p>
          <span>Independent student analysis from Washington, D.C.</span>
        </div>
        <ArticleCard article={lead} authors={getArticleContributors(lead, contributors)} featured headingLevel={1} />
      </section>
      <section className="container section">
        <div className="section-title-row">
          <h2 className="section-title">Latest analysis</h2>
          <Link className="text-link" href="/latest">View all articles <span aria-hidden="true">→</span></Link>
        </div>
        <div className="article-grid">
          {remaining.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} authors={getArticleContributors(article, contributors)} />
          ))}
        </div>
      </section>
    </>
  );
}
