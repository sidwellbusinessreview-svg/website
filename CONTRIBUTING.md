# Contributing

Thank you for helping improve the Sidwell Business Review website. This guide is written for contributors who may be new to Git and Next.js.

Writers and editors do not need repository access to submit articles. Editorial content should eventually move through the publication’s approved editorial workflow and CMS. Repository access is for people maintaining code, configuration, and technical documentation.

## Before starting

1. Make sure you are working in `/Users/Evan/Documents/GitHub/website`.
2. Read `README.md`, `AGENTS.md`, `PROJECT_STATUS.md`, and relevant architecture decisions in `docs/DECISIONS.md`.
3. Pull the current default branch.
4. Confirm `git status` is clean. Do not discard changes you do not recognize.
5. Use the Node.js major version in `.nvmrc`.

## Branches

Create a short-lived branch from the current default branch. Use a descriptive name such as:

```text
feature/article-search
fix/mobile-headline-overflow
docs/editor-handoff
```

Keep one focused change per branch. Do not combine an unrelated redesign, dependency upgrade, and content change in one pull request.

## Local setup

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

The placeholder environment file is currently optional because Phase 1 uses local sample content.

## Commits

Make small commits with clear, imperative messages:

```text
fix: prevent article image overflow
docs: add account ownership guidance
feat: improve contributor archive filtering
```

Never commit secrets, populated environment files, generated build output, test artifacts, or unrelated local changes.

## Required verification

Code changes must be verified before review:

```bash
npm run lint
npm run typecheck
npm run build
```

Also open the affected routes locally and test the behavior at desktop and mobile widths. Confirm keyboard focus, links, images, and the browser console remain healthy.

Documentation-only changes should still run the checks when they affect commands, configuration, or architecture instructions.

## Pull requests

A pull request should explain:

- What changed and why
- Which routes or components are affected
- How the change was tested
- Screenshots for visible changes
- Known limitations or follow-up work
- Whether environment variables or service settings changed

Request review from an appropriate technical maintainer. Do not merge when required checks fail, when secrets may be present, or when the change bypasses the content-provider boundary without a documented architecture decision.
