# Sidwell Business Review — Admin Handoff Checklist

Use this when responsibility passes to a new Editor-in-Chief or technical lead.

## Sanity

The successor should be able to:

- sign in to the Sanity organization/project;
- open the hosted Studio;
- manage project members;
- access project API settings and webhooks;
- understand that the production dataset is named `production`.

Project ID:

`bumxf5q6`

Hosted Studio:

https://sidwell-business-review.sanity.studio

## GitHub

Repository:

`sidwellbusinessreview-svg/website`

The successor should have enough repository access to:

- pull the code;
- create branches;
- merge approved changes;
- push to `main` when appropriate;
- review deployment-related commits.

Prefer organization/shared publication ownership rather than leaving the repository dependent on one graduating student's personal account.

## Cloudflare

Worker name:

`website`

Production URL:

https://website.sidwellbusinessreview.workers.dev

The successor should be able to:

- view deployments;
- view build configuration;
- manage runtime variables/secrets;
- promote Worker versions;
- inspect failed builds.

## Production build variables

- `CONTENT_SOURCE=sanity`
- `NEXT_PUBLIC_SITE_URL=https://website.sidwellbusinessreview.workers.dev`
- `NEXT_PUBLIC_SANITY_PROJECT_ID=bumxf5q6`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-03-01`
- `NEXT_PUBLIC_SANITY_STUDIO_URL=https://sidwell-business-review.sanity.studio`

## Runtime secrets

- `SANITY_API_READ_TOKEN`
- `SANITY_PREVIEW_SECRET`
- `SANITY_REVALIDATE_SECRET`

Do not record their actual values in this handbook.

If a secret is lost, rotate/replace it rather than trying to expose an old hidden value.

## Revalidation webhook

Sanity has a production webhook that calls:

`POST https://website.sidwellbusinessreview.workers.dev/api/revalidate/sanity`

Authentication uses:

`Authorization: Bearer <SANITY_REVALIDATE_SECRET>`

The webhook should apply to the `production` dataset and published changes for:

- `article`
- `contributor`
- `siteSettings`

Draft/version events should not be enabled.

## Annual handoff procedure

1. Add the successor to Sanity.
2. Add the successor to GitHub/repository ownership.
3. Add the successor to Cloudflare.
4. Confirm the successor can open Studio and edit a draft.
5. Confirm the successor can see Cloudflare deployments.
6. Confirm the successor can access the GitHub repository.
7. Review this handbook together.
8. Remove access for people who no longer need administrative privileges.
9. Rotate sensitive secrets if ownership or trust boundaries changed.
10. Confirm at least two current students have administrative access so the site is not dependent on one person.
