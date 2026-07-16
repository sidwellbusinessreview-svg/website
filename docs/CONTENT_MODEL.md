# Framework-independent content contract

## Purpose and conventions

This contract defines the publication’s content independently of Next.js, TypeScript, or a specific CMS. A provider adapter may store fields differently, but pages should receive equivalent domain data through the content-access layer.

Conventions:

- `ID` means an immutable provider-independent identifier.
- `Slug` means lowercase URL-safe text using letters, numbers, and hyphens.
- `DateTime` means an ISO 8601 timestamp including timezone.
- References store stable IDs, not copied display text.
- “Public” means visible after publication; editorial-only fields stay server-side.
- Examples are illustrative and are not credentials or production identifiers.

## Site settings

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable singleton ID | No | `site-settings` | Use a singleton document. |
| publicationName | String | Yes | 1–100 characters | Yes | `Sidwell Business Review` | Maps from current `siteConfig.name`. |
| shortName | String | Yes | 1–20 characters | Yes | `SBR` | Maps from `shortName`. |
| description | String | Yes | 20–300 characters | Yes | `A student-run publication…` | Default metadata description. |
| tagline | String | No | Maximum 160 characters | Yes | `Business, markets, and ideas—examined by students.` | Maps from current config. |
| schoolName | String | No | Maximum 120 characters | Yes | `Sidwell Friends School` | Must be approved public wording. |
| location | String | No | Maximum 120 characters | Yes | `Washington, D.C.` | Avoid unnecessary precision. |
| administrativeContactLabel | String | Yes | Maximum 80 characters | Yes | `Contact the editors` | Prefer a label over exposing an address in content. |
| administrativeContactTarget | String | Yes | Valid approved email or contact-page path | Public only when approved | `/contact` | Keep durable ownership with publication Gmail. |
| primaryNavigation | Ordered list of NavigationItem | Yes | Valid internal routes; unique labels | Yes | `[{label: "Latest", href: "/latest"}]` | CMS editing optional; may remain configuration. |
| defaultSeoTitle | String | No | Maximum 60 characters | Yes | `Sidwell Business Review` | Fallback for metadata. |
| defaultSeoDescription | String | No | 50–160 characters | Yes | `Student analysis of…` | Fallback for metadata. |
| defaultSocialImage | ImageAsset reference | No | Must be publishable image | Yes | `image-site-social` | Store asset reference, not framework URL. |

## Article

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No; may appear in APIs | `article-school-lunch` | Current model has no ID; add during migration. |
| slug | Slug | Yes | Unique; 1–120 characters | Yes | `the-new-economics-of-school-lunch` | Existing field maps directly. Preserve redirects if changed. |
| title | String | Yes | 5–180 characters | Yes | `The New Economics of School Lunch` | Existing field maps directly. |
| subtitle | String | No | Maximum 220 characters | Yes | `What changing menus reveal…` | New field; distinct from summary. |
| summary | String | Yes | 20–320 characters; plain text | Yes | `Rising costs, tighter budgets…` | Current `dek` maps here initially. |
| authors | Ordered list of Author references | Yes | At least one; no duplicates | Yes | `[author-maya, author-jonah]` | Preserve current `authorSlugs` order. |
| issue | Issue reference | No | Referenced issue must exist | Yes | `issue-spring-2026` | Current `issueSlug` is required; make optional later. |
| category | Category reference | Yes | Exactly one active category | Yes | `category-campus` | Replace current string union through adapter. |
| tags | List of Tag references | No | Unique; reasonable editorial limit such as 10 | Yes | `[tag-food-systems]` | Not implemented today. |
| featuredImage | ImageAsset reference | Yes | Publishable image with alt decision | Yes | `image-lunch-table` | Current object should become asset reference. |
| featuredImageAltText | String | Yes* | Meaningful text or explicit empty decorative value | Yes, as `alt` | `Students gathered around a table` | May live on article usage so context can differ. |
| featuredImageCaption | String | No | Maximum 500 characters | Yes | `Every lunch menu reflects…` | Current nested caption maps directly. |
| featuredImageCredit | String | No | Required when rights/source require it | Yes | `Photo by Headway / Unsplash` | Current nested credit maps directly. |
| structuredBody | Ordered list of BodyBlock | Yes | At least one substantive block; valid block shapes | Yes | `[{type: "paragraph", …}]` | Current `content` maps here. |
| publicationDate | DateTime | Required when published | Valid timestamp; not future unless scheduled | Yes | `2026-05-18T12:00:00-04:00` | Current date-only `publishedAt` needs normalization. |
| updatedDate | DateTime | No | Must be on/after publication date | Yes when substantive | `2026-05-20T09:30:00-04:00` | Not implemented today. |
| status | Enum | Yes | `draft`, `review`, `scheduled`, `published`, `archived` | Only published status is public | `published` | Critical CMS field; local samples implicitly published. |
| pinned | Boolean | Yes | Defaults false | Public effect, field need not display | `true` | Existing optional field should eventually default explicitly. |
| featuredRank | Integer | No | Positive integer; unique among active placements when required | No direct display | `1` | Add for deterministic homepage ordering. |
| seoTitle | String | No | Maximum about 60 characters | Metadata | `School Lunch Economics` | Fallback to title. |
| seoDescription | String | No | 50–160 characters | Metadata | `How costs and demand…` | Fallback to summary. |
| estimatedReadMinutes | Positive integer | No | At least 1; may be generated | Yes | `8` | Current `readTime` maps directly. |

