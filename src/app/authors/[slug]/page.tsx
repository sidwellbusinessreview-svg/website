import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { AuthorInfo } from "@/components/author-info";
import { getArticlesByAuthor, getAuthorBySlug, getAuthors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getAuthors()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  return author
    ? createPageMetadata({
        title: author.name,
        description: author.bio,
        path: `/authors/${author.slug}`,
      })
    : {};
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) notFound();
  const articles = await getArticlesByAuthor(author.slug);
  return (
    <div className="container page-shell">
      <header className="profile-header">
        <AuthorInfo author={author} linked={false} />
        <p>{author.bio}</p>
      </header>
      <div className="section-title-row"><h2 className="section-title">Articles by {author.name}</h2></div>
      <div className="article-list">
        {articles.map((article) => <ArticleCard key={article.slug} article={article} authors={[author]} />)}
      </div>
      {articles.length === 0 && (
        <div className="empty-state">
          <h2>No published articles yet.</h2>
          <p>This profile will list the author’s work when it is published.</p>
        </div>
      )}
    </div>
  );
}
