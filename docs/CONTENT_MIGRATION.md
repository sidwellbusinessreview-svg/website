# Content migration intake

Phase 14 uses a source-evidence-first workflow. The supplied archive remains unchanged in `migration-input/SBR_All_Articles_Migration_Bundle/`. Generated normalized records, review reports, the pilot manifest, checksums, and rollback IDs live in `migration-staging/sbr-archive-2026-08/`.

No Issues, Categories, or Tags are inferred from source sections. No Article image is assigned until a human confirms its mapping, reuse permission, alt text, caption, and credit.

## Commands

```bash
npm run sanity:migration:validate
npm run sanity:migration:dry-run
```

Both commands are read-only with respect to Sanity. They regenerate staging files from the immutable bundle. The dry run reports zero mutations and shows the exact drafts that would be considered after blockers are resolved.

An apply entry point exists for a later, separately authorized phase:

```bash
SBR_MIGRATION_CONFIRMATION='IMPORT SBR PILOT AS DRAFTS' npm run sanity:migration:apply
```

Do not run that command now. It refuses to proceed while any pilot Article lacks required data. A future implementation/acceptance step must also query current raw IDs, abort on published conflicts, create Contributors before Articles through supported Sanity document actions, and record the resulting rollback mapping. The current Phase 14 intake does not contain or execute a dataset mutation path.

## Current intake

- Eight unique source Articles and nine stable Contributor identities were detected.
- Four Articles are pilot candidates, but all four lack an exact publication day and the pilot remains blocked.
- Two Articles have neither a proven author nor a publication date.
- The housing opinion is held because its supplied source lacks a trustworthy ending.
- The NFL Article is held as an unfinished draft; its two-author attribution is inferred from the filename.
- All proposed summaries are neutral, at most 300 characters, and marked for editorial review.
- All Articles are staged image-free. Extracted images and rendered pages are reference material only.

## Date decisions

For each month-only or unknown date, an editor must choose one of these approaches before import:

1. Obtain the exact historical publication date.
2. Approve an explicit month-precision content-model change.
3. Approve and document an archival sorting convention that does not display an invented day.

No convention has been selected in Phase 14.

## Review sequence

1. Review `reports/BUNDLE_VALIDATION.md` and resolve source inconsistencies, if any.
2. Confirm Contributor identities and ordered bylines.
3. Approve or revise proposed summaries.
4. Resolve dates and all hold-list fields.
5. Review normalized bodies against the supplied PDFs and Markdown.
6. Decide image mapping and rights separately.
7. Regenerate and review the dry run.
8. Obtain explicit authorization before adding a real, draft-only apply implementation or running any import.
