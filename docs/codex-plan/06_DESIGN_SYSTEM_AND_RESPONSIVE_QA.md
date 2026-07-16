# Phase 06: Design System, Branding Flexibility, and Responsive QA

## Objective

Refine the existing visual system without replacing it. Make global branding changes easy and prove the site works across common screen sizes.

## Design direction

The site should feel:

- Sharp
- Classy
- Editorial
- Serious
- Accessible
- Appropriate for a school publication
- Somewhere between a business journal, student newspaper, and modern magazine

It should avoid:

- Excessive animation
- Generic technology-startup styling
- Oversized decorative gradients
- Weak contrast
- Tiny body text
- Hardcoded colors scattered through components
- A design that depends on the absence of a logo

## Codex prompt

```text
You are performing Phase 06 of the Sidwell Business Review website project.

Before changing anything:
1. Read the product requirements and existing design implementation.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if uncommitted work exists.
4. Preserve the information architecture and content-access layer.
5. Do not add the CMS yet.
6. Do not perform an unrequested total redesign.

Audit and improve the design system.

Requirements:

1. Centralized branding
Create or confirm a single site configuration containing:
- Publication name
- Short name
- Description
- Affiliation text
- Contact placeholders
- Social-link placeholders
- Logo mode
- Text wordmark fallback

2. Logo system
- Keep the current text wordmark.
- Create a clean SiteLogo API.
- Allow future image logo replacement through one config value and one asset.
- Preserve accessible alternative text.
- Ensure the header does not break with a horizontal or square logo.

3. Design tokens
Centralize:
- Colors
- Typography
- Font sizes
- Line heights
- Spacing
- Content widths
- Borders
- Shadows
- Radii
- Breakpoints where appropriate

Do not hardcode repeated visual values throughout components.

4. Typography
- Use a strong editorial hierarchy.
- Keep article body text highly readable.
- Avoid more font families than necessary.
- Preserve a system-font fallback.
- Ensure long titles wrap gracefully.
- Ensure captions and credits remain distinguishable and readable.

5. Responsive behavior
Test and improve:
- 320px mobile
- 375px mobile
- 768px tablet
- 1024px laptop
- 1440px desktop

Required:
- No horizontal overflow
- Usable navigation
- Correct image sizing
- Comfortable article line length
- Article cards that do not collapse awkwardly
- Touch targets that are not too small
- Footer remains readable
- Long names and headlines do not break layouts

6. Component consistency
Audit:
- Header
- Navigation
- Footer
- Article cards
- Article metadata
- Image captions
- Author display
- Issue display
- Buttons
- Links
- Form controls
- Empty states
- Not-found page

7. Print behavior
Add a minimal print stylesheet for article pages:
- Hide navigation and irrelevant controls
- Keep title, metadata, body, captions, credits, and URL context
- Avoid splitting captions from images where practical

8. Visual test coverage
Expand Playwright tests to capture screenshots or assert layout at key widths.
Do not create fragile pixel-perfect tests for every component.
Use targeted screenshots for homepage and article page at desktop and mobile.

9. Documentation
Create docs/BRANDING.md:
- How to replace the logo
- How to change colors
- How to change fonts
- How to update publication text
- Which changes require testing

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Inspect screenshot artifacts.
- Confirm no accessibility regressions.
- Update PROJECT_STATUS.md.

Do not commit.
Report:
- Design problems found
- Improvements made
- Token files
- Screenshot locations
- Every changed file
- Recommended commit message
```

## Human review

Review the homepage and one article at desktop and mobile width.

Do not approve merely because the design is attractive. Confirm it is readable and easy to maintain.

## Commit

```text
style: refine configurable editorial design system
```
