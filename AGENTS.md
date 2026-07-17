# Instructions for future Codex sessions

## Project

This is the Sidwell Business Review Phase 1 website. It uses Next.js App Router, TypeScript, Tailwind CSS v4, ESLint, npm, and a `src` directory.

## Before editing

1. Confirm the repository path, inspect the current branch and `git status`, and preserve unrelated user changes.
2. Read `README.md`, `PROJECT_STATUS.md`, `docs/DECISIONS.md`, and task-relevant documentation before editing.
3. Inspect the relevant routes, components, content types, and existing patterns before proposing or implementing changes.
4. Keep the publication serious, editorial, accessible, responsive, and restrained.

## Architecture rules

- Keep site-wide identity in `src/config/site.ts`.
- Keep design values centralized in CSS variables in `src/app/globals.css`.
- Keep raw sample data inside `src/content/data.ts`.
- Preserve the content-provider boundary: pages and general components must use the access functions exported by `src/content/index.ts`, not import raw arrays or couple themselves directly to a future CMS.
- Keep Sanity integration code in `src/sanity/`, Studio configuration in `sanity.config.ts`, and the embedded Studio at `/studio`. Public routes must remain on the local provider until the documented provider cutover phase.
- Public Sanity clients must never include tokens. Draft/read tokens are server-only and must not be imported by client components or `sanity.config.ts`.
- Maintain the typed block model in `src/content/types.ts` when adding article formats.
- Reuse existing components before creating route-specific duplicates.
- Keep `SiteLogo` replaceable so an image logo can be introduced later.
- Do not change Next.js, React, TypeScript, Tailwind, or other framework versions without recording the reason and consequences in `docs/DECISIONS.md`.

## Scope limits

Do not introduce a CMS, database, authentication, analytics, paid service, or administration interface unless a later phase explicitly requests it. Do not turn the search placeholder into a third-party integration without approval.

Never commit secrets. Do not add real tokens, passwords, private keys, private identifiers, or populated environment files. Use `.env.example` for documented placeholder names only.

Do not ask users to paste tokens into Codex or print environment values. Check only whether required variables are present. Preserve the safe no-environment Studio setup state and run `npm run sanity:check` only when approved local public variables are available.

Do not run `npm audit fix --force`. Review advisories and proposed dependency changes deliberately.

## Quality checks

Run the fast verification command before handing off code or configuration changes and fix all errors:

```bash
npm run verify
```

Run `npm run test:e2e` for changes affecting routes, navigation, layout, rendering, accessibility, interactive behavior, or browser configuration. Run focused browser tests when the full suite is unnecessary, but report exactly what was omitted.

Use semantic HTML, meaningful alt text, keyboard-visible focus states, and sufficient contrast. Avoid flashy motion and decorative effects that weaken the publication tone.

Before completion:

- Update `PROJECT_STATUS.md` with completed work, remaining work, and important decisions or risks.
- Report every changed file.
- Report unresolved warnings, security concerns, manual checks, and architecture risks.
- Do not commit unless the user explicitly asks.
