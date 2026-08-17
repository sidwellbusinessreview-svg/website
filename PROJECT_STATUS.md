# Project status

## Phase 14 archive migration intake

- **Intake complete; guarded pilot preparation underway:** August 5, 2026. Phase 13 is committed and Phase 15 has not begun.
- Received and validated eight unique source Articles in the supplied migration-preparation bundle. No source Article, Contributor, or asset has been imported, created, patched, deleted, restored, or published in Sanity.
- Added one source-evidence-first staging workflow with immutable input, stable source IDs, normalized structured bodies, checksums, proposed summaries requiring editorial review, review reports, a blocked pilot manifest, and rollback mappings.
- Article publication date is now permanently month-only: canonical `publicationMonth` stores `YYYY-MM`, editors never enter an exact day, and readers see Month Year. Legacy `publicationDate` is a transitional read fallback and is reported by the content audit without remote mutation.
- Article sources are structured separately from the body. Source-key references render as automatically numbered superscript footnotes with source anchors and accessible backlinks; editors do not type citation numbers or a Sources heading.
- **Phase 14D editor UX refinement implemented:** `publicationMonth` remains canonical `YYYY-MM` internally, while editors choose a named Month and four-digit Year. New footnotes are inline Portable Text objects inserted at the cursor without selecting text; the selector shows Source lookup text and stores only the source key. Sources remain structured separately. Phase 14C annotation compatibility was later removed in Phase 14I after a zero-use audit.
- **Phase 14E final Article-authoring hardening implemented:** Pull Quotes and Callouts can cite the same Article Sources as paragraph and list footnotes; selectors show generated Source numbers; validation uses editor-readable broken-reference, URL, slug, month, duplicate, and unused-Source guidance. Normal references remain caret-inserted without text selection, and the Month/Year control remains editor-friendly.
- **Phase 14F Article typography polish implemented:** new quotation authoring uses Portable Text **Block quote** rather than the deprecated Pull Quote object. The Article body width, reading size, line height, headings, lists, quotes, Callouts, images, footnotes, Sources, and transition from metadata now use one controlled vertical-rhythm system. Existing Pull Quote records remain render-compatible.
- **Phase 14G Article-editor usability refinement implemented:** Article body authoring now uses one visible, constrained Google Docs-like toolbar for Text, Section, Subheading, Quote, Bold, Italic, Link, lists, Footnote, Image, and Callout. Core formatting no longer depends on discovering hidden style or insertion menus; Quote is a normal Portable Text block style and citations use the visible Footnote action. Sources remain structured in numbered cards below the Article, and Publication month remains the friendly Month + Year control.
- **Phase 14H finalized the Article editor UI after visual-acceptance correction:** the literal Phase 14G buttons were replaced by one compact document-style row directly attached to the writing surface. A plain inner flex element owns toolbar geometry so Sanity component wrappers cannot stretch the fixed-width **Normal text** selector or split control groups into separate rows.
- **Phase 14I finalized Article metadata and citations:** estimated read time was removed from the domain, adapters, fixtures, tests, and public metadata. Reader-facing **Notes** now use sequential citation-occurrence numbering; repeated use of one deduplicated Source creates a new Note each time, and Source-array order no longer controls public numbering. Migration `[n]` markers remain Source-list lookup identifiers only. Phase 14 Article authoring/model work is complete after human acceptance; Phase 15 has not begun.
- **Phase 14J footnote UX hardening implemented:** Studio inline markers now use the shared body-order traversal and display live occurrence numbers rather than a neutral placeholder. Hover context is brief, the click editor presents a wrapping citation and Source selector, and public Notes are a count-labelled disclosure collapsed by default. Exact body links and direct note fragments open/focus the requested Note, backlinks return to their matching markers, visible decimal markers and multi-digit indentation are restored, and print exposes the complete Notes list. Automated acceptance is complete; authenticated Studio visual acceptance remains manual and no CMS content was mutated.
- **Phase 14K Article-body surface correction implemented after failed human visual acceptance:** an authenticated read-only raw audit confirmed the Mass Deportations draft still contains nine body blocks and has no published version. The custom input now delegates through Sanity's supplied native-input renderer so existing body values and standard validation remain intact. One themed outer shell contains the accepted toolbar and writing surface; the duplicate placeholder/Card treatment, 26rem empty minimum, native 19em fixed height, nested scrolling, and resize handle are removed. Empty rich-text fields use one native-state placeholder, the surface begins near 200px and grows with content, and no Sanity content was mutated. Phase 15 has not begun; authenticated light/dark Studio acceptance remains manual.
- **Phase 14L corrective paste hardening implemented after authenticated failure:** the first MIME-only rule incorrectly treated any `text/html` as meaningful rich content, so browser TXT-viewer PRE/generic wrappers bypassed SBR paragraph conversion and failed human acceptance. Clipboard handling now classifies true plain text, PRE, and generic DIV/SPAN/BR wrappers as plain prose regardless of HTML MIME presence; genuinely structured paragraph/quote/list/mark/link HTML is converted deterministically with schema-aware Portable Text Block Tools. Both paths return one insertion fragment. Paste-without-formatting retains predictable paragraph conversion; CRLF/CR, tabs, blank runs, URLs, punctuation, Unicode, and `[n]` markers are covered. Possible markers still produce a counted nonblocking Studio warning. Add Source still expands and focuses Citation; no other Source/editor design changed. Automated correction coverage passes, but the exact authenticated browser/file-viewer workflow must pass before acceptance. No Sanity content was mutated and Phase 15 has not begun.
- Footnote Source selection is searchable by generated number or citation and remains usable with long Source lists. With no Sources, the picker explains the next step and its **Add source** action moves directly to the Article Sources field. Sources use compact collapsible summary rows, drag reordering plus keyboard-accessible move controls, row-level duplicate/unused guidance, and stable-key numbering.
- Pull Quote and Divider remain removed. Article authoring is considered feature-complete for archive migration; further editor changes should require a concrete blocking or repeated migration problem. Phase 15 has not begun.
- An authenticated read-only production audit found zero draft or published Pull Quote blocks; migration staging also contains zero. Pull Quote schema, adapter, renderer, CSS, fixtures, and active documentation were removed. A separate read-only audit found zero Divider blocks, so Divider was also removed from new CMS authoring. No Sanity content was mutated.
- Real archive migration can resume after a brief authenticated human toolbar UX check. Phase 15 has not begun.
- No archive Article was imported during Phase 14F. The entered Mass Deportations draft remains the real-world visual acceptance Article. Archive migration may resume after human visual acceptance; Phase 15 has not begun.
- Article authoring has completed its planned pre-migration UX hardening. No real archive Article was imported during Phase 14E. Archive migration may resume only after authenticated manual Studio/Preview acceptance; Phase 15 has not begun.
- A read-only production audit found zero legacy Phase 14C annotation footnotes in draft or published Articles; local fixtures and migration staging also contain none, so obsolete annotation compatibility was removed. Signed-in verification of occurrence numbering remains the short human acceptance step; Codex made no content mutation.
- Eight revised proposed summaries were generated. None is automatically approved; approval is tied to the current summary checksum.
- Four Articles are proposed for the first image-free, draft-only pilot and remain blocked on summary approval. Four remain metadata-blocked, source-held, or unfinished.
- Two Articles are blocked on missing author and publication-date metadata. One housing Article is held for source recovery. One NFL Article remains an unfinished draft with filename-inferred authorship.
- Image migration is deferred pending human confirmation of Article mapping, reuse permission, alt text, caption, and credit. All staged Articles are currently image-free.
- No archive Article has been imported after this model change and no migration asset has been uploaded. Archive migration has not resumed; manual entry must wait for authenticated Phase 14E acceptance. A guarded apply/rollback implementation exists but was not executed; it requires explicit flags, exact confirmations, current checksum approvals, target checks, a verified backup, and full preflight before mutation. Phase 15 has not begun.

