# Phase 11: Sanity Schema and Editor Experience

## Objective

Build the actual editor-facing content model and make it understandable to student editors.

The schema must match the written content contract. The Studio should not expose confusing implementation details when a clearer editorial label is possible.

## Codex prompt

```text
You are performing Phase 11 of the Sidwell Business Review website project.

Before changing anything:
1. Read CONTENT_MODEL.md, CONTENT_AUTHORING_RULES.md, CMS_DECISION.md, and SANITY_SETUP.md.
2. Inspect the local TypeScript content model.
3. Run npm run verify and npm run test:e2e.
4. Show git status and stop if the repository is dirty.
5. Confirm Sanity Studio opens.
6. Do not switch public pages to Sanity yet.

Create production-quality Sanity schemas for:

1. siteSettings
- Publication name
- Short name
- Description
- Affiliation text
- Text or image logo setting
- Logo image
- Contact information
- Social links
- Default SEO
- Homepage settings where appropriate

2. author
- Name
- Slug
- Photo
- Graduation year
- Role
- Biography
- Active/inactive state
- Sort order
- Optional contact or social fields only if approved for public use

3. issue
- Title
- Slug
- School year
- Issue number or season
- Publication date
- Cover image
- Introduction
- Status
- Sort order

4. category
- Name
- Slug
- Description
- Sort order

5. tag
- Name
- Slug

6. article
- Title
- Slug
- Subtitle
- Summary
- Multiple author references
- Issue reference
- Category reference
- Tag references
- Featured image
- Featured image alt text
- Featured image caption
- Featured image credit
- Structured body
- Publication date
- Updated date
- Status behavior using Sanity draft/published state rather than duplicating it unnecessarily
- Pinned
- Featured rank
- SEO title
- SEO description

7. staticPage if justified
- About
- Masthead introduction
- Contact or editorial policy content

Structured body:
- Standard portable text
- Headings with a controlled hierarchy
- Bulleted and numbered lists
- Block quote
- Pull quote object
- Article image object with alt text, caption, credit, hotspot/crop support
- Callout object with controlled variants
- Divider
- Links with validation
- No arbitrary raw HTML

Editor experience:
- Friendly field titles and descriptions
- Logical groups or tabs
- Required-field validation
- Slug generation
- Character guidance for summaries and SEO
- Image alt-text requirements
- Caption and credit guidance
- Publication-date guidance
- Preview cards showing title, issue, author, and status
- Custom Studio structure organized as:
  - Articles
  - Issues
  - Authors
  - Categories and Tags
  - Pages
  - Site Settings
- Helpful filters such as drafts, published, pinned, current issue, and missing metadata where feasible
- Prevent multiple siteSettings documents
- Prevent accidental deletion problems where practical

Types:
- Use current Sanity TypeGen or current recommended schema-derived typing workflow.
- Avoid manually maintaining duplicate incompatible types when generation can help.
- Keep an explicit adapter to the application's domain model.

Seed data:
- Create a safe optional script or documented process to create:
  - One issue
  - Four authors
  - Categories
  - One test article
- Never run destructive seeding against populated production data without confirmation.

Tests:
- Schema structure
- Required validation
- Image metadata requirements
- Multiple authors
- Article preview preparation
- Portable block mapping
- Singleton settings behavior where testable

Documentation:
Create docs/CMS_EDITOR_MODEL.md with screenshots placeholders and plain-English field explanations.
Update PROJECT_STATUS.md and DECISIONS.md.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run Sanity schema extraction or type generation.
- Run production build.
- Open Studio and manually create a draft test article without publishing it.
- Confirm the draft does not affect public pages yet.

Do not commit.
Report schemas, editor improvements, generated types, tests, changed files, and recommended commit message.
```

## Human Studio test

Create a draft article containing:

- Two authors
- One issue
- One category
- Two tags
- Featured image
- Alt text
- Caption
- Credit
- Several paragraphs
- Heading
- List
- Pull quote
- Inline image
- Callout

Do not publish it yet.

Ask yourself whether a future editor could understand every field without opening the code.

## Commit

```text
feat: implement Sanity editorial schema and Studio experience
```