`featuredImageAltText` is required for informative images. An intentionally decorative image may use an explicit empty string plus a decorative flag in the image usage model.

## Author

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `author-maya-chen` | Current model has no ID. |
| slug | Slug | Yes | Unique | Yes | `maya-chen` | Existing field maps directly. |
| displayName | String | Yes | 1–100 characters | Yes | `Maya Chen` | Current `name` maps here. |
| biography | String or structured text | Yes | 20–1,000 characters | Yes | `Maya covers markets…` | Current `bio` maps here. |
| role | String | No | Approved public role | Yes | `Editor in Chief` | Existing field maps directly. |
| classYearLabel | String | No | Approved public wording | Yes | `Class of 2026` | Replace rigid `grade` naming. |
| initials | String | No | 1–4 characters | Yes | `MC` | May be derived if no portrait. |
| portrait | ImageAsset reference | No | Publicly approved image | Yes | `image-author-maya` | Not implemented today. |
| portraitAltText | String | Required with portrait | Meaningful description | Yes | `Portrait of Maya Chen` | Can be stored per use. |
| active | Boolean | Yes | Defaults true | Affects directory listing | `true` | Preserves alumni article archives. |
| displayOrder | Integer | No | Non-negative | No direct display | `1` | Useful for masthead ordering. |

## Issue

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `issue-spring-2026` | Current model has no ID. |
| slug | Slug | Yes | Unique | Yes | `spring-2026` | Existing field maps directly. |
| title | String | Yes | 1–140 characters | Yes | `The Resilience Issue` | Existing field maps directly. |
| issueNumber | Integer or string | Yes | Positive or approved label | Yes | `2` | Current `number` maps directly. |
| season | String | No | Controlled display value | Yes | `Spring` | Existing field maps directly. |
| year | Integer | No | Four-digit reasonable year | Yes | `2026` | Existing field maps directly. |
| publicationDate | DateTime | No | Valid timestamp | Yes | `2026-05-18T12:00:00-04:00` | Prefer for sorting over season/year alone. |
| description | String | Yes | 20–500 characters | Yes | `How institutions…` | Existing field maps directly. |
| editorNote | String or structured text | No | Maximum defined by editorial policy | Yes | `This issue looks closely…` | Existing field maps directly. |
| articles | Ordered list of Article references | No | No duplicates; published view filters eligibility | Yes | `[article-school-lunch]` | Current `articleSlugs` maps directly. |
| coverImage | ImageAsset reference | No | Publishable image | Yes | `image-issue-resilience` | Current UI uses generated cover treatment. |
| accentToken | String | No | Approved design token, not arbitrary unsafe CSS | Yes as presentation | `issue-rust` | Current raw hex `accent` should migrate to controlled token. |
| status | Enum | Yes | `draft`, `published`, `archived` | Only published is public | `published` | Not implemented today. |

