# Phase 03: Requirements and Content Contract

## Objective

Turn the project requirements into a written contract that future Codex sessions cannot casually reinterpret.

This phase should mostly document and validate the existing architecture. It should not redesign the site.

## Confirmed product requirements

The site must support:

- Publication name: Sidwell Business Review
- Three issues per school year, approximately
- Five to ten articles per issue
- Public access for a broad audience
- Articles with text, images, captions, credits, pull quotes, and callouts
- Multiple authors
- Author pages listing all articles
- Issues
- Categories and tags
- Pinned homepage stories
- About and Masthead pages
- Search and archive
- Private editor-only content management
- Google Docs remaining the writing and editorial-review workspace
- Editors transferring approved content into the CMS
- Faculty adviser approval occurring before publication
- Easy future logo, color, and typography changes
- Long-term leadership handoff

## Codex prompt

```text
You are performing Phase 03 of the Sidwell Business Review website project.

First:
1. Read all root documentation and docs/DECISIONS.md.
2. Inspect the current TypeScript content types and content-access functions.
3. Inspect all routes and reusable components.
4. Run git status and stop if the repository is dirty.
5. Do not redesign the UI.
6. Do not add the CMS yet.

Create docs/PRODUCT_REQUIREMENTS.md containing:

1. Publication overview
2. Audience
3. Editorial workflow
4. User roles
5. Launch scope
6. Future scope
7. Out-of-scope items
8. Page-by-page requirements
9. Homepage editorial rules
10. Article requirements
11. Author requirements
12. Issue requirements
13. Category and tag requirements
14. Image, caption, credit, and alt-text requirements
15. Search and archive requirements
16. Branding configurability
17. Accessibility requirements
18. Security and privacy requirements
19. CMS requirements
20. Handoff requirements
21. Definition of done

Create docs/CONTENT_MODEL.md containing a framework-independent content contract for:

- Site settings
- Article
- Author
- Issue
- Category
- Tag
- Static page
- Image asset
- Structured body blocks

For every field, document:
- Type
- Required or optional
- Validation rule
- Public visibility
- Example
- CMS migration notes

The article contract must include at minimum:
- id
- slug
- title
- subtitle
- summary
- authors
- issue
- category
- tags
- featured image
- featured image alt text
- featured image caption
- featured image credit
- structured body
- publication date
- updated date
- status
- pinned
- featured rank
- SEO title
- SEO description

The body model must cover:
- Paragraph
- Heading
- Bulleted list
- Numbered list
- Block quote
- Pull quote
- Inline image
- Image caption
- Photo credit
- Callout box
- Divider
- Link
- Optional table or chart-image extension

Create docs/ROUTE_CONTRACT.md:
- List every public route pattern.
- State what content-access function it uses.
- State expected empty, loading, error, and not-found behavior.
- State expected metadata behavior.

Then compare the written contract with the current TypeScript implementation.

Make only small, low-risk type changes required to prevent an obvious mismatch. Do not start a broad renderer rewrite. Record larger mismatches as tasks in PROJECT_STATUS.md.

Validation:
- Run npm run lint.
- Run npm run typecheck.
- Run npm run build.
- Confirm every route still builds.
- Update docs/DECISIONS.md if a new architecture decision was made.
- Update PROJECT_STATUS.md.

Do not commit. Report:
- Contract files created
- Mismatches found
- Code changes made
- Deferred mismatches
- Recommended commit message
```

## Manual review questions

Before proceeding, confirm:

- Does the written article model match what editors actually need?
- Are captions, credits, and alt text separate?
- Are issue and author relationships clear?
- Is the difference between draft and published content explicit?
- Is CMS access restricted to editors and administrators?
- Are writers excluded from needing accounts?

## Commit

```text
docs: define product and content contracts
```
