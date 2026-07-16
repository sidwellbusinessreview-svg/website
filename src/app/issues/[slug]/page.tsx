import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { getArticlesByIssue, getAuthors, getIssueBySlug, getIssues } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getIssues()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const issue = await getIssueBySlug((await params).slug);
  return issue
    ? createPageMetadata({
        title: issue.title,
        description: issue.description,
        path: `/issues/${issue.slug}`,
      })
    : {};
}

export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const issue = await getIssueBySlug((await params).slug);
  if (!issue) notFound();
  const [articles, authors] = await Promise.all([getArticlesByIssue(issue.slug), getAuthors()]);
  return (
    <div className="container page-shell">
      <header className="issue-header" style={{ "--issue-accent": issue.accent } as React.CSSProperties}>
        <p className="eyebrow">Issue {issue.number} · {issue.season} {issue.year}</p>
        <h1>{issue.title}</h1>
        <p className="issue-header__description">{issue.description}</p>
        <div className="editor-note"><strong>From the editors</strong><p>{issue.editorNote}</p></div>
      </header>
      <div className="article-list">
        {articles.map((article) => <ArticleCard key={article.slug} article={article} authors={authors.filter((a) => article.authorSlugs.includes(a.slug))} />)}
      </div>
      {articles.length === 0 && (
        <div className="empty-state">
          <h2>No published articles are assigned to this issue yet.</h2>
          <p>The issue metadata remains available while editors prepare its stories.</p>
        </div>
      )}
    </div>
  );
}
