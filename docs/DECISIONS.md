# Architecture decision log

This file records durable technical and operational decisions. Add a dated entry when a choice changes the project’s architecture, dependencies, service ownership, security posture, or editorial workflow.

## Decision template

### ADR-XXX: Short title

- **Status:** Proposed, accepted, superseded, or rejected
- **Date:** YYYY-MM-DD
- **Context:** What problem or constraint prompted the decision?
- **Decision:** What was chosen?
- **Consequences:** What becomes easier, harder, required, or intentionally deferred?

## Accepted decisions

### ADR-001: Continue the current Next.js application

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Phase 1 produced a working, validated publication prototype.
- **Decision:** Improve the existing application rather than reinitialize or replace it.
- **Consequences:** Existing routes, visual behavior, sample content, and component boundaries remain the baseline.

### ADR-002: Use App Router and TypeScript

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** The project needs typed content, static generation, metadata, and maintainable route organization.
- **Decision:** Continue using the Next.js App Router with strict TypeScript.
- **Consequences:** New routes belong under `src/app`, and code changes must pass TypeScript validation.

### ADR-003: Centralize design tokens

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Publication branding must be globally adjustable and not repeated throughout components.
- **Decision:** Keep colors, typography, spacing, and layout values in centralized CSS variables.
- **Consequences:** Components should consume shared tokens; global visual changes should not require scattered hardcoded edits.

### ADR-004: Preserve the content-access layer

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Local sample data must eventually be replaceable by a CMS.
- **Decision:** Pages use the asynchronous functions exported from `src/content/index.ts` instead of importing raw data.
- **Consequences:** A future provider can replace the local implementation without rewriting page components.

### ADR-005: Harden the frontend before CMS implementation

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Route correctness, tests, responsive behavior, accessibility, and content validation should be stable before adding an external editorial system.
- **Decision:** Defer CMS implementation until the planned frontend-hardening phases are complete.
- **Consequences:** CMS environment variables remain unused placeholders and local sample content remains authoritative for now.

### ADR-006: Use Sanity as the default CMS path

- **Status:** Accepted with review gate
- **Date:** 2026-07-16
- **Context:** The project needs a working default direction for later CMS planning.
- **Decision:** Plan for Sanity unless a documented technical, policy, privacy, cost, or editorial-workflow blocker is found.
- **Consequences:** Any change to the default CMS path requires a new architecture decision explaining the blocker and replacement.

### ADR-007: Use the publication Gmail as the persistent administrative account

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Student leadership changes over time, while service ownership and recovery must persist.
- **Decision:** The publication-managed Gmail account is the durable administrative and recovery identity for project services.
- **Consequences:** Ownership should not depend solely on a graduating student’s personal account.

### ADR-008: Invite individual editor accounts where team access exists

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Shared credentials reduce accountability and complicate offboarding.
- **Decision:** Services that support teams should invite individual editor or maintainer accounts with the minimum appropriate role.
- **Consequences:** The publication account remains the durable owner while individual access can be reviewed and revoked during handoffs.

### ADR-009: Treat the content contract as provider-independent

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** The current TypeScript model is intentionally small, while the launch product requires editorial status, taxonomy entities, reusable assets, SEO fields, and CMS workflow metadata.
- **Decision:** `docs/CONTENT_MODEL.md` defines the provider-independent target contract. Local data and the future CMS must map into application-domain types through the content-access layer rather than exposing provider-native records to routes and general components.
- **Consequences:** Contract fields may be introduced incrementally with validation and adapters. Documentation of a field does not mean it is already implemented, and CMS migration must not bypass the existing provider boundary.

### ADR-010: Keep search and discovery provider-independent

- **Status:** Accepted
- **Date:** 2026-07-16
- **Context:** Search must work with local data now while remaining replaceable by CMS-backed or hosted search later.
- **Decision:** Expose search and archive filtering through the content-access layer, and generate sitemap and RSS entries only from public content-access functions.
- **Consequences:** Routes never index raw sample arrays. A future provider may replace ranking and retrieval while preserving public-only results and the page-facing contracts.

