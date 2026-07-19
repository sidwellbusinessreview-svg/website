# Branding guide

Contributor identity is deliberately outside the logo and illustration system: it is always text-only. Do not add portraits, avatars, initials marks, or geometric identity placeholders. The optional image logo is publication branding and remains supported.

The Sidwell Business Review brand is intentionally centralized so future student teams can update it without searching through page components.

## Publication text

Edit `src/config/site.ts` to change:

- Publication name and short name
- Text wordmark fallback
- Description and tagline
- School affiliation and location
- Contact label and placeholder address
- Navigation
- Future social links

After changing publication text, run `npm run verify` and `npm run test:e2e`. Check the header and footer at 320, 375, 768, 1024, and 1440 pixels because longer names can change wrapping.

## Replacing the logo

The site currently uses the text wordmark. `SiteLogo` is the only rendering component that should decide between text and image modes.

To use an official image logo:

1. Add the approved logo file at `public/brand/logo.png`, or update the single `imageSrc` value if a different public asset name is required.
2. In `src/config/site.ts`, change `logo.mode` from `"text"` to `"image"`.
3. Set `imageAlt` to the publication’s full accessible name.
4. Set `imageWidth` and `imageHeight` to the asset’s intrinsic dimensions.

The logo CSS supports both horizontal and square source images using constrained dimensions and `object-fit: contain`. Do not put separate logo markup directly in the header or footer. The text wordmark remains the fallback by changing only `logo.mode`.

Logo files should:

- Have sufficient resolution for high-density screens
- Use a transparent or intentional background
- Remain legible on the paper-colored site background
- Avoid tiny taglines that become unreadable on mobile
- Include no unlicensed marks or fonts

Test the header at all required viewport widths after replacing the asset.

## Changing colors

Color tokens are in the `:root` section of `src/app/globals.css`.

Important tokens include:

- `--color-paper`
- `--color-surface`
- `--color-ink`
- `--color-muted`
- `--color-rule`
- `--color-accent`
- `--color-accent-dark`
- `--color-accent-on-dark`
- `--color-focus`
- `--color-footer`

Do not replace token usage with repeated hexadecimal values in components. After changing colors, run the Playwright axe tests and manually inspect links, focus outlines, captions, disabled controls, article images, and the dark purpose section.

## Changing fonts

Typography tokens are also in `src/app/globals.css`:

- `--font-display` controls headlines and editorial display text.
- `--font-body` controls navigation, metadata, controls, and utility text.

Both stacks include system-font fallbacks. Keep the site to these two functional families unless a documented design decision justifies another. If web fonts are introduced later, host and load them deliberately, preserve fallback behavior, and review performance and privacy.

Font size, line-height, and letter-spacing tokens are grouped near the font-family tokens. Test long headlines, author names, captions, pull quotes, and mobile navigation after typography changes.

## Spacing and layout

Spacing, widths, borders, shadows, radii, and touch-size tokens live in the same `:root` block. Breakpoint values are documented there for reference; CSS media queries must still use literal values because custom properties are not supported in media-query conditions.

Avoid route-specific spacing values when an existing token expresses the same relationship.

## Changes that require browser testing

Always run `npm run test:e2e` after changing:

- Publication or navigation text
- Logo mode, source, dimensions, or alt text
- Colors or focus styles
- Font families, sizes, or line heights
- Container widths, breakpoints, or card grids
- Header, footer, article, image, caption, or form-control layout
- Print styles

Targeted screenshots are produced by the browser suite in the Playwright test output directory for homepage and article pages at desktop and mobile widths.
