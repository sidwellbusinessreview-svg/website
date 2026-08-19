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
- Keep Sanity client/schema infrastructure in `src/sanity/`, provider queries/adapters in `src/content/sanity/`, Studio configuration in `sanity.config.ts`, and the embedded Studio at `/studio`.
- Never bypass `src/content/index.ts`. Keep both providers conforming to `ContentProvider`; `CONTENT_SOURCE=local` is a temporary rollback mode and production must use `sanity` after migration acceptance.
- The provider contract contains only Publication Settings, Articles, Contributors, About, Archive, and Search. About is a public projection of Publication Settings, not a separate CMS document. Do not add Issue, Category, Tag, Masthead, biography, or person-image compatibility methods or queries.
- Treat Publication Settings (`siteSettings`) as the durable fixed-ID page. Never expose delete, duplicate, copy, unpublish, or draft-only discard actions for it. Run the authenticated `npm run sanity:audit-pages` after lifecycle changes.
- Public Sanity clients must never include tokens. Draft/read tokens are server-only and must not be imported by client components or `sanity.config.ts`.
- Maintain the typed block model in `src/content/types.ts` when adding article formats.
- Reuse existing components before creating route-specific duplicates.
- Custom array inputs must replace, not coexist with, the default insertion UI. There must be one authoritative creation path. Never persist placeholder array members before explicit confirmation.
- When replacing a custom Studio component, delete the prior implementation and its registration after migration. Do not layer a second control over the default control.
- Keep `SiteLogo` replaceable so an image logo can be introduced later.
- Contributor identity is text-only. The site does not store or display Contributor portraits, avatars, or initials artwork. Article bylines link to text-only Contributor profile pages.
- Contributor records never store publication roles. Current leadership, including Editor-in-Chief, is configured only on the About page through Contributor references; never infer it from Contributor metadata, authorship, graduation year, ordering, or a hard-coded name.
- Do not change Next.js, React, TypeScript, Tailwind, or other framework versions without recording the reason and consequences in `docs/DECISIONS.md`.
- Custom Sanity inputs must treat form values as untrusted partial data. Never assume array members, references, or nested properties are complete. Validate and normalize values before use, and add regression tests for undefined, null, and incomplete values.
- Keep the Article formatting toolbar as one compact row at normal laptop widths. Plain inner DOM elements own flex geometry; do not attach critical flex sizing directly to Sanity `Card` or `Select` wrappers, which may retain stretch behavior.
- Preserve Portable Text list semantics through the Sanity adapter and shared Article renderer: nesting, inline emphasis, and safe links must not be flattened. Keep explicit list-marker styles because Tailwind resets browser defaults.
- Keep Article clipboard classification in `src/sanity/articlePaste.ts`: text-only, PRE-wrapped, and generic DIV/SPAN/BR viewer clipboard data uses the SBR newline-to-paragraph parser. Genuinely structured HTML uses schema-aware Portable Text Block Tools. Do not classify content as rich merely because `text/html` exists, and do not add direct document patches or duplicate paste listeners.
- Keep public cache timing and tags centralized in `src/content/sanity/cache.ts`. New relationship-dependent queries must include the shared `content` tag plus descriptive dependency tags. Do not claim automatic refresh from a server restart; use `npm run sanity:check-cache` for read-only source comparison and test the 300-second fallback separately.
- Preserve Draft Mode isolation. Public Sanity reads use `published`, CDN, no token, and normal cache tags. Preview reads use the server-only Viewer token, `drafts`, `useCdn: false`, and `no-store`. Feed and sitemap must always force published data. Never expose preview credentials through `NEXT_PUBLIC_*`, client props, logs, or browser bundles.
- Keep the preview banner and `VisualEditing` conditional on Draft Mode **and** scoped to public frontend page paths. They must never mount on `/studio`, nested Studio tools, `/api`, feed, sitemap, or robots. Keep draft-client stega pointed at `/studio`. Do not add `SanityLive`, a browser token, or live subscriptions unless a later phase explicitly requests and tests them.
- Preview exit redirects may preserve a public frontend path, but must reject Studio/API/external/protocol-relative destinations and remove preview-secret parameters.
- Treat stega as display metadata, not domain data. Preserve it on visible editorial strings for Presentation, but clean it before schema validation, slug/date/URL handling, comparisons, filtering, and route construction. Use `npm run sanity:diagnose-preview` after preview-provider changes.
- Preview exit must leave the Presentation iframe via top-level navigation. Document that Draft Mode is shared by all localhost tabs in the same browser session and that true public comparison requires a Guest or Private browser.
- Site-wide header, footer, logo, JSON-LD, and root metadata must consume `getSiteSettings()` through the selected provider, not import display values directly from `siteConfig`. `siteConfig` remains the validated fallback and source of non-editorial structural defaults.
- In the CMS adapter, required Article `summary` supplies the domain `dek`; optional `subtitle` must not cause a complete draft-only Article to fail routing. Presentation locations must send Publication Settings to Homepage and `/about`, and Articles to their clean slug routes.