## Phase 13 secure draft preview

- **Implemented; authenticated manual acceptance pending:** July 23, 2026
- Added secure App Router Draft Mode enable/disable routes, Sanity preview-secret validation, local-only redirects, no-store draft reads, preview noindex metadata, and an accessible unpublished-content banner.
- Added a separate Studio **Preview** tool for Homepage, Articles, Contributors, About, and Site Settings. Structure remains the editing workflow; Vision, Releases, and removed content models remain absent.
- Public clients remain token-free, published-perspective, and CDN-backed. Draft clients are server-only, use the Viewer token, drafts perspective, CDN disabled, and no cache. Feed and sitemap force published-only access even in preview.
- Live typing updates are not claimed. Saved drafts become visible after refreshing Preview.
- Authenticated editor and clean-guest manual checks remain required.

### Phase 13A Presentation connection

- Added the missing `VisualEditing` bridge during Draft Mode and enabled Content Source Maps/stega on the server-only draft client with the embedded `/studio` target.
- This repairs the Presentation iframe handshake and document-location channel while preserving save-and-refresh behavior. No `SanityLive`, browser token, or live subscription was added.
- Public client configuration remains published, CDN-backed, token-free, and stega-free.

### Phase 13B public-only preview chrome

- **Implemented; authenticated manual Studio acceptance pending:** July 24, 2026
- Root cause: the Phase 13A root layout rendered the preview banner and `VisualEditing` whenever the origin-wide Draft Mode cookie was enabled. Because embedded Studio shares that layout, Studio and every nested tool inherited frontend preview chrome.
- Added one pathname-aware preview boundary. It mounts the banner and Presentation bridge only on public frontend page paths and renders nothing on Studio, nested Studio tools, API routes, feed, sitemap, or robots. The root layout also no longer queries draft Site Settings solely for the banner.
- Hardened preview exit redirects: safe public paths are retained, preview-secret parameters are removed, and Studio/API/external/protocol-relative/non-page targets fall back to Homepage.
- Added focused coverage for public pages, all relevant Studio paths, non-page routes, Draft Mode conditional rendering, and safe exit redirects. No live subscriptions, browser token, CMS mutation, provider behavior change, or visual redesign was introduced.
- Authenticated manual acceptance must still hard-refresh and navigate across Structure, About, Site Settings, an Article editor, and Preview while Draft Mode is active, confirming Studio has no frontend banner or bridge and public Preview remains connected after refresh.

