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
