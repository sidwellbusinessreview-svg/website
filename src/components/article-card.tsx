import Image from "next/image";
import Link from "next/link";
import type { Article, Contributor } from "@/content";
import { ArticleMeta } from "./article-meta";

export function ArticleCard({
  article,
  authors,
  featured = false,
  headingLevel = 2,
}: {
  article: Article;
  authors: Contributor[];
  featured?: boolean;
  headingLevel?: 1 | 2 | 3;
}) {
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 3 ? "h3" : "h2";
  return (
    <article className={["article-card", featured ? "article-card--featured" : "", !article.featuredImage ? "article-card--no-image" : ""].filter(Boolean).join(" ")}>
      {article.featuredImage && <Link className="article-card__image" href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`} tabIndex={-1}>
        <Image
          src={article.featuredImage.src}
          alt={article.featuredImage.alt}
          fill
          preload={featured}
          sizes={featured ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 700px) 100vw, 33vw"}
          style={article.featuredImage.hotspot ? { objectPosition: `${article.featuredImage.hotspot.x * 100}% ${article.featuredImage.hotspot.y * 100}%` } : undefined}
        />
      </Link>}
      <div className="article-card__body">
        <Heading>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </Heading>
        <p className="article-card__dek">{article.dek}</p>
        <ArticleMeta article={article} authors={authors} />
      </div>
    </article>
  );
}
