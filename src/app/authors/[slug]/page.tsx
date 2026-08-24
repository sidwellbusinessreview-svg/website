import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { getArticleContributors, getArticlesByContributor, getContributorBySlug, getContributors, getPublishedContributors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getPublishedContributors()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const author = await getContributorBySlug((await params).slug);
  return author
    ? createPageMetadata({
        title: author.name,
        description: `Articles by ${author.name}.`,
        path: `/authors/${author.slug}`,
      })
    : {};
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const author = await getContributorBySlug((await params).slug);
  if (!author) notFound();
  const [articles, contributors] = await Promise.all([getArticlesByContributor(author.slug), getContributors()]);
  return (
    <div className="container page-shell">
      <header className="profile-header contributor-profile-header">
        <p className="eyebrow">Contributor</p>
        <h1>{author.name}</h1>
        {author.grade && <p>{author.grade}</p>}
      </header>
      <div className="section-title-row"><h2 className="section-title">Articles by {author.name}</h2></div>
      <div className="article-list">
        {articles.map((article) => <ArticleCard key={article.slug} article={article} authors={getArticleContributors(article, contributors)} />)}
      </div>
      {articles.length === 0 && (
        <div className="empty-state">
          <h2>No published articles yet.</h2>
          <p>This profile will list the contributor’s work when it is published.</p>
        </div>
      )}
    </div>
  );
}
