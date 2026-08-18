# Phase 15: Preview Deployment and Hosted Revalidation

## Objective

Deploy a private reviewable version of the CMS-backed site and prove that hosted publishing updates work.

This phase does not perform the final production cutover.

## Environment strategy

Use:

```text
Local:
CONTENT_SOURCE=sanity when testing CMS
CONTENT_SOURCE=local when testing rollback

Vercel Preview:
CONTENT_SOURCE=sanity

Vercel Production:
CONTENT_SOURCE=local until Phase 18
```

## Human steps

1. Create or open the Vercel account owned by the publication Gmail.
2. Connect the GitHub organization repository.
3. Invite individual trusted administrators where supported.
4. Set `main` as the Production Branch.
5. Create a Phase 15 branch for preview testing.
6. Do not connect the final domain yet.
7. Do not expose secret values in chat or documentation.

## Codex prompt

```text
You are performing revised Phase 15 of the Sidwell Business Review website project.

Before changing anything:

1. Read:
   - docs/CONTENT_PROVIDER.md
   - docs/PREVIEW_WORKFLOW.md
   - docs/ARCHIVE_MIGRATION.md
   - SECURITY.md
   - PROJECT_STATUS.md
2. Confirm Phase 14 is committed.
3. Show git status.
4. Run full local, CMS, preview, and migration checks.
5. Do not switch Production to Sanity mode.
6. Do not purchase or connect a domain.
7. Do not print environment-variable values.
8. Use current official Vercel, Next.js, and Sanity behavior.

Prepare and validate hosted preview deployment.

1. Environment matrix.

Document variables by name and scope.

Local:
- Public Sanity identifiers
- CONTENT_SOURCE
- Server-only preview token
- Preview secret
- Revalidation secret
- Site URL

Preview:
- CONTENT_SOURCE=sanity
- Preview deployment URL or supported derived origin
- Sanity public identifiers
- Server-only preview values
- Revalidation secret
- No write token in browser

Production:
- CONTENT_SOURCE=local for this phase
- Production site URL placeholder
- Sanity variables may be configured but not authoritative
- Server-only secrets scoped correctly

Create:

docs/ENVIRONMENTS.md

2. Environment validation.

Required:

- Helpful failure for missing required Sanity variables in Preview.
- Local provider does not require Sanity variables where architecture permits.
- Preview and Production values cannot be accidentally confused.
- Server-only values never use NEXT_PUBLIC_.
- Site URL handles Vercel preview URLs correctly.
- Environment changes require a new deployment and documentation says so.

3. Git deployment.

Required:

- Feature branch creates Preview deployment.
- `main` creates Production deployment.
- Preview uses Sanity content.
- Production remains local.
- CI must pass before merge.
- Preview deployment URL is recorded in the review checklist.
- No production content mutation occurs merely from deploying.

4. Sanity CORS.

Configure and document approved origins:

- localhost
- Vercel Preview domain pattern or exact preview origin as supported
- Future production origin

Allow credentials only where Studio/Preview requires them.

Do not use an unrestricted wildcard when authenticated access is involved.

5. Hosted Draft Preview.

Confirm:

- Preview enable route works on Vercel Preview.
- Preview Article opens.
- Draft-only Article is visible only in preview.
- Exit Preview works.
- Public Preview deployment outside Draft Mode remains published-only.
- Clean unauthenticated browser cannot activate preview.

6. Hosted revalidation.

The endpoint already exists.

Do not rebuild it unless defects are found.

Configure a Sanity webhook for relevant document changes:

- Article
- Contributor
- About
- Site Settings

No webhook filters for:

- Issue
- Category
- Tag
- Masthead

Requirements:

- Secret matches the Preview environment.
- Webhook sends enough document metadata to invalidate correct tags.
- Endpoint verifies signature or secret using the accepted implementation.
- Failed verification returns safe error.
- Publish Article triggers update.
- Publish Contributor change updates Article byline/profile.
- Publish About change updates About.
- Publish Site Settings change updates relevant pages.
- Unpublish Article removes it.
- Delete Article removes it.
- Draft save without Publish does not update public output.

7. Revalidation semantics.

Document exact behavior.

If using `revalidateTag` with stale-while-revalidate behavior:

- First request after invalidation may receive stale content.
- A subsequent request receives refreshed content.
- Documentation must tell editors how to verify.

If using another accepted cache mechanism:

- Document its exact behavior.
- Prove it in hosted Preview.

Do not claim instant update unless tests prove it.

8. Health and diagnostics.

Add or preserve safe diagnostics:

- Application reachable
- Published Sanity read reachable
- Provider mode visible only in safe developer diagnostics
- No secrets
- No document content dumped publicly
- No stack traces

Do not add a public administrative dashboard.

9. Rollback.

Create:

docs/ROLLBACK.md

Include:

- Revert Git commit
- Redeploy previous Vercel deployment
- Set Preview or Production CONTENT_SOURCE=local
- Redeploy after environment change
- Restore Sanity dataset export for content corruption
- Disable webhook if it is causing failures
- Verify rollback

10. Tests.

Add hosted or local-equivalent tests for:

- Preview environment selects Sanity
- Production environment remains local
- Environment validation
- Hosted preview activation
- Hosted preview rejection
- Webhook valid request
- Webhook invalid request
- Article publish
- Article unpublish
- Contributor update
- About update
- Site Settings update
- Draft save no public update
- Cache refresh behavior
- Rollback provider switch

11. Documentation.

Create or update:

- docs/DEPLOYMENT.md
- docs/ENVIRONMENTS.md
- docs/REVALIDATION.md
- docs/ROLLBACK.md
- README.md
- SECURITY.md
- AGENTS.md
- PROJECT_STATUS.md

12. Validation.

Run:

- CI locally
- Local provider build
- Sanity provider build
- Preview browser tests
- Draft preview tests
- Webhook route tests
- Provider diagnostic
- Dataset audit
- Production build
- Secret scan
- git diff --check

Then deploy a branch Preview and manually test it.

Do not commit.

Report:

- Preview URL
- Environment names only
- Preview provider mode
- Production provider mode
- CORS configuration result
- Hosted Draft Preview result
- Webhook result
- Revalidation timing
- Rollback test
- Every changed file
- Recommended commit message
```

## Human acceptance

On the Vercel Preview URL:

1. Confirm CMS Article appears.
2. Confirm local-only Articles do not appear.
3. Confirm normal mode hides drafts.
4. Confirm Preview shows drafts.
5. Publish an Article change.
6. Verify hosted revalidation.
7. Restore the Article.
8. Unpublish and republish a disposable test Article.
9. Publish a Contributor graduation-year change and confirm public update.
10. Publish an About change and restore it.
11. Verify Search, Archive, sitemap, and feed.
12. Verify clean-browser authentication.

On the Production URL:

1. Confirm it still uses local content.
2. Confirm Phase 15 did not cut over production accidentally.

## Stop conditions

Do not continue if:

- Preview uses local content.
- Production switches to Sanity early.
- Drafts leak publicly.
- Webhook accepts invalid secrets.
- Publish changes do not reach Preview.
- Rollback cannot be performed.
- Environment variables appear in Git.
- Preview deployment has red runtime errors.

## Commit

```text
chore: configure CMS preview deployment and revalidation
```
