# Phase 05: Content Renderer and Data Validation

## Objective

Make the article system reliable before connecting it to a CMS.

The local sample data should behave like future CMS data. Invalid content must be caught early rather than crashing public pages.

## Codex prompt

```text
You are performing Phase 05 of the Sidwell Business Review website project.

Before changing anything:
1. Read the product, content, and route contracts.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Inspect the content model, sample data, renderer, and access layer.
5. Do not add the CMS yet.
6. Preserve all existing routes.

Implement robust runtime validation for local content.

Requirements:

1. Schema validation
- Use a current, maintained TypeScript-friendly runtime validation approach such as Zod if not already present.
- Keep TypeScript types aligned with runtime schemas.
- Validate articles, authors, issues, categories, site settings, and body blocks.
- Produce understandable errors in development.
- Do not expose internal validation details to public visitors in production.

2. Cross-document validation
Detect:
- Duplicate article slugs
- Duplicate author slugs
- Duplicate issue slugs
- Missing referenced authors
- Missing referenced issues
- Missing referenced categories
- Invalid publication dates
- Published articles missing required fields
- Images missing alt text
- Captions without an image
- Invalid featured ranks
- Multiple lead articles when rules prohibit it

3. Renderer completeness
Confirm support for:
- Paragraphs
- Headings
- Bulleted lists
- Numbered lists
- Block quotes
- Pull quotes
- Images
- Captions
- Credits
- Callout boxes
- Dividers
- Links

Unknown blocks must:
- Produce a clear development warning
- Fail safely in production
- Never render raw untrusted HTML

4. Content access behavior
- Keep all pages using content-access functions.
- Do not allow raw sample-data imports from page components.
- Make sorting deterministic.
- Define handling for drafts versus published records.
- Keep local data capable of supporting future CMS replacement.

5. Test fixtures
Add test cases for:
- Every valid block
- Every invalid relationship
- Long headlines
- Multiple authors
- Missing optional values
- Missing required values
- Draft exclusion from public results
- Pinned ordering
- Same-date deterministic ordering

6. Developer tooling
Add a script such as:
- npm run validate:content

Make it part of npm run verify.

7. Documentation
Update CONTENT_MODEL.md with actual validation.
Add docs/CONTENT_AUTHORING_RULES.md describing:
- Required metadata
- Image alt text
- Captions
- Credits
- Link rules
- Pull quote usage
- Callout usage
- Heading hierarchy

Validation:
- Run npm run validate:content.
- Run npm run verify.
- Run npm run test:e2e.
- Run npm run build.
- Temporarily prove that one invalid fixture is detected, then revert it.
- Update PROJECT_STATUS.md.

Do not commit.
Report all changed files, validation behavior, test counts, and the recommended commit message.
```

## Manual review

Open all six sample articles and confirm every block still renders correctly.

## Commit

```text
feat: harden content validation and article rendering
```
