# Sidwell Business Review Website: Codex Execution Plan

## Decision: continue the existing project

Do not start over.

The current repository already has a valid foundation:

- Next.js 16.2.10
- App Router
- TypeScript
- Tailwind CSS
- ESLint
- A typed local content model
- A CMS-ready content-access layer
- All required prototype page types
- Passing lint and production build checks

Rebuilding now would discard working code without evidence that the architecture is defective. The correct next step is to verify the current site locally, preserve a baseline, and improve it in controlled phases.

## Repository location

The repository path is:

```text
/Users/Evan/Documents/GitHub/website
```

This is a good location. It follows the common GitHub Desktop layout:

```text
Documents/
└── GitHub/
    └── website/
```

Do not move it unless:

- GitHub Desktop says the repository cannot be found
- The folder is being synchronized by a service that causes file conflicts
- The path changes because the computer account changes

The `website` folder itself must be the repository root. It should contain files such as:

```text
package.json
package-lock.json
README.md
AGENTS.md
PROJECT_STATUS.md
src/
public/
```

Do not create another `website` folder inside it.

## How to use this plan

Complete one numbered file at a time.

For every phase:

1. Read the entire file.
2. Complete any steps marked **Human steps** yourself.
3. Open Codex in `/Users/Evan/Documents/GitHub/website`.
4. Paste only the prompt from that phase.
5. Let Codex inspect the existing repository before changing it.
6. Review Codex's summary.
7. Run every required test.
8. Inspect the website manually when instructed.
9. Do not continue if a stop condition is present.
10. Commit and push the completed phase.
11. Update `PROJECT_STATUS.md`.
12. Move to the next numbered file.

Do not paste every phase into Codex at once. Large all-at-once builds are harder to inspect, test, and reverse.

## Safety rule for Codex

At the beginning of every phase, Codex must:

- Inspect the repository and current Git status
- Preserve working features
- Avoid deleting files unless deletion is justified
- Avoid changing framework versions without a documented reason
- Avoid adding paid services without approval
- Avoid committing secrets
- Run tests before and after changes
- Report every changed file
- Stop if it finds uncommitted work that may be overwritten

## Required verification command

By Phase 04, the project will have a unified verification command:

```bash
npm run verify
```

Until then, use:

```bash
npm run lint
npm run build
```

When a phase includes browser tests, also run:

```bash
npm run test:e2e
```

## Branch and commit method

For the first baseline phase, save the current work on `main`.

For later phases, use a branch when the change is substantial:

```text
phase/04-testing
phase/10-sanity-foundation
phase/12-cms-integration
```

A beginner-safe GitHub Desktop process is:

1. Confirm all previous work is committed.
2. Select **Current Branch**.
3. Select **New Branch**.
4. Name it after the phase.
5. Make and test the changes.
6. Commit the phase.
7. Push the branch.
8. Review the preview deployment when available.
9. Merge only after tests pass.

## CMS decision

A CMS is part of this plan. It is not being deferred indefinitely.

The default implementation path is **Sanity Studio with Sanity Content Lake**, integrated with the existing Next.js application. This default was selected because the project needs:

- A private editor interface
- Structured articles
- Multiple authors
- Issues and categories
- Images with captions, credits, and alt text
- Drafts and published content
- Preview capability
- A replaceable content-access layer
- Exportable structured content
- An interface that future editors can use without editing code

Phase 09 confirms the decision against the actual repository. If Codex finds a concrete blocker, it must document the blocker before proposing an alternative. It may not replace Sanity merely because another platform is fashionable or easier to generate.

## Major milestones

| Milestone | Result |
|---|---|
| Phases 01-03 | Verified baseline and frozen requirements |
| Phases 04-08 | Strong automated tests and production-quality public frontend |
| Phases 09-13 | Fully implemented editor-only CMS and draft preview |
| Phase 14 | Real content and image migration workflow |
| Phase 15 | Preview and production deployment |
| Phase 16 | Security, privacy, and backup controls |
| Phase 17 | Editor handbook and leadership handoff |
| Phase 18 | Final launch acceptance |
| Phase 19 | Sustainable maintenance process |

## Current immediate action

Begin with `01_BASELINE_LOCAL_TEST_AND_SNAPSHOT.md`.

Do not create the CMS account, buy a domain, or import 30 to 50 articles yet.