## Category

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `category-markets` | Current model uses string literals. |
| slug | Slug | Yes | Unique | Yes | `markets` | Required for category routes. |
| name | String | Yes | Unique normalized name | Yes | `Markets` | Seed from current union. |
| description | String | No | Maximum 500 characters | Yes | `Markets, investing, and finance.` | Supports landing-page metadata. |
| displayOrder | Integer | No | Non-negative | No direct display | `1` | Controls navigation/filter ordering. |
| active | Boolean | Yes | Defaults true | Affects assignment and listings | No direct display | Retire without breaking archives. |
| seoTitle | String | No | Maximum about 60 characters | Metadata | `Markets Articles` | Fallback to name. |
| seoDescription | String | No | 50–160 characters | Metadata | `Student analysis of markets…` | Fallback to description. |

## Tag

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `tag-food-systems` | New entity. |
| slug | Slug | Yes | Unique | Yes when tag routes exist | `food-systems` | Normalize before creation. |
| name | String | Yes | Unique normalized name | Yes | `Food systems` | Avoid near-duplicate terms. |
| description | String | No | Maximum 300 characters | Optional | `Supply chains and institutional food.` | May support metadata. |
| active | Boolean | Yes | Defaults true | Affects assignment | No direct display | Retain historical references when inactive. |

## Static page

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `page-about` | About/masthead are currently hardcoded. |
| slug | Slug | Yes | Unique; reserved-route checks | Yes | `about` | Some pages may remain code-owned. |
| title | String | Yes | 1–140 characters | Yes | `About the Review` | Used in heading and metadata fallback. |
| eyebrow | String | No | Maximum 80 characters | Yes | `About the Review` | Optional presentation label. |
| summary | String | No | Maximum 320 characters | Yes | `Our mission and standards.` | Metadata fallback. |
| structuredBody | Ordered list of BodyBlock | Yes | Valid blocks | Yes | `[{type: "heading", …}]` | Reuse safe body contract. |
| status | Enum | Yes | `draft`, `published`, `archived` | Only published is public | `published` | Required if CMS-owned. |
| updatedDate | DateTime | No | Valid timestamp | Optional | `2026-07-16T10:00:00-04:00` | Supports governance transparency. |
| seoTitle | String | No | Maximum about 60 characters | Metadata | `About` | Fallback to title. |
| seoDescription | String | No | 50–160 characters | Metadata | `Learn about the Review…` | Fallback to summary. |

## Image asset

| Field | Type | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| id | ID | Yes | Immutable and unique | No | `image-lunch-table` | CMS asset ID may be mapped. |
| source | Asset reference or URL | Yes | Approved scheme/provider; must resolve | Delivered publicly | `cms://image-lunch-table` | Avoid coupling domain model to CDN URL. |
| width | Positive integer | Yes | Greater than 0 | Used by frontend | `1800` | Read from asset metadata. |
| height | Positive integer | Yes | Greater than 0 | Used by frontend | `1200` | Read from asset metadata. |
| mimeType | String | Yes | Approved image type | No direct display | `image/jpeg` | Validate upload types. |
| altText | String | No | Context-neutral default; usage may override | Yes when used | `Students around a table` | Do not force one alt across all contexts. |
| caption | String | No | Maximum 500 characters | Yes when used | `Every lunch menu reflects…` | Usage may override. |
| credit | String | No | Required by rights policy | Yes when used | `Photo by …` | Preserve attribution. |
| rightsNote | String | No | Internal permission/license record | No | `Licensed for web publication` | Editorial-only. |
| focalPoint | Object `{x, y}` | No | Values 0–1 | No direct display | `{x: 0.5, y: 0.4}` | Map from CMS hotspot/crop. |

## Structured body blocks

Every block has a stable `id`, a `type` discriminator, and the fields below. Blocks are ordered. Public visibility follows the parent published document.

