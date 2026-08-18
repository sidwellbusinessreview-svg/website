# Product requirements

## Publication and audience

Sidwell Business Review is a student-run publication presenting serious, accessible reporting and analysis about business and economics. Its readers include the Sidwell community, students elsewhere, educators, alumni, and general readers. The website is a public publication, not a social network, school-record system, or administration product.

## Launch scope

- Homepage with one pinned lead or deterministic newest-story fallback
- Latest and chronological archive pages
- Article pages with structured content, responsive images, metadata, and contributor bylines
- Individual contributor pages listing all published work by that contributor
- About (including the staff roster), Search, RSS, sitemap, robots, and custom not-found behavior
- Configurable branding, accessible responsive presentation, and Sanity editorial workflow

There is no public contributor directory in primary navigation. Version 1 has no issue, category, or tag system. An optional plain-text section or edition label may be proposed later only after a demonstrated editorial need and a new architecture decision.

## Editorial workflow and roles

Writers do not need repository or Studio accounts. Editors create and publish a contributor record once, create an article, select contributors in byline order, preview, review accessibility/rights/accuracy, and publish manually. A publisher or editor-in-chief gives final approval. Technical maintainers preserve the content-provider boundary and do not make editorial decisions. Individual accounts are used where supported; the publication Gmail remains the durable administrative identity.

## Page requirements

- **Homepage:** one eligible pinned lead, newest fallback, recent stories, About and archive links; no issue module.
- **Latest/archive:** all published articles newest first. Archive filtering is limited to school year and contributor for expected launch scale.
- **Article:** title, optional subtitle, summary, contributors, Month Year publication date, featured image metadata, structured body, optional homepage placement, and automatic SEO defaults. Estimated reading time and word count are excluded.
- **Contributor:** public name, optional graduation year, and all published articles. Contributor records never store publication roles. Identity is text-only; photos, portraits, avatars, initials artwork, biography, and personal contact information are excluded.
- **About:** mission and publication information followed by Editor-in-Chief, Editors, and Faculty Adviser. Staff entries reference Contributors and may carry an About-only displayed label. Current leadership is configured here, independently of Contributor records.
- **Search/Not found:** accessible, resilient, useful recovery behavior; search covers public title, summary, contributor, and body text.

## Content and media rules

Every article has a unique slug, title, summary, at least one published contributor reference, publication month, and non-empty structured body. Sources are stored once; every body citation is a distinct Note occurrence numbered sequentially in reading order, including repeated use of one Source. Studio and the public page must agree on those occurrence numbers. Public Notes omit unused Sources, start collapsed with a visible count, open for exact note-fragment navigation, and print fully expanded.

Captions provide context, credits identify source/creator, and editors confirm rights. Raw HTML and unsafe links are prohibited. H2/H3 maintain heading hierarchy. Block quotes visually separate substantial quotations; callouts add concise supporting context.

## SEO, discovery, accessibility, security

Article metadata defaults to title plus publication name, summary, featured image, and slug-derived canonical URL. Optional title/description overrides are advanced fields and never required. Only published content appears in public routes, search, RSS, sitemap, or metadata.

Target WCAG 2.2 AA: semantic landmarks, visible focus, keyboard navigation, sufficient contrast, meaningful alt text, labeled controls, reduced-motion support, responsive reflow, and no keyboard traps. Minimize student personal information; never commit secrets or expose draft-provider errors publicly.

## Future and out of scope

Possible later work includes newsletters, submissions, related stories, corrections, charts, audio/video, or privacy-reviewed analytics. Version 1 excludes issues, categories, tags, scheduled publishing requirements, reader accounts, comments, payments, custom authentication, and arbitrary HTML.

## Definition of done

Contracts, schemas, generated types, adapters, tests, documentation, ownership, security review, content migration, accessibility checks, production build, preview workflow, rollback, and editor handoff must all be validated before launch. Public pages remain on local content until a later phase explicitly accepts provider parity and cutover.
