# Phase 12: CMS Provider Acceptance and Correction

## Objective

Accept, correct, and commit the existing Sanity content-provider implementation.

Do not rebuild Phase 12 from scratch.

The current implementation already provides:

- Stable `ContentProvider` interface
- Local provider
- Sanity provider
- Environment-based provider selection
- Typed queries and adapters
- Published-only public data
- Search
- Contributor pages
- About content
- Sitemap and feed integration
- Five-minute cache revalidation
- Tagged cache invalidation endpoint
- Local rollback mode
- CMS-specific automated tests

This phase determines whether that implementation is correct enough to become the foundation for later work.

## Known current conditions

- `CONTENT_SOURCE=local` is the temporary default.
- One published Sanity article is valid.
- A second published Sanity article is excluded because it fails domain validation.
- Issues, Categories, and Tags do not exist and must not be reintroduced.
- The public Contributor compatibility route may remain `/authors/[slug]`.
- Article images are optional.
- Contributor identity is text-only.
- The hosted webhook is not configured yet.
- Production remains in local mode until Phase 18.

## Codex prompt

```text
You are performing the revised Phase 12 acceptance of the Sidwell Business Review Sanity content provider.

Do not rebuild the provider.
Do not begin draft preview.
Do not deploy.
Do not commit.
Do not reintroduce Issues, Categories, Tags, biographies, portraits, avatars, or Masthead.
Preserve the local rollback provider.

Current Phase 12 implementation summary:
- Stable ContentProvider interface
- Local and Sanity providers
- CONTENT_SOURCE environment selection
- Published-only token-free Sanity client
- Typed GROQ queries and adapters
- Portable Text conversion
- Sanity images
- Search
- Contributor relationships
- About content
- Sitemap and feed
- Five-minute cache revalidation
- Secret-authenticated /api/revalidate/sanity endpoint
- sanity:check-provider and test:e2e:sanity
- One valid published CMS article
- One invalid published CMS article excluded by validation

Before changing anything:

1. Read:
   - AGENTS.md
   - PROJECT_STATUS.md
   - docs/CONTENT_PROVIDER.md
   - docs/CONTENT_MODEL.md
   - docs/ROUTE_CONTRACT.md
   - docs/CMS_EDITOR_MODEL.md
   - docs/DECISIONS.md
2. Show git status.
3. Inspect the complete Phase 12 diff.
4. Run the existing local and CMS automated suites.
5. Do not require a clean worktree because Phase 12 is intentionally uncommitted.
6. Report any change that is not part of Phase 12 or earlier accepted Phase 11 work.

1. Confirm the final provider contract.

The domain-facing provider must support only the current model:

- Site settings
- Published Articles
- Article by slug
- Latest Articles
- Pinned lead Article
- Archive
- Search
- Contributors
- Contributor by slug
- Articles by Contributor
- About

No provider methods, queries, adapters, routes, tests, or documentation should actively support:

- Issues
- Categories
- Tags
- Masthead
- Contributor biography
- Contributor photo
- Staff portrait

Remove active obsolete code physically if any remains.
Historical decision prose may remain when clearly marked historical.

2. Audit provider selection.

Required behavior:

- CONTENT_SOURCE=local selects local content.
- CONTENT_SOURCE=sanity selects Sanity content.
- Invalid CONTENT_SOURCE fails clearly.
- Explicit Sanity mode never silently falls back to local sample content.
- Public production reads require no token.
- Missing Sanity public configuration fails clearly in Sanity mode.
- Local mode remains operational without Sanity configuration where the current architecture allows it.
- Provider selection occurs behind src/content/index.ts or the accepted equivalent.
- Routes and components do not import raw Sanity data directly.

Add or correct tests for all provider-selection states.

3. Repair the invalid second published Sanity test Article.

Use the content audit and Studio data to identify the invalid published Article.

Do not merely leave it silently excluded.

Report:

- Article title
- Article slug
- Validation failures
- Whether a draft and published version exist
- Whether it is disposable test content

Preferred resolution:

- If clearly disposable test content, unpublish and permanently delete it through the safe editorial workflow.
- If it contains useful test content, correct the required fields and republish it.
- Do not delete an Article unless the human has already confirmed that test content is disposable.
- If authentication prevents mutation, produce exact human steps.

After resolution:

- sanity:check-provider must report no published Article excluded by domain validation.
- Audit output must distinguish draft-only records from invalid published records.
- Public queries must not hide validation failures without reporting them to developers.

4. Verify the valid CMS Article and Contributor.

The valid published test Article must:

- Appear through the Sanity provider
- Resolve its Contributor
- Render without an image if no image exists
- Render Portable Text blocks
- Appear in Homepage results when editorial ordering permits
- Appear in Latest
- Appear in Archive
- Appear in Search
- Appear on its Contributor page
- Appear in sitemap.xml
- Appear in feed.xml
- Remain absent from local-provider output unless a separate local record intentionally exists

5. Verify draft isolation.

Public Sanity mode must use the published perspective.

Confirm that:

- Draft-only Articles are absent publicly.
- Unpublished edits to a published Article are absent publicly.
- Draft Contributors are not exposed through public pages.
- Draft About or Site Settings changes are not exposed.
- Draft content is absent from Search, sitemap, feed, metadata, and static payloads.
- Public queries never use the drafts perspective.
- No read token is sent to the browser.

6. Verify local rollback mode.

Run the complete public site with:

CONTENT_SOURCE=local

Confirm:

- Local sample Articles render.
- Local Contributor pages render.
- Search works.
- About works.
- Sitemap and feed work.
- No Sanity network or configuration failure breaks local mode.
- The design is the same provider-independent design used in Sanity mode.

Then run with:

CONTENT_SOURCE=sanity

Confirm:

- CMS content renders.
- Local-only sample Articles are absent.
- Missing or invalid CMS content produces a controlled error or omission with developer diagnostics.
- No silent fallback occurs.

7. Audit queries and adapters.

Confirm:

- Queries are typed using the accepted Sanity TypeGen workflow.
- Queries request only needed fields.
- Deterministic Article ordering uses publication date plus a stable fallback.
- Contributor references preserve byline order.
- Archived Contributors remain available for existing published bylines.
- Archived Contributors do not disappear from existing Articles.
- Optional Article images map correctly.
- Alt text, caption, credit, crop, hotspot, and dimensions map when an image exists.
- Portable Text never renders arbitrary raw HTML.
- Unknown blocks fail safely.
- About staff sections resolve correctly.
- Missing optional Site Settings do not crash the site.

8. Audit caching and revalidation.

Document the actual current behavior, not a generic description.

Confirm:

- Time-based cache interval is exactly documented.
- Cache tags are attached to the data they claim to invalidate.
- /api/revalidate/sanity validates a server-only secret.
- The endpoint rejects missing or incorrect secrets.
- The endpoint cannot invalidate arbitrary attacker-supplied paths or tags.
- The endpoint handles Article, Contributor, About, and Site Settings changes.
- No Issue, Category, Tag, or Masthead webhook logic remains.
- The endpoint returns safe status messages without printing secrets.

At this phase:

- Hosted webhook configuration may remain deferred to Phase 15.
- Local manual verification may use the documented time-based interval.
- Clearly distinguish code-complete revalidation from hosted webhook-complete revalidation.

9. Create a precise manual acceptance document.

Create:

docs/PHASE_12_ACCEPTANCE.md

It must contain exact commands for:

- Local provider mode
- Sanity provider mode
- Provider diagnostic
- CMS browser test
- Build in each mode
- Draft-isolation test
- Revalidation timing test
- Restoring the test Article title
- Returning the environment to the intended post-test state

It must list the current valid test Article and Contributor by title/name.

10. Update documentation.

Update:

- docs/CONTENT_PROVIDER.md
- docs/ROUTE_CONTRACT.md
- docs/DECISIONS.md
- README.md
- AGENTS.md
- PROJECT_STATUS.md
- .env.example

Remove outdated manual checks for:

- Issue
- Category
- Tag
- Masthead
- Author biography
- Contributor portrait

11. Validation.

Run both modes explicitly.

Local mode:
- npm run sanity:typegen
- npm run validate:content
- npm run verify
- npm run test:e2e
- npm run build

Sanity mode:
- npm run sanity:check-provider
- npm run test:e2e:sanity
- npm run build with CONTENT_SOURCE=sanity
- any CMS-specific unit tests

Also run:
- npm run sanity:audit-content
- git diff --check
- secret scan

Do not commit.

Report:

- Whether existing Phase 12 architecture was accepted
- Corrections made
- Invalid Article resolution status
- Final provider methods
- Final routes using CMS content
- Cache interval
- Revalidation endpoint behavior
- Local rollback result
- Sanity-mode result
- Draft-isolation result
- Every changed file
- Exact manual verification steps
- Recommended commit message
```

