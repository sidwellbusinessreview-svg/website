# Testing

## Phase 14N manual acceptance

Hard-refresh Studio and confirm Structure shows one **Publication Settings** entry and no separate About or Site Settings entries. Verify its General, About, Leadership, and SEO/Advanced groups contain the preserved data. Add a second Editor-in-Chief, reorder the list, preview `/about`, and confirm the plural heading and configured order; then confirm Contributor profiles contain no leadership label.

Open an Article that already has a footnote without changing Article content. Confirm **Add footnote** opens beside its toolbar control, Escape and click-away close without inserting, and choosing a Source inserts exactly once without a Save step. Select an existing superscript and confirm Sanity's inline controls and anchored **Edit footnote** popover remain close to the marker; the Source selector is searchable, removal uses the native editor action, Escape preserves the value, and focus returns predictably. Check 1440, 1100, 768, and 390 CSS-pixel viewports for clipping and horizontal overflow. The component layout test covers those widths; authenticated Studio placement, keyboard traversal, undo/redo, and real editor patches remain human checks.

The CMS browser suite always verifies Publication Settings-backed `/about` and public exclusion of local/draft Articles. Its deeper Article-discovery scenario uses the environment-configurable published Article fixture and skips explicitly when that fixture is not published; tests must never create or publish Article content.

The project uses four complementary checks:

- **ESLint** finds common code-quality and framework mistakes.
- **TypeScript** checks that values and component contracts agree.
- **Vitest and Testing Library** test pure content functions and focused React rendering quickly.
- **Playwright and axe** open the real website in Chromium to test routes, keyboard behavior, mobile overflow, and automated accessibility rules.

## Initial setup

From `/Users/Evan/Documents/GitHub/website`:

```bash
nvm use
npm ci
npx playwright install chromium
```

The Playwright browser installation is a one-time local setup per browser version. On Linux CI, the workflow uses `npx playwright install --with-deps chromium`.

## Everyday verification

Run the fast blocking checks:

```bash
npm run verify
npm run sanity:migration:validate
npm run sanity:migration:dry-run
```

This runs lint, typecheck, unit/component tests, and the production build in that order. It intentionally does not start a browser because browser tests are slower and may need a downloaded Chromium binary.

For changes affecting routes, navigation, layout, rendering, accessibility, or browser behavior, also run:

```bash
npm run test:e2e
```

## Available commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
npm run verify
```

- `npm test` runs all unit and component tests once.
- `npm run test:watch` reruns affected tests while files change.
- `npm run test:coverage` writes a coverage report to `coverage/`.
- `npm run test:e2e` builds the site, starts or reuses the local Next.js production server, and runs Chromium tests.
- `npm run test:e2e:ui` opens Playwright’s interactive test interface when a desktop environment is available.

## Viewing Playwright results

The terminal prints a concise result after every run. If a test fails, Playwright stores screenshots, video, or traces in `test-results/` according to the configuration. Tests use one worker against the production server because concurrent Next.js development compilation was not reliable enough for a blocking baseline suite.

To open the HTML report after a run:

```bash
npx playwright show-report
```

GitHub Actions uploads `playwright-report` and `playwright-test-results` artifacts when browser tests fail. Open the failed workflow run in GitHub, scroll to **Artifacts**, and download the relevant archive.

## Writing tests

- Put unit and component tests beside source files using `*.test.ts` or `*.test.tsx`.
- Put browser tests in `tests/e2e/`.
- Prefer accessible roles, labels, headings, and visible text.
- Add `data-testid` only when the interface has no stable accessible selector.
- Test public behavior rather than private implementation details.
- New article body blocks require renderer tests, type coverage, and browser verification when their layout is significant.
- Custom Sanity inputs require regression fixtures for undefined, null, incomplete, malformed, and duplicate form values. They must replace the default insertion UI, expose one creation path, and test that confirmation emits only intended complete keyed values while Cancel, X, Escape, and outside click emit nothing.

## Studio regression checks

After changing Contributor selection or Article browsing, run the unit suite, start `npm run studio:dev`, and verify standalone Studio at `http://localhost:3333` while signed in. Article lists support search across title, subtitle, summary, contributor name, and publication month. Test Newest, Oldest, Title A–Z, and Recently updated sorting in every state pane.

The Article field must show exactly one **Add contributors** button and no native **Add item** or default item menu. The modal searches by name, shows optional graduation year, supports temporary multiple selection, and only **Confirm selection** patches the field. X, Escape, outside click, and **Cancel** never save. Verify About uses a single Contributor selection for Editor-in-Chief, that the Contributor form has no Role field, and that the public Contributor page does not inherit the About label. A malformed historical selection must show a friendly repair action instead of crashing.

After Contributor-model changes, run the authenticated dry-run cleanup with `npm run sanity:cleanup-contributor-roles`. It must report zero affected documents after the approved cleanup. The apply command is guarded by exact target, recent-export, and typed-confirmation requirements and must never run without explicit authorization.

