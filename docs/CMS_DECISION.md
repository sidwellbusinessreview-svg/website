# CMS decision and implementation design

> **Phase 11C update (July 17, 2026):** Sanity remains the selected CMS, but ADR-014, ADR-015, and the current `CONTENT_MODEL.md` supersede this document's earlier issue/category/tag/author/biography/Masthead mapping. The launch model now uses Contributors, Articles, About with its staff roster, and Site Settings only. Later phases must follow the simplified contract.

**Decision date:** July 17, 2026  
**Decision:** Use Sanity Studio with Sanity Content Lake.  
**Implementation status:** Designed, not yet installed. CMS packages and credentials begin in Phase 10 only after the policy and account gates below are complete.

## Decision criteria

The launch needs structured articles, reusable authors/issues/taxonomy, contextual image metadata, drafts with manual publishing, preview, durable ownership, exports, a usable editor experience, and a clean adapter to the existing Next.js content-access layer. It does not require scheduled publishing, public submissions, writer accounts, a database operated by the school, or a CMS-backed search service at launch.

Scores use 1 (poor) through 5 (strong). Weights reflect this project's requirements rather than a generic feature comparison.

| Criterion | Weight | Sanity | Payload | Decap |
|---|---:|---:|---:|---:|
| Structured content and references | 20 | 5 | 5 | 3 |
| Portable article-body fit | 15 | 5 | 5 | 2 |
| Editor workflow and preview | 15 | 5 | 4 | 3 |
| Operational burden | 15 | 5 | 2 | 3 |
| Next.js 16/App Router fit | 10 | 5 | 5 | 3 |
| Durable access and handoff | 10 | 4 | 4 | 3 |
| Exportability and rollback | 10 | 4 | 5 | 5 |
| Sustainable launch cost | 5 | 4 | 3 | 5 |
| **Weighted score / 5** | **100** | **4.8** | **4.2** | **3.2** |

### Sanity

Sanity best matches the provider-independent contract: referenced documents, custom validation, image assets with hotspot/crop, Portable Text with custom blocks and annotations, drafts, preview, and queryable published content. Its official Next.js integration supports App Router, Server Components, Draft Mode, caching, and visual editing. Content Lake and hosted Studio remove the database, file-storage, backup, and admin-runtime burden that Payload would introduce.

The Free plan is suitable for proving and launching a small publication, but its role model is a real constraint: Admin and Viewer are available, while finer Editor/Contributor roles and private datasets require a paid plan. Launch may use a deliberately small group of trusted individual Admin accounts after school approval. If more student editors need limited permissions, budget for Growth rather than sharing credentials or granting broad access casually. Scheduled drafts are not assumed to be free and are not required; draft plus manual publish meets launch scope.

### Payload

Payload is technically capable and compatible with the current Next.js generation. Its typed collections, access control, drafts, versions, uploads, and rich-text blocks could implement the contract well. It is not selected because it transfers database, durable media storage, backups, email, deployment, monitoring, upgrades, and recovery operations to the publication or school. That ongoing burden is disproportionate for rotating student leadership. Payload becomes the leading fallback only if school policy prohibits Sanity's hosted Content Lake or requires school-controlled hosting.

### Decap

Decap has attractive portability and no content-service fee because content is stored in Git. Its branch/pull-request editorial workflow can work for technically confident editors. It is not selected because this contract has numerous references, contextual assets, structured custom body blocks, validation, and preview requirements. Decap can model some of these with relation, list, variable-type, and custom widgets, but the result would require more custom editor and preview code, expose Git concepts to editors, and make cross-document integrity and media-heavy workflows less dependable.

## Blocker review

No blocker was identified, so ADR-006's default becomes the final selection.