## Human verification

### A. Configure Sanity mode temporarily

Stop the server.

Open `.env.local` and set:

```text
CONTENT_SOURCE=sanity
```

Do not change the public Sanity identifiers.

Restart:

```bash
npm run dev
```

### B. Verify the valid published CMS Article

In Studio, confirm the test Contributor is:

- Published
- Active
- Free of unpublished changes

Confirm the test Article is:

- Published
- Free of unpublished changes
- Connected to the published Contributor
- Valid according to Studio and `sanity:check-provider`

Open its public Article URL.

Confirm:

- Title
- Subtitle, if used
- Summary
- Linked byline
- Publication date
- Reading time
- Body blocks
- Image-free layout or image metadata
- No draft information

### C. Check current public routes

Check:

- Homepage
- Latest
- Archive
- Search
- Article
- Contributor profile
- About
- sitemap.xml
- feed.xml
- Custom 404

Skip:

- Issues
- Categories
- Tags
- Masthead

### D. Verify draft isolation

Edit the test Article title without publishing.

Refresh the public page.

Expected:

- Old published title remains.
- Unpublished title is absent from Homepage, Latest, Archive, Search, sitemap, and feed.

Discard the edit or publish it according to the next test.

### E. Verify publishing changes

Edit the title to a clearly identifiable temporary value.

