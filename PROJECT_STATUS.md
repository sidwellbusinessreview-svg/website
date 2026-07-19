# Project status

## Phase 11H final text-only Contributor identity

- **Completed:** July 19, 2026
- Finalized the project-wide rule that Contributor identity is text-only. Removed local initials data/schema support, the public Contributor identity component, About initials shapes, the Article-body Contributor sidebar, and every About portrait/portrait-alt schema, Studio, type, validation, and upload path.
- Article pages now contain one identity location: the linked byline under the headline, in explicit byline order. Contributor profiles use a compact name/role/year header followed immediately by “Articles by …”. About staff uses linked text cards with role/year metadata and a clear absent-adviser state.
- Preserved optional Article featured/inline images, publication logo assets, editorial image validation, and intentional image-free Article layouts.
- Extended guarded obsolete-field cleanup to dry-run nested About portrait fields without deleting assets. No dataset content was mutated, deleted, reset, or published.
- The authenticated production dry run found no obsolete Contributor photo or About portrait fields, so no document cleanup is required. One unreferenced image asset remains informational and was not deleted or assumed to be a former staff portrait.

### Phase 11H follow-up

- Complete the authenticated Studio selector check after sign-in. Public visual and browser checks are automated; Phase 12 remains intentionally unstarted.

## Phase 11G authoritative Contributor editing

- **Completed:** July 19, 2026
- Replaced the wrapped Sanity Contributor array with one authoritative custom Article byline input. It never calls `renderDefault`, exposes exactly one **Add contributors** path, and has explicit open, remove, and reorder controls without avatars or generic item menus.
- Added a shared searchable confirmation modal showing name, role, graduation year, active/already-added state, temporary multi-selection, and selected count. Cancel, X, Escape, and outside click do not patch; confirmation creates only complete, uniquely keyed references and blocks duplicates.
- Applied the same custom interaction to Editors-in-Chief, Editors, and Faculty Adviser. Phase 11H subsequently removed all portrait fields while preserving selection and displayed-role behavior.
- Replaced the raw reassignment select with the shared searchable single-contributor picker and retained the separate destructive final confirmation.
- Kept malformed-entry repair explicit and targeted. The dataset audit and repair plan remain dry-run-only; no record was automatically mutated, published, reset, or deleted.
- Added focused pure and rendered-input regression tests and updated editor, workflow, testing, audit, and future-agent instructions.

### Phase 11G follow-up

- Complete the authenticated focused Studio test: Article and all three About selectors, modal cancellation paths, byline ordering, reassignment, narrow panes, and browser console.
- Phase 12 remains intentionally unstarted and public routes still use local content through the provider boundary.

## Phase 11F Contributor selector and Article browsing

- **Completed:** July 18, 2026
- Fixed the Contributor selector crash by treating every form value and array member as untrusted partial data before reading or normalizing a reference.
- Added field-level incomplete-selection warnings and targeted invalid-entry removal without touching valid selections.
- Confirmed selections now use `setIfMissing` plus an append-position insert in one `PatchEvent`; Cancel and X emit no patches, duplicates are prevented after draft/published ID normalization, and valid order is preserved.
- Expanded Article panes with editorial metadata, optional thumbnails, image-free layouts, exact state badges, pinned badges, counts, search, four sort modes, loading/empty/error states, Retry, and New article controls.
- Added explicit New contributor controls to Active, Archived, and All Contributor panes.
- Explicitly disabled Sanity Releases so Structure remains the only Studio tool.
- Added read-only malformed-Contributor auditing and a dry-run repair report. No dataset content was reset, repaired, deleted, or published.
- The authenticated raw audit found no persisted incomplete Contributor selections in either draft or published Articles. The observed crash therefore came from a temporary incomplete Studio form value, not stored Article data; the generated repair plan was empty.
- Added regression coverage for the observed `[undefined]` crash plus null, empty, incomplete, draft-prefixed, duplicate, mixed, add, cancel, remove, and reorder behavior.

### Phase 11F follow-up

- Complete the authenticated manual Studio sequence documented in the Phase 11F handoff, including selector X/Cancel, duplicate prevention, every Article pane’s search/sort behavior, creation buttons, narrow widths, and browser console review.
- Apply no persisted-data repair without reviewing the generated dry-run report and receiving explicit approval.
- Phase 12 remains intentionally unstarted; public pages still use local content through the provider boundary.

## Phase 11E editorial UI and schema simplification