| Potential blocker | Finding | Required follow-up |
|---|---|---|
| Required functionality | No blocker. Draft/manual publish, references, assets, Portable Text, preview, queries, and webhooks cover launch. | Prove schemas and preview with five test articles. |
| Sustainable cost | No blocker for a small launch team. Granular roles/private datasets may be paid. | Confirm editor count, current plan terms, and approved budget before invitations. |
| Account continuity | No blocker if the publication Gmail is the durable administrator/recovery identity and people use individual invitations. | Record owners and recovery contacts outside Git; test handoff. |
| Current Next.js compatibility | No blocker. The official integration supports App Router and current Next patterns. | Pin compatible packages in Phase 10; do not upgrade Next.js. |
| Exportability | No blocker. Sanity supports dataset exports including documents and assets. | Exercise and document an export/restore drill before production acceptance. |
| Editor usability | No blocker. Studio is customizable and avoids direct Git editing. | Conduct a student-editor usability test in Phase 13. |
| School policy | No known blocker, but approval has not yet been recorded. | Before Phase 10 credentials or real student data, obtain approval for the vendor, public published dataset, student bylines/bios, and data ownership. A prohibition triggers a new ADR and Payload review. |

## Architecture

### Studio, content, and public reads

- Keep Studio configuration and schemas in this repository and embed Studio at `/studio` in the existing Next.js application. The route is omitted from public navigation, marked `noindex`, and editing remains protected by Sanity authentication. ADR-012 supersedes the earlier separate-deployment detail so the project has one build and deployment in this phase.
- Store editorial records and assets in Sanity Content Lake. The repository retains schemas, validation, adapters, and migration scripts—not CMS content exports or secrets.
- Add a Sanity provider behind `src/content/index.ts`. It queries published content and maps provider-native records to the provider-independent domain contract before pages receive them. Routes and general components never import Sanity records or clients.
- During migration, select the provider explicitly with a server-side `CONTENT_SOURCE=local|sanity` setting. Local remains the default until acceptance. After production acceptance, CMS failure must surface through the existing safe error boundary; it must not silently serve stale sample content.
- Keep search provider-independent. At the expected 30–50 article scale, the Sanity provider may fetch/index published article fields behind `searchArticles`; a hosted search product is not part of this decision.

### Draft preview

An authenticated Next.js preview entry route verifies a server-only secret, enables Draft Mode, and uses a server-only read token to request draft-aware queries. Studio's presentation/preview configuration points to local, preview, or production frontend origins. Preview pages show a clear preview banner and exit control. Drafts never enter public search, archive, sitemap, RSS, metadata, or normal static generation. Studio requires an invited Sanity identity; there is no public editing endpoint.

### Images

Editors upload rights-cleared images to Sanity assets. The provider maps asset IDs, dimensions, MIME type, hotspot/crop, and contextual article fields into `ImageAsset` and image-usage data. Next.js allows only the required Sanity CDN hostname and uses width-aware URLs. Alt text, caption, and credit remain contextual on each use; the asset may supply defaults. `rightsNote` stays editorial-only and is never rendered or exposed through public records.

### Revalidation

On publish, unpublish, or delete, a Sanity webhook calls a server route that verifies a dedicated secret/signature. It invalidates tags for the entity, affected slug, related articles/issues/authors/categories, homepage, search/archive, sitemap, and feed. Queries use deterministic tags and conservative time-based revalidation as a backstop. A rejected webhook returns no internal details. Draft edits update authenticated preview without publishing.

## Document types and complete field mapping

CMS `_id` values map to provider-independent `id` values. CMS references are resolved by the adapter, never leaked to routes. Requiredness and validation follow `CONTENT_MODEL.md`; this table specifies storage.

### Site settings (`siteSettings`, singleton)

| Contract field | Sanity field |
|---|---|
| id | Fixed `_id: siteSettings` |
| publicationName, shortName, description, tagline, schoolName, location | String/text fields |
| administrativeContactLabel | String |
| administrativeContactTarget | Validated internal path or approved email string |
| primaryNavigation | Ordered array of `navigationItem` objects (`label`, `href`) |
| defaultSeoTitle, defaultSeoDescription | Validated strings |
| defaultSocialImage | Image field/reference to a Sanity image asset |

### Article (`article`)