### ADR-011: Select Sanity Studio and Sanity Content Lake

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Frontend hardening is complete and Phase 09 requires a final CMS choice. Sanity, Payload, and Decap were compared against the publication's structured content, preview, editor, continuity, cost, policy, export, and operating requirements. No required-functionality, sustainable-cost, continuity, Next.js-compatibility, exportability, editor-usability, or known school-policy blocker to Sanity was found.
- **Decision:** Use a separately deployed Sanity Studio whose source lives in this repository, with editorial content in Sanity Content Lake. The public application will read through a Sanity adapter behind the existing content-access layer. Use explicit local/Sanity provider selection during migration, authenticated Draft Mode for preview, Sanity image delivery, and verified webhook-driven revalidation. Obtain school approval and confirm the seat/role plan before adding real student data or accounts.
- **Consequences:** Phases 10–14 implement the design in `docs/CMS_DECISION.md`. No CMS package, credential, or frontend behavior changes in Phase 09. Granular editor roles or private datasets may require a paid plan; Payload is the documented fallback if policy requires school-controlled hosting. A different CMS requires a superseding ADR with a concrete blocker.

### ADR-012: Embed Sanity Studio at `/studio`

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Phase 10 requires the editorial Studio at a stable application route. Current official `next-sanity` guidance supports an App Router optional catch-all route, static Studio shell, noindex metadata, and Sanity-managed authentication.
- **Decision:** Embed Studio at `/studio` in the existing Next.js application instead of deploying a separate Studio. Keep it out of public navigation, disallow it in `robots.txt`, retain Sanity's noindex metadata, and render safe setup guidance when public configuration is absent.
- **Consequences:** This supersedes only ADR-011's separate-Studio hosting detail. Content remains in Content Lake, public pages retain the content-provider boundary and local source, and Sanity authentication—not application authentication—controls editing. Trusted Studio origins require tightly scoped credentialed CORS entries.

### ADR-013: Derive Sanity types and use native drafts

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Phase 11 needs an editor-friendly schema without creating a second, incompatible hand-maintained CMS type system or duplicating workflow state.
- **Decision:** Define provider schemas with current Sanity schema helpers, use Sanity's native draft/published document state, extract the schema with required-field enforcement, and generate provider types with Sanity TypeGen. Keep an explicit provider-to-domain adapter contract; do not expose generated records to routes.
- **Consequences:** Schema changes require `npm run sanity:typegen`. The generated schema and types are reviewable build inputs, while Phase 12 must implement projections, runtime mapping, and provider parity before public content can switch to Sanity.

### ADR-014: Simplify the launch editorial model

- **Status:** Superseded in part by ADR-015
- **Date:** 2026-07-17
- **Context:** The initial Phase 11 schema added issues, categories, tags, biographies, and placement metadata beyond the publication's actual launch workflow.
- **Decision:** Use Contributors, Articles, Masthead, About, and Site Settings only. Articles use date-only publication values and automatic SEO with optional title/description overrides. Remove issue/category/tag documents and public discovery behavior; keep `/authors/[slug]` as the compatibility URL for contributor profiles. ADR-015 later consolidates Masthead into About.
- **Consequences:** The archive is chronological with school-year/contributor filters. An optional plain-text section or edition label requires demonstrated need and a future decision. Existing unseen draft records need export/review and explicit migration rather than destructive automatic cleanup.

### ADR-015: Use actual document pairs for article state and consolidate staff into About

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Perspective-flattened Studio lists can make a draft-only document appear published, and separate Masthead and Contributor biography content add editorial complexity without launch value.
- **Decision:** Classify Articles from raw draft/published ID pairs as Draft only, Published, or Published with changes. Present explicit publish, publish-changes, discard-changes, and confirmation-protected unpublish actions. Remove duplication actions for core editorial documents. Put the staff roster in the fixed About page and exclude Contributor biographies.
- **Consequences:** The custom article state panes must query with the raw perspective. The former standalone staff route is retired, About owns staff roles, and any legacy staff-page or biography data requires export/review rather than automatic deletion.

