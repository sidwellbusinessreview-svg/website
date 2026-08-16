# Simplified Sanity editor model

Phase 11B keeps the Studio deliberately small. Phase 12 can serve published public content through the Sanity provider while retaining explicit local rollback mode.

## Navigation

- **Articles:** All Articles, Draft Only, Published, Published with Unpublished Changes, Pinned
- **Contributors:** Active Contributors, Archived Contributors, All Contributors
- **About**
- **Site Settings**

Vision, Releases, issues, categories, tags, and technical tools are absent. A separate **Preview** tool securely loads saved drafts on the frontend; it does not replace the Structure editing workflow and does not promise live updates while typing. About and Site Settings are fixed pages protected from ordinary duplicate/delete actions. Duplicate is also removed from Articles and Contributors. Studio has a dedicated full-screen shell without the public header or footer.

Each Article pane shows a count, search field, sort control, New article button, status and pinned badges, title, subtitle or shortened summary, contributors, publication month, and an optional compact thumbnail. Search is case-insensitive and does not alter draft/published classification. Sorting supports newest month, oldest month, title, and recently updated. Image-free records use a deliberate compact text layout.

## Contributor

Only **Name** and **Slug** are required. Role and graduation year are optional. Contributor identity is text-only; records have no photo, portrait, avatar, initials artwork, biography, email, or social field. Publish a contributor once before referencing that person from an article; the contributor then supplies the linked byline and profile identity.

Contributors default to active. Use **Archive contributor** for ordinary offboarding; archived people remain on old bylines and can be restored. The Contributor form shows live incoming references. Context-aware deletion allows unreferenced deletion, offers About removal for About-only references, and blocks Article-linked deletion until the bylines are reassigned.

## About

About combines the publication mission/body with text-only Editors-in-Chief, Editors, and Faculty Adviser sections. Each staff entry references a Contributor and may supply an optional displayed role for that roster entry. No staff entry has an image, portrait, avatar, or initials field. Contributor roles and About roles may differ. There is no separate Masthead document or public Masthead route.

## Durable fixed pages

About uses the fixed document ID `about`; Site Settings uses `siteSettings`. Their permanent Structure entries first inspect the current draft/published pair with an exact uncached raw query. Existing records open normally. If neither variant exists, the pane does not assume the record is new: it explains that Sanity may retain document history and offers **Open revision history** or an explicitly confirmed **Create clean About draft** action. Clean creation uses Sanity’s `sanity.action.document.create` Document Action with the fixed published ID and a draft ID from `createDraftId`; generic mutations never write directly to `drafts.*`. The pane verifies the new draft through the exact raw query before opening the editor and never restores or publishes old content automatically. These durable resources cannot be deleted, duplicated, copied, or unpublished.

The normal draft/publish workflow remains enabled. Draft-only fixed pages can be published but cannot be discarded or deleted. Published fixed pages remain editable. When a published fixed page has a draft, **Publish changes** and **Discard unpublished changes** are available; Discard removes only the draft and returns to the published values. Historical revision restoration, where Sanity supports it, must create unpublished changes rather than overwrite the public version directly.

## Article form

The main Article group follows the writing workflow: Title, Slug, optional Subtitle, Summary, Contributors, Publication month, optional Featured image and its metadata, Article body, and Sources. Sources appear once as compact lookup rows. Every body citation stores only the Source key and becomes a distinct public Note occurrence numbered in reading order. Estimated read time is not stored or displayed.

Structure is the authoring workspace for metadata, body, Sources, and footnotes. Preview is the reader-facing review workspace for dates, citation jumps, Notes, and layout.

Contributor selection is one authoritative custom array input. It does not render Sanity's default **Add item** control or default item menus. **Add contributors** opens a searchable multi-select of active published Contributors showing name, role, and graduation year. Selection stays temporary until **Confirm selection**; X, Escape, outside click, and **Cancel** make no content change. Confirmed references receive stable keys, duplicates are blocked, and explicit text controls handle opening, removing, and reordering byline rows without avatars.

About staff sections use the same confirmed picker. Editors-in-Chief and Editors allow multiple selections; Faculty Adviser allows one. Selected and candidate rows are entirely text-based.

Malformed historical members are never repaired automatically. The field can remove only invalid or duplicate members after an editor explicitly chooses **Repair invalid entries**; `npm run sanity:audit-contributors` remains the read-only dataset-wide dry run.

The **Advanced / SEO** group contains optional SEO title and description overrides. Most editors should leave both blank. Metadata otherwise uses the article title plus publication name, summary, featured image, and slug canonical URL.

Article bodies use one compact document-style toolbar row directly attached to the writing surface at normal laptop widths. Its fixed-width paragraph-style selector offers **Normal text**, **Section heading**, **Subheading**, and **Block quote** without stretching across the editor. Familiar icon controls provide Undo, Redo, Bold, Italic, Link, bulleted and numbered lists, Footnote, Image, and Callout; accessible labels and tooltips explain each icon and standard shortcuts. Block quote is an ordinary text block, so inline emphasis, links, and footnotes remain available. Raw HTML, H1/H4-H6, arbitrary typography, tables, and dividers are not allowed. The duplicate native toolbar is suppressed through the supported input option.