| Contract field | Sanity field |
|---|---|
| id | `_id` mapped by adapter |
| slug | Required unique `slug.current`; adapter returns string |
| title, subtitle, summary | String/text fields with contract length rules |
| authors | Required ordered array of references to `author`, unique |
| issue | Optional reference to `issue` |
| category | Required reference to active `category` |
| tags | Unique array of references to active `tag`, maximum 10 |
| featuredImage | Image field with hotspot/crop; asset maps to `ImageAsset` |
| featuredImageAltText, featuredImageCaption, featuredImageCredit | Contextual sibling strings on the image-use object |
| structuredBody | Portable Text array using the mapping below |
| publicationDate, updatedDate | `datetime`; cross-field validation enforces ordering/status rules |
| status | Enum `draft`, `review`, `scheduled`, `published`, `archived`; provider exposes only eligible published records. Sanity's native draft state is also honored. |
| pinned | Boolean, default false |
| featuredRank | Positive integer, valid only when pinned; dataset validation enforces active uniqueness |
| seoTitle, seoDescription | Optional validated strings |
| estimatedReadMinutes | Positive integer; optionally computed in adapter when absent |

### Author (`author`)

| Contract field | Sanity field |
|---|---|
| id | `_id` |
| slug | Unique `slug.current` |
| displayName, role, classYearLabel, initials | Strings |
| biography | Portable Text limited to simple paragraphs/links, normalized by adapter |
| portrait | Image asset with hotspot/crop |
| portraitAltText | Contextual string required with portrait |
| active | Boolean, default true |
| displayOrder | Non-negative integer |

### Issue (`issue`)

| Contract field | Sanity field |
|---|---|
| id | `_id` |
| slug | Unique `slug.current` |
| title, season, description | String/text fields |
| issueNumber | Validated string representation, normalized by adapter to approved number/string |
| year | Four-digit integer |
| publicationDate | `datetime` |
| editorNote | Portable Text limited to approved blocks |
| articles | Ordered unique array of article references |
| coverImage | Image asset with hotspot/crop |
| coverImageAltText | Contextual string required with cover |
| accentToken | String selected from the design-token allowlist, never arbitrary CSS |
| status | Enum `draft`, `published`, `archived` |

### Category (`category`)

| Contract field | Sanity field |
|---|---|
| id | `_id` |
| slug | Unique `slug.current` |
| name, description | String/text fields |
| displayOrder | Non-negative integer |
| active | Boolean, default true |
| seoTitle, seoDescription | Optional validated strings |

### Tag (`tag`)

| Contract field | Sanity field |
|---|---|
| id | `_id` |
| slug | Unique `slug.current` |
| name, description | String/text fields with normalized-name validation |
| active | Boolean, default true |

### Static page (`staticPage`)

| Contract field | Sanity field |
|---|---|
| id | `_id` |
| slug | Unique `slug.current`, restricted initially to `about` and `masthead` |
| title, eyebrow, summary | String/text fields |
| structuredBody | Approved Portable Text blocks |
| status | Enum `draft`, `published`, `archived` |
| updatedDate | `datetime` |
| seoTitle, seoDescription | Optional validated strings |

Masthead people remain `author` records ordered by `displayOrder`; the `masthead` static page owns only introductory/adviser copy that is not an author profile.

### Image asset and usage

| Contract field | Sanity field |
|---|---|
| id | Referenced asset `_id` |
| source | Asset reference mapped to an application image source/CDN URL |
| width, height, mimeType | Asset metadata read by query/adapter |
| altText, caption, credit | Optional defaults in custom `editorialImage` usage object; each article/page use may override |
| rightsNote | Internal string on the editorial usage/asset metadata document; excluded from public projections |
| focalPoint | Sanity hotspot coordinates normalized by adapter to `{x, y}` |

## Portable body mapping

Portable Text spans allow only approved marks (`strong`, `em`, and link annotations); raw HTML is prohibited. Every block receives a stable `_key`, mapped to contract `id`. The adapter converts Portable Text into the current discriminated domain blocks so the renderer remains provider-neutral.

