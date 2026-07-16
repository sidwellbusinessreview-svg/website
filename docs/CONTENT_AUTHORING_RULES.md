# Content authoring rules

These rules apply to local sample content now and should become field descriptions and validation guidance in the future CMS.

## Required article metadata

Every article needs:

- A unique lowercase slug using words separated by hyphens
- A clear headline between 5 and 180 characters
- A summary/deck between 20 and 320 characters
- At least one valid author
- One valid category
- A valid issue reference during the current local-content phase
- A real calendar publication date in `YYYY-MM-DD` format
- A positive estimated reading time
- A featured image with meaningful alt text
- At least one valid structured body block
- A status of `draft` or `published`

Published articles cannot use future publication dates. Draft articles are excluded from public article access functions.

## Headlines and summaries

Headlines should be specific, accurate, and readable without relying on the image. Long headlines are supported, but editors should remove unnecessary clauses.

The summary should explain the article’s question, finding, or significance. It should add information rather than repeat the headline.

## Authors

Use an existing author slug and preserve intentional byline order. Do not list the same author twice. Add or update the author record before referencing it from an article.

Do not publish personal student email addresses, phone numbers, schedules, or other private information.

## Categories and issues

Use an existing controlled category. Do not invent a spelling variation in an article record. During the current phase, every article must reference an existing issue, and issue article lists must reference existing article slugs.

## Image alt text

Alt text is required for every featured and inline image in the current model.

Good alt text:

- Describes the relevant visible content
- Is concise but specific
- Reflects why the image appears in this article
- Does not begin with “image of” or “photo of” unless the medium matters

Do not use a filename, photographer credit, or caption as alt text. If decorative-image support is introduced later, it must use an explicit decorative flag and empty alt text rather than simply omitting the field.

## Captions

Captions are optional and belong to a specific image. They provide context a reader cannot get from alt text alone, such as why a scene matters or how it relates to the article.

Do not create unattached caption blocks. A caption without an image is invalid.

## Photo credits

Credits are optional in the schema but required whenever the source, license, permission, or publication policy requires attribution. Use a consistent format such as:

```text
Photo by Name / Source
```

Confirm publication rights before adding an image. A credit does not itself establish permission.

## Links

- Use `https` whenever available.
- Link to the most direct and authoritative source.
- Write meaningful labels that make sense out of context.
- Do not use labels such as “click here.”
- Confirm the destination is appropriate and still available.
- Never place raw HTML, scripts, or event handlers in article content.

The current standalone link block opens external links in a new tab. Future rich-text links should distinguish internal references from external URLs.

## Pull quotes

Use pull quotes sparingly to emphasize an important sentence or idea already supported by the article. Do not introduce a new claim only in a pull quote. Avoid using multiple pull quotes close together.

## Callout boxes

Use a callout for concise context that benefits from separation, such as:

- A definition
- A key tradeoff
- A short “what to watch” note
- A compact methodological explanation

Do not place the main argument or several ordinary paragraphs inside callouts. A callout body is required; its title is optional.

## Heading hierarchy

- Article titles are the page’s level-one heading and are not body blocks.
- Use level-two headings for major article sections.
- Use level-three headings only within the preceding level-two section.
- Do not skip directly to level three.
- Headings should describe the following section and should not be used only for visual styling.

## Lists, quotes, and dividers

Use bulleted lists when sequence does not matter and numbered lists when order or steps matter. Lists require at least one non-empty item.

Block quotes must reproduce or accurately represent sourced words. Add attribution when the source is not unmistakable from nearby text.

Use dividers only for a meaningful transition. Do not stack dividers or use them as substitutes for headings.

## Pinned and featured articles

Only one published article may be pinned as the homepage lead. A featured rank must be a positive integer and may appear only on a pinned article. When ranking support expands beyond one lead, the editorial rules and validator must be updated together.

## Before submitting content

Run:

```bash
npm run validate:content
```

The command reports field paths and relationship problems. Fix every error before opening a pull request or publishing through a future CMS.