### ADR-016: Archive Contributors and require explicit dataset migrations

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Removing a schema did not remove a legacy draft document, whose strong reference then correctly blocked Contributor deletion.
- **Decision:** Treat schema removal and Content Lake migration as separate operations. Require raw audits, export-backed dry-run cleanup, explicit target/confirmation gates, regenerated types, and absence tests. Archive Contributors for normal offboarding; retain strong Article/About references and replace generic deletion with reference-aware workflows.
- **Consequences:** Assets are preserved by default, published Articles never cascade-delete, compatibility aliases require a documented removal plan, and destructive commands never run automatically.

### ADR-017: Select content providers explicitly during migration

- **Status:** Accepted
- **Date:** 2026-07-19
- **Context:** Public routes need CMS data without coupling pages to GROQ, while migration requires a recoverable local mode and must never expose drafts or hide a CMS outage behind sample content.
- **Decision:** Local and Sanity implementations conform to the domain-facing `ContentProvider` and are selected by `CONTENT_SOURCE`. The temporary default is `local` until migration acceptance; production then explicitly uses `sanity`. Public Sanity reads use published perspective, explicit draft exclusion, deterministic ordering, adapters, exact 300-second tagged caching, and fixed-tag secret-authenticated revalidation. There is no automatic local fallback after explicit Sanity selection.
- **Consequences:** Pages remain provider-independent. Missing configuration fails clearly, query failures become controlled errors, and rollback is deliberate. ADR-014 remains authoritative: the provider has no Issue, Category, Tag, or Masthead methods or queries.

### ADR-018: Treat About and Site Settings as durable fixed pages

- **Status:** Accepted
- **Date:** 2026-07-20
- **Context:** Deleting both variants of the fixed About document left editors at a confusing missing-document state, and generic document actions could expose destructive lifecycle operations.
- **Decision:** About uses fixed ID `about` and Site Settings uses `siteSettings`. Their permanent Structure entries use lifecycle panes rather than opening an absent ID directly. Current records open normally. An absent current pair offers explicit history inspection or confirmed clean draft initialization at the same fixed ID; it never restores or publishes automatically. Initialization uses `sanity.action.document.create` with `createDraftId`, never a generic mutation against `drafts.*`, and must be verified by an exact raw existence query before navigation. Singleton actions use a schema-registry allowlist: Publish is retained; Discard is shown only for a published document with unpublished changes; delete, duplicate, copy, and unpublish are never available. Normal Sanity drafts remain enabled for future preview; Scheduled Drafts and Releases UI are disabled.
- **Consequences:** An empty content query is no longer treated as proof of a never-created record. CLI audits report partial history as indeterminate, while authenticated Studio remains authoritative for its own retained document history. Draft-only fixed pages cannot be discarded destructively. Public adapters use controlled defaults while a fixed page has no published version. Lifecycle changes require the read-only fixed-page audit, state/action tests, and an authenticated Studio recovery check.

### ADR-019: Use one validated Sanity target for all surfaces

- **Status:** Accepted
- **Date:** 2026-07-21
- **Context:** Studio and CLI disagreed about whether the current About document existed, while several callers used a hardcoded API version instead of the validated public environment.
- **Decision:** Public project, dataset, and API version come from `src/sanity/env.ts`. Studio configuration, CLI configuration, fixed-page checks, read-only audits, provider diagnostics, the public provider, TypeGen, and CMS browser tests must resolve to that configuration. Fixed-page Studio and CLI checks share one exact uncached raw query.
- **Consequences:** Target diagnostics may safely report public project/dataset/API values but never tokens. Studio emits detailed target/result diagnostics only in development. A current About response of `[]` always selects the creation/recovery view and can never enable **Open About**.
