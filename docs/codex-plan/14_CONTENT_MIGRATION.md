# Phase 14: Content Cleanup and Archive Migration

## Objective

Prepare and import the real Sidwell Business Review archive without reintroducing removed editorial concepts.

Expected archive size:

- Approximately 30 to 50 historical Articles
- Approximately three publication batches per school year, but no Issue document model
- Multiple Contributors
- Optional Article images

## Human preparation

Create a Google Sheet named:

```text
Sidwell Business Review Article Inventory
```

Use these columns:

```text
Source ID
Title
Subtitle
Summary
Contributor 1
Contributor 2
Additional Contributors
Publication date
Google Doc link
Featured image file or link
Featured image alt text
Featured image caption
Featured image credit
Inline images
Body formatting notes
Pinned
Ready for import
Image permission confirmed
Notes
```

Do not include:

- Issue
- Category
- Tag
- Contributor biography
- Contributor portrait

Select five representative Articles:

1. Short Article
2. Long Article
3. Multiple Contributors
4. Multiple inline images
5. Unusual formatting, long title, pull quote, or callout

Confirm publication permission for every image.

## Codex prompt

```text
You are performing revised Phase 14 of the Sidwell Business Review website project.

Before changing anything:

1. Read:
   - docs/CONTENT_MODEL.md
   - docs/CONTENT_AUTHORING_RULES.md
   - docs/CMS_EDITOR_MODEL.md
   - docs/PREVIEW_WORKFLOW.md
   - docs/DATASET_AUDIT_AND_RESET.md
   - PROJECT_STATUS.md
2. Confirm Phases 12 and 13 are committed.
3. Run full CMS and preview verification.
4. Show git status and stop if unrelated uncommitted work exists.
5. Do not import the full archive immediately.
6. Do not scrape Google Docs or Drive without explicit authorized access.
7. Do not upload images without confirmed permission.
8. Do not introduce Issues, Categories, Tags, portraits, avatars, or biographies.

Build a safe migration process for the accepted content model.

1. Clean the CMS test dataset.

Audit:

- Disposable test Articles
- Invalid published Article
- Draft-only test records
- Duplicate Contributors
- Legacy fields
- Malformed references
- Obsolete portrait or biography fields
- Old Masthead, Author, Issue, Category, or Tag documents
- Test About entries
- Test Site Settings values
- Orphaned assets

Before destructive cleanup:

- Export the dataset.
- Produce a dry-run report.
- Require explicit confirmation.
- Preserve assets by default.
- Preserve the one clean CMS integration Article until migration tooling is proven, unless the human approves deletion.

2. Final migration model.

Import only:

Contributor:
- Name
- Slug
- Optional role
- Optional graduation year
- Active state

Article:
- Title
- Slug
- Optional subtitle
- Required summary, maximum 300 characters
- Ordered Contributors
- Date-only publication date
- Optional featured image
- Conditional featured-image alt text
- Optional caption
- Optional credit
- Structured body
- Optional pinned state
- Optional featured rank
- Optional SEO overrides

About:
- Mission/introduction
- Editors-in-Chief
- Editors
- Faculty Adviser

Site Settings:
- Publication name and short name
- Affiliation
- Optional homepage tagline
- Optional logo
- Default SEO
- Approved contact/social links

3. Import format.

Create documented CSV or JSON input formats.

Requirements:

- Stable source ID
- Deterministic slug
- Explicit Contributor ordering
- Structured body representation
- Image paths or asset IDs
- Draft-by-default import
- Import batch ID
- Source-to-Sanity ID mapping

Do not require Issue, Category, or Tag columns.

4. Validation before mutation.

Dry run must detect:

- Duplicate source IDs
- Duplicate slugs
- Missing titles
- Missing summaries
- Summary over 300 characters
- Missing Contributors
- Unpublished or archived Contributor used for a new Article
- Invalid dates
- Unsupported images
- Missing alt text when an image exists
- Missing image-permission confirmation
- Broken local image path
- Unsupported body blocks
- Unsafe or malformed links
- Existing Sanity document conflict
- Invalid references
- Accidental test content

5. Safe import behavior.

Required:

- Dry run by default
- Explicit apply flag
- Typed confirmation phrase
- Draft-only Article creation
- Idempotency
- Never silently overwrite published content
- Patch/update only when source ID mapping proves identity
- Batch report
- Rollback mapping
- Import batch label in internal metadata if appropriate
- Asset upload before document reference
- Preserve Article image metadata
- No automatic asset deletion

6. Google Docs workflow.

Document a practical workflow:

1. Article is approved in Google Docs.
2. Editor enters or converts content into import format.
3. Formatting is reviewed.
4. Import creates a draft.
5. Editor opens Preview.
6. Editor corrects formatting.
7. Faculty adviser approves.
8. Editor publishes.

Do not promise perfect automatic Google Docs conversion.

If a helper converts exported Docs HTML or Markdown:

- Treat output as a draft.
- Sanitize links.
- Never import arbitrary HTML.
- Report unsupported formatting.

7. Five-Article pilot.

Import the five representative Articles as drafts.

For each, manually compare:

- Title
- Subtitle
- Summary
- Contributor order
- Date
- Paragraphs
- Headings
- Lists
- Links
- Pull quotes
- Callouts
- Featured image
- Inline images
- Alt text
- Captions
- Credits
- Mobile layout
- Preview

Publish only after explicit human approval.

8. One-batch pilot.

After the five-Article pilot succeeds:

- Import one coherent historical publication batch.
- Do not model it as an Issue.
- Verify chronological archive ordering.
- Verify Search.
- Verify Contributor pages.
- Verify sitemap and feed.
- Verify homepage remains editorially controlled.

9. Full archive.

Import remaining Articles in small batches.

After each batch:

- Run audit.
- Run provider diagnostic.
- Run CMS browser tests.
- Review Search and Archive.
- Export a fresh backup.
- Record failures and corrections.

10. Images.

Supported:

- JPEG
- PNG
- WebP

Article images remain optional.

Requirements:

- Alt text required only when image exists.
- Caption and credit optional.
- Image permission recorded in inventory.
- Replace Unsplash placeholders before launch.
- Do not create Contributor images.
- Do not create staff portraits.

11. Tooling.

Create or update:

- npm run sanity:migration:validate
- npm run sanity:migration:import
- npm run sanity:migration:report
- npm run sanity:migration:rollback-batch

Names may differ if existing project conventions are clearer.

Never run import automatically during:

- Install
- Build
- Test
- Deployment

12. Documentation.

Create:

- docs/ARTICLE_IMPORT_FORMAT.md
- docs/ARCHIVE_MIGRATION.md
- docs/IMAGE_POLICY.md
- docs/MIGRATION_REPORT_TEMPLATE.md

Update:

- docs/DATASET_AUDIT_AND_RESET.md
- docs/CONTENT_AUTHORING_RULES.md
- docs/SIMPLIFIED_PUBLISHING_WORKFLOW.md
- AGENTS.md
- PROJECT_STATUS.md

13. Tests.

Test:

- Valid import
- Dry-run no mutation
- Draft-by-default
- Idempotency
- Duplicate source ID
- Duplicate slug
- Missing Contributor
- Archived Contributor rejection for new Article
- Invalid date
- Summary maximum
- Optional image
- Conditional alt text
- Unsupported image
- Image-permission failure
- Missing source file
- Structured blocks
- Unsafe link rejection
- Existing published conflict
- Batch rollback
- Asset preservation

14. Validation.

Run:

- Dataset export
- Dataset audit
- Provider check
- Migration validation fixtures
- Five-Article dry run
- Five-Article import to drafts
- Preview tests
- Unit tests
- CMS browser tests
- Production build
- git diff --check

Do not commit.

Report:

- Cleanup performed
- Backup path and timestamp
- Import format
- Five-Article result
- Remaining archive count
- Image-permission gaps
- Test results
- Every changed file
- Exact human review
- Recommended commit message
```

## Human acceptance

Review all five pilot Articles in Preview.

Do not publish an Article until:

- It matches the approved source.
- Contributor order is correct.
- Date is correct.
- Formatting is correct.
- Images are permitted.
- Alt text is present when needed.
- Links work.
- Mobile layout works.
- Faculty adviser approval is complete.

Then import and review one historical batch.

## Stop conditions

Do not continue if:

- Import overwrites published content silently.
- Imported Articles are published automatically.
- Contributor identity fields reappear.
- Issues, Categories, or Tags reappear.
- Images lack permission tracking.
- Import cannot be rolled back by batch.
- Five representative Articles require excessive manual repair because the import format is inadequate.

## Commit

```text
feat: add safe Sanity archive migration workflow
```
