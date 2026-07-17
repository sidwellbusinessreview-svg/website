# Sidwell Business Review

Phase 1 prototype for the official website of the Sidwell Business Review, a student-run business publication at Sidwell Friends School.

## Repository location

The expected local repository path is:

```text
/Users/Evan/Documents/GitHub/website
```

Before running commands, confirm your terminal is inside that folder. The GitHub repository is the shared source of truth; do not create a second Next.js project inside this repository.

## Getting started

The project pins Node.js major version 24 in `.nvmrc`. Next.js 16.2.10 requires Node.js 20.9 or newer, and Node 24 is also the version that successfully completed the project baseline checks.

```bash
nvm install
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The development server automatically refreshes when files change.

The environment file may remain blank to use the current local-content mode. Phase 10 adds an optional embedded Sanity Studio; follow `docs/SANITY_SETUP.md` when an approved project is ready. Never commit `.env.local` or real secrets.

## Sanity Studio foundation

The optional editorial Studio is mounted at [http://localhost:3000/studio](http://localhost:3000/studio) and is intentionally absent from public navigation. Without Sanity environment values it shows safe setup guidance; public pages continue using local content. With an approved project configured, Sanity authentication restricts editing to invited project members.

Run the token-free connectivity check after configuring `.env.local`:

```bash
npm run sanity:check
```

Studio configuration lives in `sanity.config.ts`, CLI configuration in `sanity.cli.ts`, and integration code in `src/sanity/`. No CMS provider supplies public pages yet.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run lint` checks the code for common errors. `npm run typecheck` validates TypeScript without creating files. `npm run build` creates and validates the production version. To run that production build locally, use `npm start` after a successful build.

## Understanding the different copies

- **Local copy:** The files on your computer and the site served by `npm run dev`. Local work is private until it is committed and pushed.
- **GitHub copy:** The committed repository shared with collaborators. A commit records changes locally; a push sends those commits to GitHub.
- **Preview copy:** A temporary hosted version created from a branch or pull request once preview hosting is configured. It lets reviewers test changes without affecting the public site.
- **Production copy:** The official public website built from the approved production branch and production environment settings. Production should change only through the reviewed deployment process.

Never assume that saving a file updates GitHub or production. Those are separate steps.

## Important folders

- `src/app/` contains public pages, the root layout, global styles, and the custom not-found page.
- `src/components/` contains reusable publication components such as the header, footer, logo, article cards, metadata, author information, issue cards, captions, and article-body renderer.
- `src/content/` contains typed sample content and the content-access layer.
- `src/sanity/` contains environment validation, the token-free public client, health check, Studio setup state, and the future schema registration point.
- `src/config/site.ts` contains the publication name, description, tagline, navigation, and contact information.
- `public/` is for static files such as a future image logo, local photography, and publication assets.
- `docs/` contains baseline records, architecture decisions, account-ownership guidance, and the phased development plan.

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

This phase remains a local-content publication prototype with an embedded Sanity Studio foundation. The Studio uses Sanity authentication but does not yet supply public content. Search and archive filtering continue to work against validated local content through the provider boundary.

Project security and contribution expectations are documented in `SECURITY.md` and `CONTRIBUTING.md`.
