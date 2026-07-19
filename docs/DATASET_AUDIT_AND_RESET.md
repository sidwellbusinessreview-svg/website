# Dataset audit and reset

These commands use the current authenticated Sanity CLI session. They never contain or print a token.

```bash
npm run sanity:audit-content
npm run sanity:audit-contributors
npm run sanity:cleanup-legacy
npm run sanity:reset-test-content
```

The first two commands are read-only. The contributor audit reports each affected Article title, draft/published state, and invalid member count, and writes a dry-run repair plan without mutating content. The general audit fails when it finds legacy/unregistered document types, dangling references, or obsolete fields. Cleanup/reset commands are dry-run by default and write timestamped ignored reports under `.sanity-reports/`.

`npm run sanity:cleanup-fields` also detects obsolete Contributor photo fields and nested About `portrait`/`portraitAltText` fields. Its dry run reports exact unset paths but never mutates documents or deletes referenced assets. Article featured/inline images and publication-logo assets are outside this cleanup.

Before approved legacy cleanup, export the dataset and then run:

```bash
npx sanity exec scripts/sanity/cleanup-legacy.ts --with-user-token -- --apply --expect-project PROJECT_ID --expect-dataset DATASET --export-confirmed /absolute/path/to/recent-export.tar.gz --confirm "CLEAN LEGACY CONTENT"
```

For a deliberately disposable development dataset:

```bash
npx sanity exec scripts/sanity/reset-test-content.ts --with-user-token -- --apply --expect-project PROJECT_ID --expect-dataset DATASET --confirm "RESET TEST CONTENT"
```

Production mode additionally requires `--production-override "I ACCEPT PRODUCTION DATA LOSS"`. Neither command deletes assets by default or runs during install, test, build, or deployment. Review the target and report before applying.