For date/source model changes, use the existing unpublished draft in **Structure**. Choose **March** and enter **2025** using the friendly controls; editors must never type `2025-03`. Add each Source once, then cite one Source more than once. Confirm Studio markers show the actual live body-order numbers and renumber after inserting, moving, or removing an occurrence; hover must stay brief and the click editor must wrap the full citation. Preview must show **March 2025**, matching sequential occurrence numbers, a collapsed **Notes (N)** disclosure, one Note per citation occurrence, working occurrence-specific jumps/backlinks, and no read time or numerical day. Studio must reject a blank citation, non-HTTP/S URL, and nonexistent source. Do not publish this acceptance record.

The read-only persisted-data check is:

```bash
npm run sanity:audit-contributors
```

It writes a dry-run report and never repairs or deletes dataset content.

## Preview chrome regression checks

With Draft Mode enabled, public Homepage, Article, Contributor, and About paths must show **Previewing unpublished content** and mount the Presentation bridge. The public browser session must not show the banner or mount that bridge on:

- `/api/...`
- `/feed.xml`, `/sitemap.xml`, or `/robots.txt`

Run standalone Studio and the public site together, then move between Structure, Publication Settings, an Article editor, and Preview. **Exit preview** should retain the current public Article path, but unsafe API, external, or protocol-relative redirect targets must return to Homepage. Unit coverage for these rules lives in `preview-chrome.test.tsx`, `preview.test.ts`, and the Draft Mode route tests. Public browser tests must also confirm `/studio` and `/studio/*` return 404.

For provider-loss investigations, run:

```bash
npm run sanity:diagnose-preview
```

The authenticated, read-only diagnostic compares the canonical Article across Homepage/articles, Article by slug, Latest, Archive, Search, Contributor, Contributor Articles, About, and Site Settings in published and draft perspectives. Every valid surface should report equal raw, clean-validation, adapter, and final counts with `excluded: []`.

It also reports each current draft-only Article using only safe fields: ID, type, slug, lifecycle, missing-field names, reference IDs, string lengths, validation state, and provider presence. For Site Settings it reports the current variants and whether the selected preview tagline matches the draft without printing the tagline itself.

When testing **Exit preview**, begin on a canonical Article route. The control must leave the Presentation iframe, navigate the top-level browser to the same clean Article path, remove the banner, and remain out of Draft Mode after refresh. Because localhost Draft Mode is shared across tabs in one browser session, use a Guest or Private window for the simultaneous public comparison.

For Site Settings and draft-only routing:

1. Save an unpublished Homepage tagline in the Site Settings page.
2. Open **Homepage and site settings** in Preview and refresh.
3. Confirm the preview header uses the draft tagline while a Guest/Private public window uses the published tagline.
4. Open the saved draft-only Article through its Article preview location.
5. Confirm its clean slug route renders in Preview and appears on Preview Homepage.
6. Confirm the same route is not found in the Guest/Private public window.

The CMS browser suite uses `CMS_TEST_DRAFT_ONLY_ARTICLE_SLUG` when set and otherwise checks the current acceptance slug `preview-draft-article`. Update that environment value if the preserved acceptance draft changes; never publish or recreate content merely to satisfy the test.

## Common failures

### `node` or `npm` is not found

Install and use the version in `.nvmrc`:

```bash
nvm install
nvm use
```

### Playwright cannot find Chromium

```bash
npx playwright install chromium
```

### Port 3000 is already in use

Stop the existing development server, or allow Playwright to reuse it if it is the correct project. The configured browser tests expect `http://127.0.0.1:3000`.

### A unit test cannot resolve `@/…`

Keep the alias in `vitest.config.ts` aligned with `tsconfig.json`.

### A component test fails around `next/image`

The shared test setup replaces `next/image` with a semantic `<img>` for focused rendering tests. Browser tests still exercise the real Next.js image component.

### An axe test reports a violation

Read the rule, affected selector, impact, and remediation in the Playwright output. Fix the underlying markup or styles; do not disable a rule merely to make CI green without documenting why it is inapplicable.

### The build passes but a browser test fails

A build proves compilation and static generation, not navigation, layout, image delivery, or browser accessibility. Reproduce the failing route with `npm run test:e2e:ui` or inspect the saved trace/report.

`npm run test:e2e` deliberately selects the stable local fixture provider, regardless of `.env.local`. Use `npm run test:e2e:sanity` for the separate published CMS dataset suite. This prevents the local-route assertions from silently changing meaning when a developer switches content sources.

The CMS suite defaults to the canonical published records:

- Article: **CMS Integration Test Article** at `cms-integration-test-article`
- Contributor: **CMS Integration Test Contributor** at `cms-integration-test-contributor`