- **Completed:** July 18, 2026
- Rebuilt permanent deletion and unpublishing confirmations with centered Sanity UI dialogs, explicit cancellation, destructive labels, loading/error states, and a final contributor-reassignment confirmation.
- Contributor reassignment preserves byline order, removes duplicates, patches draft/published references, rechecks incoming references, and deletes only after resolution.
- Added polished Studio article-state and incoming-reference cards, contributor availability badges, exact `Published with unpublished changes` wording, and direct New article creation.
- Reduced Contributor to name, slug, role, graduation year, and active state; removed the legacy photo field and kept biography absent.
- Split About staff entries by role. Phase 11H subsequently removed the temporary Editor-in-Chief portrait fields.
- Made article featured images optional and made public article/card/metadata rendering safe when they are absent.
- Added JPEG/PNG/WebP schema validation by MIME type and filename extension; PDFs, SVGs, GIFs, and mismatched extensions are rejected.
- Simplified article summary, Site Settings description, homepage tagline, and logo fallback behavior.
- Added a guarded, dry-run-first obsolete-field cleanup command; no current test content was reset or deleted.
- Read-only production-dataset audit found 3 retained test documents and no legacy types, dangling references, obsolete fields, or orphaned assets; the obsolete-field cleanup dry run planned zero changes.
- Redesigned public contributor headers and About staff cards without contributor photos or biographies.

### Phase 11E follow-up

- Manually verify all Studio dialogs, Escape/X cancellation, contributor selection, status badges, media rejection, and narrow-width behavior using an authenticated editor session.
- Studio loaded the configured project and displayed Sanity authentication, but the verification browser was not signed in; authenticated editor interactions were therefore not exercised by Codex.
- Review the obsolete-field dry-run report before any authenticated cleanup apply operation.
- Phase 12 remains intentionally unstarted; public pages still use local content through the provider boundary.

## Phase 11D deletion safety and legacy removal

- **Completed:** July 17, 2026
- Confirmed the registered Sanity documents are only Article, Contributor, About (`staticPage`), and Site Settings; obsolete editorial schema types remain physically absent.
- Added raw dataset auditing, export-gated legacy cleanup, and development editorial-reset commands. Cleanup/reset are dry-run by default, preserve assets, require exact targets and typed confirmations to apply, and write ignored timestamped reports.
- Added active/archived Contributor lifecycle, filtered selection, live incoming-reference presentation, reference-aware Contributor deletion/reassignment, and explicit draft/published Article deletion actions.
- Added the permanent schema-removal policy and documented every remaining reference relationship.
- Public routes remain on local content; no destructive command was applied.

## Phase 11C editorial state and About consolidation

- **Completed:** July 17, 2026
- Article lists and badges now distinguish Draft only, Published, and Published with changes from the actual raw draft/published document pair; Pinned remains a separate filter.
- Article actions use Publish, Publish changes, Discard unpublished changes, and confirmation-protected Unpublish article. Duplicate is removed for Articles, Contributors, About, and Site Settings.
- Consolidated Editors-in-Chief, Editors, and Faculty Adviser into About and retired the Masthead schema, Studio item, public route, navigation, footer link, and sitemap entry.
- Removed Contributor biography data and presentation; profile headers now use a restrained responsive layout.
- Public article content remains on the local provider. No CMS package, secret, dataset record, or public provider behavior changed.

### Phase 11C follow-up

- Authenticated Studio verification is still required to exercise every action against a safe development-dataset test record and inspect unseen legacy drafts.
- Export and review any legacy Masthead, author, or article drafts before migration or deletion. The anonymous published query found no editorial document requiring automatic migration.
- Phase 12 remains responsible for the Sanity adapter and provider parity; it must not bypass the content-access boundary.

## Phase 11B simplified editor model

- **Completed:** July 17, 2026
- **Historical note:** Phase 11C supersedes the separate Masthead and biography-related presentation described in this section.
- Replaced the CMS Author concept with Contributor; only name and slug are required, while role and graduation year are optional. Phase 11H made identity permanently text-only.
- Added a separate singleton Masthead with Editors-in-Chief, Editors, and Faculty Adviser sections.
- Simplified articles to date-only publication, contributor references, separate featured-image metadata, structured body, homepage placement, and optional advanced SEO overrides.
- Removed issue, category, and tag schemas, article fields, Studio sections, public issue routes, discovery filters, and homepage issue module.
- Simplified Studio navigation and removed Vision; Studio now renders without public site chrome.
- Preserved `/authors/[slug]`, local `authorSlugs`, and compatibility access aliases while introducing contributor-first APIs and an explicit future Sanity adapter.
- The published dataset inspection found one image asset and no editorial documents. No dataset content was deleted or mutated; authenticated draft inspection remains a manual requirement.

### Phase 11B follow-up

- Before Phase 12, inspect authenticated drafts and migrate any legacy author/article/issue/category/tag records after export. Datetime-to-date conversion needs timezone review.
- Phase 12 must implement GROQ projections and the Sanity-domain adapter; public pages remain on local content.
- Consider a simple optional section or edition label only after editors demonstrate a real discovery need.

