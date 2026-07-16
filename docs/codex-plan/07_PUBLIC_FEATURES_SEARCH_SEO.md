# Phase 07: Search, Archive, Metadata, and Public Features

## Objective

Complete the important public-facing capabilities while preserving CMS independence.

## Codex prompt

```text
You are performing Phase 07 of the Sidwell Business Review website project.

Before changing anything:
1. Read all project contracts and current status.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Preserve the content-provider boundary.
5. Do not add the CMS yet.
6. Search must work with local data now and be replaceable with CMS-backed search later.

Implement or complete:

1. Search
- Functional search, not a placeholder.
- Search published articles by title, subtitle, summary, author, category, tag, issue, and body text when practical.
- Case-insensitive.
- Sensible ranking.
- Empty query guidance.
- No-result state.
- Keyboard-accessible form.
- Search query reflected in the URL.
- No exposure of draft content.
- Keep search logic behind a content-access function or search service.

2. Archive
- Browse all published articles.
- Group or filter by school year, issue, category, and author where practical.
- Stable ordering.
- Empty states.
- Pagination or progressive loading only if needed for the expected 30 to 50 article archive.

3. Issues
- Current issue behavior.
- Past issues.
- Issue metadata.
- Article lists.
- Clear empty state for an issue without published articles.

4. Homepage editorial rules
- One manually pinned lead when available.
- Automatic newest-article fallback.
- Deterministic secondary ordering.
- Current issue module.
- Recent stories.
- Archive and About links.

5. Metadata and discovery
Use Next.js metadata APIs appropriately:
- Page titles
- Descriptions
- Canonical URLs using a configurable site URL
- Open Graph metadata
- Social metadata
- Article metadata
- Author metadata when appropriate
- robots.txt
- sitemap.xml
- RSS feed if implementation is maintainable

Do not hardcode a final production domain. Use configuration and a safe local fallback.

6. Structured data
Add appropriate schema.org JSON-LD for:
- Organization or publication
- NewsArticle or Article
- Breadcrumbs where useful

Do not include claims or data not present in the content model.

7. Links and URL quality
- Stable readable slugs
- No broken internal links
- Correct not-found behavior
- Breadcrumbs if they materially improve navigation
- External links clearly handled

8. Tests
Add tests for:
- Search matches
- Search no-results
- Search excludes drafts
- Archive filters
- Pinned fallback
- Metadata
- Sitemap excludes drafts
- RSS excludes drafts if RSS is implemented
- Dynamic routes remain valid

9. Documentation
Update ROUTE_CONTRACT.md.
Add docs/SEO_AND_DISCOVERY.md.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run npm run build.
- Inspect generated sitemap, robots, metadata, and feed.
- Update PROJECT_STATUS.md.

Do not commit.
Report every route and feature added, all changed files, tests, and recommended commit message.
```

## Commit

```text
feat: complete search archive and discovery features
```
