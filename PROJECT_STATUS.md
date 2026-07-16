# Project status

## Baseline verification

- **Verified:** July 16, 2026
- **Result:** Automated baseline passed. The lockfile installs cleanly, lint and production build pass, the development server starts normally, all implemented routes respond correctly, custom not-found behavior works, and all sample image URLs respond after replacing one dead Unsplash reference.
- **Manual follow-up:** Complete the visual, responsive, keyboard, and browser-console checks listed in `docs/BASELINE_REPORT.md` before beginning Phase 02.

## Complete in Phase 1

- Next.js 16.2.10 foundation using App Router, TypeScript, Tailwind CSS v4, ESLint, npm, and `src/`
- Responsive homepage and all requested public routes
- Latest-article archive and long-form article pages
- Issue archive and individual issue pages
- Author directory and individual author pages
- About, masthead, search-ready placeholder, and custom not-found page
- Typed local sample data for six articles, two issues, four authors, and six categories
- Pinned lead story, co-authored story, long story, multi-image story, pull quote, callout, and long-headline examples
- Structured article blocks for paragraphs, headings, bulleted and numbered lists, quotes, pull quotes, images, captions, credits, callouts, dividers, and links
- Content-access layer that separates page code from raw content
- Reusable editorial components and centralized site/design configuration
- Beginner-friendly project documentation

## Major architecture decisions

- The content layer is asynchronous even though data is local. A future CMS adapter can preserve the same page-facing API.
- Article bodies use a typed discriminated union instead of embedded JSX or raw HTML.
- Global design variables control color, type, spacing, and content widths.
- `SiteLogo` is a text wordmark component today and is isolated for a later image-logo replacement.
- Remote Unsplash sample photographs are configured through Next Image; production editorial assets should eventually be owned and stored by the publication.
- Search remains nonfunctional by design in Phase 1.

## Remaining for later phases

- Final brand identity, official logo, and selected typefaces
- Real editorial content, photography permissions, and publication workflow
- CMS selection and migration adapter
- Functional full-text search
- Newsletter or submission workflows
- Analytics and privacy decisions
- Domain, deployment, social previews, sitemap review, and launch QA
- Accessibility audit with real content and devices

## Open decisions

- Whether issues will remain curated collections or map to print/PDF editions
- Whether categories need dedicated landing pages
- Who owns corrections, revisions, and publication approval
- Whether author profiles remain after graduation
- Which search and hosting services best fit school policy