## Phase 11 Sanity editor model

- **Completed:** July 17, 2026
- Added production schemas for site settings, authors, issues, categories, tags, articles, controlled static pages, SEO, editorial images, links, pull quotes, callouts, dividers, and Portable Text.
- Added grouped editor fields, required/conditional validation, character guidance, slug generation, image metadata rules, article preview preparation, lifecycle ordering, and targeted schema tests.
- Organized Studio into editorial sections and useful article/issue filters, with one fixed Site Settings document and guarded singleton creation/deletion actions.
- Added Sanity schema extraction and TypeGen scripts, checked-in generated schema/types, and an explicit generated-record-to-domain adapter contract.
- Documented the editor model, draft workflow, image/link policy, safe manual development seeding, and screenshot placeholders in `docs/CMS_EDITOR_MODEL.md`.
- Public routes remain on validated local content; no CMS provider cutover or public behavior change occurred.

### Phase 11 follow-up

- Phase 12 must add GROQ projections and implement/test the adapter contract before enabling Sanity reads.
- Dataset-wide rules such as exactly one pinned lead and one current issue require query-aware validation or publishing workflow checks in a later phase.
- Replace documentation screenshot placeholders after editor training content and approved records exist.
- Real content, student profiles, accounts, and production publication remain subject to the school approval and ownership gates recorded in the CMS decision.

## Phase 10 Sanity foundation

- **Completed:** July 17, 2026
- Added current Sanity 6 and `next-sanity` 13 dependencies compatible with Next.js 16, React 19, and Node 24.
- Embedded the Sanity Studio shell at `/studio` using the official App Router optional catch-all pattern, Sanity authentication, static route generation, noindex metadata, and an explicit robots exclusion.
- Added all-or-none public environment validation. Missing variables preserve local-content mode and show setup guidance; partial or malformed configuration fails clearly.
- Added a published, CDN-backed public Sanity client with no token or write capability, plus `npm run sanity:check` for manual token-free connectivity testing.
- Added the Studio/CLI configuration, an empty deliberate schema registration point, setup documentation, configuration/client tests, and a browser test for the unconfigured Studio route.
- Public routes and the content-access provider remain unchanged and use local data.
- Corrected the embedded Studio environment bridge so Next.js statically inlines each `NEXT_PUBLIC_SANITY_*` value into the client configuration; removed the `setuprequired` placeholder path and verified `/studio` plus nested Studio routes with the configured local project.

### Phase 10 risks and follow-up

- An ignored `.env.local` now supplies the approved public Sanity configuration, and the live Studio reaches that project. CORS approval, project membership, and authentication remain human-administered steps in `docs/SANITY_SETUP.md`.
- The schema registry is intentionally empty. Phase 11 must implement contract-aligned schemas, GROQ projections, provider adapters, validation, caching/revalidation, and parity tests before any public content cutover.
- Embedded Studio replaces Phase 09's separate-Studio hosting detail; ADR-012 records the narrowed architecture change.
- Dependency installation reports 15 moderate advisories and deprecated transitive UUID releases. The audit's proposed fixes include incompatible downgrades of current Next/Sanity integrations, so no automatic fix was applied; review upstream releases without using `npm audit fix --force`.

## Phase 09 CMS decision and implementation design

- **Completed:** July 17, 2026
- Selected Sanity Studio plus Sanity Content Lake after a requirements-weighted comparison with Payload and Decap.
- Recorded the complete architecture, content and Portable Text mappings, access model, environment/secret boundaries, migration, rollback/export plan, costs, acceptance gates, and exact Phases 10–14 in `docs/CMS_DECISION.md`.
- Confirmed that the public application will keep its provider-independent content-access boundary; a Sanity adapter will map and validate records before routes receive them.
- Chose a separately deployed Studio whose source will live in this repository, two public datasets (`development` and `production`), authenticated Draft Mode, Sanity image delivery, and verified webhook-driven revalidation.
- Added ADR-011 as the final CMS architecture decision. Phase 09 added no packages, secrets, CMS project, or frontend behavior.

### Phase 09 gates and risks

- School approval for Sanity, public published content, student bylines/biographies, data ownership, and retention must be recorded before Phase 10 credentials or real content.
- Confirm the current plan, seat count, and role requirements. The free plan's limited role granularity may require a small trusted Admin group or an approved paid plan; shared credentials are prohibited.
- Record the publication Gmail owner/recovery setup and invited administrators outside the repository, then test account handoff.
- Verify a dataset export and restore into a disposable dataset before production cutover.
- Local content remains authoritative until provider parity and pilot acceptance. Production must never silently fall back to stale sample content.

## Phase 08 accessibility, performance, and resilience audit

