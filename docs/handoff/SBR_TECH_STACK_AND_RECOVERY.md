# Sidwell Business Review — Technical Stack and Recovery Notes

## Architecture

Public website:
- Next.js 16
- TypeScript
- Tailwind CSS
- Cloudflare Workers

Worker name:
`website`

Production origin:
https://website.sidwellbusinessreview.workers.dev

CMS:
- Sanity
- Project ID: `bumxf5q6`
- Dataset: `production`
- API version: `2026-03-01`

Hosted Studio:
https://sidwell-business-review.sanity.studio

The Studio is intentionally separate from the public Next.js application.

There should be no public `/studio` CMS route in the deployed Next.js site.

## Source repository

GitHub:
`sidwellbusinessreview-svg/website`

Production branch:
`main`

Cloudflare automatically builds production from `main`.

## Content-source model

The application supports:
- `CONTENT_SOURCE=local`
- `CONTENT_SOURCE=sanity`

Production must use:
`CONTENT_SOURCE=sanity`

The production configuration deliberately compiles the non-secret content-source selection into the server bundle so OpenNext runtime requests do not fall back to fixture content.

## Article date model

The canonical Sanity field is:
`publicationMonth`

Do not restore old `publicationDate`-based publishing behavior.

## Content model

Main document types:
- Article
- Contributor
- Publication Settings (`siteSettings` internally)

Removed concepts that should not be casually reintroduced:
- Issues
- Categories
- Tags
- Contributor portraits
- Contributor biographies
- Contributor role fields
- read-time field
- embedded public-site Studio

Editors-in-Chief/leadership are configured in Publication Settings, not on Contributor records.

## Sources and Footnotes

Articles maintain a Source registry and inline Footnote occurrences.

Public Notes are generated from citation occurrences.

Do not replace this with legacy `[n]` text markers.

## Preview security

Public reads are published-only.

Draft preview uses a server-only Sanity Viewer token.

The public browser must never receive the Sanity read token.

## Revalidation

Sanity publishing triggers:
`POST /api/revalidate/sanity`

Authentication:
`Authorization: Bearer <SANITY_REVALIDATE_SECRET>`

The endpoint invalidates the shared content cache tag.

## If the public site shows filler/sample content

Check:
1. Cloudflare production build has `CONTENT_SOURCE=sanity`.
2. Current code on `main` includes the production content-source fix.
3. Sanity queries use `publicationMonth`.
4. The deployed Worker is the newest successful version.

## If Studio preview points to localhost

Redeploy Studio with:
`SANITY_STUDIO_PREVIEW_ORIGIN=https://website.sidwellbusinessreview.workers.dev`

## If a Cloudflare build becomes too large

Do not re-embed Sanity Studio into the Next.js app. That previously caused the Worker to exceed the free compressed-size limit.

## If a secret is lost

Rotate it instead of trying to expose the old hidden value.

Never place a write-capable Sanity token in the public website deployment.