### Phase 13C preview content retention and reliable exit

- **Implemented; final authenticated browser acceptance pending:** July 24, 2026
- Exact root cause: draft-perspective GROQ returned the canonical published Article, but stega source-map metadata inflated strict title/dek lengths and contaminated Contributor validation. The Article adapter rejected the otherwise valid record, so Homepage, Article, Latest, Archive, Search, and Contributor Article results became empty in Preview.
- Adapters now validate stega-clean semantic content and keep control values such as slugs, dates, URLs, references, and internal links clean, while preserving stega on visible editorial strings for Presentation overlays. Empty stega-only body spans are ignored safely.
- Added `sanity:diagnose-preview`, an authenticated read-only metadata diagnostic. After the fix, published and draft perspectives each report one raw, adapted, validated, and final canonical Article across every required discovery surface, with no exclusions; Contributor, About, and Site Settings also remain available.
- Exit Preview now targets the top-level browser rather than remaining inside Presentation’s iframe, preserves a safe public path, strips preview parameters, and documents the origin-wide browser-session effect. A Guest or Private window remains required for simultaneous true-public comparison.
- No Sanity content was created, edited, restored, deleted, or published.

### Phase 13D Site Settings and draft-only Article preview

- **Implemented; final authenticated browser acceptance pending:** July 26, 2026
- Preserved and diagnosed the current dataset without mutation. Site Settings is `publishedWithChanges`; both variants validate, and the draft provider selects the draft tagline. The frontend failure came from site-wide components importing static configuration instead of consuming provider-selected Site Settings.
- Header, footer, logo, organization JSON-LD, preview label, and root metadata now use the selected Site Settings. Public mode remains published/token-free/CDN-backed; Draft Mode remains server-token/drafts/no-CDN/no-store. Structural publication values are stega-clean while the visible tagline may retain overlay metadata.
- Provider-driven logo mode now requires a resolved CMS logo asset; an image-mode setting without an asset safely falls back to the text wordmark and produces no broken image request.
- The draft-only Article `drafts.fa62b097-88bc-41d2-bc51-147be597884d` has slug `preview-draft-article`, no missing required fields, one valid Contributor reference, a four-character optional subtitle, and a 25-character required summary. The adapter incorrectly preferred the subtitle and rejected `dek`; it now correctly uses required `summary`.
- The authenticated read-only diagnostic now reports two valid Preview Articles with no exclusions. The draft-only Article passes clean validation and individual slug lookup, while published mode still returns only the canonical published Article.
- Added explicit Presentation locations for **Homepage and site settings**, Articles, Contributors, and the About page. There is intentionally no public Site Settings route.
- No editorial content was created, edited, restored, deleted, or published.

