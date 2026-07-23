# Public route contract

All pages use `src/content/index.ts` and therefore the selected local or Sanity `ContentProvider`. Sanity mode uses only published content and explicit draft exclusion. Query failures become controlled provider errors instead of exposing upstream details.

| Route | Access | Empty/not-found behavior | Metadata |
|---|---|---|---|
| `/` | `getArticles`, `getContributors`, `selectLeadArticle` | Publication purpose and recovery links if empty | Site defaults; pinned/newest lead |
| `/latest` | `getArticles`, `getContributors` | Clear no-articles state | Latest title/description |
| `/archive` | `getArchiveArticles`, `getArticles`, `getContributors`, `getSchoolYear` | No-match state and clear filters | Canonical `/archive`; query variants not separately canonicalized |
| `/articles/[slug]` | `getArticleBySlug`, `getArticles`, `getContributors` | Missing/unpublished slug is 404 | Automatic title, summary, featured image, slug canonical; optional overrides later |
| `/authors/[slug]` | `getContributorBySlug`, `getArticlesByContributor`, `getContributors` | Valid contributor with no articles gets an empty state; missing is 404 | Contributor name and safe fallback description |
| `/authors` | `getContributors` | Compatibility directory remains reachable but is absent from primary navigation and sitemap | `Contributors`; may redirect in a later URL migration |
| `/about` | `getStaticPageBySlug("about")`, `getContributors`; local prose fallback | Required mission and staff-roster content | About metadata |
| `/search?q=` | `searchArticles`, `getContributors` | Guidance for empty query; no-result recovery | Search pages with queries are noindex |
| `/feed.xml` | `getArticles`, `getContributors` | Valid empty RSS | Published articles only |
| `/sitemap.xml` | `getArticles`, `getContributors` | Static routes remain | Excludes drafts and removed collection routes |

`/masthead` is intentionally retired and must use the application not-found behavior. Its former staff content is part of `/about`.
| `/robots.txt` | Site config | Always available | Disallows Studio |
| `/studio/[[...tool]]` | Sanity Studio | Setup page when env is absent | Noindex; dedicated full-screen shell |
| Unknown path | None | Custom HTTP 404 | No misleading content metadata |

Removed routes `/issues` and `/issues/[slug]` use normal custom not-found behavior. There are no Issue, Category, Tag, or Masthead provider methods, queries, or public routes. Provider selection, projections, mapping, caching, and controlled errors are implemented in Phase 12; authenticated draft preview remains later work.