### Schema-removal policy

When removing or renaming a schema type, field, singleton, route, or relationship:

1. Delete obsolete source files and registrations.
2. Audit the raw dataset, including published and `drafts.*` documents.
3. Export the dataset before destructive migration.
4. Add a repeatable migration or cleanup script.
5. Dry-run the migration.
6. Apply it only after explicit approval.
7. Regenerate the extracted schema and TypeGen output.
8. Test that obsolete code and documents are absent.
9. Update documentation and `PROJECT_STATUS.md`.

Changing schema code does not change existing dataset documents. Never overwrite or alias an obsolete schema merely to hide migration problems. A compatibility layer requires an explicit documented reason and removal plan. Never silently cascade-delete published articles.

## Scope limits

Do not introduce a CMS, database, authentication, analytics, paid service, or administration interface unless a later phase explicitly requests it. Do not turn the search placeholder into a third-party integration without approval.

Never commit secrets. Do not add real tokens, passwords, private keys, private identifiers, or populated environment files. Use `.env.example` for documented placeholder names only.

Do not ask users to paste tokens into Codex or print token values. Public project, dataset, and API-version values may be printed by `npm run sanity:check-target` for target alignment. Preserve the safe no-environment Studio setup state. Public-provider checks stay token-free and published-only. Draft-aware local audits must use the signed-in CLI user; CI must use a server-only read token or explicitly run published-only.

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

## Archive migration safety

- Treat `migration-input/` as immutable source evidence. Generate normalized records and reports only in `migration-staging/`.
- Run `npm run sanity:migration:validate` and `npm run sanity:migration:dry-run` before reviewing a migration batch.
- Migration commands are dry-run by default. Never run `sanity:migration:apply` without explicit user authorization, an unblocked batch, the required apply flag, and the documented typed confirmation.
- Create Contributor drafts before Article drafts, preserve source IDs and byline order, and never overwrite a published document.
- Never invent missing authors, exact publication days, citations, endings, image rights, captions, credits, or alt text.
- Article dates use canonical `publicationMonth` (`YYYY-MM`) and the shared Month Year formatter. Never invent or expose a day, precision selector, or sorting anchor. Legacy `publicationDate` is read-only transitional input until deliberately migrated.
- Keep unique Article Sources in the structured `sources` array. Portable Text footnotes store only a stable source key; every body use becomes a separate reader-facing Note occurrence numbered from reading order. Editors never type public numbers, expose internal keys, or add a Notes heading. Published validation rejects broken references, while Preview preserves broken occurrences safely.
- Use the shared citation-occurrence traversal for paragraph, Block quote, list, and Callout citations. Repeated Source use receives a new sequential Note number; Source-array reordering never changes public numbering. Pull Quote and legacy Phase 14C annotation compatibility remain removed after read-only zero-use audits.
- Studio footnote previews must derive their live number from that shared traversal; never restore a neutral placeholder or infer the number from Source-array position. Keep hover text brief and the click editor wide enough for a readable wrapping citation. Public Notes stay collapsed by default, but exact note hashes must open them and print must expose all Notes.
- Preserve the compact icon-based Article-body toolbar and its supported editor API boundary. Paragraph types belong in one labelled style selector; common marks, lists, Footnote, Image, and Callout remain visible icons with tooltips. Do not reintroduce word-heavy buttons, a hidden primary formatting path, unsupported blocks, or DOM selectors against Sanity internals. Keep actions selection-safe and retain normal undo/redo.
- Keep Article typography and vertical rhythm centralized in `src/app/globals.css`. Editors never receive per-Article font, size, color, alignment, or spacing controls.
- Keep `publicationMonth` stored as canonical `YYYY-MM`, but expose it through the friendly Month/Year Studio input. Never require editors to type the storage syntax.
- Public summaries contain content descriptions only. Migration/editorial status stays in internal reports, and summary approval is valid only for the current checksum.
- Never run migration apply or rollback apply without explicit user authorization and a verified target-matching dataset export.
