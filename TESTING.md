# Testing

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

## CI behavior

GitHub Actions runs on pull requests and pushes to `main`. The first job performs lint, typecheck, Vitest, and the production build. After that succeeds, a separate job installs Chromium and runs Playwright. No secrets are required by the current tests.
