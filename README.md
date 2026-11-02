# Sidwell Business Review

The production website for the Sidwell Business Review, a student-run business publication at Sidwell Friends School.

- Public site: <https://website.sidwellbusinessreview.workers.dev/>
- Editorial Studio: <https://sidwell-business-review.sanity.studio/>
- Repository: `sidwellbusinessreview-svg/website`
- Production branch: `main`

The public application uses Next.js 16, React 19, TypeScript, Tailwind CSS v4, Sanity Content Lake, and Cloudflare Workers/OpenNext. Sanity Studio is hosted separately and is not exposed at `/studio` on the public site.

## Local development

Use Node.js 24 from `.nvmrc`:

```bash
nvm install
nvm use
npm ci
npm run dev
```

Open <http://localhost:3000>. With no explicit provider setting, local development uses the validated local fixture provider. To test published production content, copy `.env.example` to `.env.local`, configure the documented public Sanity values, and set `CONTENT_SOURCE=sanity`. Never commit `.env.local` or any secret.

Run standalone Studio in a second terminal:

```bash
npm run studio:dev
```

Studio normally opens at <http://localhost:3333>. Draft Preview additionally requires the documented server-only Viewer token and preview secret. See [Sanity setup](docs/SANITY_SETUP.md), [content providers](docs/CONTENT_PROVIDER.md), and [Preview workflow](docs/PREVIEW_WORKFLOW.md).

## Publishing and deployment

Editors publish routine content in the hosted Sanity Studio. Publishing does not require a website deployment. A secret-authenticated Sanity webhook asks the public application to invalidate its shared content cache; public reads also have a 300-second revalidation backstop. A successful webhook response proves delivery and invalidation-request acceptance, not that a particular page already displays the new content. The [Editor handbook](docs/handoff/SBR_EDITOR_HANDBOOK.md) and [maintenance checklist](docs/handoff/SBR_LAUNCH_AND_MAINTENANCE_CHECKLIST.md) contain the operational procedure.

Code and Studio-schema changes go through a reviewed branch and pull request. Cloudflare builds production from `main`; do not deploy or promote changes without the publication's approval. The hosted Studio is deployed separately with `npm run studio:deploy` when its source changes.

## Useful commands

```bash
npm run verify                 # lint, types, content validation, unit tests, build
npm run test:e2e               # local-provider browser coverage
npm run studio:build           # standalone Studio production build
npm run sanity:check           # token-free Sanity connectivity
npm run sanity:check-provider  # published provider diagnostic
npm run sanity:check-cache     # read-only origin/CDN/provider comparison
```

Use `npm run test:e2e:sanity` only with the documented public Sanity configuration and current fixture expectations. Authenticated audit and migration commands have stricter prerequisites; read their documentation before running them.

## Architecture map

- `src/app/`: public routes, metadata, sitemap, robots, feed, and API endpoints.
- `src/components/`: reusable publication UI and Article rendering.
- `src/content/`: provider-independent contract, local fixtures, and Sanity provider/adapters.
- `src/sanity/`: schemas, Studio controls, diagnostics, and target validation.
- `src/config/site.ts`: validated fallback identity and structural defaults.
- `src/app/globals.css`: centralized design tokens and Article typography.
- `sanity.config.ts`: standalone Studio configuration.
- `docs/handoff/`: editor, administrator, maintenance, and recovery guidance.

Public pages and general components must use the access functions from `src/content/index.ts`; they must not import raw fixture arrays or Sanity records. Production uses `CONTENT_SOURCE=sanity`. `CONTENT_SOURCE=local` remains an explicit, temporary recovery mode and is never an automatic fallback after Sanity has been selected.

## Security and recovery

Never commit or print tokens, passwords, recovery codes, or populated environment files. Store service ownership and recovery details in the publication's approved private register, not in this public repository. Start with the [handoff package](docs/handoff/README_FIRST.md), [technical recovery notes](docs/handoff/SBR_TECH_STACK_AND_RECOVERY.md), [account-ownership template](docs/ACCOUNT_OWNERSHIP_TEMPLATE.md), and [security policy](SECURITY.md).