## Phase 12J Portable Text lists and cache audit

- **Implemented; full validation and automatic-refresh acceptance pending:** July 23, 2026
- Root causes for missing list markers were both structural and visual: the Sanity adapter flattened Portable Text list levels/inline marks into strings, and Tailwind's reset removed browser list markers without an explicit replacement.
- Sanity list blocks now map into the shared domain model with nesting level, bold, italic, and safe links preserved. The renderer builds semantic nested `<ul>`/`<ol>` structures, while centralized article styles restore restrained bullet and number markers at desktop and mobile widths. Local string-list fixtures remain compatible.
- Centralized the five-minute public cache window and explicit dependency tags. The safe shared `content` tag continues to invalidate every relationship-dependent surface; Feed's shared-cache header now matches the same 300-second window.
- Added a deterministic read-only `sanity:check-cache` diagnostic comparing origin, CDN, provider detail, and provider collection results without a five-minute sleep.
- Added unit/component coverage for list semantics, nesting, inline marks/links, schema validation, provider tags, exact cache timing, Feed caching, and XML escaping. CMS Playwright now checks the canonical Article's visible list markers and mobile overflow.
- Manual evidence confirms a clean server restart after deleting `.next` displayed the newly published Homepage title. This proves Content Lake correctness but not automatic refresh. The prior stale result remains classified as a development cache/session; the transient `ChunkLoadError` has not reproduced after the clean restart.
- Hosted webhook delivery remains deferred to Phase 15. Automatic refresh within 300 seconds still needs a non-mutating observation of a future approved publish; no Sanity content was changed during Phase 12J.

## Phase 12 CMS browser fixture alignment

- **Completed:** July 23, 2026
- Updated the CMS-backed Playwright suite to use the current canonical published Article and Contributor, with environment-configurable public titles/slugs and documented defaults.
- Coverage now verifies Homepage, exact Article and Contributor routes, Search, Latest, Archive, sitemap, feed, About, and exclusion of the local-only sample story.
- No Sanity content was created, edited, restored, deleted, or published.
- The token-free provider diagnostic confirmed one valid published Article and Contributor with the canonical values. `npm run test:e2e:sanity` passes both CMS discovery and local-content exclusion tests.

## Phase 12I Studio document-action hook stability

