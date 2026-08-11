# Content migration intake

Phase 14 uses a source-evidence-first workflow. The supplied archive remains unchanged in `migration-input/SBR_All_Articles_Migration_Bundle/`. Generated normalized records, review reports, the pilot manifest, checksums, and rollback IDs live in `migration-staging/sbr-archive-2026-08/`.

No Issues, Categories, or Tags are inferred from source sections. No Article image is assigned until a human confirms its mapping, reuse permission, alt text, caption, and credit.

## Commands

```bash
npm run sanity:migration:validate
npm run sanity:migration:dry-run
npm run sanity:migration:report
npm run sanity:migration:rollback
```

Both commands are read-only with respect to Sanity. They regenerate staging files from the immutable bundle. The dry run reports zero mutations and shows the exact drafts that would be considered after blockers are resolved.

Guarded apply and rollback-apply entry points exist but must not be run during preparation:

```bash
SBR_MIGRATION_CONFIRMATION='IMPORT SBR PILOT AS DRAFTS' npm run sanity:migration:apply -- --expect-project=PROJECT_ID --backup=/absolute/path/to/export.tar.gz
SBR_MIGRATION_ROLLBACK_CONFIRMATION='ROLL BACK SBR PILOT DRAFTS' npm run sanity:migration:rollback:apply -- --expect-project=PROJECT_ID
```

Do not run either apply command now. Apply requires a server-only `SANITY_API_WRITE_TOKEN`, exact confirmation, expected production target, non-empty target-matching backup plus manifest, current checksum approvals, and a clean preflight before its first action. It creates Contributors before draft Articles, rejects published/source/slug conflicts, remains idempotent for matching drafts, uploads no images, and writes an applied-operation report. Rollback selects only current drafts carrying this batch ID.

## Current intake

- Eight unique source Articles and nine stable Contributor identities were detected.
- Four Articles are pilot candidates. Their month-only dates use canonical `YYYY-MM`; the pilot remains blocked until all four revised summary checksums are approved.
- Two Articles have neither a proven author nor a publication date.
- The housing opinion is held because its supplied source lacks a trustworthy ending.
- The NFL Article is held as an unfinished draft; its two-author attribution is inferred from the filename.
- All revised proposed summaries are one neutral sentence, at most 300 characters, and contain no migration/readiness language. `editor-approvals.json` starts every checksum as unapproved and automatically invalidates approval when its summary changes.
- All Articles are staged image-free. Extracted images and rendered pages are reference material only.

## Date policy

Every Article stores `publicationMonth` as `YYYY-MM`, and every reader-facing date is Month Year. Original source date text remains staging provenance where useful, but Studio receives no day, precision value, or fake first-of-month anchor. JSON-LD and Open Graph use `YYYY-MM`; sitemap omits Article `lastModified`; RSS omits `pubDate` because RFC 822 requires an unknown day. Completely missing months remain blocked.

Migration staging extracts numbered source citations into each Article's structured `sources` array and maps matching inline citation numbers to cursor-style inline footnote objects containing only a source key. Generated display numbering follows source order. Citation/footer lines are removed from the normalized body; the migration never imports bracket characters, visible numbers, spacing before a footnote, or a manual Sources heading.

## Backup and approval

Create the ignored production export before apply:

```bash
mkdir -p migration-backups
npx sanity dataset export production migration-backups/sbr-production-YYYY-MM-DD.tar.gz
```

Create the sibling `.manifest.json` with project ID, dataset, timestamp, and checksum. Review each proposed summary, then set `approved: true`, `approvedBy`, and `approvedAt` only without changing its generated checksum. Regenerate the dry run; any changed summary resets approval.

## Review sequence

1. Review `reports/BUNDLE_VALIDATION.md` and resolve source inconsistencies, if any.
2. Confirm Contributor identities and ordered bylines.
3. Approve or revise proposed summaries.
4. Confirm publication months and resolve missing months for held records.
5. Review normalized bodies and structured Sources against the supplied PDFs and Markdown; verify repeated citations map to one source.
6. Decide image mapping and rights separately.
7. Regenerate and review the dry run.
8. Export and verify a backup, obtain explicit authorization, then run the guarded apply command separately.
