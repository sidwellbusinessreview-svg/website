# Sidwell Business Review — Technical Stack and Recovery Notes

## Current architecture

- Public application: Next.js 16, React 19, TypeScript, Tailwind CSS v4.
- Hosting: Cloudflare Workers through OpenNext.
- Worker/origin: `website` / <https://website.sidwellbusinessreview.workers.dev/>.
- Source: `sidwellbusinessreview-svg/website`, production branch `main`.
- CMS: Sanity project `bumxf5q6`, dataset `production`, API `2026-03-01`.
- Studio: <https://sidwell-business-review.sanity.studio/>.

Studio is intentionally separate from the public Next.js app; `/studio` must remain a public 404. Cloudflare builds production from `main`. Sanity Studio has its own deployment lifecycle.

Production uses `CONTENT_SOURCE=sanity`. The non-secret provider choice is compiled into the server bundle so build-time routes and OpenNext runtime requests use the same source. `CONTENT_SOURCE=local` is an explicit fixture-backed recovery mode, not an automatic failover.

Main CMS types are Article, Contributor, and fixed Publication Settings (`siteSettings`). The launch model excludes Issues, Categories, Tags, Contributor portraits/biographies/roles, read time, and an embedded Studio. Leadership belongs only in Publication Settings.

Article dates use canonical `publicationMonth` (`YYYY-MM`) and display Month Year; do not restore exact-day publishing. Articles keep a structured Source registry and body-order Footnote occurrences. Public Note numbers come from each occurrence, not Source-array order or typed `[n]` markers.

## Revalidation and Preview

Publishing calls `POST /api/revalidate/sanity` with a bearer value matching `SANITY_REVALIDATE_SECRET`. The endpoint invalidates the fixed shared `content` tag; public reads also revalidate after 300 seconds. Successful delivery is not proof that a specific page has already refreshed.

Public reads are published-only and token-free. Draft Preview uses a server-only Viewer token, `drafts`, no CDN, and no store. The public browser must never receive a Sanity token.

If Preview points to localhost, confirm the Studio deployment's `SANITY_STUDIO_PREVIEW_ORIGIN` is the production Worker origin and redeploy Studio. If Presentation cannot connect, check the current Worker, Viewer token, Draft Mode endpoint, exact Sanity CORS origins, and Preview banner/Visual Editing bridge before changing code.

## Application rollback

Application rollback changes code/deployment; it does not roll back Sanity content.

1. Record the failing production symptoms, current commit, Worker version, and relevant logs.
2. Identify the last known good reviewed commit and Cloudflare Worker version. Do not guess based only on age.
3. Prefer promoting the known-good Worker version when an authorized Cloudflare administrator can do so. Otherwise, create a reviewed revert commit/PR from `main`; do not force-push or rewrite shared history.
4. Confirm required variables/secrets still exist for the version being promoted. A historical binary can still fail against missing current configuration.
5. Verify Homepage, one Article, About, Search, a Contributor page, robots, sitemap, feed, and Studio Preview after promotion.
6. Preserve failure evidence and open a follow-up fix; do not merge the broken change again without reproducing the cause.

Select `CONTENT_SOURCE=local` only when leadership explicitly accepts fixture content as the temporary public result. It requires a rebuild and is not appropriate for recovering deleted or incorrect Sanity records.

## Sanity content recovery

Sanity content recovery is separate from application rollback. Promoting an older Worker does not restore Articles, Contributors, assets, or Publication Settings.

1. Stop further destructive editing and record the affected document IDs/types and times without copying private content into public logs.
2. Inspect Sanity document history for a narrow document-level recovery when available.
3. Locate the latest target-matching dataset export and its manifest/checksum in approved private storage. The repository does not prove that such a backup exists.
4. Before any broad restore, import the export into a new disposable dataset and verify expected document counts, references, assets, and representative content.
5. Compare the restore candidate with current production changes made after the export. A broad replacement can erase legitimate newer work.
6. Restore or migrate production only with explicit authorization, a written target/impact plan, and a fresh pre-change export.
7. Re-run the authenticated content/page audits and public smoke checks after recovery.

Create an export before approved high-risk changes with a dated filename in approved private storage:

```bash
npx sanity dataset export production /approved/private/path/sbr-production-YYYY-MM-DD.tar.gz
```

Record the project ID, dataset, timestamp, file checksum, creator, and storage location separately. An export file is not a verified backup until an authorized maintainer has restored it to a disposable dataset and recorded the result. Never run a production import/replace from this handbook alone.

## Missing or rotated secrets

Do not try to display an old hidden value.

1. Identify the secret by name and its legitimate consumers.
2. Revoke/rotate it in the owning service.
3. Update each approved secret store. For `SANITY_REVALIDATE_SECRET`, update both Sanity's webhook and Cloudflare.
4. Promote/redeploy the Worker version created by the change when required.
5. Test only the affected path: Preview for Viewer/Preview credentials; one approved publish observation for revalidation.
6. Review access/audit logs and record the incident or scheduled rotation without recording the value.

Never install `SANITY_API_WRITE_TOKEN` in the public Worker.

## Common recovery checks

### Public site shows fixture content

1. Confirm the approved deployment has `CONTENT_SOURCE=sanity` at build time.
2. Confirm the current code includes the compiled provider selection.
3. Confirm the promoted Worker is the intended successful version.
4. Do not edit Sanity content to hide a deployment/configuration problem.

### Published content appears stale

Use the timed procedure in `SBR_LAUNCH_AND_MAINTENANCE_CHECKLIST.md`. Compare webhook acceptance, `npm run sanity:check-cache`, the exact public URL, and the 300-second fallback before rotating secrets or republishing.

### Worker exceeds size limits

Do not re-embed Studio. That architecture previously exceeded the Cloudflare free compressed Worker limit.

### Administrator is unavailable

Use the publication's approved recovery identity and private ownership register. If no authorized person can recover a service, document the access blocker and contact that service's official account-recovery channel; do not create a replacement production project or copy credentials between people.

## Backup and access acceptance

The following require human evidence and must not be inferred from code:

- two current authorized maintainers for GitHub, Cloudflare, and Sanity where policy/plan permit;
- current publication-controlled recovery and billing contacts;
- location, checksum, and target metadata for the latest dataset export;
- successful restore of a recent export into a disposable dataset;
- identification/promotion ability for a last known good Worker version;
- current onboarding/offboarding review and removal of departed members.

Track these in the private operations register using `docs/ACCOUNT_OWNERSHIP_TEMPLATE.md` as a blank template.