- **Implemented; authenticated manual confirmation pending:** July 23, 2026
- Fixed the blocking React hook-order crash in the guarded fixed-page discard action. The wrapper previously returned before invoking Sanity's hook-using action when either document version was absent, then invoked it after Studio state changed.
- The wrapper now invokes the underlying Sanity action on every render and only then suppresses the returned action descriptor unless both published and draft versions exist. It does not execute the action handler or mutate content.
- Added a rendered regression that transitions through published-only, published-with-unpublished-changes, and unavailable states using a hook-bearing mock action. It verifies one underlying invocation per render, stable labels, and no hook-order warning.
- The accompanying Structure `undefined.length` error was a cascade from the action-render crash; no separate undefined action array was found in the resolver, which always returns arrays and filters null availability inside the action component.
- No content was initialized, restored, deleted, reset, or published. The currently published About page remains in place.
- Validation passed with 200 unit/component tests, production build, and 29 local browser tests with 2 CMS-only skips. The authenticated read-only audit confirms `about` remains published with no current draft. A final hard-refresh/navigation check in the human's authenticated Studio remains required.

## Phase 12H authenticated draft audits

- **Implemented; automated validation complete with one dataset-fixture limitation:** July 21, 2026
- Root cause: the page and content audits selected raw perspective but did not require an authenticated client. Anonymous raw responses could therefore be mislabeled as authoritative draft absence.
- `sanity:audit-pages` and `sanity:audit-content` now use the signed-in Sanity CLI user through `--with-user-token`. The scripts fail with a clear authentication message rather than classifying draft state when credentials are unavailable.
- Added deliberately token-free published-only variants, a CI mode that uses a server-only read token when available and otherwise labels itself published-only, and the previously documented `sanity:check-target` command.
- Public website/provider checks remain token-free and published-only. No content was created, restored, deleted, initialized, or published.
- Read-only reproduction on July 21 found that the dataset changed from the prompt's captured state: both audit modes saw published `about`; neither saw `drafts.about`. Only the authenticated run could authoritatively resolve history and draft state. Site Settings had no current version in that read.
- Validation: TypeGen passed; authenticated and published-only page/content audits passed; provider diagnostics passed; migration/reset diagnostics ran in dry-run mode only; `npm run verify` passed with 199 tests; local Playwright passed 29 tests with 2 CMS-only skips; both local and Sanity production builds passed.
- `npm run test:e2e:sanity` passed draft/local-content exclusion but its published-fixture flow failed because the previously documented `Contributor Lifecycle Test` Article is no longer published. No content was created or published to mask this external-state limitation.

## Phase 12G About target alignment

- **Implemented; authenticated Studio comparison pending:** July 21, 2026
- Confirmed `.env.local`, CLI configuration, Studio configuration, the fixed-page client, both read-only audits, provider diagnostics, public provider, TypeGen, and CMS browser tests resolve to public project `bumxf5q6` and dataset `production`.
- Centralized the fixed-page client and both audits on environment API version `2026-03-01`. The lifecycle pane and About/Site Settings audit now share the exact raw projection from `src/sanity/pageExistence.ts`, including IDs, types, and creation/update timestamps.
- Added safe target output to read-only diagnostics and development-only Studio console output. Production editors see no target diagnostics.
- Current CLI evidence for About is `[]`; therefore normal About navigation must show the creation/recovery choices and must not show **Open About**. The current authenticated Studio result still requires comparison after restarting with this code.
- Target details and perspective/CDN behavior are recorded in `docs/SANITY_TARGET_ALIGNMENT.md`.

## Phase 12E supported fixed-page draft creation

- **Implemented; authenticated action verification pending:** July 20, 2026
- Replaced the unsupported generic `createIfNotExists` write to `drafts.*` with Sanity’s Document Actions API: `sanity.action.document.create`, fixed `publishedId`, `createDraftId(publishedId)`, exact schema/initial attributes, and `ifExists: "fail"`.
- The pane reruns the Phase 12D exact raw existence query after the action and does not navigate or claim success unless the expected draft ID/type is returned from current Content Lake state.
- Added `@sanity/id-utils` as a direct dependency because fixed-page draft IDs must be generated through Sanity’s supported ID utility rather than string construction in the write path.
- Focused tests verify the exact action payload, confirmation-only execution, and failure behavior when the action resolves but the authoritative raw query remains empty. No dataset action was run by Codex.

