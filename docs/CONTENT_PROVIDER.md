# Content provider

## Architecture

Public pages call asynchronous functions in `src/content/index.ts`. That module selects one implementation of the stable `ContentProvider` interface in `src/content/provider.ts`:

- `local` validates and reads the temporary sample records.
- `sanity` runs token-free, published-only GROQ queries and maps results into the same domain types.

Routes and renderers never receive raw Sanity documents. Portable Text is converted by `src/content/sanity/adapters.ts` into the existing structured body model. Unknown blocks are warned about in development and omitted safely; raw HTML is never rendered.

## Selecting a source

Copy `.env.example` to `.env.local`. During migration, `CONTENT_SOURCE=local` is the documented rollback mode. To test published CMS data, configure the public Sanity project, dataset, and API date values, then set `CONTENT_SOURCE=sanity`.

Run `npm run sanity:check-provider`. It prints public document counts and titles, never environment values or tokens. Explicit Sanity selection fails clearly if public configuration is absent and does not silently fall back. After migration acceptance, hosting must set `CONTENT_SOURCE=sanity`; local mode can be removed in a later reviewed phase.

## Queries and visibility

Focused projections cover settings, articles, lead/latest articles, contributor relations, contributors, search, and managed About. Every public document query excludes `drafts.*`; the public client uses published perspective without a token. Required references are resolved, and an invalid published article is excluded rather than partially rendered. Ordering is publication date descending with slug as tie-breaker.

Contributor reference arrays are projected in their editorial order. Neither Article projections nor Contributor queries filter on `active`, so archived Contributors remain visible on historical bylines while Studio controls whether they may be selected for new work. Missing optional CMS Site Settings use the validated application configuration rather than crashing public pages.

ADR-014 removed Issue, Category, and Tag schemas and routes from the accepted launch model. The provider contains no methods or queries for those models.

## Draft preview

The same domain adapter and queries serve both modes. Visibility comes from the client perspective:

- Public: `published`, token-free, CDN enabled, tagged 300-second cache.
- Draft Mode: `drafts`, server-only Viewer token, CDN disabled, `no-store`.

The draft client enables Content Source Maps/stega with the embedded `/studio` URL. During Draft Mode, the root layout delegates preview chrome to a pathname-aware client boundary that mounts the banner and `VisualEditing` only on public frontend pages. It renders nothing on `/studio`, nested Studio tools, API routes, feed, sitemap, or robots, and the root no longer performs a draft Site Settings query merely to label the banner. This provides Presentation’s communication and document-location bridge without adding Sanity Live subscriptions. Feed and sitemap explicitly request the published provider even when the requesting browser has a Draft Mode cookie. Preview never writes content and never falls back to drafts when credentials are missing.

Sanity stega metadata is retained on visible editorial strings so Presentation can locate content. Before runtime validation and routing comparisons, adapters clean that metadata from semantic values. Slugs, publication dates, URLs, references, search inputs, and other control values remain clean. This prevents valid published documents from being rejected solely because invisible source-map metadata changes JavaScript string length.

Site-wide frontend chrome receives Site Settings from the same selected provider as page content. Published mode supplies the published Site Settings page; Draft Mode supplies its draft overlay with `drafts`, a server-only Viewer token, CDN disabled, and `no-store`. Publication name, URLs, metadata values, logo structure, and contact targets are cleaned before use; the visible Homepage tagline may retain stega for Presentation.

Image-logo mode is honored only when the selected Site Settings variant resolves an actual CMS image asset. If it does not, the header safely uses the configured text wordmark rather than requesting a nonexistent fallback image.

The required Article `summary` is the domain card description. Optional `subtitle` does not override it. This permits a valid draft-only Article with a brief subtitle and complete summary to pass the same adapter and route contract as published work.

Run `npm run sanity:diagnose-preview` for a safe development comparison of published and draft-perspective provider behavior. It prints only query names, counts, IDs/types, mode, adapter/validation results, and exclusion reasons—never content bodies, stega payloads, tokens, or preview secrets.

## Caching and publishing

Reads use Next/Sanity fetch integration with an exact 300-second backstop. Every fetch receives the shared `content` tag plus explicit dependency tags for Articles, Contributors, pages, settings, and relationship queries. The shared tag is the deliberately safe invalidation boundary: a publish can affect Homepage, Latest, Archive, Search, an Article, its Contributor, feed, sitemap, About, or Site Settings, so invalidating the whole public-content set prevents partially stale relationships.

| Surface | Data dependency | Normal refresh | Invalidation coverage |
| --- | --- | --- | --- |
| Homepage, Latest, Archive | Article collection and lead ordering | 300 seconds | `content`, `articles` |
| Search | Article text and Contributor names | 300 seconds | `content`, `articles`, `contributors`, `search` |
| Article | Article plus Contributor references | 300 seconds | `content`, `articles`, `article:{slug}` |
| Contributor | Contributor plus related Articles | 300 seconds | `content`, `contributors`, `contributor:{slug}`, `contributor-articles:{slug}` |
| About | Managed page content | 300 seconds | `content`, `pages`, `page:about` |
| Site Settings | Publication identity and defaults | 300 seconds | `content`, `settings` |
| Sitemap | Article and Contributor collections | 300-second underlying reads | shared collection tags |
| Feed | Article collection | 300-second underlying read and shared-cache header | `content`, `articles` |

Configure a Sanity webhook to POST to `/api/revalidate/sanity` with an `Authorization: Bearer` value matching the server-only `SANITY_REVALIDATE_SECRET`. The endpoint accepts no caller-selected path or tag and invalidates only the fixed shared `content` tag. It returns only `{ revalidated: boolean }` and never returns the secret. Missing or incorrect secrets receive HTTP 401.

The endpoint code is complete, but hosted webhook configuration and end-to-end hosted delivery are deferred to Phase 15. Until then, published changes use the 300-second fallback. Local development can also retain a stale App Router/dev-session entry; use `npm run sanity:check-cache` to compare origin, CDN, and provider reads without waiting five minutes. That diagnostic is read-only and cannot inspect a browser's in-memory or Next development cache.

A query failure becomes a generic `ContentProviderError`; upstream details are logged only outside production. App Router error boundaries prevent raw stacks reaching visitors. Rollback is an intentional deployment change to `CONTENT_SOURCE=local`, not an automatic response to an outage.

About and Site Settings are optional from the public provider's perspective during recovery. A missing published About document uses the controlled local About copy and roster empty states; missing optional Site Settings use validated application configuration. Draft singleton content is never read publicly.

## Images and search

Image projections retain public URL, dimensions, crop, hotspot, alt text, caption, and credit. Internal rights notes are not projected. Next Image allows `cdn.sanity.io`, uses responsive sizes, and maps hotspot positioning. Search stays behind `searchArticles`, queries published CMS text and references, then applies existing deterministic ranking.

## Verification

```bash
npm run sanity:typegen
npm run sanity:check-provider
npm run verify
npm run test:e2e
npm run test:e2e:sanity
```

The ordinary suite proves local rollback. The Sanity suite proves a published CMS article reaches Homepage, Article, Contributor, Latest, Archive, Search, About, sitemap, and feed while a local-only slug remains unavailable. See `PHASE_12_ACCEPTANCE.md` for the manual draft and cache tests.
