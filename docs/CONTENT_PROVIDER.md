# Content provider

## Current production state

Production uses the Sanity provider against project `bumxf5q6`, dataset `production`. `CONTENT_SOURCE=local` remains an explicit fixture-backed recovery and development mode; it is not the production default and is never selected automatically after `sanity` has been configured.

Sanity stores global identity, Homepage copy, About content, and leadership in fixed document `siteSettings` (**Publication Settings** in Studio). `getStaticPageBySlug("about")` adapts that record into the public About contract. There is no separate About CMS document.

## Architecture

Public pages call asynchronous functions in `src/content/index.ts`. That module selects an implementation of the stable `ContentProvider` interface in `src/content/provider.ts`:

- `local` validates and reads sample records for local development or an explicitly approved rollback;
- `sanity` runs token-free, published-only GROQ queries and maps records into the same domain types.

Routes and renderers never receive raw Sanity documents. Portable Text is converted by `src/content/sanity/adapters.ts` into the shared structured body model. Unknown blocks are omitted safely, and raw HTML is never rendered.

## Selecting a source

For ordinary fixture-backed development, no provider variables are required. To test published CMS data, copy `.env.example` to `.env.local`, retain the documented public project/dataset/API values, and set:

```text
CONTENT_SOURCE=sanity
```

Run `npm run sanity:check-provider`. It reports public document counts and titles, never tokens. Explicit Sanity selection fails clearly if its public configuration is absent; it does not silently fall back to fixtures. Production must keep `CONTENT_SOURCE=sanity` in the Cloudflare build environment.

## Queries and visibility

Focused projections cover Publication Settings, Articles, lead/latest Articles, Contributor relations, Contributors, search, and managed About. Every public query excludes `drafts.*`; the public client uses the published perspective without a token. Required references are resolved, and invalid published Articles are excluded instead of partially rendered. Ordering uses publication month descending with slug as the stable tie-breaker.

Contributor reference arrays retain editorial order. Archived Contributors remain visible on historical bylines while Studio prevents their selection for new work. Missing optional published Publication Settings use validated application fallbacks rather than crashing public pages.

The accepted launch model has no Issue, Category, Tag, Masthead, biography, or Contributor-image provider methods or queries.

## Draft Preview

The same domain adapter and queries serve both modes:

- Public: `published`, token-free, CDN enabled, tagged 300-second cache.
- Draft Mode: `drafts`, server-only Viewer token, CDN disabled, `no-store`.

The draft client enables Content Source Maps/stega with the standalone Studio origin from `NEXT_PUBLIC_SANITY_STUDIO_URL`. During Draft Mode, the public layout mounts the preview banner and `VisualEditing` only on public frontend page paths—not API routes, feed, sitemap, or robots. Feed and sitemap force the published provider even when the browser has a Draft Mode cookie. No Sanity Live subscription or browser token is installed.

Adapters retain stega on visible editorial strings for Presentation but clean it from slugs, dates, URLs, references, comparisons, validation, and route construction. The required Article `summary` supplies the public card description; optional `subtitle` does not replace it.

Run `npm run sanity:diagnose-preview` for a safe comparison of published and draft provider behavior. It prints modes, counts, IDs/types, adapter results, and exclusion reasons—not bodies, stega payloads, tokens, or preview secrets.

## Caching and publishing

Public reads use an exact 300-second revalidation backstop. Every fetch receives the shared `content` tag plus descriptive dependency tags. The shared tag is the safe invalidation boundary because one publish can affect several relationship-dependent surfaces.

| Surface | Data dependency | Backstop | Invalidation coverage |
| --- | --- | --- | --- |
| Homepage, Latest, Archive | Article collection and lead ordering | 300 seconds | `content`, `articles` |
| Search | Article text and Contributor names | 300 seconds | `content`, `articles`, `contributors`, `search` |
| Article | Article and Contributor references | 300 seconds | `content`, `articles`, `article:{slug}` |
| Contributor | Contributor and related Articles | 300 seconds | `content`, `contributors`, `contributor:{slug}`, `contributor-articles:{slug}` |
| About | Publication Settings projection | 300 seconds | `content`, `pages`, `page:about`, `settings` |
| Sitemap and feed | Article/Contributor collections | 300-second underlying reads | shared collection tags |

Sanity's production webhook posts to `/api/revalidate/sanity` with an `Authorization: Bearer` value matching the server-only `SANITY_REVALIDATE_SECRET`. The endpoint accepts no caller-selected path or tag, invalidates only `content`, and returns only `{ "revalidated": true }` on success. Missing or incorrect authorization returns HTTP 401.

On October 19, 2026, the supplied Sanity delivery log contained 16 production attempts; all 16 returned HTTP 200 and `{ "revalidated": true }`, with no supplied failures. This confirms that those requests reached the endpoint and that it accepted the invalidation request. It does **not** prove that a particular public page fetched and displayed changed content afterward. No evidence establishes whether content was published after October 19.

### Verify propagation during a future approved edit

Use a real, already-approved editorial update; do not create or alter production content solely to test infrastructure.

1. Before publishing, record the affected public URL, the expected visible change, and the current visible value. Use a clean non-Preview browser.
2. Publish once in Studio and record the time without copying content or credentials into logs.
3. In Sanity's webhook attempt log, confirm the matching attempt returned HTTP 200 and `{ "revalidated": true }`.
4. Reload the exact public URL in a clean browser and record when the approved change first appears. Also check any relationship-dependent surface affected by the edit, such as Homepage or the Contributor page.
5. If it remains stale, wait through the 300-second fallback without republishing. Run `npm run sanity:check-cache` to compare origin, CDN, and provider reads; this command is read-only and cannot inspect browser memory or a Next.js development cache.
6. After five minutes, compare the provider result, webhook log, public response, and Cloudflare deployment/runtime configuration. Escalate with those timestamps rather than rotating secrets or publishing repeatedly.

The remaining operational gap is one recorded end-to-end observation tying an approved publish to the first visible public response. Successful delivery history alone cannot close that gap.

## Failure and recovery behavior

A query failure becomes a generic `ContentProviderError`; upstream details are not exposed to visitors. App Router error boundaries prevent raw stacks reaching the public site. Missing published Publication Settings uses controlled fallback identity/About content.

Rollback is an intentional deployment change. Selecting `CONTENT_SOURCE=local` requires a reviewed rebuild and can expose fixture content, so use it only when leadership explicitly accepts that consequence. It is not a substitute for restoring Sanity content. See `docs/handoff/SBR_TECH_STACK_AND_RECOVERY.md`.

## Images and search

Image projections retain the public URL, dimensions, crop, hotspot, alt text, caption, and credit; internal rights notes are not projected. Search stays behind `searchArticles`, reads published CMS text and references, and applies deterministic application ranking.

## Verification commands

```bash
npm run sanity:check-provider
npm run sanity:check-cache
npm run verify
npm run test:e2e
npm run test:e2e:sanity
```

Choose checks in proportion to the change. Documentation-only maintenance does not require the application suites; provider, route, or cache code changes do.
