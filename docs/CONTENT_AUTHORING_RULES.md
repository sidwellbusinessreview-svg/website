# Content authoring rules

## Contributor identity

Contributor identity is text-only. Do not upload or store Contributor portraits, avatars, initials artwork, or other identity images. Article bylines contain linked names in editorial order, Contributor profiles contain name plus optional role/year, and About staff entries contain linked names plus optional displayed role/year. Article photography and publication-logo assets follow the separate editorial-image rules below.

## Required article metadata

Every article needs a unique slug, clear title, summary of no more than 300 characters, at least one contributor, valid `YYYY-MM` publication month, and non-empty structured body. Estimated reading time and word count are not reader metadata. A featured image is optional; when one is present it needs meaningful alt text. Publish the contributor record before publishing an article that references it. Preserve contributor byline order and never select the same person twice.

Version 1 has no categories, tags, or issues. Do not encode these concepts in titles or recreate them as ad hoc reference documents.

## Images

Upload JPEG, PNG, or WebP images only. PDF, SVG, GIF, and other formats are not accepted in editorial image fields.

Alt text describes relevant visible information and purpose; it is not a caption. Captions provide context. Credits name the creator/source and follow rights requirements. Confirm permission before publication. Inline images follow the same rules. Text-heavy charts also need an accessible summary.

## Links and structure

Use descriptive link labels and safe HTTP(S) or approved internal destinations. Never add raw HTML or `javascript:` URLs. Start body sections at H2 and use H3 only beneath an H2. Use lists for genuinely parallel items, Block quotes for long quotations that should stand apart, and Callouts for concise supporting context rather than essential narrative.

## Dates, placement, and SEO

Choose a named Month and enter a four-digit Year in Studio. The system stores canonical `YYYY-MM`, but editors never type that syntax. The website displays Month Year everywhere and never invents a day. Same-month stories sort by stable slug. Only one published story should be pinned; featured order is allowed only for pinned stories.

Create each bibliographic record once in **Sources**, with required citation text and an optional HTTP/S URL. A **Note occurrence** is one body use of that Source. Every paragraph, Block quote, list, or Callout use stores the stable Source key and receives a new public number from reading order. Reusing or reordering Sources never reuses or changes occurrence numbering.

Keep ordinary quotations in normal paragraphs. For a longer quotation that should stand apart, put the caret in its paragraph, open **Paragraph style**, and choose **Block quote**. Then use the superscript Footnote icon after the punctuation when needed. Callouts are short highlighted notes, statistics, or explanatory asides and may cite a Source.

The body toolbar is the normal formatting path. Use **Paragraph style** for Normal text, Section heading, Subheading, or Block quote. Highlight text before using the Bold, Italic, or Link icons. Use the list icons for parallel items and the Footnote, Image, and Callout icons for insertions. The toolbar intentionally does not offer fonts, sizes, colors, alignment, raw HTML, or horizontal rules.

The Article body is one toolbar-and-writing surface. An empty draft shows one subdued prompt inside the canvas; click there to begin. The surface expands with the Article, so use normal Studio page scrolling rather than looking for a textarea resize control.

Plain-prose paste treats every newline as a paragraph boundary, collapses repeated blank lines, and converts tabs to spaces. This includes browser TXT viewers that supply PRE or generic DIV/SPAN HTML alongside `text/plain`. Genuinely structured Google Docs or rich-document HTML is converted through Sanity's schema-aware Block Tools so supported paragraphs, emphasis, links, lists, and Block quotes remain intact while presentation-only styling is removed. **Paste and Match Style** / paste-without-formatting uses the plain-prose rules. Bracketed migration markers such as `[1]` are preserved for review but trigger a nonblocking warning until replaced with **Add footnote**.

Article font size, line spacing, margins, quote styling, and list indentation are controlled by the website. Editors should not simulate spacing with empty paragraphs or try to reproduce Google Docs typography.

Broken references and malformed URLs block publication. Duplicate citation/URL and unused-Source notices are nonblocking warnings; unused Sources do not appear in public Notes. Do not type public numbers or add a manual Notes heading. Studio footnote markers show the live body-order number; hover gives brief context and click opens the full citation editor. Preview and confirm punctuation touches the superscript, repeated citations receive new sequential numbers, the collapsed Notes count is correct, and every Note links back to its own occurrence.

Summaries describe the Article’s subject, question, analysis, or argument in one neutral sentence. Never put source condition, readiness, migration status, missing metadata, inferred authorship, or editorial workflow language in a public summary.

Run `npm run validate:content` after local content edits and `npm run sanity:typegen` after CMS schema changes.