### Phase 12E acceptance

- In authenticated Studio, explicitly confirm clean About initialization once. Then run `npm run sanity:audit-pages`; acceptance requires `draft: present`, `state: draftOnly`, and exact raw response `[{"_id":"drafts.about","_type":"staticPage"}]`.
- Do not publish, restore, delete, reset, or modify unrelated content. If the action fails, preserve the console’s Sanity action error and do not treat the form or navigation as success.
- **Unexpected external state at handoff:** the final read-only audits returned an empty current dataset, including no prior published Site Settings or Contributor. Both fixed-page exact responses are now `[]`. No Phase 12E code path or automated test invoked `client.action`, and Codex performed no dataset write. Confirm the intended Sanity project/dataset and investigate this state change before any authenticated acceptance action; do not restore or recreate content automatically.

## Phase 12D authoritative fixed-page existence

- **Implemented; authenticated Studio acceptance pending:** July 20, 2026
- The lifecycle pane now runs a server-filtered exact query for the published/draft IDs and expected schema type, forces `perspective: "raw"` per request, uses `useCdn: false`, requests only `_id`/`_type`, and disables response caching.
- Returned values are defensively filtered again. Wrong IDs, wrong types, deleted-history shapes, empty objects, and non-arrays cannot enable **Open About**. A request-generation guard prevents pane reuse or out-of-order responses from replacing the active fixed-page result.
- Safe Studio console diagnostics record the requested IDs/type, received `_id`/`_type` projection, accepted records, and public project/dataset client target; no token or document content is logged.
- The read-only fixed-page audit now prints the same exact raw existence response. Current result: About `[]`; Site Settings `[{"_id":"siteSettings","_type":"siteSettings"}]`.
- Regression coverage includes exact ID/type rejection and Site Settings → About pane reuse. `npm run verify` passes with 186 tests; local-provider Playwright passes 29 tests with two CMS-only tests intentionally skipped.

### Phase 12D acceptance

- In authenticated Studio, reproduce Site Settings → About, hard refresh, away/back, and direct About navigation. Every path must show initialization while the exact raw response is empty; **Open About** must never appear.
- Compare Studio’s safe `Fixed page existence response` console record with `npm run sanity:audit-pages`. Acceptance requires both to report an empty About result. Do not initialize, restore, create, publish, or delete content during this phase.

## Phase 12C fixed-page deleted-history recovery

- **Implemented; authenticated clean-initialization click pending:** July 20, 2026
- Corrected the Phase 12B assumption that absence from GROQ means a fixed-ID editor will open as a new document. Sanity can resolve a discarded/deleted fixed-ID tombstone even when `about` and `drafts.about` are absent from ordinary queries.
- Replaced direct fixed-page Structure editors with lifecycle panes. Existing fixed pages open normally; an absent pair offers two explicit paths: inspect Sanity revision history or confirm creation of a clean unpublished draft at the same fixed ID. Nothing is restored, created, published, or deleted automatically.
- Expanded the state model and audit vocabulary for never-created, current version pairs, discarded drafts, deleted/restorable history, restored drafts, and indeterminate history. The current CLI can read document/event history but is not authorized for transaction history, so About is correctly reported as `historyIndeterminate` rather than falsely `missing` or `neverCreated`.
- Disabled Scheduled Drafts as well as Releases in Studio configuration.
- Focused tests prove that opening the recovery pane performs no mutation and that clean initialization requires a second explicit confirmation before creating `drafts.about` and navigating to its editor.

### Phase 12C acceptance

