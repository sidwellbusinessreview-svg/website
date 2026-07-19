# SEO and discovery

This phase makes published local content discoverable without tying routes to a specific CMS or final production domain.

## Site URL

Set `NEXT_PUBLIC_SITE_URL` to the public origin in preview or production:

```text
NEXT_PUBLIC_SITE_URL=https://example.org
```

Do not add a trailing path. When the variable is blank, the application safely uses `http://localhost:3000`. The final production domain is intentionally not hardcoded.

The configured origin controls:

- Next.js `metadataBase`
- Canonical absolute URLs
- Sitemap URLs
- RSS links
- JSON-LD entity URLs

## Page metadata

Shared metadata helpers live in `src/lib/metadata.ts`. Public pages define:

- A specific title and description
- A canonical path
- Open Graph metadata
- Twitter/social-card metadata

Article pages also provide article publication date, authors, and featured-image metadata. Search result URLs are marked `noindex,follow` and canonically point to `/search` so arbitrary queries do not create duplicate indexed pages.

## Structured data

The root layout emits an `Organization` record using only configured publication and school information.

Article pages emit:

- `NewsArticle`
- `BreadcrumbList`

Do not add awards, addresses, ownership claims, founding dates, or other facts unless the content model contains verified values.

## Sitemap and robots

- `/sitemap.xml` lists public static pages, published articles, issues, and authors.
- `/robots.txt` allows public pages, points to the sitemap, and discourages crawling search-result URLs.

Both use the public content-access functions, so draft articles are excluded.

## RSS

`/feed.xml` provides a maintainable RSS 2.0 feed for published articles. It contains title, URL, summary, publication date, and byline information already present in the content model.

The feed escapes XML-sensitive text and never imports raw sample data. A future CMS adapter can preserve the route by implementing the existing content-access functions.

## Search indexing

Local search is implemented in `src/content/search.ts` and exposed through `searchArticles` in the content-access layer.

Current ranking weights prioritize:

1. Headline
2. Summary
3. Contributor
4. Publication date
5. Article body text
6. Structured article body

Search is case-insensitive and public results exclude drafts. A future CMS-backed search implementation should preserve the `searchArticles` result contract and public-only behavior.

## Required checks

After changing metadata, URLs, search fields, sitemap, robots, or RSS:

```bash
npm run verify
npm run test:e2e
npm run build
```

Also inspect `/robots.txt`, `/sitemap.xml`, `/feed.xml`, one static page’s metadata, and one article page’s metadata using the configured deployment origin.