The toolbar and native rich-text canvas live in one Sanity-themed shell with one border and divider. Empty drafts show one in-canvas **Start writing or paste here…** placeholder and begin at a compact writing height; existing text is passed unchanged through Sanity's supplied native-input renderer. The canvas grows naturally with the Article and has no textarea resize handle or fixed nested scrolling region. Detailed formatting instruction stays in documentation rather than a permanent tutorial above the field.

The picker searches by citation or Studio Source-list number and says **Source 5**, never **Footnote 5**. Source-list numbers are lookup aids, not public numbers. Each inline Studio marker displays its current occurrence number from the same shared body-order traversal used by the public renderer. Inserting, deleting, or moving a citation therefore renumbers the visible markers live without changing stored Source keys. Hover text stays brief; clicking the marker opens the normal editor with the full wrapping citation and source selector.

## Publishing dependency

Contributor references do not cascade-publish. The article field explains the dependency and validation warns when a selected contributor has no published record.

Article state is determined from the actual raw document pair, not from a perspective-flattened list: a draft ID without a published ID is **Draft only**; a published ID without a draft ID is **Published**; both IDs means **Published with unpublished changes**. The latter means the public version remains live while the draft edits are not public. Actions are **Publish** for a first publication, **Publish changes** when a published article has a draft, **Discard unpublished changes**, and confirmation-protected **Unpublish article**. Pinned is an independent editorial flag, not a publication state.

## Media rules

Editorial image fields accept JPEG, PNG, and WebP assets only. PDF, SVG, GIF, and other formats fail document validation using both MIME type and original filename extension. Article featured/inline images and the publication logo remain optional; these are editorial or publication assets, never Contributor identity images. Alternative text is required when an editorial image is present. Caption and credit remain optional but should follow the authoring rules.

## Safe deletion and cleanup

Archive a contributor in ordinary circumstances. Permanent contributor deletion shows incoming references first. Article-linked deletion requires selecting an active published replacement, reviewing a separate final confirmation, patching draft and published bylines without duplicates, rechecking references, and only then deleting. Closing or cancelling a dialog performs no mutation.

Run `npm run sanity:cleanup-fields` for a dry-run report of legacy Contributor photo/biography fields, nested About portrait/portrait-alt fields, and removed Site Settings fields. It never deletes image assets. Applying field cleanup is guarded by authenticated-target, recent-export, and exact-confirmation protections. Do not apply it during routine schema work.

Follow [SIMPLIFIED_PUBLISHING_WORKFLOW.md](./SIMPLIFIED_PUBLISHING_WORKFLOW.md) for exact steps.

## Migration notes

- Existing `author` records, if any unseen drafts exist, are not automatically deleted. Recreate or migrate them to `contributor`, preserving slug values so `/authors/[slug]` remains compatible.
- Convert prior article `authors` references to `contributors`.
- Convert legacy publication values to reviewed `YYYY-MM` months. The compatibility adapter may read old values temporarily, but Studio does not expose an exact-day or precision control.
- Remove obsolete issue/category/tag fields only after exporting and reviewing affected drafts.
- Fold any legacy Masthead data into About staff entries after export and review; do not delete an unseen draft automatically.
- The one observed published dataset asset is retained; no dataset content was deleted.

Run `npm run sanity:typegen` after schema changes. Generated artifacts are `src/sanity/schema.json` and `src/sanity/sanity.types.ts`; never edit them directly.

> Screenshot placeholder: simplified Studio navigation.

> Screenshot placeholder: contributor form showing only Name and Slug required.

> Screenshot placeholder: article main and Advanced / SEO groups.

## Final Article authoring model

The Article form keeps Summary required and counted to 300 characters; Subtitle is optional and never substitutes for Summary. Contributors are selected from existing active published records, remain in explicit byline order, and cannot be duplicated. Publication Month is chosen through named Month and four-digit Year controls even though the stored value is `YYYY-MM`.

Sources stay inside their Article and remain deduplicated. Paragraph, Block quote, list, and Callout citations participate in one public sequence; repeated use repeats the full citation in **Notes** and receives its own anchor/backlink. Machine metadata and search may continue using each unique Source once.

Public **Notes** are a collapsed disclosure by default and show their occurrence count. Activating a superscript, including a direct `#note-N` URL, opens Notes and focuses the exact occurrence. Every backlink returns to that occurrence rather than merely to the Article body.

Article typography is centrally controlled by the frontend: editors do not choose fonts, sizes, colors, alignment, or spacing. Structure is for editing; Preview is for checking the resulting hierarchy and rhythm.

Duplicate citation/URL and unused-Source findings are warnings. A missing referenced Source, unsafe URL, missing required metadata, duplicate Contributor, invalid Month/Year, missing image alt text, or conflicting slug blocks publication. Image, Subtitle, Sources, footnotes, Callout, Source URL, image caption, and image credit remain optional.

> Screenshot placeholder: Article Sources showing generated-number selectors.

> Screenshot placeholder: cited Block quote and Callout blocks.
