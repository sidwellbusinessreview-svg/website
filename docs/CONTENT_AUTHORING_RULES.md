# Content authoring rules

## Contributor identity

Contributor identity is text-only. Do not upload or store Contributor portraits, avatars, initials artwork, or other identity images. Article bylines contain linked names in editorial order, Contributor profiles contain name plus optional role/year, and About staff entries contain linked names plus optional displayed role/year. Article photography and publication-logo assets follow the separate editorial-image rules below.

## Required article metadata

Every article needs a unique slug, clear title, summary of no more than 300 characters, at least one contributor, valid `YYYY-MM` publication month, reading time in local mode, and non-empty structured body. A featured image is optional; when one is present it needs meaningful alt text. Publish the contributor record before publishing an article that references it. Preserve contributor byline order and never select the same person twice.

Version 1 has no categories, tags, or issues. Do not encode these concepts in titles or recreate them as ad hoc reference documents.

## Images

Upload JPEG, PNG, or WebP images only. PDF, SVG, GIF, and other formats are not accepted in editorial image fields.

Alt text describes relevant visible information and purpose; it is not a caption. Captions provide context. Credits name the creator/source and follow rights requirements. Confirm permission before publication. Inline images follow the same rules. Text-heavy charts also need an accessible summary.

## Links and structure

Use descriptive link labels and safe HTTP(S) or approved internal destinations. Never add raw HTML or `javascript:` URLs. Start body sections at H2 and use H3 only beneath an H2. Use lists for genuinely parallel items, pull quotes for exact excerpts already present in the story, and callouts for concise supporting context rather than essential narrative.

## Dates, placement, and SEO

Choose a named Month and enter a four-digit Year in Studio. The system stores canonical `YYYY-MM`, but editors never type that syntax. The website displays Month Year everywhere and never invents a day. Same-month stories sort by stable slug. Only one published story should be pinned; featured order is allowed only for pinned stories.

Create each citation once in **Sources**, with required citation text and an optional HTTP/S URL. In the body, place the cursor immediately after the sentence punctuation, choose **Add footnote**, and select the citation; do not highlight text. The inline object stores its stable source key internally. Do not type bracketed numbers, paste PDF footer citations into the body, or add a manual Sources heading. Preview and confirm there is no space before the superscript and every link reaches the correct generated source number.

Summaries describe the Article’s subject, question, analysis, or argument in one neutral sentence. Never put source condition, readiness, migration status, missing metadata, inferred authorship, or editorial workflow language in a public summary.

Run `npm run validate:content` after local content edits and `npm run sanity:typegen` after CMS schema changes.
