# SEO and discovery

## Current production origin

The production origin is:

```text
https://website.sidwellbusinessreview.workers.dev
```

Cloudflare must set `NEXT_PUBLIC_SITE_URL` to that origin without a trailing path. The value controls Next.js `metadataBase`, canonical URLs, sitemap entries, RSS links, and JSON-LD entity URLs. Local development safely falls back to `http://localhost:3000`.

Changing the production origin—including a future custom-domain move—requires a reviewed deployment and a coordinated Search Console, canonical, sitemap, Studio Preview, CORS, and redirect plan. Do not change it merely because indexing is slow.

## Implementation review — November 1, 2026

Repository and read-only production checks found no demonstrated technical indexing blocker:

- the Homepage, `/robots.txt`, `/sitemap.xml`, and `/feed.xml` returned HTTP 200;
- the Homepage canonical used the configured Cloudflare origin and included the Google verification token;
- a representative Article used its canonical URL and `article` Open Graph type;
- a query Search page used `noindex, follow` and canonical `/search`;
- robots allowed public pages, disallowed search-result crawling, and linked the canonical sitemap;
- the sitemap contained 21 canonical public URLs: 4 static pages, 7 published Articles, and 10 Contributor profiles;
- sitemap and feed are built through published content-provider access functions, so drafts remain excluded.

The accepted launch model has no Issues, Categories, or Tags. They do not belong in the sitemap or discovery documentation.

## Page metadata and structured data

Shared metadata helpers live in `src/lib/metadata.ts`. Public pages define a title, description, canonical path, Open Graph metadata, and social-card metadata. Search queries are `noindex,follow` and canonicalize to `/search` so arbitrary queries do not become duplicate indexed pages.

Article pages emit `NewsArticle` and `BreadcrumbList` JSON-LD with the canonical Article and Contributor URLs. The root layout emits an `Organization` record using publication settings/fallbacks. Do not add unverified awards, ownership claims, founding dates, addresses, or other facts.

## Sitemap, robots, and RSS

- `/sitemap.xml` lists the Homepage, Latest, Archive, About, published Articles, and published Contributor profiles.
- `/robots.txt` allows public pages, disallows `/search`, and points to the sitemap.
- `/feed.xml` provides RSS 2.0 for published Articles and uses the same 300-second public-content cache window.

Do not add drafts, Preview URLs, Studio paths, removed content types, or query-string variants.

## Search indexing evidence

As of November 1, 2026, the supplied Google Search Console evidence says:

- the sitemap was accepted;
- Google had discovered 21 pages;
- Homepage inspection still reported **Discovered – currently not indexed**;
- the live URL test succeeded;
- repeated manual indexing requests returned **Quota Exceeded**;
- Crawl Stats previously recorded one successful HTTP 200 HTML discovery request, without retaining an example URL.

This evidence shows discovery and a successful live fetch, but not selection for indexing. It does not justify changing canonical URLs, robots, or sitemap behavior, and it does not prove a crawl or rendering defect. Do not attempt to bypass indexing quotas.

## Search Console follow-up

1. Leave the accepted sitemap submitted at its canonical URL; do not resubmit it repeatedly without a configuration change.
2. After Google has had additional time, inspect the Homepage and one representative Article URL.
3. Record the inspection date, coverage status, selected canonical, last crawl (if shown), and screenshot in the private operations record.
4. Run **Test live URL** only when diagnosing a current page response or after a meaningful deployment.
5. If indexing remains absent, compare several Article URLs—not only the Homepage—and review Crawl Stats, Page Indexing reasons, rendered HTML, and the selected canonical before proposing code changes.
6. Request indexing only when the quota permits and only for important canonical pages. Do not automate or repeat requests to evade the limit.
7. Recheck the sitemap after future publishing to confirm the approved Article URL appears and returns HTTP 200.

## Low-risk discoverability work

Continue publishing original, complete Articles; keep titles and summaries descriptive; maintain clear internal links through Homepage, Latest, Archive, bylines, and Contributor profiles; and verify each new canonical URL in the sitemap after publishing. These editorial and operational steps are preferable to speculative metadata changes.

A memorable custom domain may improve long-term publication continuity, but the repository contains no evidence that the publication owns one. Domain selection, ownership, billing, redirects, DNS, Search Console verification, and recovery must be approved and recorded before any code or hosting change. The current Workers origin remains authoritative until then.

## Required checks after SEO code changes

```bash
npm run verify
npm run test:e2e
```

Also inspect the deployed `/robots.txt`, `/sitemap.xml`, `/feed.xml`, one static page's canonical metadata, and one Article's metadata using the configured production origin.
