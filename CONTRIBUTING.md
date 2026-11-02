# Contributing

Writers and editors do not need repository access for ordinary publishing. Editorial content belongs in Sanity Studio; repository access is for maintainers of code, configuration, and technical documentation.

## Before starting

1. Open the `sidwellbusinessreview-svg/website` repository root.
2. Read `README.md`, `AGENTS.md`, `PROJECT_STATUS.md`, `docs/DECISIONS.md`, and the task-relevant documentation.
3. Fetch and start from the latest `main`.
4. Confirm `git status` is clean. Preserve changes you do not recognize.
5. Use the Node.js major version in `.nvmrc`.

## Branches and local setup

Create a short-lived, focused branch from `main`, for example:

```text
feature/article-search
fix/mobile-headline-overflow
docs/editor-handoff
```

Install and start the local fixture-backed site:

```bash
nvm install
nvm use
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` only when you need explicit provider, CMS, or Preview configuration. Never commit the populated file. See `docs/CONTENT_PROVIDER.md` before selecting `CONTENT_SOURCE=sanity`.

## Commits and scope

Keep one coherent change per branch. Do not mix an unrelated redesign, dependency upgrade, migration, and documentation cleanup. Use clear imperative commit messages, such as:

```text
fix: prevent article image overflow
docs: clarify account recovery
feat: improve contributor archive filtering
```

Never commit secrets, generated build output, test artifacts, migration source evidence, or unrelated local changes.

## Verification

For code or configuration changes, run:

```bash
npm run verify
```

Run `npm run test:e2e` for changes to routes, navigation, rendering, layout, accessibility, interaction, or browser configuration. Run the focused Sanity or Studio checks required by the affected subsystem and report anything omitted.

For documentation-only changes, use proportionate checks: review every diff, run `git diff --check`, validate commands and local links, and confirm no secret values entered the change. Do not run a full application suite solely to justify a documentation edit.

## Pull requests

A pull request should explain:

- what changed and why;
- which routes, workflows, or documents are affected;
- how the change was verified;
- screenshots for visible changes;
- known limitations and human follow-up;
- whether environment-variable names or external service settings changed.

Request review from an appropriate technical maintainer. Do not merge when required checks fail, secrets may be present, or the change bypasses the content-provider boundary or recovery safeguards.
