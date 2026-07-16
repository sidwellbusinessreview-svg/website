import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ArticleMeta } from "@/components/article-meta";
import { AuthorInfo } from "@/components/author-info";
import { ImageCaption } from "@/components/image-caption";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getArticles, getAuthors } from "@/content";
import { absoluteUrl, createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getArticles()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug);
  return article
    ? {
        ...createPageMetadata({
          title: article.title,
          description: article.dek,
          path: `/articles/${article.slug}`,
        }),
        openGraph: {
          type: "article",
          title: article.title,
          description: article.dek,
          url: `/articles/${article.slug}`,
          siteName: siteConfig.name,
          publishedTime: article.publishedAt,
          authors: article.authorSlugs.map((slug) => absoluteUrl(`/authors/${slug}`)),
          images: [{
            url: article.featuredImage.src,
            alt: article.featuredImage.alt,
          }],
        },
        twitter: {
          card: "summary_large_image",
          title: article.title,
          description: article.dek,
          images: [article.featuredImage.src],
        },
      }
    : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticleBySlug((await params).slug);
  if (!article) notFound();
  const allAuthors = await getAuthors();
  const authors = allAuthors.filter((author) => article.authorSlugs.includes(author.slug));
  return (
    <article data-print-url={`/articles/${article.slug}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.dek,
          datePublished: article.publishedAt,
          mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
          image: [article.featuredImage.src],
          author: authors.map((author) => ({
            "@type": "Person",
            name: author.name,
            url: absoluteUrl(`/authors/${author.slug}`),
          })),
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: absoluteUrl("/"),
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Archive",
              item: absoluteUrl("/archive"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: article.title,
              item: absoluteUrl(`/articles/${article.slug}`),
            },
          ],
        }}
      />
      <header className="container article-header">
        <Link className="category-link" href={`/archive?category=${encodeURIComponent(article.category)}`}>{article.category}</Link>
        <h1>{article.title}</h1>
        <p className="article-dek">{article.dek}</p>
        <ArticleMeta article={article} authors={authors} />
      </header>
      <figure className="container feature-figure">
        <div className="feature-figure__image">
          <Image src={article.featuredImage.src} alt={article.featuredImage.alt} fill priority sizes="(max-width: 1200px) 100vw, 1200px" />
        </div>
        <ImageCaption caption={article.featuredImage.caption} credit={article.featuredImage.credit} />
      </figure>
      <div className="container article-layout">
        <aside className="article-authors" aria-label="About the authors">
          <p className="eyebrow">{authors.length > 1 ? "Authors" : "Author"}</p>
          {authors.map((author) => <AuthorInfo key={author.slug} author={author} />)}
        </aside>
        <ArticleBody blocks={article.content} />
      </div>
    </article>
  );
}
