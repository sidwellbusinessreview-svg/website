# Sidwell Business Review — Launch and Maintenance Checklist

## Routine publishing

Normal Article, Contributor, Homepage, About, or leadership publishing happens in Sanity Studio and does not require a website deployment.

Before publishing, Preview the saved draft and follow `SBR_EDITOR_HANDBOOK.md`. After publishing, verify the exact live page and any affected Homepage/Contributor/About surface in a clean browser.

If content looks stale:

1. Record the publish time, public URL, expected change, and currently visible value.
2. Inspect the matching Sanity webhook attempt. HTTP 200 with `{ "revalidated": true }` proves endpoint acceptance only.
3. Reload once in a clean non-Preview browser. Do not republish or rotate secrets.
4. Wait through the 300-second fallback, then run `npm run sanity:check-cache` if a maintainer has local access.
5. If still stale, compare the public provider result, webhook log, Cloudflare deployment/runtime configuration, and response timestamps before changing infrastructure.

During the next approved real editorial update, record when the change first appears publicly. That observation is the remaining end-to-end revalidation check; do not create production content solely for a test.

## Before a code change goes to production

- Start from current `main` on a focused branch.
- Confirm the diff contains no secret or populated environment value.
- Confirm Studio remains separate from the public site.
- Confirm production remains `CONTENT_SOURCE=sanity`.
- Run checks required by the affected subsystem. Code changes normally require `npm run verify`; route/layout/interaction changes require `npm run test:e2e`.
- Review environment-variable and migration consequences explicitly.
- Merge or deploy only after approval.

## After a production deployment

- Homepage, one Article, About, Search, and one Contributor profile load.
- Real SBR content appears; fixture/sample content does not replace it.
- `/robots.txt`, `/sitemap.xml`, and `/feed.xml` respond.
- `/studio` is not a CMS route.
- Hosted Studio still opens and Preview targets the production Worker.
- The deployed Worker is the intended newest approved version.
- No unexpected browser or Cloudflare runtime error is present.

## Environment changes

Changing a build/public variable requires a new build. Changing a runtime secret may create a new Worker version; confirm that the intended version is promoted.

After rotating `SANITY_REVALIDATE_SECRET`, update both the Sanity webhook and Cloudflare before testing. After rotating the Viewer/Preview credentials, reopen Studio Preview and confirm drafts remain absent from a clean public browser. Never expose old or new values while troubleshooting.

## Webhook health evidence

The supplied Sanity log contained 16 attempts on October 19, 2026; all returned HTTP 200 and `{ "revalidated": true }`. No failures were supplied, and there is no evidence about whether later content was published.

- HTTP 401: the bearer secret is absent or mismatched.
- HTTP 404: the endpoint URL is wrong or the intended deployment is not active.
- HTTP 5xx: inspect the current Worker/runtime error.
- HTTP 200 but stale page: follow the page-level propagation procedure above.

## Search Console follow-up

- Keep the accepted canonical sitemap submitted once.
- Reinspect the Homepage and one representative Article after additional crawl time.
- Record status, selected canonical, and last crawl in the private operations record.
- Use live testing after a meaningful change or when diagnosing a response—not as a quota workaround.
- Do not repeatedly request indexing after **Quota Exceeded**.
- See `../SEO_AND_DISCOVERY.md` before proposing code changes or a custom domain.

## Each semester and before leadership turnover

- Review Sanity, GitHub, Cloudflare, Search Console, recovery-identity, and backup-storage access.
- Confirm at least two authorized maintainers where policy/plan permit.
- Remove departed members and review whether rotation is necessary.
- Locate the latest Sanity export, verify its recorded checksum/target/date, and schedule a disposable-dataset restore test if none is current.
- Confirm a known-good Cloudflare version/commit can be identified.
- Test Preview with a saved draft and the public site in a clean browser.
- Review the residual dependency advisories deliberately; never use `npm audit fix --force`.
- Review this handoff package for stale platform or contact information.

Do not add comments, newsletters, Issues, Categories, Tags, Contributor portraits/roles, or complex accounts without a demonstrated need and reviewed architecture decision.
