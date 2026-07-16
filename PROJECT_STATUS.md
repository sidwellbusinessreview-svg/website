# Project status

## Phase 05 local content validation

- **Completed:** July 16, 2026
- Added Zod runtime schemas for site settings, articles, authors, issues, categories, images, and every current structured body block.
- TypeScript domain types are inferred from the runtime schemas and re-exported through the existing content boundary.
- Added cross-document validation for duplicate slugs, missing references, dates, required fields, alt text, invalid featured ranks, and multiple published lead articles.
- Added explicit `draft` and `published` article status handling; public access functions exclude drafts.
- Added deterministic publication-date and slug sorting, ranked pinned selection, and ordered issue filtering.
- Added `npm run validate:content` and included it in `npm run verify`.
- Added content-validation fixtures covering every valid block, every current relationship class, long headlines, multiple authors, optional values, missing values, drafts, pinned rank behavior, and same-date ordering.
- Unknown renderer blocks now warn in development and render nothing in production; raw untrusted HTML is never rendered.
- Added `docs/CONTENT_AUTHORING_RULES.md` and documented actual validation in `docs/CONTENT_MODEL.md`.

### Validation boundaries and deferred work

- The local model still uses slug references and embedded image URLs; stable IDs and reusable CMS assets remain future migration work.
- Categories are now validated records, but public category filtering and routes remain deferred.
- Current local articles all default to `published` unless explicitly marked `draft`; the CMS will require broader review and scheduled states.
- Current rules allow exactly one published pinned lead. Expanding homepage placements requires a documented rule and validator change.

## Phase 04 automated tests and CI

- **Completed:** July 16, 2026
- Added Vitest with V8 coverage and Testing Library for content and focused React tests.
- Added Playwright with Chromium browser coverage and `@axe-core/playwright` accessibility assertions.
- Added unit coverage for content lookup, ordering, filtering, pinned-lead selection, empty/invalid results, and duplicate slug detection.
- Added renderer coverage for every current structured body block, optional image metadata, multiple authors, missing optional subtitle behavior, and explicit unknown-block failure.
- Added end-to-end coverage for public routes, primary navigation, custom 404 behavior, mobile overflow, keyboard skip navigation, and axe scans.
- Added GitHub Actions checks for pull requests and pushes to `main`, using Node from `.nvmrc`, `npm ci`, fast checks, production build, Chromium tests, and failure artifacts.
- Added `npm run verify` as the single fast blocking command; full browser tests remain separate because they download/start a browser and server.
- Added `TESTING.md` and updated `AGENTS.md` with required future verification behavior.
- Corrected the homepage dark-section accent contrast after the axe baseline identified a WCAG AA failure.

### Testing notes

- The testing packages were selected against Node 24 and React 19 compatibility rather than copied from older Next.js examples.
- `selectLeadArticle`, `findDuplicateSlugs`, and `getArticlesByCategory` are small pure/provider utilities added to make existing editorial behavior directly testable.
- Unknown article body blocks now throw an explicit error instead of failing ambiguously.
- Browser tests currently target Chromium with one worker against a production build. Concurrent Next.js development-mode compilation produced unreliable manifest errors during the initial browser run.
- Additional browser engines can be added after the baseline suite proves stable in CI.

## Phase 03 product and content contract

- **Completed:** July 16, 2026
- Added `docs/PRODUCT_REQUIREMENTS.md` covering audience, workflow, roles, launch/future scope, page requirements, editorial rules, accessibility, security, CMS, handoff, and definition of done.
- Added `docs/CONTENT_MODEL.md` as a framework-independent contract for settings, articles, authors, issues, categories, tags, static pages, image assets, and structured body blocks.
- Added `docs/ROUTE_CONTRACT.md` mapping every current public route to content-access functions and expected empty, loading, error, not-found, and metadata behavior.
- Recorded the provider-independent contract and adapter boundary in ADR-009.
- No routes, reusable components, sample data, visual behavior, dependency versions, or TypeScript runtime contracts changed.

### Deferred contract mismatches

