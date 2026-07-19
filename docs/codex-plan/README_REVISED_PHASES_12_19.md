# Revised Sidwell Business Review Plan: Phases 12–19

## Why these phases were rewritten

The original plan assumed an editorial model that no longer exists:

- Issues
- Categories
- Tags
- Author biographies
- Contributor portraits
- A separate Masthead page

The accepted model is now:

- Articles
- Contributors
- About
- Site Settings
- Chronological Archive
- Search
- Text-only contributor identity
- Optional article images
- Editor-only Sanity Studio
- Local content retained temporarily as rollback data

## What to do with the existing Phase 12 work

Do not delete or rebuild the Phase 12 implementation.

The existing work already includes:

- A stable content-provider interface
- Local and Sanity providers
- Typed Sanity queries and adapters
- Published-only public queries
- Search
- About content
- Contributor relationships
- Sitemap and feed integration
- Cache tags
- A revalidation endpoint
- Local rollback mode
- Automated CMS tests

Replace the old Phase 12 file with the revised Phase 12 file and run it as an **acceptance and correction phase**.

The revised Phase 12 must:

1. Inspect the work already completed.
2. Repair or remove the invalid second Sanity test article.
3. Verify the valid CMS article manually.
4. Verify draft isolation.
5. Verify local rollback mode.
6. Record the actual revalidation behavior.
7. Commit the existing Phase 12 implementation only after acceptance.

Do not paste the old implementation prompt again.

## Replacement instructions

Replace these files in:

```text
docs/codex-plan/
```

with the revised versions in this package:

```text
12_CMS_PROVIDER_ACCEPTANCE.md
13_DRAFT_PREVIEW.md
14_CONTENT_MIGRATION.md
15_PREVIEW_DEPLOYMENT_AND_REVALIDATION.md
16_SECURITY_PRIVACY_BACKUPS.md
17_EDITOR_HANDBOOK_HANDOFF.md
18_LAUNCH_ACCEPTANCE_AND_CUTOVER.md
19_POST_LAUNCH_MAINTENANCE.md
```

The old files may be deleted after the replacements are copied:

```text
12_CMS_INTEGRATION_CONTENT_QUERIES.md
13_DRAFT_PREVIEW_VISUAL_EDITING.md
14_MEDIA_AND_ARCHIVE_MIGRATION.md
15_DEPLOYMENT_ENVIRONMENTS_WEBHOOKS.md
16_SECURITY_PRIVACY_BACKUPS.md
17_EDITOR_HANDBOOK_HANDOFF.md
18_FINAL_LAUNCH_ACCEPTANCE.md
19_POST_LAUNCH_MAINTENANCE.md
```

## Current order

1. Complete revised Phase 12.
2. Commit and push Phase 12.
3. Complete Phase 13.
4. Continue one phase at a time.
5. Perform the manual acceptance test in every phase before committing.
6. Do not defer all testing until launch.

## Final editorial model

### Contributor

Required:

- Name
- Slug

Optional:

- Role
- Graduation year
- Active or archived state

Contributor identity is text-only. No photo, portrait, avatar, initials artwork, biography, contact information, or social links.

### Article

Required:

- Title
- Slug
- Summary
- At least one published active Contributor at initial publication
- Publication date
- Structured body

Optional:

- Subtitle
- Featured image
- Featured-image alt text, required only if an image exists
- Caption
- Credit
- Inline images, with alt text when present
- Pinned state
- Featured order
- SEO overrides

No Issue, Category, or Tag fields.

### About

- Publication introduction or mission
- Editors-in-Chief
- Editors
- Faculty Adviser

Staff entries reference Contributors and are text-only.

### Site Settings

- Publication name
- Short name
- Affiliation text
- Optional homepage tagline
- Optional logo
- Default SEO values
- Contact and social links when approved

## Provider strategy

Until launch acceptance:

```text
Local development:
- Use CONTENT_SOURCE=sanity when testing CMS behavior.
- Use CONTENT_SOURCE=local when testing rollback behavior.

Preview deployment:
- Use CONTENT_SOURCE=sanity.

Production deployment:
- Keep CONTENT_SOURCE=local until Phase 18 production cutover.
```

After Phase 18:

```text
Production:
- Use CONTENT_SOURCE=sanity.

Local provider:
- Retain only as a documented emergency rollback until a later maintenance decision removes it.
```
