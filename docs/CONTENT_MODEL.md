# Simplified content contract

This provider-independent contract is the Phase 11B source of truth. Sanity records must be projected and adapted before routes receive domain data.

## Site settings

| Field | Type | Required | Rule / visibility | Example / migration |
|---|---|---:|---|---|
| id | ID | Yes | Fixed singleton; editorial only | `siteSettings` |
| publicationName | String | Yes | 1–100; public | `Sidwell Business Review` |
| shortName | String | Yes | 1–20; public | `SBR` |
| description | String | Yes | 20–300; public/SEO | Publication description |
| affiliationText | String | Yes | Approved public wording | School affiliation |
| tagline, location | String | No | Public when approved | Optional brand text |
| logoMode | `text` or `image` | Yes | Controls logo fallback | `text` |
| textWordmark / logoImage / logoImageAlt | Conditional | Yes when selected | Accessible logo | Existing site config maps here |
| contactLabel / contactTarget | String | Yes | Publication-owned contact only | No student personal contact |
| socialLinks | List | No | Approved publication accounts | Empty at launch |
| defaultSeo | Object | No | Global title/description/image defaults | Provider mapping |
| homepageTagline | String | No | Optional short homepage line | Replaces the retired recent-story count and homepage-introduction fields |

## Contributor

| Field | Type | Required | Rule / visibility | Example / migration |
|---|---|---:|---|---|
| id | ID | Yes | Stable provider ID | Existing local slug becomes migration key |
| name | String | Yes | 1–100; public | `Maya Chen` |
| slug | Slug | Yes | Unique; public URL | Existing `/authors/[slug]` stays compatible |
| role | String | No | Public when approved | `Staff Writer` |
| graduationYear | Integer | No | 2000–2200; public when approved | `2027` |
| active | Boolean | Yes | Defaults true; archived records remain public where referenced | Editor lifecycle state |

The CMS type and local domain type are both `contributor`. The public `/authors/[slug]` route remains for URL continuity, but implementation and content fields use Contributor terminology. Contributor identity is text-only: biography, portrait/photo, avatar, initials artwork, email, and social fields are not part of the launch contract. Article bylines link to text-only Contributor profile pages.

Active controls eligibility for new Article/About selections, not historical visibility. Archiving never removes an existing byline or contributor history.

## Article

| Field | Type | Required | Rule / visibility | Example / migration |
|---|---|---:|---|---|
| id | ID | Yes | Stable provider ID | Added by CMS |
| title | String | Yes | 5–180; public | Headline |
| slug | Slug | Yes | Unique, stable; public | Canonical path |
| subtitle | String | No | Max 220; public | Optional deck |
| summary | String | Yes | 20–300; public/SEO fallback | Local `dek` maps here |
| contributors | Ordered references | Yes | At least one, unique, published before article publication | Local `contributorSlugs` map here |
| publicationMonth | `YYYY-MM` string | Yes to publish | Exact regex; month 01–12; public Month Year | Canonical Article chronology |
| sources | Array of `{key, citation, url?}` | No | Stable unique key; nonblank citation; optional HTTP/S URL | Embedded in Article, never separate documents |
| featuredImage | Image asset | Yes | Rights-cleared; public | Local URL maps during migration |
| featuredImageAltText | String | Yes | Contextual, meaningful; public alt | Required separately in CMS |
| featuredImageCaption / featuredImageCredit | String | No | Max 500/300; public | Existing nested values map here |
| structuredBody | BodyBlock list | Yes | At least one; no raw HTML | Portable Text |
| pinned | Boolean | Yes | Default false | Homepage placement |
| featuredRank | Positive integer | No | Only when pinned | Deterministic placement |
| seoTitle / seoDescription | String | No | Advanced overrides, max 70/180 | Defaults to title/summary |
| status | Native provider state | Yes | Sanity draft/published, not duplicate field | Local `status` maps at migration |

Same-month public ordering is publication month descending, then stable slug ascending. Queries temporarily derive `YYYY-MM` from legacy `publicationDate` when the canonical field is absent; audits report those records and no remote mutation is automatic.

Portable Text footnote annotations store a source key, never a display number. Numbers are generated from `sources` order. Every reference must resolve to an Article source; missing references are rejected by published validation and render as a safe visible fallback in preview/development.

## About

`staticPage` is the singleton About document. It contains title, the fixed `about` slug, optional summary, structured mission/body content, updated date, optional SEO, and `editorsInChief`, `editors`, and `facultyAdviser` staff arrays. Each staff entry requires a Contributor reference and permits an optional displayed-role override; Faculty Adviser allows at most one entry. There is no separate Masthead document.

## Body blocks and images

Portable Text supports paragraphs, H2/H3, bullet/number lists, block quotes, inline links, pull quotes, editorial images, callouts, and dividers. Editorial images require an asset and contextual alt text; caption, credit, and internal rights note are optional. Links allow safe HTTP(S), internal paths, or references to articles, contributors, and About. Arbitrary HTML is prohibited.

## Removed version-1 concepts

Issues, categories, and tags are not documents or article fields. The chronological archive replaces issue discovery. A simple optional edition label or section string may be proposed later only with demonstrated need; do not recreate reference taxonomies by default.
