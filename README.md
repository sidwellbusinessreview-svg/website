# Sidwell Business Review

Phase 1 prototype for the official website of the Sidwell Business Review, a student-run business publication at Sidwell Friends School.

## Getting started

You need a current Node.js installation and npm.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The development server automatically refreshes when files change.

## Validation

```bash
npm run lint
npm run build
```

`npm run lint` checks the code for common errors. `npm run build` creates and validates the production version. To run that production build locally, use `npm start` after a successful build.

## Important folders

- `src/app/` contains public pages, the root layout, global styles, and the custom not-found page.
- `src/components/` contains reusable publication components such as the header, footer, logo, article cards, metadata, author information, issue cards, captions, and article-body renderer.
- `src/content/` contains typed sample content and the content-access layer.
- `src/config/site.ts` contains the publication name, description, tagline, navigation, and contact information.
- `public/` is for static files such as a future image logo, local photography, and publication assets.

## Changing content

- Sample articles, authors, and issues: `src/content/data.ts`
- Content types and supported article blocks: `src/content/types.ts`
- Content-access functions: `src/content/index.ts`
- Publication name and site settings: `src/config/site.ts`
- Colors, typography, spacing, and layout tokens: the `:root` section of `src/app/globals.css`
- Fonts loaded for the whole site: `src/app/layout.tsx`
- Text logo behavior: `src/components/site-logo.tsx`

Pages call functions such as `getArticles`, `getArticleBySlug`, `getIssues`, and `getAuthors`; they do not import the sample arrays. This boundary is intentional so a CMS can replace the local source later without requiring page rewrites.

## Current scope

This phase is a static, responsive publication prototype. It intentionally has no CMS, database, login system, analytics, or administration interface. Search is a clearly labeled placeholder ready for a later search service.
