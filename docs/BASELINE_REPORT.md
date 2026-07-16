# Phase 01 Baseline Report

**Verification date:** July 16, 2026  
**Repository:** `/Users/Evan/Documents/GitHub/website`  
**Branch:** `main`  
**Git status:** Dirty. The complete Phase 1 application and planning documents are uncommitted. These changes were recognized and preserved; nothing was discarded or committed.  
**Remote:** `origin` is configured as `https://github.com/sidwellbusinessreview-svg/website.git`.

## Result

The automated baseline passes and the site is safe to continue developing after the manual browser checks below are completed. The application installs from its lockfile, passes lint and production compilation, starts in development mode, serves all implemented routes, returns the custom not-found page for unknown routes, and has no errors in the development server log.

One baseline-breaking defect was found and fixed: an Unsplash image in the Metro article returned HTTP 404. The dead URL in `src/content/data.ts` was replaced with a working sample image.

Visual appearance, responsive overflow, browser-console output, hydration warnings visible only in the browser, and keyboard interaction still require the human browser pass listed below. The in-app browser automation surface was not available in this session, so those results are not claimed as automated findings.

## Environment

- Node.js: `v24.14.0`
- npm: `10.9.2`
- `node_modules`: Present before verification
- Install method: `npm ci` because `package-lock.json` exists
- Next.js: `16.2.10`
- React / React DOM: `19.2.4`
- Tailwind CSS: `4.3.3`
- TypeScript: `5.9.3`
- ESLint: `9.39.5`

The shell did not initially expose `node` on `PATH`, so the bundled Codex Node.js runtime was used. This did not require a dependency or application change.

## Architecture and scripts

The project uses Next.js App Router, TypeScript, Tailwind CSS v4, ESLint, npm, and a `src` directory.

- `src/app`: route pages, root layout, global styling, and custom not-found page
- `src/components`: reusable publication components
- `src/content`: typed sample data and asynchronous content-access functions
- `src/config/site.ts`: centralized publication identity and navigation
- `public`: static assets

Available scripts:

- `npm run dev`: start the development server
- `npm run lint`: run ESLint
- `npm run build`: compile and validate the production application
- `npm start`: run a completed production build

## Commands run

```text
git branch --show-current
git status --short
node --version
npm --version
npm ci
npm ls next react react-dom tailwindcss typescript eslint --depth=0
npm run lint
npm run build
npm run dev
curl checks against every route
curl checks against every unique remote sample image
npm audit --omit=dev
```

## Development server

- Local URL: `http://localhost:3000`
- Network URL reported by Next.js: `http://172.16.0.16:3000`
- Startup result: Ready in approximately 500 ms
- Startup warnings: None
- Runtime server errors during route sweep: None
- Runtime server warnings during route sweep: None

## Routes checked

The following returned HTTP 200 with the expected page title:

- `/`
- `/latest`
- `/latest?category=Markets`
- `/issues`
- `/issues/spring-2026`
- `/issues/winter-2025`
- `/authors`
- `/authors/maya-chen`
- `/authors/jonah-patel`
- `/authors/lena-brooks`
- `/authors/samir-okafor`
- `/about`
- `/masthead`
- `/search`
- `/articles/the-new-economics-of-school-lunch`
- `/articles/semiconductors-and-the-geography-of-risk`
- `/articles/small-businesses-big-rates`
- `/articles/what-metro-ridership-can-tell-us`
- `/articles/reading-the-fed`
- `/articles/solar-club-capital-budget`

Not-found behavior was checked with:

- `/definitely-not-a-real-page`
- `/archive`
- `/category/markets`

All returned HTTP 404 and the custom page content: “This story is not in our archive,” “Return home,” and “Browse latest articles.”

There is no dedicated category page or separate archive route in Phase 1. Category links intentionally point to `/latest?category=...`; the query currently does not filter results. The issue index at `/issues` is the archive linked from the footer.

## Links and images

- Internal route targets found in application components correspond to working routes.
- The mail link uses the configured publication email address.
- The one external editorial link points to the USDA Food and Nutrition Service.
- Every unique remote sample-image URL was checked after the repair and responded successfully.
- No missing-image requests appeared in the server route log.

## Errors and warnings

### Runtime errors

None observed in development server output during the complete route sweep.

### Console or hydration warnings

Not automatically verified because browser automation was unavailable. The server log contained no corresponding warnings. Check the browser console manually before Phase 02.

### npm audit

`npm ci` and `npm audit --omit=dev` report two moderate vulnerabilities involving a PostCSS version nested inside Next.js. npm proposes `npm audit fix --force`, but its suggested resolution would install Next.js 9.3.3 and break the requested architecture. No forced audit fix or dependency upgrade was performed.

## Manual browser checks required

Open `http://localhost:3000` after running `npm run dev`, then:

1. Confirm the homepage wordmark, navigation, lead story, article cards, metadata, issue block, and footer display without overlap.
2. Open the semiconductor article and check the very long headline, full long-form body, list, quote, and image.
3. Open the school-lunch article and check both authors, pull quote, callout, divider, captions, credits, and external link.
4. Open the Metro article and confirm all four article/feature images now load.
5. Check `/latest`, `/issues`, one individual issue, `/authors`, one individual author, `/about`, `/masthead`, and `/search`.
6. Open `/definitely-not-a-real-page` and confirm the custom 404 design and both recovery links.
7. Open browser developer tools and confirm there are no red console errors, hydration warnings, failed network requests, or unexpected 404s.
8. Navigate the header, cards, article links, author links, issue links, and footer with the keyboard. Confirm focus indicators remain visible.
9. Narrow the browser to approximately 390 pixels. Confirm there is no horizontal scrolling, clipped headline text, overlapping navigation, oversized pull quote, or image escaping the viewport.
10. Also check an intermediate tablet width around 768 pixels.

## Continue / stop decision

The code and server baseline are healthy. Continue to Phase 02 only after the manual visual/browser-console checklist passes and the current Phase 1 changes are reviewed, committed, and pushed by the human.