| Contract block | Portable Text representation |
|---|---|
| Paragraph | Standard block with `style: normal` and safe span marks |
| Heading | Standard block with `style: h2` or `h3` only |
| Bulleted list | Consecutive standard blocks with `listItem: bullet` |
| Numbered list | Consecutive standard blocks with `listItem: number` |
| Block quote | Custom `blockQuote` object with rich text and optional attribution, or a strictly mapped quote style |
| Pull quote | Custom `pullQuote` object with text and optional `sourceText` |
| Inline image | Custom `editorialImage` object with image asset, alt decision, caption, credit, and internal rights note |
| Image caption | Field on `editorialImage`, not a free-floating block |
| Photo credit | Field on `editorialImage`, not a free-floating block |
| Callout box | Custom `callout` object with optional title and limited Portable Text body |
| Divider | Custom `divider` object with no content fields |
| Link | Inline annotation with URL or internal-document reference; the existing standalone link maps to a custom `linkCard` only when editorially needed |
| Table extension | Deferred custom `table` object with caption, columns, bounded rows/cells, and source; implement only after a real need and accessible renderer |
| Chart-image extension | Deferred `chartImage` object extending editorial image with required data summary and optional source |

Unknown CMS blocks fail adapter validation with useful server-side development logs and render nothing safely in production. Neither Studio nor the public renderer accepts arbitrary HTML.

## Access and continuity

- The publication Gmail is the durable Sanity organization/project administrator or recovery identity, subject to the school's account policy. Its address and recovery details stay outside this repository.
- Invite editors through individual accounts. Never share the publication password or a common API token.
- Writers submit content through the existing editorial process and require no CMS account.
- Keep the invited group small on Free because editing may require broad Admin access. If least-privilege Editor/Contributor roles are needed, obtain an approved paid plan.
- A faculty adviser may be invited as Viewer or the minimum useful paid role; this is optional and policy-dependent.
- Each semester and before leadership turnover, review members, remove departed editors, confirm two durable administrators where allowed, rotate tokens, test recovery, update the private ownership register, and export the dataset.
- There is no public editing. Preview endpoints require both CMS membership and server-side verification.

## Environments and secret boundaries

| Environment | Dataset and behavior |
|---|---|
| Local | `development` dataset for schema/content work; local provider remains available explicitly during migration. Draft preview uses a developer's authenticated Studio session and server token. |
| Preview deployment | Reads published `production` content by default. Authorized Draft Mode can read production drafts so reviewers see the exact pending content against the candidate frontend. |
| Production | Reads only published `production` content through cache/CDN-aware server queries. No read token is shipped for ordinary public reads when the dataset is public. |

Use one Sanity project with `development` and `production` datasets. The expected launch configuration uses public datasets: only published documents are anonymously readable, so no private student information may be stored. Draft access and writes require authentication. If school policy requires private datasets, move to a suitable paid plan or reopen the CMS decision.

Public variables are limited to non-secret project ID, dataset name, API version, and canonical site URL. Read/preview tokens, preview secret, revalidation secret, deployment token, and write credentials are server-only deployment secrets. Never prefix secrets with `NEXT_PUBLIC_`, place them in Studio client bundles, log them, or commit populated environment files. Use least-privilege tokens per environment and rotate them on exposure or staff handoff.

## Migration sequence

1. **Local sample data:** implement schemas, queries, adapter, explicit provider flag, preview/revalidation skeleton, and parity tests while local remains authoritative.
2. **Five real test articles:** migrate deliberately varied stories (long, co-authored, multi-image, pull quote/callout, long headline), their authors/taxonomy/assets, and compare every route and metadata surface.
3. **One full issue:** migrate issue ordering, cover/editor note, all referenced articles, search/archive behavior, sitemap/RSS, and preview/publish workflow.
4. **Remaining archive:** batch import with validation, reconcile links/assets/bylines, editorially review, export a baseline, and switch production only after acceptance.

Do not copy student personal details or images until approval and permissions are recorded. Migration scripts must be repeatable and detect duplicates rather than overwrite silently.

## Rollback and export

