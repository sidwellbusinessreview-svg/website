# Phase 09: CMS Decision and Preparation

## Objective

Confirm the CMS choice against the completed frontend, then prepare a controlled integration plan.

The project must implement a CMS. The default is Sanity.

## Why this phase exists

A CMS should not be attached by copying a tutorial into the project. Codex must map the existing content contract and access layer to the CMS deliberately.

## Required decision criteria

Evaluate:

- Editor-only access
- Ease for nontechnical student editors
- Multiple authors
- Issues
- Categories and tags
- Structured article body
- Images with alt text, captions, and credits
- Draft versus published content
- Preview
- Pinned stories
- Site settings
- Account transfer
- Export and backup
- Next.js integration
- Cost risk
- Vendor lock-in
- Maintenance burden
- Ability to migrate 30 to 50 articles

## Codex prompt

```text
You are performing Phase 09 of the Sidwell Business Review website project.

This phase must end with a CMS decision and implementation design. It must not leave the CMS indefinitely undecided.

Before changing anything:
1. Read PRODUCT_REQUIREMENTS.md, CONTENT_MODEL.md, ROUTE_CONTRACT.md, DECISIONS.md, and PROJECT_STATUS.md.
2. Inspect the content-access layer and renderer.
3. Run npm run verify and npm run test:e2e.
4. Show git status and stop if the repository is dirty.
5. Do not install CMS packages in this phase.

Create docs/CMS_DECISION.md.

Evaluate at minimum:
- Sanity
- Payload
- A Git-based CMS such as Decap

Score each against the actual project requirements, not generic feature lists.

The default decision is Sanity Studio plus Sanity Content Lake.

Choose Sanity unless you identify a concrete blocker involving:
- Required functionality
- Sustainable cost
- Account continuity
- Current Next.js compatibility
- Exportability
- Editor usability
- School policy

Do not reject Sanity merely because another tool is newer, more self-hosted, or easier for Codex to generate.

For the selected CMS, document:

1. Architecture
- Where Studio/admin lives
- Where content lives
- How the public site reads published content
- How draft preview works
- How images are delivered
- How revalidation works
- How local fallback content is handled during migration

2. Document types
- Article
- Author
- Issue
- Category
- Tag if separate
- Site settings
- Static page or About/Masthead content

3. Field mapping
Map every field from CONTENT_MODEL.md to a CMS field.

4. Portable body mapping
Map every structured block to the CMS's rich-content system.

5. Access model
- Publication Gmail as durable owner or recovery account
- Individual editor invitations
- No public editing
- No writer accounts required
- Faculty adviser role optional
- Account-transfer process

6. Environments
- Local development
- Preview deployment
- Production
- Dataset strategy
- Environment variables
- Secret boundaries

7. Migration sequence
- Local sample data
- Five real test articles
- One full issue
- Remaining archive

8. Rollback
- Keep a temporary local-data mode until CMS integration is accepted
- Ability to restore the last working deployment
- Export process

9. Costs and unknowns
- Clearly mark features that may depend on paid plans
- Do not assume scheduled publishing is free or required
- Draft and manual publish are sufficient for launch

10. Exact implementation phases
Reference Phases 10 through 14.

Update docs/DECISIONS.md with the final CMS architecture decision.
Update PROJECT_STATUS.md.

Validation:
- No code packages added
- No secrets created
- No frontend behavior changed
- npm run verify still passes

Do not commit.
Report the final decision, reasons, blockers checked, and recommended commit message.
```

## Human approval

Read `docs/CMS_DECISION.md`.

The expected result is:

```text
Selected CMS: Sanity
```

Proceed unless the document identifies a specific, credible blocker.

## Commit

```text
docs: select and design CMS architecture
```
