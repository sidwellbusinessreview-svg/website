import Link from "next/link";
import type { Article, Contributor } from "@/content";
import { articleDateTimeValue, formatArticleDate } from "@/lib/article-date";

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
      <time dateTime={articleDateTimeValue(article.publicationMonth)}>
        {formatArticleDate(article.publicationMonth)}
      </time>
    </div>
  );
}