- Retain explicit local-data mode, local fixtures, and tests until CMS integration has passed editorial acceptance and at least one stable production release. Do not implement automatic runtime fallback between providers.
- Tag the last local-data release and keep the last working deployment available through the hosting provider's rollback mechanism.
- Before provider cutover and major migrations, run a Sanity dataset export including documents and required assets, store it in approved restricted storage outside Git, and record tool/version/date/checksum in the private operations register.
- Test restoration into a disposable dataset before launch. An export file alone is not a proven recovery plan.
- To roll back a failed integration: restore the last deployment, select local mode only if the retained local content is intentionally accepted as current, revoke compromised webhooks/tokens if relevant, and reconcile CMS edits before retrying.

## Costs and unknowns

- Plan names, quotas, seats, roles, API/CDN usage, private datasets, comments/tasks, scheduled drafts, and hosted-Studio terms can change. Recheck official terms before Phase 10 and launch.
- Sanity currently advertises a Free plan with limited roles and public datasets. Granular editorial roles and private datasets may require a per-seat paid plan.
- Scheduled publishing is neither assumed free nor required. Editors can save drafts and publish manually for launch.
- Potential costs also include domain/hosting usage, image bandwidth, additional seats, and future search/analytics products; none are authorized by this decision.
- Unknowns requiring named human decisions are school vendor/privacy approval, number and role of editors, data-retention expectations, image-rights process, production owner/recovery contacts, and who authorizes publication/corrections.

## Exact implementation phases 10–14

### Phase 10 — Sanity foundation

Confirm policy/account/plan gates; add pinned compatible dependencies; embed the authenticated Studio foundation at `/studio`; add environment validation, a token-free public client, connectivity tooling, CORS/origin guidance, and setup docs. Schema documents and the public provider remain for Phase 11.

### Phase 11 — Provider and published-content integration

Implement server clients, GROQ projections, provider-to-domain adapters, runtime validation, deterministic queries, image mapping, provider selection, cache tags, webhook revalidation, and parity/unit tests. Keep production on local mode.

### Phase 12 — Preview and editorial workflow

Implement authenticated Draft Mode entry/exit, Studio presentation preview, preview banners, safe token boundaries, draft exclusion tests, manual publish/unpublish workflow, roles, recovery, corrections, and editor documentation.

### Phase 13 — Pilot migration and acceptance

Migrate five representative real articles and one full issue; validate assets, metadata, search/archive, sitemap/RSS, responsive rendering, accessibility, preview, publishing, revalidation, editor usability, account handoff, export, and restore. Resolve parity gaps before cutover.

### Phase 14 — Archive migration and production cutover

Migrate and reconcile the remaining archive; complete editorial/legal/image review; take verified exports; switch production to Sanity explicitly; monitor revalidation/errors; preserve rollback deployment and temporary local mode through the acceptance window; then document decommission criteria for sample fallback data.

## Acceptance gates

CMS implementation may start only after the school-policy and durable-owner questions are recorded outside Git. Production cutover requires passing provider parity, content validation, accessibility/browser tests, preview authorization, webhook revalidation, editor workflow, export/restore, and rollback drills. Any discovered blocker in the seven reviewed areas requires a new ADR; it does not return the project to an indefinite “CMS undecided” state.

## Primary implementation references

- [Sanity pricing and plan capabilities](https://www.sanity.io/pricing)
- [Sanity roles](https://www.sanity.io/docs/user-guides/roles)
- [Sanity and Next.js](https://www.sanity.io/docs/nextjs/introduction)
- [Portable Text/block content](https://www.sanity.io/docs/studio/block-content)
- [Sanity drafts](https://www.sanity.io/docs/content-lake/drafts)
- [Dataset export](https://www.sanity.io/docs/cli-reference/cli-datasets)
- [Payload installation](https://payloadcms.com/docs/getting-started/installation) and [deployment](https://payloadcms.com/docs/production/deployment)
- [Decap architecture](https://decapcms.org/docs/architecture/), [editorial workflow](https://decapcms.org/docs/editorial-workflows/), and [widgets](https://decapcms.org/docs/widgets/)
