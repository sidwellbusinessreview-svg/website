# Phase 14: Media Pipeline and Archive Migration

## Objective

Replace placeholder images and establish a safe, repeatable method for importing the existing 30 to 50 articles.

Do not manually copy every article before the import process has been tested on five representative articles.

## Human preparation

Create or complete an article inventory spreadsheet with:

- Issue
- Title
- Subtitle
- Authors
- Publication date
- Category
- Tags
- Google Doc link
- Featured image
- Featured image alt text
- Caption
- Credit
- Additional images
- Ready status
- Notes

Select five representative articles:

1. Short
2. Long
3. Multiple authors
4. Multiple images
5. Unusual headline or formatting

Confirm online publication permission for every image.

## Codex prompt

```text
You are performing Phase 14 of the Sidwell Business Review website project.

Before changing anything:
1. Read CONTENT_AUTHORING_RULES.md and CMS_EDITOR_MODEL.md.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Confirm CMS-backed content and preview work.
5. Do not import the full archive immediately.
6. Do not scrape Google Docs or Drive without explicit authorized access.
7. Do not upload images without confirmed publication rights.

Build a safe media and migration workflow.

Media requirements:
- Featured and inline Sanity images
- Required alt text
- Optional caption
- Photo credit
- Hotspot and crop
- Original filename where useful
- Reasonable file-size guidance
- Accepted formats
- No reliance on remote Unsplash placeholders for launch
- Clear handling for logos, author headshots, issue covers, and article images
- Prevent decorative logos from receiving misleading alt text

Migration tooling:
1. Define a CSV or JSON import format aligned with the content model.
2. Create a dry-run validation command.
3. Create an import command that requires explicit confirmation.
4. Detect:
   - Duplicate slugs
   - Duplicate source IDs
   - Missing authors
   - Missing issues
   - Missing categories
   - Missing dates
   - Missing alt text
   - Missing image rights or credit status when represented
   - Broken image paths
   - Unsupported block structures
5. Produce an import report.
6. Make imports idempotent where practical.
7. Never overwrite published content silently.
8. Support a rollback or delete-by-import-batch strategy.
9. Keep source-to-CMS ID mapping.
10. Do not store Google Docs authentication secrets in the repository.

Google Docs workflow:
- Editors continue writing in Docs.
- Final approved content is converted into structured CMS content.
- Document what formatting is retained, transformed, or manually reviewed.
- Provide a manual fallback.
- Do not promise perfect rich-text conversion.

Implement scripts or tooling for:
- Importing authors
- Importing issues
- Importing categories
- Importing articles
- Uploading linked local image files when available
- Validating imported output

Migration sequence:
1. Import reference data.
2. Dry-run five articles.
3. Import five articles into draft state.
4. Preview each.
5. Correct errors.
6. Publish only after approval.
7. Import one complete issue.
8. Re-run all tests.
9. Import remaining archive in batches.

Backups:
- Export the Sanity dataset before bulk import.
- Document export and restore.
- Name backups with date and purpose.
- Never commit backup archives containing personal or draft content to the public repository.

Tests:
- Valid import
- Duplicate handling
- Missing-reference failure
- Dry-run no-mutation behavior
- Idempotency
- Rollback mapping
- Image metadata
- Draft-by-default behavior

Documentation:
Create:
- docs/ARTICLE_IMPORT_FORMAT.md
- docs/ARCHIVE_MIGRATION.md
- docs/IMAGE_POLICY.md

Update PROJECT_STATUS.md.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Run dry-run against test fixtures.
- Import only the five approved test articles.
- Compare CMS and source documents manually.
- Confirm imported records are drafts.
- Confirm no secrets or copyrighted placeholder assets were committed.

Do not commit.
Report tooling, migration results, failures, changed files, and recommended commit message.
```

## Required manual review for every imported article

- Title
- Subtitle
- Author order
- Date
- Issue
- Category
- Tags
- Paragraph breaks
- Headings
- Lists
- Links
- Images
- Alt text
- Captions
- Credits
- Pull quotes
- Callouts
- Mobile layout
- Preview
- Publication approval

## Commit

```text
feat: add media governance and archive migration tooling
```
