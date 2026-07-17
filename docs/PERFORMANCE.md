# Performance

The site is intentionally server-first. Pages and content components remain React Server Components except for the required Next.js error boundary. There is no analytics, CMS SDK, client-side search index, web-font download, or animation library.

## Current baseline

Baseline recorded July 17, 2026 against Next.js 16.2.10 production output:

- `npm run build` completes successfully and produces 26 routes.
- Static editorial routes are prerendered; search, archive, and RSS are server-rendered only where query or response behavior requires it.
- JavaScript files in `.next/static/chunks` total approximately 651 KB uncompressed across the build output. This is not the per-route transferred size and should not be treated as a Core Web Vitals measurement.
- The local in-app production-browser check reported no console warnings or errors and no recorded layout-shift entries on the homepage.
- Lighthouse is not installed in the project, so no Lighthouse score is recorded. Dependencies and tests were not changed merely to manufacture a score.

Network timing from localhost is not representative of school, mobile, preview, or production hosting. Capture field or throttled lab metrics after hosting is configured.

## Improvements in Phase 08

- Above-the-fold lead and article images use the current Next.js `preload` API.
- Below-the-fold article-card and body images retain Next.js lazy loading.
- Every responsive image has a `sizes` hint and a CSS aspect ratio that reserves layout space.
- Image containers retain a neutral background and meaningful alt text if an image request fails.
- System font stacks avoid blocking font downloads and preserve readable fallbacks.
- Mobile navigation uses native `details` behavior rather than adding a JavaScript menu bundle.
- Loading and error UI is small and isolated; no provider SDK was introduced.

## Image guidance

- Prefer publication-owned, rights-cleared images at sensible source dimensions.
- Supply accurate intrinsic dimensions when using non-`fill` images.
- Use `fill` only inside a positioned container with a reserved aspect ratio.
- Keep `sizes` aligned with actual card and article widths.
- Preload only the likely Largest Contentful Paint image.
- Leave below-the-fold images lazy-loaded.
- Do not increase quality or dimensions beyond visible benefit.
- Preserve meaningful alt text, captions, and credits when optimizing assets.

Remote Unsplash images are prototypes. Production assets should move to an approved, reliable publication-controlled source during the content migration.

## Bundle guidance

- Prefer Server Components and server-side content functions.
- Add `"use client"` only for interactions or framework boundaries that require it.
- Do not ship CMS clients, validation libraries, or complete content collections to the browser unnecessarily.
- Review bundle impact before adding editors, charts, analytics, search SDKs, or animation packages.
- Keep system fonts unless a brand decision includes a measured, privacy-conscious font-loading plan.

## Performance regression checklist

1. Run `npm run verify`, `npm run test:e2e`, and `npm run build`.
2. Review which routes changed from static to dynamic.
3. Check production console warnings and failed requests.
4. Inspect the homepage and a long article at mobile and desktop widths.
5. Confirm one likely LCP image is preloaded and below-the-fold images remain lazy.
6. Confirm images reserve space and do not cause visible layout shifts.
7. Compare `.next/static/chunks` output or a supported bundle analyzer when client dependencies change.
8. Run Lighthouse or an equivalent throttled audit after deployment and record the environment honestly.
9. Test on a slower phone/network before launch; localhost timings are insufficient.
