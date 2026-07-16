# Phase 02: Repository Safety and Project Governance

## Objective

Make the repository safe for repeated Codex work, future student leadership changes, environment variables, and recoverable development.

This phase changes project operations, not the website design.

## Codex prompt

```text
You are performing Phase 02 of the Sidwell Business Review website project.

Before changing anything:
1. Read AGENTS.md, README.md, PROJECT_STATUS.md, and docs/BASELINE_REPORT.md.
2. Show git status.
3. Stop if uncommitted work is present.
4. Do not upgrade Next.js or other dependencies.
5. Preserve all existing routes and visual behavior.

Create or improve the following project-governance files:

1. .nvmrc
- Pin a Node.js major version compatible with the currently installed Next.js version and the current development environment.
- Do not guess blindly. Inspect package requirements and current successful Node version.
- Explain the chosen version.

2. .env.example
- Include placeholder names only.
- Do not include real tokens, IDs, URLs containing private identifiers, or secrets.
- Add comments explaining each variable.
- Include planned CMS and preview variables, but mark them unused until the CMS phases.

3. .gitignore
- Confirm .env, .env.local, generated test output, Playwright artifacts, coverage, build output, and operating-system files are ignored.
- Do not ignore source files or required configuration.

4. SECURITY.md
- Explain how to report a website security issue.
- State that secrets must never be committed.
- Explain what to do if a secret is exposed.
- Explain that student personal information should be minimized.
- Use the publication Gmail as the administrative contact placeholder without writing the actual address unless it is already in the repository.

5. CONTRIBUTING.md
- Beginner-friendly branch, commit, test, and pull-request process.
- Explain that writers do not need repository access.
- Explain that code changes require verification.

6. docs/DECISIONS.md
- Create an architecture decision log.
- Record existing decisions:
  - Continue the current Next.js application
  - App Router and TypeScript
  - Centralized design tokens
  - Content access layer
  - CMS will be implemented after frontend hardening
  - Default CMS path is Sanity unless a documented blocker is found
  - Publication Gmail is the persistent administrative account
  - Individual editor accounts should be invited where services support team access

7. docs/ACCOUNT_OWNERSHIP_TEMPLATE.md
- Create a table for service, owner, additional administrators, billing owner, recovery contact, renewal date, and handoff status.
- Do not include passwords.

8. AGENTS.md
- Add strict instructions for future Codex sessions:
  - Inspect before editing
  - Preserve the content-provider boundary
  - Never commit secrets
  - Do not use npm audit fix --force
  - Do not change framework versions without an architecture decision
  - Run verification before completion
  - Update PROJECT_STATUS.md
  - Report changed files and unresolved risks

9. package.json
- Add a typecheck script if one does not exist, using the project's TypeScript configuration.
- Do not add test dependencies yet.
- Preserve current scripts.

10. README.md
- Add a clear repository-path note.
- Add Node version setup.
- Add environment-file setup.
- Add a beginner explanation of local, GitHub, preview, and production copies.

Validation:
- Run npm run lint.
- Run npm run typecheck.
- Run npm run build.
- Confirm no secret-like values are tracked.
- Show git diff summary.
- Update PROJECT_STATUS.md.

Do not commit. List every changed file and give a recommended commit message.
```

## Human checks

Open and read:

- `.env.example`
- `.gitignore`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `docs/DECISIONS.md`
- `docs/ACCOUNT_OWNERSHIP_TEMPLATE.md`

Confirm that no password, API token, recovery code, or private email credential appears.

## Required result

These commands must pass:

```bash
npm run lint
npm run typecheck
npm run build
```

## Commit

```text
chore: add repository safety and governance controls
```
