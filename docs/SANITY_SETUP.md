# Sanity setup and administration

Sanity Studio is hosted separately from the public Next.js application. Its source, schemas, custom controls, Structure, and Presentation configuration remain in this repository; the public deployment has no `/studio` route.

## Current target

- Project ID: `bumxf5q6` (public identifier)
- Dataset: `production`
- API version: `2026-03-01`
- Hosted Studio: <https://sidwell-business-review.sanity.studio/>
- Preview frontend: <https://website.sidwellbusinessreview.workers.dev/>

The standalone Studio target is fixed in source. Public application reads validate the matching `NEXT_PUBLIC_SANITY_*` values. Do not create another project or dataset to work around a configuration problem.

## Policy and ownership

Confirm school approval before adding new kinds of student information. Published documents in the public dataset are anonymously readable, so private student information does not belong there.

Use a publication-controlled administrative/recovery identity where school policy permits, invite maintainers and editors through individual accounts, and keep the real ownership/recovery register outside Git. Do not put tokens, recovery codes, passwords, or private contact details in source, issues, chat, screenshots, or documentation.

## Local configuration

Copy the example file:

```bash
cp .env.example .env.local
```

The example includes the public project, dataset, and API date. For published CMS reads, select `CONTENT_SOURCE=sanity`. Local fixture-backed development may keep `CONTENT_SOURCE=local`.

Use these local origins unless a task explicitly tests hosted services:

```text
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Draft Preview requires a server-only Viewer token and preview secret. Webhook handling requires a separate server-only revalidation secret. Migration apply/rollback commands use a write token only when explicitly authorized; the public website must never receive it. No secret name may be prefixed with `NEXT_PUBLIC_`.

`.env.local` is ignored. Confirm before proceeding:

```bash
git check-ignore .env.local
git status --short
```

## CORS and trusted origins

In Sanity Manage, open **Settings → API settings → CORS Origins**. Exact trusted origins that need authenticated browser access may include:

- `http://localhost:3333` for local Studio;
- `https://sidwell-business-review.sanity.studio` for hosted Studio;
- `https://website.sidwellbusinessreview.workers.dev` for production Presentation/Preview;
- a specific approved temporary review origin only while it is needed.

Enable credentials where authenticated Studio/Presentation requires them. Never add a platform-wide wildcard with credentials. Remove temporary origins after review. Server-side token-free public reads do not require a CORS entry.

Administrators may inspect configured origins without exposing credentials:

```bash
npx sanity cors list
```

## Connectivity and Studio development

Run the token-free connectivity check:

```bash
npm run sanity:check
```

Then start the public site and Studio in separate terminals:

```bash
npm run dev
npm run studio:dev
```

Open <http://localhost:3333>. Signing in does not grant access by itself; the identity must be an invited project member. The public site remains on port 3000 and has no Studio route.

Build Studio without deploying it:

```bash
npm run studio:build
```

Deploy source changes to the existing hosted Studio only through the reviewed workflow:

```bash
npm run studio:deploy
```

The hosted Studio is a separate deployment from the Cloudflare Worker. A public application rebuild is required when `NEXT_PUBLIC_SANITY_STUDIO_URL` or other build variables change.

## Invite, review, and revoke access

1. Invite each approved editor through an individual identity.
2. Grant the minimum role supported by the approved plan and workflow.
3. Do not create shared student credentials.
4. Review members each semester and before leadership handoff.
5. Remove access promptly when a person's role ends.
6. Confirm at least two authorized maintainers can administer the service where policy and plan allow.
7. Record who verified membership and when in the private ownership register—never record credentials.

Sanity's plan and available role granularity must be reviewed before expanding the editorial team.

## Security boundaries and secret rotation

- `src/sanity/lib/client.ts` is public, published-only, token-free, and has no write capability.
- Draft reads use a server-only Viewer token with `drafts`, no CDN, and no store.
- Studio uses each invited member's authenticated Sanity session.
- Revalidation uses a dedicated bearer secret shared only by Sanity's webhook and the Cloudflare Worker.
- Write tokens are limited to separately authorized migration operations and never belong in public deployment variables.

If a secret is missing or exposed, revoke/rotate it in the owning service, replace it in every legitimate secret store, promote/redeploy the resulting Worker version when required, and retest only the affected workflow. A revalidation-secret rotation must update both Cloudflare and the Sanity webhook. Never try to reveal an old hidden value.

## Troubleshooting

- **Public provider configuration error:** confirm the three public identifiers and `CONTENT_SOURCE=sanity`; do not add a read token to public reads.
- **Studio cannot edit after sign-in:** confirm project membership and the member's role.
- **CORS/credentials error:** add the exact current origin with credentials; never use a broad wildcard.
- **Hosted Preview points to localhost:** confirm `SANITY_STUDIO_PREVIEW_ORIGIN` for the Studio deployment and redeploy Studio.
- **Presentation cannot connect:** verify the production frontend origin, Draft Mode endpoint, Viewer token, exact CORS origins, and Preview banner/Visual Editing bridge. Reopen Preview to obtain a fresh expiring URL secret.
- **Publish returns 200 in webhook logs but content looks stale:** follow the propagation procedure in `docs/CONTENT_PROVIDER.md`; a delivery response is not page-level proof.
- **Webhook returns 401:** align the revalidation secret in the webhook and current promoted Worker without exposing it.
- **Token-free health check fails while Studio works:** confirm the target and that the production dataset remains public.

## Schema and dataset safety

Schema code does not remove or rename existing Content Lake documents. Before schema removal or dataset cleanup, follow `DATASET_AUDIT_AND_RESET.md`: inspect published and draft records, export first, dry-run a repeatable migration, and apply only with explicit authorization.

Use `npm run sanity:audit-pages` after fixed Publication Settings lifecycle changes. It uses the authenticated CLI user and must not be replaced with a public-only check when draft state matters.

See the [Preview workflow](PREVIEW_WORKFLOW.md), [content provider](CONTENT_PROVIDER.md), [editor handbook](handoff/SBR_EDITOR_HANDBOOK.md), and [recovery notes](handoff/SBR_TECH_STACK_AND_RECOVERY.md) for current operations.
