import Image from "next/image";
import Link from "next/link";
import type { Article, Author } from "@/content";
import { ArticleMeta } from "./article-meta";

export function ArticleCard({
  article,
  authors,
  featured = false,
  headingLevel = 2,
}: {
  article: Article;
  authors: Author[];
  featured?: boolean;
  headingLevel?: 1 | 2 | 3;
}) {
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";
  return (
    <article className={featured ? "article-card article-card--featured" : "article-card"}>
      <Link className="article-card__image" href={`/articles/${article.slug}`} tabIndex={-1}>
        <Image
          src={article.featuredImage.src}
          alt={article.featuredImage.alt}
          fill
          preload={featured}
          sizes={featured ? "(max-width: 900px) 100vw, 65vw" : "(max-width: 700px) 100vw, 33vw"}
        />
      </Link>
      <div className="article-card__body">
        <Link className="category-link" href={`/archive?category=${encodeURIComponent(article.category)}`}>
          {article.category}
        </Link>
        <Heading>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </Heading>
        <p className="article-card__dek">{article.dek}</p>
        <ArticleMeta article={article} authors={authors} />
      </div>
    </article>
  );
}
