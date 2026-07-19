# Simplified publishing workflow

## First-time contributor setup

1. Open `/studio` and choose **Contributors**.
2. Create a contributor with Name and generated Slug. Add an optional role or graduation year. Contributor identity is text-only: records do not contain portraits, avatars, initials artwork, photos, or biographies.
3. Review the public spelling and slug.
4. Select **Publish**. Publishing a contributor creates no article and sends no notification.

## Publish an article

1. Create and publish the contributor first.
2. Create an Article.
3. Enter Title, generate the Slug, add optional Subtitle, and write the Summary.
4. Select one or more published Contributors in byline order.
   - Choose **Add contributors**, search by name or role, select one or more people, and use **Confirm selection** once.
   - X, Escape, outside click, or **Cancel** closes the selector without saving.
   - Reorder and remove people with the explicit controls on each text-only byline row. Default Copy, Duplicate, Replace, and Add-before/after menus are intentionally unavailable.
   - If a historical malformed-entry warning appears, use **Repair invalid entries** only after reviewing the retained valid byline. Other valid bylines and their order remain unchanged.
5. Enter the date as `YYYY-MM-DD`.
6. Optionally add a JPEG, PNG, or WebP featured image. When present, add contextual alt text and optional caption/credit. Add the required structured body.
7. Optionally pin the article and set Featured order. Leave Advanced / SEO blank unless an editor has a specific reason to override automatic metadata.
8. Preview and review accuracy, links, accessibility, image rights, byline order, and date.
9. Select **Publish**. The article moves from **Draft only** to **Published**.

## Update a published article

1. Open the article. Editing creates unpublished changes while the existing published version remains public.
2. Confirm the badge and list state read **Published with unpublished changes**. The published version remains public until those changes are published.
3. Review the changed fields and preview.
4. Select **Publish changes** to replace the public version, or **Discard unpublished changes** to keep the existing public version and remove the draft edits.

## Unpublish an article

1. Open the article and select **Unpublish article**.
2. Read the confirmation carefully and confirm only when the story should leave the public CMS dataset.
3. If unpublished changes also existed, review the remaining draft before editing or publishing again.

Unpublish is not delete. Duplicate is intentionally unavailable for Articles, Contributors, About, and Site Settings to reduce accidental records.

The schema does not cascade-publish contributors. If article validation reports an unpublished contributor, open that contributor, review it, publish it, then return to the article. Never create duplicate contributor records merely to bypass the warning.

## Offboard a contributor

Use **Archive contributor**. Do not delete a contributor merely because they graduate or leave staff. Existing articles and profile history remain intact, while the archived record is hidden from new byline/About selections. Use **Restore contributor** to return them to selection lists. Permanent deletion is reserved for erroneous records and follows the reference-aware workflow in `CONTRIBUTOR_LIFECYCLE.md`.

## Test safely

Use the development dataset. Give test slugs an obvious prefix and keep the article as a draft unless the test explicitly requires publication. Before removing test content, confirm it is not referenced. Export or record anything that might need recovery; never run destructive cleanup against production without explicit confirmation.

Article list panes can be searched by title, subtitle, summary, Contributor, or publication date and sorted by publication date, title, or update time. Search and sorting are view-only and never publish, unpublish, or edit an Article.
