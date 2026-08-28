# Sidwell Business Review — Handoff Package

This package is the operational handbook for running the Sidwell Business Review website after launch.

## What is already complete

- Public website is deployed on Cloudflare Workers.
- Public content comes from the Sanity `production` dataset.
- Sanity Studio is hosted separately from the public site.
- Draft preview points at the live website.
- Publishing changes trigger the production revalidation webhook.
- The public site does not embed Sanity Studio.
- Article publishing, contributor pages, About/Publication Settings, search, sitemap, RSS, and preview are in place.

## Day-to-day links

Public site:
https://website.sidwellbusinessreview.workers.dev

Sanity Studio:
https://sidwell-business-review.sanity.studio

## Read these next

1. `SBR_EDITOR_HANDBOOK.md` — normal editorial workflow.
2. `SBR_ADMIN_HANDOFF_CHECKLIST.md` — what the next Editor-in-Chief needs access to.
3. `SBR_TECH_STACK_AND_RECOVERY.md` — technical map and recovery notes.
4. `SBR_LAUNCH_AND_MAINTENANCE_CHECKLIST.md` — what to verify before/after major changes.

## Important rule

Do not put secret values in this package, GitHub, screenshots, emails, or chat messages.

The website currently uses these secret names:

- `SANITY_API_READ_TOKEN`
- `SANITY_PREVIEW_SECRET`
- `SANITY_REVALIDATE_SECRET`

The values should remain stored only in the services that need them.