- **Completed:** July 17, 2026
- Expanded axe coverage from two routes to homepage, article, search, issue, author, About, Masthead, and archive pages; all automated WCAG A/AA checks pass.
- Added a native keyboard-accessible mobile navigation menu without adding a client-side menu bundle.
- Added the missing homepage level-one heading and corrected nested article and issue card heading levels while preserving their visual styling.
- Added search-result status announcements, explicit new-tab link announcements, and safe `noopener noreferrer` behavior.
- Added global accessible loading and error boundaries; public errors expose no provider message or stack trace.
- Added tests for keyboard mobile navigation, non-empty image alternatives, external-link safety, loading announcements, and safe error recovery.
- Migrated likely LCP images from deprecated Next.js `priority` to the Next.js 16 `preload` API while retaining lazy loading below the fold.
- Added `docs/ACCESSIBILITY.md` and `docs/PERFORMANCE.md` with author, developer, manual-test, image, bundle, and regression guidance.

### Phase 08 audit results and limits

- Automated checks pass, but manual VoiceOver/NVDA, forced-colors, zoom/reflow, speech-input, real-device, and editorial alt-text quality review remain required before launch.
- Lighthouse is not installed; the equivalent local production audit used build/route output, chunk inspection, console errors, image loading, and layout-shift entries without adding dependencies or manipulating tests.
- The local provider cannot simulate real CMS downtime. The global boundary is ready to catch provider failures, while provider-specific caching, logging, and retry policy remains for the CMS phase.
- Prototype images remain hosted by Unsplash; production performance and resilience require rights-cleared publication-controlled assets.

## Phase 07 search, archive, and discovery

- **Completed:** July 16, 2026
- Replaced the search placeholder with case-insensitive weighted search across titles, summaries, authors, categories, tags, issues, and structured body text.
- Kept search behind the content-access layer and excluded drafts from all public results.
- Added `/archive` with combinable school-year, issue, category, and author filters, stable newest-first ordering, URL-reflected state, and empty states.
- Added article tags to the validated local contract and sample content.
- Hardened homepage lead fallback, deterministic secondary order, current-issue labeling, archive links, and no-content behavior.
- Distinguished current and past issues and added issue/author empty states.
- Added configurable canonical URLs, Open Graph and social metadata, article metadata, organization/article/breadcrumb JSON-LD, `robots.txt`, `sitemap.xml`, and RSS at `/feed.xml`.
- Added automated search, archive, metadata, sitemap, RSS, and browser-route coverage.
- Added `docs/SEO_AND_DISCOVERY.md` and updated the route contract and architecture decisions.

### Phase 07 limits and follow-up

- Search ranking is intentionally simple and local; a CMS or hosted index may replace it behind `searchArticles`.
- Dedicated category and tag landing pages remain future work; archive query filters provide stable discovery now.
- Pagination is not needed for the expected 30–50 article launch archive and should be added only when content volume justifies it.
- The final production origin and social preview image remain deployment/brand decisions.

## Phase 06 design-system audit

- **Completed:** July 16, 2026
- Expanded the centralized site configuration with affiliation, structured contact data, social placeholders, logo mode, image metadata, and a text-wordmark fallback.
- Refined `SiteLogo` into a reusable text/image API supporting horizontal or square assets without changing the current text wordmark.
- Expanded global design tokens for color, typography, line height, spacing, widths, borders, shadows, radii, and touch targets.
- Improved long-headline, long-name, navigation, form-control, article-card, logo, footer, and 320-pixel layout resilience.
- Added minimal article print styling that removes site chrome while retaining title, metadata, body, images, captions, credits, links, and article-path context.
- Expanded browser coverage across 320, 375, 768, 1024, and 1440 pixels, plus print behavior and targeted desktop/mobile screenshots.
- Added `docs/BRANDING.md` for publication text, logo, color, font, spacing, and testing updates.

### Design problems found and addressed

- Branding configuration lacked affiliation, social placeholders, and a future image-logo contract.
- The original wordmark API assumed text and did not constrain square or horizontal image dimensions.
- Repeated visual values remained outside the token system.
- Navigation and controls did not consistently guarantee recommended touch-target height.
- The smallest breakpoint began at 650 pixels and did not explicitly protect 320-pixel layouts.
- Long headlines and names needed stronger wrapping safeguards.
- Article print output included site navigation and lacked URL context.
- Responsive browser coverage checked only one mobile width and did not preserve visual artifacts.

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
- Refine active/alumni state and staff display ordering only if editorial need emerges; Contributor portraits are permanently out of scope.
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
- Search and archive discovery use public local content through provider-independent access functions.

## Remaining for later phases

- Final brand identity, official logo, and selected typefaces
- Real editorial content, photography permissions, and publication workflow
- CMS selection and migration adapter
- CMS-backed or hosted search only if local ranking no longer meets archive scale
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
