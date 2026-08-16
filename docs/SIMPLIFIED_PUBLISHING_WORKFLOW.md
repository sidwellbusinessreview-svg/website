# Simplified publishing workflow

Before publishing, use Studio’s **Preview** tool. Draft-only Articles and unpublished changes remain hidden from ordinary visitors. Save changes in Structure, refresh Preview, complete the review checklist in `PREVIEW_WORKFLOW.md`, and publish only after approval.

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
5. Under **Publication month**, choose the named Month and enter the four-digit Year. Editors never type the stored syntax or enter a day; readers see Month Year.
6. Add each Source once (citation required, HTTP/S URL optional). Every time you cite it in the body, click **Footnote** and choose that Source; repeated uses automatically receive new public Note numbers. Do not type public numbers or add a Notes heading.
7. Optionally add a JPEG, PNG, or WebP featured image. When present, add contextual alt text and optional caption/credit. Preview and confirm every superscript reaches the right source and its backlink returns to the body.
8. Optionally pin the article and set Featured order. Leave Advanced / SEO blank unless an editor has a specific reason to override automatic metadata.
9. Save in Structure, then open Preview to review accuracy, links, accessibility, byline order, Month Year, punctuation-adjacent superscripts, matching Studio/public sequence numbers, the collapsed Notes count, and occurrence-specific jumps/backlinks. Estimated read time is intentionally absent.
10. Select **Publish**. The article moves from **Draft only** to **Published**.

## Update a published article

1. Open the article. Editing creates unpublished changes while the existing published version remains public.
2. Confirm the badge and list state read **Published with unpublished changes**. The published version remains public until those changes are published.
3. Review the changed fields and preview.
4. Select **Publish changes** to replace the public version, or **Discard unpublished changes** to keep the existing public version and remove the draft edits.

## Edit About or Site Settings

1. Open the permanent **About** or **Site Settings** entry in Structure. Do not use the global New menu.
2. If neither current version exists, review the lifecycle pane. **Open revision history** enters Sanity’s built-in editor/history view so retained content can be inspected. **Create clean About draft** requires confirmation and uses Sanity’s supported Document Actions API to create a new unpublished draft for the same fixed published ID without restoring old content. The pane must verify the exact draft in raw Content Lake state before opening the editor.
3. Never infer “never created” merely from an empty GROQ result. Sanity can retain a deleted/discarded-history tombstone that normal content queries do not return.
4. Use **Publish** for the first version or **Publish changes** for later edits.
5. **Discard unpublished changes** appears only when a published version also exists. It removes only the draft and immediately returns to the published values.
6. Delete, permanent delete, duplicate, copy, and unpublish are intentionally unavailable. Clear optional fields manually instead of deleting the fixed page.

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

Article list panes can be searched by title, subtitle, summary, Contributor, or publication month and sorted by publication month, title, or update time. Search and sorting are view-only and never publish, unpublish, or edit an Article.

## Create an Article

1. Open **Articles** in Structure and create an Article.
2. Enter Title and choose **Generate** for the Slug. Enter the required Summary; add a Subtitle only when the Article truly has one.
3. Select existing Contributors in byline order and choose Publication Month and a four-digit Year.
4. Add every citation once under **Sources**. URLs are optional but, when present, must begin with `http://` or `https://`.
5. Paste or write the Article body. Google Docs paragraphs, emphasis, links, and lists are supported; remove pasted footer citations and standalone markers such as `[1]` manually.
6. To cite prose or a list item, place the caret immediately after punctuation, click **Footnote** in the visible body toolbar, then select the numbered Source. Do not highlight text and never type a footnote number.
7. For a quotation that should stand apart, put the caret in its paragraph and choose **Block quote** from **Paragraph style**. Place the caret after its punctuation and click the superscript Footnote icon normally. To cite a Callout, select its Source inside the block.
8. Save, open Preview, and refresh. Check byline order, Month Year, superscript spacing, Source jumps/backlinks, external links, and mobile wrapping.
9. Return to Structure to correct errors. Publish only after editorial review.

Source-list numbers are Studio lookup aids only. Public Note numbers follow body occurrence order. Reordering Sources does not change them; reusing one Source creates a new Note occurrence and repeats its full citation.

The inline marker shows the live occurrence number. Hover for brief Source context; click to read the full citation or change its Source. The public Notes disclosure begins collapsed and opens automatically when a reader follows a superscript or direct note link.

### Common mistakes

- Typing `[1]` manually or highlighting text before choosing **Footnote**.
- Pasting PDF or Google Docs footer citations, the Article title, or the byline into the body.
- Duplicating a Source instead of reusing it, or deleting a Source that is still cited.
- Creating duplicate Contributors instead of selecting the existing record.
- Using Quote for every ordinary quotation instead of only quotations that should stand apart.
- Entering or inventing an exact publication day.
