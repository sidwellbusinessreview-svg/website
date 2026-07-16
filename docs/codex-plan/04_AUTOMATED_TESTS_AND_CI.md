# Phase 04: Automated Tests and Continuous Integration

## Objective

Create a dependable testing system before making larger design and CMS changes.

Every later Codex phase should be required to pass the same baseline checks.

## Test layers

The project should have:

1. Linting
2. Type checking
3. Unit tests
4. Component tests where useful
5. Content-contract tests
6. Browser smoke tests
7. Basic accessibility checks
8. Production build
9. GitHub Actions continuous integration

## Codex prompt

```text
You are performing Phase 04 of the Sidwell Business Review website project.

Before changing anything:
1. Read AGENTS.md, PRODUCT_REQUIREMENTS.md, CONTENT_MODEL.md, ROUTE_CONTRACT.md, and PROJECT_STATUS.md.
2. Run the existing lint, typecheck, and build scripts.
3. Show git status and stop if uncommitted work exists.
4. Preserve the current framework and page behavior.
5. Do not add the CMS yet.

Establish a testing stack compatible with the current Next.js, TypeScript, and npm versions.

Required capabilities:
- Unit testing for pure functions and content access
- React component testing when valuable
- Browser end-to-end testing
- Automated accessibility assertions
- GitHub Actions CI
- A single verification command

Prefer:
- Vitest for unit tests
- Testing Library for focused component tests
- Playwright for browser tests
- axe integration for automated accessibility checks

If the current framework version requires different current-compatible packages or configuration, use the compatible approach and document it. Do not use outdated examples blindly.

Implement:

1. package.json scripts
- lint
- typecheck
- test
- test:watch
- test:coverage
- test:e2e
- test:e2e:ui if practical
- verify

The verify script must run all fast blocking checks in a sensible order. It may leave full browser tests as a separate command if server orchestration makes them too slow, but document that distinction.

2. Unit tests
- Slug lookup
- Article sorting
- Pinned article logic
- Articles by author
- Articles by issue
- Articles by category
- Empty results
- Invalid slug behavior
- Duplicate slug detection if a validator exists

3. Renderer tests
- At least one test for each structured block type
- Safe handling of optional caption and credit
- Multiple authors
- Missing optional subtitle
- Unknown block behavior must fail safely or be explicitly handled

4. Playwright browser tests
- Homepage loads
- Main navigation works
- Article route loads
- Issue route loads
- Author route loads
- About and Masthead load
- Search route loads
- Invalid route shows not-found
- No obvious horizontal overflow at mobile width
- Basic keyboard navigation
- At least one automated axe scan on key pages

5. Stable test selectors
- Prefer accessible roles, labels, and visible text.
- Add data-testid only when no accessible selector is stable.

6. GitHub Actions
Create .github/workflows/ci.yml that:
- Runs on pull requests and pushes to main
- Uses the pinned Node version
- Uses npm ci
- Runs lint
- Runs typecheck
- Runs unit tests
- Runs production build
- Runs Playwright tests if reliable in CI
- Uploads useful Playwright failure artifacts
- Does not expose secrets

7. Documentation
- Add TESTING.md with exact beginner instructions.
- Add common failure explanations.
- Explain unit versus browser tests.
- Explain how to view a Playwright report.

Validation:
- Run npm ci if dependency state allows.
- Run npm run verify.
- Run npm run test:e2e.
- Run npm run build.
- Confirm tests fail when deliberately given a temporary bad assertion, then revert that temporary change.
- Confirm CI YAML is syntactically reasonable.
- Update PROJECT_STATUS.md.
- Update AGENTS.md so every future phase runs npm run verify and relevant browser tests.

Do not commit.
Report:
- Dependencies added
- Scripts added
- Tests added
- Total passing tests
- Any tests omitted and why
- Every changed file
- Recommended commit message
```

## Human test

After Codex finishes:

1. Run `npm run test:e2e:ui` if available.
2. Watch one browser test execute.
3. Confirm the test opens the actual application.
4. Open GitHub after pushing and verify the Actions workflow appears.

## Stop conditions

Do not continue if:

- Tests are flaky
- Tests only assert that files exist
- Browser tests skip major routes
- CI requires secrets that are not yet available
- `npm run build` no longer passes

## Commit

```text
test: add automated verification and CI
```