| Block | Fields and types | Req. | Validation | Public visibility | Example | CMS migration notes |
|---|---|---:|---|---|---|---|
| Paragraph | `id: ID`, `text: RichText` | Yes | Non-empty; safe marks only | Yes | `Business stories are rarely…` | Current plain text should migrate to portable rich text. |
| Heading | `id`, `level: 2\|3`, `text: String` | Yes | Non-empty; preserve hierarchy | Yes | `{level: 2, text: "The decision"}` | Matches current block. |
| Bulleted list | `id`, `items: RichText[]` | Yes | At least one non-empty item | Yes | `["Ingredient costs", "Labor"]` | Current strings map directly initially. |
| Numbered list | `id`, `items: RichText[]` | Yes | At least one non-empty item | Yes | `["Map risk", "Price interruption"]` | Current strings map directly initially. |
| Block quote | `id`, `text: RichText`, `attribution?: String` | Yes | Quote text non-empty | Yes | `{"text":"Resilience…","attribution":"SBR analysis"}` | Current type is named `quote`. |
| Pull quote | `id`, `text: String`, `sourceText?: String` | Yes | Must be supported by article text or clearly attributed | Yes | `A lunch price is not one number.` | Current block maps directly. |
| Inline image | `id`, `image: ImageAsset reference`, `altText: String`, `caption?: String`, `credit?: String` | Yes | Asset resolves; alt decision present | Yes | `image-downtown` | Current block embeds URL fields. |
| Image caption | Stored with image usage | Conditional | Contextual, maximum 500 characters | Yes | `Office districts are adapting…` | Not a separate current block; renderer uses `ImageCaption`. |
| Photo credit | Stored with image usage | Conditional | Required by rights policy | Yes | `Photo by Samson / Unsplash` | Not a separate current block. |
| Callout box | `id`, `title?: String`, `body: RichText` | Yes | Body non-empty | Yes | `{"title":"What to watch",…}` | Current plain-text callout maps directly. |
| Divider | `id` | Yes | No content fields | Yes | `{type:"divider"}` | Matches current block. |
| Link | Prefer inline rich-text mark; standalone form uses `id`, `intro?: RichText`, `label: String`, `href: URL`, `newWindow?: Boolean` | Yes | Valid safe URL; meaningful label | Yes | `Visit the USDA…` | Current standalone block can migrate; internal links should be references where possible. |
| Table | `id`, `caption?: String`, `columns: String[]`, `rows: Cell[][]`, `source?: String` | Optional extension | Header required; size limits; accessible caption | Yes | Small comparison table | Not implemented; use only for genuinely tabular data. |
| Chart image | Inline-image fields plus `dataSummary: String`, `source?: String` | Optional extension | Accessible text summary required | Yes | `Chart of ridership by weekday` | Initial chart support may use an image asset before native charts. |

## Current implementation comparison

The current TypeScript model already supports articles, authors, issues, fixed categories, and the required Phase 1 body blocks. It does not yet implement the full contract:

- No stable IDs
- `dek` combines subtitle/summary concerns
- Author and issue relationships use slugs
- Issue is mandatory on every article
- No tags or explicit category entities
- No updated date, publication status, featured rank, or SEO overrides
- Date-only publication values
- Images are embedded URL objects rather than reusable assets
- No author portraits or active status
- No issue status or publication date
- About and masthead are code-owned rather than static-page records
- Body content uses plain strings rather than rich text and stable block IDs
- No table or chart-image block

These mismatches are migration tasks. They should be introduced with validation and adapter work in the planned content-model and CMS phases, not through a broad Phase 03 renderer rewrite.

## Implemented local runtime validation

The current local provider now validates content with Zod before access functions return it.

Implemented schemas:

- Site settings
- Articles
- Authors
- Issues
- Controlled categories
- Every current structured body block
- Featured and inline image metadata

Implemented field rules include:

- Lowercase URL-safe slugs
- Headline, summary, biography, and descriptive text length limits
- Valid `YYYY-MM-DD` calendar dates
- Positive reading times, issue numbers, and featured ranks
- Required author lists and non-empty article bodies
- Required featured and inline image alt text
- Safe HTTP/HTTPS image and link URLs
- Caption and credit values attached only to image objects
- Valid heading levels and non-empty lists
- `draft` or `published` article status
- Featured rank allowed only for pinned articles

Implemented cross-document rules include:

- Unique article, author, issue, and category slugs
- Existing author, issue, category, and issue-article references
- No future publication date for a published article
- At most one published pinned lead
- No duplicate active featured ranks

Public access behavior:

- Draft articles are excluded from public lookup and listing functions.
- Article ordering is publication date descending, then slug ascending for deterministic same-date results.
- Issue article ordering follows the issue’s explicit article list while excluding nonpublic articles.
- Pages continue using the content-access layer rather than raw data.

Validation failures throw `ContentValidationError` with readable field paths during development, builds, tests, and the standalone validation command. In production, invalid content prevents a successful build or provider initialization; public pages do not render raw schema details. Unknown renderer blocks warn in development and render nothing safely in production. Raw untrusted HTML is never rendered.

Run:

```bash
npm run validate:content
```

Authoring guidance is maintained in `docs/CONTENT_AUTHORING_RULES.md`.
