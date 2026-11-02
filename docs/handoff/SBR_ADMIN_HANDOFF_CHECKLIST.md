# Sidwell Business Review — Admin Handoff Checklist

Use this when responsibility passes to a new Editor-in-Chief, faculty adviser, or technical maintainer. Record completion dates and responsible people in the approved private operations register, never in this public file.

## Service access to verify

### Sanity

- Project/dataset: `bumxf5q6` / `production`
- Hosted Studio: <https://sidwell-business-review.sanity.studio/>
- Required capabilities: open Studio, edit/save a draft, manage project members, inspect API/CORS settings, and inspect webhook attempts.

### GitHub

- Repository: `sidwellbusinessreview-svg/website`
- Production branch: `main`
- Required maintainer capabilities: clone/pull, create and push branches, open/review pull requests, inspect Actions, and merge approved changes.

Prefer publication/organization ownership. Do not leave repository recovery dependent on one graduating student's account.

### Cloudflare

- Worker: `website`
- Production URL: <https://website.sidwellbusinessreview.workers.dev/>
- Required capabilities: view builds/deployments, inspect variable and secret names (not values), promote a known Worker version, and review failed builds/runtime logs.

### Google Search Console

- Property: the canonical production origin currently documented in `../SEO_AND_DISCOVERY.md`.
- Required capabilities: inspect indexing/crawl status, view the accepted sitemap, and manage authorized users.
- Do not repeatedly request indexing to work around quota limits.

### Publication-controlled identity and storage

- Confirm the durable recovery identity is controlled under school/publication policy.
- Confirm approved recovery methods and billing contacts are current.
- Confirm maintainers know where the private ownership register and Sanity dataset exports are stored.
- Do not store passwords, tokens, recovery codes, or private contacts in this repository.

## Production configuration names

Build/public variables:

- `CONTENT_SOURCE=sanity`
- `NEXT_PUBLIC_SITE_URL=https://website.sidwellbusinessreview.workers.dev`
- `NEXT_PUBLIC_SANITY_PROJECT_ID=bumxf5q6`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-03-01`
- `NEXT_PUBLIC_SANITY_STUDIO_URL=https://sidwell-business-review.sanity.studio`

Server-only secrets:

- `SANITY_API_READ_TOKEN`
- `SANITY_PREVIEW_SECRET`
- `SANITY_REVALIDATE_SECRET`

Verify names and presence only. If a secret is unavailable, rotate it through the owning service and update every legitimate consumer; never attempt to reveal the old value.

## Revalidation webhook

The production Sanity webhook calls:

```text
POST https://website.sidwellbusinessreview.workers.dev/api/revalidate/sanity
Authorization: Bearer <SANITY_REVALIDATE_SECRET>
```

It should cover published changes for `article`, `contributor`, and `siteSettings` in the `production` dataset. Draft/version events should remain disabled. A revalidation-secret rotation requires updating both Sanity and Cloudflare.

The supplied log showed 16 successful attempts on October 19, 2026. Do not infer current secret custody or later publishing activity from that historical result.

## Onboard a maintainer or editor

1. Obtain approval for the person's role and duration.
2. Invite their individual account to only the services they need.
3. Grant the minimum useful role.
4. Have them sign in and perform a non-destructive capability check; a Studio editor may create/save and then remove an unpublished test draft only when authorized.
5. Review the Editor handbook, secret rules, publishing approval, and escalation contacts.
6. Record the verifier, date, and granted scope in the private register.

## Offboard access

1. Confirm the incoming maintainer can operate the service before removing the outgoing maintainer.
2. Remove the outgoing person's Sanity, GitHub, Cloudflare, Search Console, and private-storage access as applicable.
3. Transfer billing/recovery responsibilities where applicable.
4. Rotate secrets only when custody or trust boundaries changed, exposure is suspected, or policy requires it.
5. Verify Preview, webhook delivery, and production after any rotation.
6. Record completion without recording secret values.

## Handoff acceptance

- At least two currently authorized maintainers can access each critical service where plan and policy permit.
- No critical service depends solely on a graduating student's personal account.
- One maintainer can identify and promote the last known good Cloudflare version.
- One maintainer can locate the latest dataset export and its verification record.
- One maintainer can inspect webhook attempts and follow the stale-content procedure.
- One editor can Preview a saved draft without exposing it publicly.
- Departed members have been removed.

These checks remain incomplete until a human records evidence in the private register.
