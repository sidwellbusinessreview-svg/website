# Product requirements

## 1. Publication overview

Sidwell Business Review is a student-run publication covering business, economics, markets, technology, entrepreneurship, policy, and campus institutions. The website should present student work with the seriousness, clarity, accessibility, and editorial discipline of a modern journal while remaining maintainable as student leadership changes.

The product is a public editorial website, not a social network, learning-management system, or school records system. Its primary job is to help readers discover, read, understand, and share published work.

## 2. Audience

Primary audiences:

- Sidwell Friends students, families, faculty, staff, and alumni
- Students at other schools interested in business and economics
- Prospective contributors and future student editors
- Educators and community members
- General readers discovering articles through search or shared links

The site must not assume business expertise. Headlines, summaries, navigation, and article structure should make complex subjects approachable without oversimplifying them.

## 3. Editorial workflow

The intended workflow is:

1. A writer proposes or is assigned a story.
2. An editor assigns one or more authors and an article category.
3. The writer drafts structured article content and supplies source, image, caption, credit, and alt-text information.
4. Editors review accuracy, fairness, clarity, structure, permissions, privacy, and conflicts.
5. A designated publisher performs final approval and schedules or publishes the article.
6. Published articles may receive clearly recorded corrections or updates.
7. Editors may place published articles on the homepage or within an issue.
8. Graduating editors hand service access and workflow documentation to successors.

The current local data represents only the public output of this workflow. The CMS phases must support drafts and approvals without exposing unpublished content publicly.

## 4. User roles

- **Reader:** Browses and reads public content without an account.
- **Writer:** Drafts assigned content and supplies supporting media information. Repository access is not required.
- **Editor:** Reviews and revises content, assigns taxonomy and authors, and recommends publication.
- **Publisher / editor in chief:** Approves publication, scheduling, homepage placement, corrections, and major metadata.
- **Technical maintainer:** Maintains code, integrations, deployment, and security without making unilateral editorial decisions.
- **Faculty adviser:** Supports continuity and school-policy compliance. Editorial authority remains defined by the publication.
- **Administrative account owner:** Maintains durable ownership and recovery access for services through the publication Gmail.

CMS permissions should use individual accounts where supported and grant the minimum role required.

## 5. Launch scope

Launch scope includes:

- Responsive homepage
- Latest-article listing
- Article pages
- Issue listing and issue pages
- Author listing and author pages
- Category discovery
- Search or a usable archive fallback
- About and masthead pages
- Custom not-found behavior
- Configurable site identity and branding
- Accessible semantic markup and keyboard behavior
- Production metadata, social previews, sitemap, and robots configuration
- Documented editorial, operational, security, and handoff procedures
- CMS-backed published content after frontend hardening

## 6. Future scope

Potential later work includes:

- Newsletter signup and publishing workflow
- Contributor submissions
- Related-article recommendations
- PDF or print-issue archives
- Data visualizations and native charts
- Audio or video embeds
- Correction-history display
- Advanced search filters
- Structured data beyond launch essentials
- Privacy-respecting analytics after a documented decision

Future features require prioritization, privacy review, ownership, and maintenance plans.

## 7. Out-of-scope items

Unless separately approved, the following are out of scope:

- Public reader accounts, comments, likes, or social feeds
- Student grades, schedules, school records, or other sensitive school data
- Advertising marketplace, subscriptions, or payments
- Custom authentication built by the publication
- A bespoke CMS when a maintained service meets requirements
- Unreviewed AI-generated editorial content
- Tracking scripts or advertising analytics
- Publishing personal student contact information
- Storing secrets in the repository

## 8. Page-by-page requirements

### Homepage

Must present one clear lead article, a selection of recent or deliberately featured articles, current or recent issue information, publication purpose, and routes into the archive. It must remain useful when fewer than the ideal number of articles or no issue is available.

### Latest

Must list published articles newest first, support category discovery, and provide meaningful empty-state text. Pagination or incremental loading may be added when volume requires it.

### Article

Must display headline, summary/deck, authors, publication date, optional update date, category, optional issue, featured media, complete structured body, captions, credits, and accessible links. Invalid or unpublished slugs return not found.

### Issues

Must list public issues newest first with issue identity, date/season, summary, cover treatment, and link.

### Individual issue

Must display issue metadata, editor note, and its ordered published articles. An issue may exist without every planned article being published.

### Authors

Must list public author profiles without exposing private contact details.

### Individual author

Must display the author’s public identity, biography, role or class information when approved, and published articles. A valid author with no articles receives an empty state rather than a 404.

### About

Must explain mission, standards, student leadership, editorial independence, correction expectations, and appropriate contact path.

### Masthead

Must show current public staff roles and adviser information without exposing private details.

### Search

At launch, search should return relevant published content or provide a clearly labeled archive fallback. It must never suggest that a disabled control is functional.

### Not found

Must return HTTP 404, use the site layout, explain the problem, and offer routes home and to recent content.

## 9. Homepage editorial rules

- Only articles with `status = published` and a publication date not in the future may appear publicly.
- At most one primary lead article is displayed.
- `pinned` expresses editorial priority; `featuredRank` resolves ordering among multiple eligible featured articles.
- If no pinned article exists, use the most recently published eligible article.
- The lead article must not be repeated in the immediately following latest-content section.
- Featured sections must not fail when content counts are low.
- Homepage labels must come from current settings or content, not hardcoded season text.
- Editors control placement; engagement metrics do not automatically determine prominence.

## 10. Article requirements