- Sign into the local embedded Studio, open **About**, and confirm the lifecycle pane appears instead of the deleted-document tombstone.
- Choose **Open revision history** and confirm Sanity still exposes the existing tombstone/recovery UI without restoring it.
- Return to **About**, choose **Create clean About draft**, cancel once, then confirm once. Verify the draft opens with title `About`, slug `about`, no old body/staff content restored, and no published About version created. Leave it as a draft.
- Refresh the **About** pane; verify it now reports the fixed page exists and **Open About** reaches the normal editor. Confirm Scheduled Drafts is absent from the top navigation.

## Phase 12B durable fixed-page lifecycle (superseded in part by Phase 12C)

- **Superseded after authenticated testing:** July 20, 2026
- Confirmed authoritative IDs `about` (`staticPage`) and `siteSettings` (`siteSettings`). Both Structure entries already use direct fixed-ID editors and never depend on query results.
- Added one typed fixed-page state machine covering missing, draft-only, published-only, and published-with-changes states, plus explicit status badges.
- Fixed-page actions now use an allowlist: Publish is always retained, and Discard unpublished changes is retained only when draft and published versions both exist. Delete, permanent delete, duplicate, copy, unpublish, and draft-only discard are absent.
- The direct fixed-ID editor and initial values were insufficient after deleted/discarded history; Phase 12C replaces that path with an explicit lifecycle pane.
- Added the read-only `npm run sanity:audit-pages` command and regression tests for all state/action and malformed-dataset cases.
- Raw current-document result: About has neither variant; Site Settings is published-only. Phase 12C records About history as indeterminate because Studio resolves a tombstone that the authenticated CLI history endpoints do not expose completely.

### Phase 12B follow-up

- Sign into the local Studio and confirm the missing About entry opens an editable form, first edit creates `drafts.about`, refresh remains editable, and only Publish is offered. Do not publish test content merely for verification.
- On Site Settings, make a harmless unpublished edit, verify the changed-state badge and Discard action, discard it, and confirm the pane immediately returns to published values. Restore the original value if needed.
- The automated browser reached the configured Sanity login screen but had no authenticated session, so these editor interactions remain manual.

## Phase 12 Sanity content provider acceptance

- **Implementation complete; dataset acceptance pending:** July 19, 2026
- Added a stable domain-facing `ContentProvider` with separate validated local and published-only Sanity implementations selected by `CONTENT_SOURCE`.
- Added focused GROQ projections, runtime adapters, Portable Text mapping, deterministic ordering, CMS search, contributor/About relationships, Sanity image metadata, tagged caching, and secret-authenticated revalidation.
- Preserved `CONTENT_SOURCE=local` as a temporary rollback until migration acceptance. Explicit Sanity mode never silently falls back and never uses a public read token.
- Generated schema/query types and added provider, projection, adapter, failure, revalidation, and CMS-backed browser coverage.
- The dataset contains one domain-valid published test Article, two published Contributors, and managed About. The valid Article is `Contributor Lifecycle Test` by `manual 2`.
- Revised acceptance physically removed all Issue and Category compatibility types, methods, GROQ queries, tests, and documentation claims from the provider.
- Diagnostics now identify invalid published records with field-level failures and distinguish them from draft-only records. They intentionally exit unsuccessfully while such a record exists.

### Phase 12 follow-up

- Human confirmation is required before deleting the apparently disposable published test Article `feawfweaf` (`fwaefw`). It has no draft pair and fails because its summary/dek is below 20 characters. Exact safe Studio steps are in `docs/PHASE_12_ACCEPTANCE.md`.
- The accepted Phase 11 launch model has no Issue, Category, or Tag schemas/routes, so those migration checks are not applicable unless ADR-014 is superseded.
- Complete the documented manual draft-isolation and 300-second cache tests. There are currently no draft-only Articles or unpublished-change pairs in the dataset.
- Verify a real editorial image with caption and credit after one is added; adapter fixtures cover image-free and complete-image mapping now.
- After editorial acceptance and real-content migration, set production `CONTENT_SOURCE=sanity`, verify the publishing webhook, and schedule local fallback removal.

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