- Add stable IDs and provider-to-domain mapping for every content entity.
- Separate article subtitle and summary; migrate the current `dek`.
- Make issue association optional and resolve authors, issues, categories, and tags through references.
- Add category and tag entities plus functional category filtering and future taxonomy routes.
- Add article status, updated date, featured rank, SEO overrides, and timezone-aware publication timestamps.
- Filter all public access functions to published, eligible content before CMS launch.
- Replace embedded image URLs with reusable image assets, dimensions, rights notes, and contextual alt/caption/credit data.
- Add author portraits, active/alumni state, and masthead display ordering.
- Add issue publication status/date, controlled accent tokens, and optional cover assets.
- Decide whether About and Masthead become CMS-managed static pages.
- Add stable body-block IDs and safe rich-text marks.
- Add accessible table or chart-image support only when a real editorial need exists.
- Add explicit empty states and provider-backed loading/error boundaries.
- Remove the homepage’s hardcoded season label and make low-content homepage behavior safe.
- Implement actual category-query behavior; current `/latest?category=...` links do not filter.
- Add canonical, social, article, update-date, and SEO override metadata.

## Phase 02 governance

- **Completed:** July 16, 2026
- Added a Node 24 development pin after confirming Next.js requires Node 20.9+ and the successful baseline environment uses Node 24.14.0.
- Added safe environment-variable documentation for planned Sanity, preview, revalidation, and canonical-site settings. These variables are unused until later phases.
- Expanded ignore rules for secrets, build output, coverage, Playwright artifacts, generated test output, and operating-system files.
- Added security reporting, contribution workflow, architecture decisions, and service-account ownership documentation.
- Added `npm run typecheck` and made lint, typecheck, and production build the required verification set.
- No dependency versions, routes, application components, content behavior, or visual styles changed.

### Current governance risks

- The publication Gmail administrative address, recovery setup, and named account owners must be recorded outside this public repository.
- Preview and production hosting are not configured yet.
- Planned CMS variables are placeholders only; no CMS is connected.
- The existing moderate transitive PostCSS advisories remain under review. Do not use `npm audit fix --force`.

## Baseline verification

- **Verified:** July 16, 2026
- **Result:** Automated baseline passed. The lockfile installs cleanly, lint and production build pass, the development server starts normally, all implemented routes respond correctly, custom not-found behavior works, and all sample image URLs respond after replacing one dead Unsplash reference.
- **Manual follow-up:** Complete the visual, responsive, keyboard, and browser-console checks listed in `docs/BASELINE_REPORT.md` before beginning Phase 02.

## Complete in Phase 1

- Next.js 16.2.10 foundation using App Router, TypeScript, Tailwind CSS v4, ESLint, npm, and `src/`
- Responsive homepage and all requested public routes
- Latest-article archive and long-form article pages
- Issue archive and individual issue pages
- Author directory and individual author pages
- About, masthead, search-ready placeholder, and custom not-found page
- Typed local sample data for six articles, two issues, four authors, and six categories
- Pinned lead story, co-authored story, long story, multi-image story, pull quote, callout, and long-headline examples
- Structured article blocks for paragraphs, headings, bulleted and numbered lists, quotes, pull quotes, images, captions, credits, callouts, dividers, and links
- Content-access layer that separates page code from raw content
- Reusable editorial components and centralized site/design configuration
- Beginner-friendly project documentation

## Major architecture decisions

- The content layer is asynchronous even though data is local. A future CMS adapter can preserve the same page-facing API.
- Article bodies use a typed discriminated union instead of embedded JSX or raw HTML.
- Global design variables control color, type, spacing, and content widths.
- `SiteLogo` is a text wordmark component today and is isolated for a later image-logo replacement.
- Remote Unsplash sample photographs are configured through Next Image; production editorial assets should eventually be owned and stored by the publication.
- Search remains nonfunctional by design in Phase 1.

## Remaining for later phases

- Final brand identity, official logo, and selected typefaces
- Real editorial content, photography permissions, and publication workflow
- CMS selection and migration adapter
- Functional full-text search
- Newsletter or submission workflows
- Analytics and privacy decisions
- Domain, deployment, social previews, sitemap review, and launch QA
- Accessibility audit with real content and devices

## Open decisions

- Whether issues will remain curated collections or map to print/PDF editions
- Whether categories need dedicated landing pages
- Who owns corrections, revisions, and publication approval
- Whether author profiles remain after graduation
- Which search and hosting services best fit school policy