The test covers Homepage, Article, Contributor, Search, Latest, Archive, sitemap, feed, About, and exclusion of local-only sample content. If an approved replacement fixture is introduced, override `CMS_TEST_ARTICLE_TITLE`, `CMS_TEST_ARTICLE_SLUG`, `CMS_TEST_CONTRIBUTOR_NAME`, and `CMS_TEST_CONTRIBUTOR_SLUG` in the shell running Playwright. These are public test labels, not secrets; do not use them to pass tokens.

It also verifies that the canonical CMS Article renders a real bulleted list with semantic `<ul>/<li>` markup, visible markers, and no mobile horizontal overflow.

Migration tests use injected clients and temporary backup fixtures. They exercise preflight and action ordering without real tokens or Sanity mutations. Apply and rollback-apply commands must never run during tests, CI, builds, installation, deployment, or server startup.

### CMS cache diagnostic

Run `npm run sanity:check-cache` to compare the canonical Article from uncached Sanity origin, Sanity CDN, provider detail, and provider collection reads. The command is read-only, uses no token, prints no secret, and exits unsuccessfully when public sources disagree. It does not inspect the browser or Next development cache and deliberately does not wait through the five-minute refresh window.

If a newly published value appears only after stopping the server and removing `.next`, record that as a stale development cache/session. Do not infer that the 300-second fallback or hosted webhook has passed. A one-off `ChunkLoadError` that disappears after a clean restart is likewise a development artifact unless it reproduces from a clean state.

### Content Lake audit failures

First run `npm run sanity:check-target`. Then run `npm run sanity:audit-pages` and `npm run sanity:audit-content` while signed into the Sanity CLI. Both scripts include `--with-user-token`; the user token stays in the CLI session and is never printed or committed. A nonzero content-audit exit indicates legacy documents, unregistered types, missing references, obsolete fields, or missing authentication.

For a token-free check, use `npm run sanity:audit-pages:published` or `npm run sanity:audit-content:published`. These commands explicitly label draft state as not checked. An anonymous response can never prove that a draft is absent. Review timestamped `.sanity-reports`; do not hide a problem by restoring an obsolete schema alias. Cleanup and reset commands are dry-run-only unless their explicit target, export, and confirmation safeguards are supplied.

## CI behavior

GitHub Actions runs on pull requests and pushes to `main`. The first job performs lint, typecheck, Vitest, and the production build. After that succeeds, a separate job installs Chromium and runs Playwright. Public-site tests require no token. If a future CI job runs `npm run sanity:audit-pages:ci`, it may receive `SANITY_API_READ_TOKEN` as a server-only repository secret; without that secret it performs an explicitly published-only audit. Never use a personal CLI user token in CI.

## Article authoring regression checks

Vitest covers the full image-free Article fixture; the toolbar and layout; Source controls; shared Studio/public occurrence numbering through paragraphs, Block quotes, lists, and Callouts; repeated Sources; 21-note sequences; insertion, deletion, body and Source reordering; anchors; backlinks; Month Year output; and validation. Playwright checks toolbar and footnote-editor geometry, Article metadata without read time, collapsed Notes behavior, direct hashes, exact backlinks, numbered-list visibility, overflow, typography, and accessibility at desktop/mobile sizes.

Authenticated Studio acceptance is still manual: create no automated records. Hard-refresh Studio, open the Mass Deportations draft, confirm the toolbar resembles compact document-editor chrome, choose Block quote from Paragraph style with only a caret, add a Footnote, bold one word and undo, scan/reorder Sources, and refresh Preview once. Do not claim this acceptance from unit tests alone.

For the Article-body surface, confirm the existing nine-block Mass Deportations text appears after a hard refresh. Toolbar and canvas must share one border, the native empty state must read **Start writing or paste here…** exactly once, an empty canvas should be roughly 200px tall without a resize handle, and longer content should use normal Studio page scrolling. Component coverage verifies that a non-empty value is passed to Sanity's native renderer and cannot be replaced by empty-state UI; browser geometry coverage checks normal and narrow widths.

Clipboard tests cover true text-only input; browser-viewer `text/plain` plus PRE HTML; generic DIV/SPAN/BR wrappers; CRLF/CR; tabs; whitespace-only lines; repeated blank lines; Unicode; URLs; `[n]`; empty fallback; and a browser-wrapped 20-paragraph manuscript over 5,000 characters. Genuine HTML fixtures verify separate paragraphs, Bold, Italic, external Link, bulleted list, numbered-list support through the configured schema, and Block quote conversion using `@portabletext/block-tools`. Each handled paste returns exactly one insertion fragment. The browser harness renders the converted manuscript with 20 Source controls and checks vertical growth, toolbar usability, and horizontal overflow. Selection replacement and undo remain native Sanity transaction behavior because the hook never patches the document directly.

If a development server already owns port 3000, preserve it and run an isolated suite with `PLAYWRIGHT_PORT=3001 CI=1 npm run test:e2e` (or `test:e2e:sanity`). Port 3000 remains the default.