Publish changes.

Follow the exact cache behavior documented in `docs/PHASE_12_ACCEPTANCE.md`.

Confirm the public page updates within the documented behavior.

Restore the original title and publish again.

Leave the Article:

- Published
- No unpublished changes

### F. Verify local rollback

Stop the server.

Set:

```text
CONTENT_SOURCE=local
```

Restart and confirm:

- Local sample content returns.
- CMS-only test content is absent.
- Public pages still work.

Stop the server.

Return `.env.local` to the state required for the next phase. Phase 13 will normally use:

```text
CONTENT_SOURCE=sanity
```

### G. Run final commands

```bash
npm run sanity:typegen
npm run sanity:audit-content
npm run sanity:check-provider
npm run validate:content
npm run verify
npm run test:e2e
npm run test:e2e:sanity
npm run build
git diff --check
```

Run the build in both local and Sanity modes if the scripts do not already do so.

## Stop conditions

Do not commit if:

- A published Sanity Article is silently excluded as invalid.
- Draft content appears publicly.
- Sanity mode falls back silently to local data.
- Local rollback mode fails.
- The valid CMS Article is absent from required routes.
- Sitemap or feed exposes drafts.
- Provider code includes active Issue, Category, Tag, or Masthead logic.
- Public reads require a private token.
- Revalidation behavior is undocumented or materially incorrect.
- Automated tests fail.

## Commit

```text
feat: accept and harden published Sanity content provider
```
