# Sidwell Business Review — Handoff Package

Last reviewed: November 1, 2026

This package is the current operational handbook for the Sidwell Business Review website. Historical phase plans in `docs/codex-plan/` are preserved as records and are not current deployment instructions.

## Current services

- Public website: <https://website.sidwellbusinessreview.workers.dev/>
- Sanity Studio: <https://sidwell-business-review.sanity.studio/>
- GitHub repository: `sidwellbusinessreview-svg/website`
- Production branch: `main`
- Cloudflare Worker: `website`
- Sanity project/dataset: `bumxf5q6` / `production`

Production content comes from Sanity, Studio is hosted separately, and the public site has no embedded `/studio` route. Article publishing, Publication Settings/About, Contributors, Preview, search, sitemap, RSS, and the fixed-tag revalidation endpoint are implemented.

The supplied Sanity log showed 16 successful webhook deliveries on October 19, 2026. Those responses prove endpoint acceptance, not page-level content propagation. A future approved editorial change still needs a timed end-to-end observation.

## Read these next

1. `SBR_EDITOR_HANDBOOK.md` — normal editorial work.
2. `SBR_ADMIN_HANDOFF_CHECKLIST.md` — access, onboarding, and offboarding.
3. `SBR_TECH_STACK_AND_RECOVERY.md` — architecture, rollback, secrets, Preview, and content recovery.
4. `SBR_LAUNCH_AND_MAINTENANCE_CHECKLIST.md` — deployments, publishing continuity, and Search Console follow-up.
5. `SBR_HUMAN_VERIFICATION_CHECKLIST.md` — short list of evidence that still requires an authorized person.

## Evidence limits

This repository does not prove who currently controls GitHub, Cloudflare, Sanity, the publication recovery identity, billing, or backup storage. It also does not prove that a dataset export has been restored successfully. Verify those items in the publication's private operations register; do not mark them complete from documentation alone.

## Secret rule

Never put secret values in this package, GitHub, screenshots, email, or chat. Public deployment uses these server-only secret names:

- `SANITY_API_READ_TOKEN`
- `SANITY_PREVIEW_SECRET`
- `SANITY_REVALIDATE_SECRET`

`SANITY_API_WRITE_TOKEN` is for separately authorized migration operations and must not be installed in the public website deployment.
