# Public route contract

## General behavior

- Public routes render only content eligible for public display.
- Content is obtained through `src/content/index.ts`; pages do not import raw arrays.
- Static content may render immediately. Future remote-provider routes should use route-level loading UI or stable shell behavior where latency is meaningful.
- Expected provider errors produce an accessible error state and server logging; they must not silently appear as empty content.
- Missing dynamic content uses the custom not-found behavior and HTTP 404.
- Metadata uses site defaults plus page-specific title and description. Article SEO overrides will take precedence when implemented.

## Route inventory

| Route pattern | Purpose | Current content-access functions | Empty behavior | Loading behavior | Error behavior | Not-found behavior | Metadata behavior |
|---|---|---|---|---|---|---|---|
| `/` | Homepage | `getArticles`, `getAuthors`, `getIssues` | Must render publication purpose and recovery links if articles/issues are absent; never index undefined lead content | Static/local today; future provider should use a stable page shell | Accessible homepage error or safe degraded sections; log provider failure | Not applicable | Site default title/description; future configurable social image |
| `/latest` | Published article archive | `getArticles`, `getAuthors`, `getCategories` | Explain that no articles are published and link home | Static/local today; skeleton or stable list shell if remote | Accessible retry/recovery message; no false “no articles” state | Not applicable | `Latest Articles` plus descriptive archive metadata |
| `/archive` | Filterable published article archive | `getArchiveArticles`, `getArticles`, `getAuthors`, `getIssues`, `getCategories`, `getSchoolYear` | Explain that no articles match and provide a clear-filter action | Server-rendered from URL query parameters; stable form and result shell with a remote provider | Retain validated filters and show an accessible recovery state | Not applicable; unknown filter values are ignored safely | Canonical `/archive`; filter combinations do not create separate canonical pages |
| `/latest?category={name-or-slug}` | Category-filtered latest view | Same as `/latest`; future `getCategoryBySlug` and `getArticlesByCategory` | Valid category with no articles gets an empty state | Same as `/latest` | Same as `/latest` | Unknown category should become 404 once filtering is implemented | Category-specific title, description, canonical query/route policy |
| `/articles/[slug]` | Individual article | `getArticleBySlug`, `getAuthors`; `getArticles` for static params | Not applicable for valid article; missing related author should be treated as data error | Static generation today; fallback/loading policy required with CMS | Accessible error boundary and logging for provider/render failure | Missing, draft, scheduled, or otherwise nonpublic article returns custom 404 | Current title + `dek`; future SEO title/description, canonical URL, open graph, article dates/authors |
| `/issues` | Issue archive | `getIssues` | Explain that no issues are published; articles remain discoverable | Static/local today; stable issue-list shell if remote | Accessible recovery and logging | Not applicable | `Issues` plus archive description |
| `/issues/[slug]` | Individual issue | `getIssueBySlug`, `getArticlesByIssue`, `getAuthors`; `getIssues` for static params | Valid issue with no eligible articles still shows issue metadata and an editorial empty state | Static generation today; fallback policy required with CMS | Accessible error boundary; invalid article references are data errors | Missing or nonpublic issue returns custom 404 | Current issue title/description; future canonical and social metadata |
| `/authors` | Public author directory | `getAuthors` | Explain that profiles are not available and link to latest content | Static/local today; stable directory shell if remote | Accessible recovery and logging | Not applicable | `Authors` plus directory description |
| `/authors/[slug]` | Individual author and articles | `getAuthorBySlug`, `getArticlesByAuthor`; `getAuthors` for static params | Valid author with no published articles shows biography and a no-articles message | Static generation today; fallback policy required with CMS | Accessible error boundary; invalid relationships logged | Missing/nonpublic profile returns custom 404; inactive alumni may remain reachable by policy | Current name/bio; future canonical, portrait/social metadata |
| `/about` | Mission and standards | None; currently code-owned | Required static content must exist | Immediate static render | Route error boundary if code fails | Not applicable | `About`; should include descriptive metadata |
| `/masthead` | Current team | `getAuthors` | Show adviser/publication information and explain current roster is unavailable | Static/local today; stable shell if remote | Accessible recovery and logging | Not applicable | `Masthead` plus current-team description |
| `/search?q={query}` | Search published articles | `searchArticles`, `getAuthors` | Empty query provides guidance; unmatched query provides a no-results state and archive link | Server-rendered from the URL; future remote search should retain the form and query while pending | Search service errors retain query and offer archive navigation | Not applicable; missing or malformed query is handled, not 404 | Canonical `/search`; populated query pages use `noindex,follow` |
| `/robots.txt` | Crawler policy | Site configuration | Always available | Generated by Next.js | Safe static policy | Not applicable | Points to the configured sitemap URL |
| `/sitemap.xml` | Public URL discovery | `getArticles`, `getAuthors`, `getIssues` | Still lists static public routes when collections are empty | Generated by Next.js | Generation failure must fail build/monitoring rather than publish partial private data | Not applicable | Contains configured absolute URLs and excludes drafts |
| `/feed.xml` | Published article RSS feed | `getArticles`, `getAuthors` | Valid empty RSS channel | Generated route response | Return a server error rather than malformed XML | Not applicable | `application/rss+xml`; linked from root metadata |
| Any unknown path | Recovery | None | Not applicable | Immediate | Not applicable | Custom 404 with home and latest links, HTTP 404 | Site title plus no misleading content metadata |

## Routes not currently implemented

The product contract anticipates, but the current application does not yet provide:

- A dedicated `/categories/[slug]` route
- A dedicated `/tags/[slug]` route
- A CMS preview route or authenticated draft mode
- Dedicated loading and error files for provider-backed routes

Adding these routes requires a later scoped phase and must preserve existing URLs.

## Current behavior gaps

- Dedicated category and tag landing pages remain unimplemented; category links use the filterable archive.
- Pagination is intentionally omitted while the expected archive remains approximately 30–50 articles.
- Dynamic pages gather related authors separately instead of receiving resolved domain relationships.
- Article metadata cannot use SEO overrides, update dates, or canonical information.
- No route-level `loading.tsx` or `error.tsx` exists.
- The local provider has no failure mode, so error behavior remains contractual rather than implemented.

These are deferred hardening tasks. Phase 03 does not redesign pages or introduce a remote provider.