- Stable internal ID and unique, URL-safe slug
- Headline and concise public summary
- At least one author
- Exactly one primary category
- Zero or more tags and zero or one issue
- Required featured image and meaningful alt text unless the image is explicitly decorative
- Structured, validated body with at least one substantive block
- Publication status and publication date rules
- Optional update date that cannot precede publication
- Optional pinned state and featured rank
- Optional SEO title and description with sensible fallbacks
- No unpublished article may appear in listings, search, metadata, or static parameters
- Corrections and substantive updates should eventually be auditable

## 11. Author requirements

- Stable ID, unique slug, display name, and public biography
- Public role and class/year details are optional and require editorial approval
- Optional portrait with alt text and credit
- Optional active/inactive status to preserve alumni archives without listing every former author as current staff
- No personal email, phone number, schedule, or private profile data on public pages
- Multiple authors must retain intentional byline order

## 12. Issue requirements

- Stable ID, unique slug, title, issue number or label, publication date or season/year, description, and editor note
- Ordered article references
- Optional cover image or configurable cover treatment
- Public status or publication control
- Issue membership must not change an article’s canonical URL
- An article may be published without an issue

## 13. Category and tag requirements

- Categories are controlled, editorially meaningful, and mutually understandable.
- Each article has exactly one primary category.
- Categories have stable IDs, unique slugs, names, descriptions, and optional display order.
- Tags are optional, narrower descriptors used across categories.
- Tags have stable IDs, unique slugs, and normalized names.
- Editors should reuse existing terms instead of creating near-duplicates.
- Category and tag pages should exist only when the product supports meaningful discovery and adequate content.

## 14. Image, caption, credit, and alt-text requirements

- Every image is represented as an image asset with a stable reference.
- Alt text describes the image’s relevant visual information and purpose; it is not a duplicate of the caption.
- Decorative images use empty alt text only when the frontend deliberately marks them decorative.
- Captions explain context that is useful to readers.
- Credits identify photographer, illustrator, source, and license/permission where required.
- Editors must confirm publication rights before use.
- Crop or focal-point data should be stored when the CMS supports it.
- Remote placeholder imagery must be replaced with publication-owned or appropriately licensed assets before launch.
- Text embedded in chart images requires an accessible textual summary.

## 15. Search and archive requirements

- Search indexes only public, published content.
- Search should cover title, subtitle, summary, author, category, tags, issue, and body text where supported.
- Results show enough metadata to distinguish similar articles.
- No-result and error states provide useful recovery links.
- The latest archive sorts by publication date descending.
- Category, tag, author, and issue filters must produce stable URLs when implemented.
- Pagination must preserve filters and be accessible.
- The issue index may be described as an archive, but routes and labels should remain consistent.

## 16. Branding configurability

- Publication name, short name, description, tagline, school, location, administrative contact path, navigation, and social metadata are centralized.
- Colors, typography, spacing, widths, and other design tokens remain globally configurable.
- `SiteLogo` remains the single replacement point for moving from a text wordmark to an image logo.
- Content schemas must not encode visual CSS values except intentional editorial presentation fields such as an issue accent or crop.
- Branding changes must preserve contrast, responsive behavior, and semantic hierarchy.

## 17. Accessibility requirements

- Target WCAG 2.2 AA.
- Use semantic landmarks, headings, lists, figures, captions, and time elements.
- All functionality must be keyboard accessible with visible focus.
- Provide a working skip link.
- Maintain sufficient color contrast.
- Images require correct alt behavior; media alternatives are required where applicable.
- Do not rely on color alone to communicate meaning.
- Respect reduced-motion preferences.
- Avoid horizontal scrolling at common mobile widths.
- Form controls require labels, instructions, status messaging, and accessible error handling.
- Page titles, metadata, link text, and heading order must be meaningful.

## 18. Security and privacy requirements

- Never commit secrets or populated environment files.
- Use protected hosting environment variables and minimum service permissions.
- Use the publication Gmail as durable service ownership and invite individual accounts where supported.
- Minimize student personal information and follow school policy and consent requirements.
- Do not expose draft content through predictable public URLs.
- Validate CMS webhooks and preview requests.
- Sanitize or safely render externally managed rich content.
- Keep dependencies reviewed; never apply forced audit fixes blindly.
- Document incident response, recovery ownership, and account handoff.

## 19. CMS requirements

- The default planned CMS is Sanity unless a documented blocker changes the decision.
- The CMS must represent the framework-independent contract in `docs/CONTENT_MODEL.md`.
- It must support drafts, scheduled/publication status, references, ordered multi-author bylines, structured bodies, image metadata, validation, and preview.
- The website must continue to consume content through the content-access layer.
- CMS-specific objects must be mapped into application-domain types before reaching pages and general components.
- Published queries must exclude drafts and future-scheduled content.
- Preview mode must be authenticated and visibly distinguish draft content.
- Editors need usable field descriptions and validations without repository access.

## 20. Handoff requirements

- Maintain beginner-friendly setup, contribution, security, and editorial documentation.
- Record architecture decisions and service ownership.
- Store secrets in an approved password manager, never in handoff documents.
- Use the publication account as durable owner and review individual access at least annually and during leadership transitions.
- Document deployment, domain, CMS, recovery, billing, renewal, and backup responsibilities.
- A successor must be able to install, run, validate, edit content, publish, and recover access using the documentation.

## 21. Definition of done

A feature or release is done when:

- Requirements and acceptance behavior are documented.
- Content-provider boundaries and established architecture are preserved or a new decision is recorded.
- Empty, loading, error, and not-found states are handled.
- Accessibility, privacy, and security implications are addressed.
- Relevant desktop and mobile routes are manually verified.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- No secrets or generated artifacts are tracked.
- Metadata and canonical public behavior are correct.
- Documentation and `PROJECT_STATUS.md` are current.
- Changed files, manual checks, warnings, and deferred risks are reported.
- Appropriate review occurs before merging or production deployment.
