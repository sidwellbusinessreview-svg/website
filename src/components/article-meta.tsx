import Link from "next/link";
import type { Article, Contributor } from "@/content";

export function ArticleMeta({
  article,
  authors,
}: {
  article: Article;
  authors: Contributor[];
}) {
  return (
    <div className="article-meta">
      <span>By{" "}
        {authors.map((author, index) => (
          <span key={author.slug}>
            {index > 0 && (index === authors.length - 1 ? " and " : ", ")}
            <Link href={`/authors/${author.slug}`}>{author.name}</Link>
          </span>
        ))}
      </span>
      <span aria-hidden="true">•</span>
      <time dateTime={article.publishedAt}>
        {new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(`${article.publishedAt}T12:00:00`))}
      </time>
      <span aria-hidden="true">•</span>
      <span>{article.readTime} min read</span>
    </div>
  );
}
