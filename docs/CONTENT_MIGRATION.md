# Content migration intake

Phase 14 uses a source-evidence-first workflow. The supplied archive remains unchanged in `migration-input/SBR_All_Articles_Migration_Bundle/`. That directory is intentionally excluded from Git because it contains supplied source documents and extracted working material; it is not generated during CI. Maintainers must obtain the bundle separately before running the migration commands. Generated normalized records, review reports, the pilot manifest, checksums, and rollback IDs live in `migration-staging/sbr-archive-2026-08/`.

CI does not need the source bundle. The migration unit tests create a temporary synthetic bundle to exercise metadata consistency, normalization, contributor mapping, readiness blockers, draft ordering, and apply/rollback safeguards. A separate local-only test validates the supplied archive when it is present. The production migration commands always read the supplied bundle and never substitute the test fixture.

No Issues, Categories, or Tags are inferred from source sections. No Article image is assigned until a human confirms its mapping, reuse permission, alt text, caption, and credit.

Contributor migration retains name, slug, optional graduation year, active state, and migration identity only. It never imports, defaults, or infers a publication role. Current leadership, including Editor-in-Chief, is configured separately on About through Contributor references.

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

Migration staging extracts each numbered Source once and maps every matching `[n]` marker to a distinct cursor-style footnote object containing that Source key. The manuscript number identifies Source-list entry `n`; it is not the eventual public number. Public Notes are numbered later by body occurrence order, so repeated `[7]` markers reuse Source 7 but become separate Notes. No visible number is persisted.

Studio derives and displays that current public occurrence number from the full body while editors work. Renumbering after insertion, deletion, or movement is expected and does not modify the migration Source mapping.

For migration, add Sources from the prepared list, then treat `[7]` as “choose Source 7 here.” Do not type `7` or expect the published Note to display 7: published numbers identify citation occurrences and run 1, 2, 3 in reading order. Ordinary quotations remain paragraphs; visually separated quotations use **Block quote** and the normal Footnote action. Callouts may retain a stable Source reference only when the source evidence is unambiguous.

When manually transferring a plain-text manuscript, every newline becomes a normal Article paragraph; CRLF/CR and tabs are normalized and blank-line runs do not create empty blocks. This remains true when a browser TXT viewer supplies presentation-only PRE or generic wrapper HTML with the plain text. URLs, punctuation, and `[n]` markers remain literal text. The Article warning counts likely markers so editors can replace them deliberately with structured footnotes. Genuine rich-document HTML is converted with schema-aware Portable Text Block Tools. Add Sources individually from reviewed evidence; bulk Source parsing is intentionally unavailable because citations do not have a safe universal delimiter.

Normal manual migration is: open the reviewed body-only `.txt`, copy the body, paste it once into Article body, format only genuine headings and Block quotes, replace each `[n]` with the matching structured Footnote, and preview. Paragraph boundaries are preserved automatically; manually repairing paragraph spacing is neither required nor acceptable as a workaround. Future paragraph collapse is a regression.

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
