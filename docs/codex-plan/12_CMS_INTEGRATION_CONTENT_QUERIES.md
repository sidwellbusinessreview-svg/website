# Phase 12: CMS Integration and Public Content Queries

## Objective

Connect the public website to Sanity while preserving the existing domain model and a temporary rollback path.

This is the phase where the CMS becomes the actual content source.

## Core rule

Pages must not query Sanity directly. They must continue to use the content-access layer.

The architecture should remain:

```text
Page
  -> Content access interface
    -> Sanity provider
      -> Sanity query and adapter
```

## Codex prompt

```text
You are performing Phase 12 of the Sidwell Business Review website project.

Before changing anything:
1. Read CMS_DECISION.md, CONTENT_MODEL.md, ROUTE_CONTRACT.md, and CMS_EDITOR_MODEL.md.
2. Inspect the current content-access layer.
3. Confirm the test article exists in Sanity.
4. Run npm run verify and npm run test:e2e.
5. Show git status and stop if the repository is dirty.
6. Preserve a documented temporary local-data fallback until this phase is accepted.
7. Do not expose draft content publicly.
8. Do not place read or write tokens in client-side code.

Implement the Sanity content provider.

Requirements:

1. Provider architecture
- Define a stable domain-facing content interface.
- Keep local and Sanity provider implementations behind that interface.
- Use an environment setting such as CONTENT_SOURCE=local or sanity only if necessary and secure.
- Default production behavior must eventually be Sanity.
- Local fallback must be clearly marked temporary and removable after migration acceptance.

2. Queries
Create typed current-compatible Sanity queries for:
- Site settings
- All published articles
- Article by slug
- Pinned lead article
- Latest articles
- Articles by issue
- Articles by author
- Articles by category
- Search
- Issues
- Issue by slug
- Authors
- Author by slug
- Categories
- Static pages

Queries must:
- Exclude drafts in public mode
- Resolve required references
- Avoid overfetching
- Use deterministic ordering
- Support image metadata
- Support SEO metadata
- Handle missing optional fields
- Return not-found correctly

3. Domain adapters
- Convert Sanity documents into the existing domain model.
- Keep renderer components independent of raw Sanity document shape where practical.
- Map Portable Text blocks into the rendering system.
- Reuse the existing renderer or introduce a well-tested adapter.
- Do not duplicate two unrelated article renderers.

4. Caching and freshness
Use current official Next.js and Sanity integration practices.
- Document caching behavior.
- Use revalidation tags or equivalent supported mechanisms.
- Avoid stale content after publish.
- Avoid making every page fully dynamic unless necessary.
- Preserve build reliability when content is available.
- Define safe behavior during temporary CMS query failure.

5. Images
- Use the Sanity image pipeline correctly.
- Preserve alt text, caption, credit, crop, and hotspot.
- Provide responsive sizes.
- Avoid exposing internal-only metadata.

6. Search
- Replace or adapt local search to CMS data.
- Keep URL behavior and no-result states.
- Exclude drafts.

7. Build-time and runtime behavior
- Build must fail clearly for invalid required production configuration.
- Local setup must have a documented path.
- Public pages must not require a write token.
- A temporary CMS outage should produce a controlled error rather than a raw stack trace.

8. Tests
Add:
- Query projection tests or fixtures
- Adapter tests
- Published versus draft filtering
- Missing-reference behavior
- Portable Text mapping
- Search
- Pinned fallback
- Issue, author, and category relations
- CMS failure state
- Public route browser tests using CMS-backed data

9. Migration verification
Publish one test article.
Confirm:
- It appears on the correct pages
- Its author pages update
- Its issue page updates
- Search finds it
- Draft records remain hidden
- Captions and credits render

10. Documentation
Create docs/CONTENT_PROVIDER.md.
Update README, ROUTE_CONTRACT, DECISIONS, AGENTS, and PROJECT_STATUS.

Validation:
- Run type generation.
- Run npm run verify.
- Run npm run test:e2e against CMS-backed local development.
- Run npm run build.
- Inspect network and browser console for errors.
- Confirm no secret is client-exposed.
- Confirm local rollback mode still works.

Do not commit.
Report architecture, queries, caching, tests, changed files, manual verification, and recommended commit message.
```

## Human verification

Publish only the test article.

Check:

- Homepage
- Latest
- Search
- Issue
- Author
- Category
- Article
- Sitemap or feed if present

Then edit the article in Studio and publish again. Confirm the public page updates according to the documented revalidation behavior.

## Stop conditions

Do not continue if:

- Draft content appears publicly
- A private token appears in the browser
- Pages directly import raw Sanity queries
- Local and CMS renderers produce meaningfully different designs
- CMS data breaks the production build
- Public content does not update after publishing

## Commit

```text
feat: connect public site to Sanity content
```
