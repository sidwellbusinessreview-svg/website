# Instructions for future Codex sessions

## Project

This is the Sidwell Business Review Phase 1 website. It uses Next.js App Router, TypeScript, Tailwind CSS v4, ESLint, npm, and a `src` directory.

## Before editing

1. Read `README.md` and `PROJECT_STATUS.md`.
2. Inspect `git status` and preserve unrelated user changes.
3. Keep the publication serious, editorial, accessible, responsive, and restrained.

## Architecture rules

- Keep site-wide identity in `src/config/site.ts`.
- Keep design values centralized in CSS variables in `src/app/globals.css`.
- Keep raw sample data inside `src/content/data.ts`.
- Pages and general components must use the access functions exported by `src/content/index.ts`, not import raw arrays.
- Maintain the typed block model in `src/content/types.ts` when adding article formats.
- Reuse existing components before creating route-specific duplicates.
- Keep `SiteLogo` replaceable so an image logo can be introduced later.

## Scope limits

Do not introduce a CMS, database, authentication, analytics, paid service, or administration interface unless a later phase explicitly requests it. Do not turn the search placeholder into a third-party integration without approval.

## Quality checks

Run both commands before handing off changes and fix all errors:

```bash
npm run lint
npm run build
```

Use semantic HTML, meaningful alt text, keyboard-visible focus states, and sufficient contrast. Avoid flashy motion and decorative effects that weaken the publication tone.
