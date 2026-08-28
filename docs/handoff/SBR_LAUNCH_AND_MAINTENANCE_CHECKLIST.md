# Sidwell Business Review — Launch and Maintenance Checklist

## Routine publishing

No deployment should be necessary for normal Article publishing.

Use Sanity Studio, publish the content, then verify the live site.

## Before a code change goes to production

Confirm:
- The change is on the correct branch.
- Current `main` has been synced before starting work.
- No secret values are in the diff.
- Sanity Studio remains separate from the public site.
- Production still uses `CONTENT_SOURCE=sanity`.

Recommended validation for substantial code changes:
- `npm run sanity:check-provider`
- `npm run validate:content`
- `npm run verify`
- `CONTENT_SOURCE=sanity npm run build`
- `git diff --check`

## After a production deployment

Check:
- Homepage loads.
- Real SBR Articles appear.
- One Article opens.
- About page works.
- Search works.
- Individual author pages work.
- `/studio` is not a CMS route.
- Hosted Sanity Studio still opens.
- Studio preview points at the production Worker.

## After changing a runtime secret

Cloudflare may create a new Worker version when runtime secrets are changed.

Make sure the newest version is actually promoted to production.

## After changing a build variable

A new build is required.

Examples:
- `CONTENT_SOURCE`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_SANITY_STUDIO_URL`

## Webhook health

If published content does not refresh:
1. Open the Sanity webhook delivery/attempt log.
2. Confirm the endpoint returns HTTP 200.
3. A 401 usually means the bearer secret does not match.
4. A 404 usually means the endpoint URL is wrong.
5. A 5xx indicates a server-side failure.

## Optional future cleanup

The `/authors` directory is not essential. Individual `/authors/[slug]` pages can remain useful even if the directory is later removed or hidden.

## Avoid unnecessary complexity

Do not add comments, newsletters, categories, tags, issue management, or complicated user accounts unless the publication develops a real editorial need for them.
