import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ArticleMeta } from "@/components/article-meta";
import { ImageCaption } from "@/components/image-caption";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getArticles, getContributors } from "@/content";
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
          authors: article.contributorSlugs.map((slug) => absoluteUrl(`/authors/${slug}`)),
          images: article.featuredImage ? [{
            url: article.featuredImage.src,
            alt: article.featuredImage.alt,
          }] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: article.title,
          description: article.dek,
          images: article.featuredImage ? [article.featuredImage.src] : undefined,
        },
      }
    : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticleBySlug((await params).slug);
  if (!article) notFound();
  const allContributors = await getContributors();
  const contributorBySlug = new Map(allContributors.map((contributor) => [contributor.slug, contributor]));
  const authors = article.contributorSlugs.flatMap((slug) => {
    const contributor = contributorBySlug.get(slug);
    return contributor ? [contributor] : [];
  });
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
          ...(article.featuredImage ? { image: [article.featuredImage.src] } : {}),
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
        <h1>{article.title}</h1>
        <p className="article-dek">{article.dek}</p>
        <ArticleMeta article={article} authors={authors} />
      </header>
      {article.featuredImage && <figure className="container feature-figure">
        <div className="feature-figure__image">
          <Image src={article.featuredImage.src} alt={article.featuredImage.alt} fill preload sizes="(max-width: 1200px) 100vw, 1200px" />
        </div>
        <ImageCaption caption={article.featuredImage.caption} credit={article.featuredImage.credit} />
      </figure>}
      <div className="container article-layout"><ArticleBody blocks={article.content} /></div>
    </article>
  );
}
