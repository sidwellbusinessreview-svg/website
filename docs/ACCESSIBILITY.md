# Accessibility

Sidwell Business Review targets WCAG 2.2 Level AA. Automated checks support this goal, but they do not replace testing by disabled readers or manual review with real content and devices.

## Standards and current safeguards

The site uses semantic header, navigation, main, article, aside, figure, time, and footer elements. It provides:

- A visible-on-focus skip link to the main content
- Logical heading levels and one page-level heading on primary content pages
- Keyboard-operable desktop and native mobile navigation
- Visible focus outlines with a centralized high-contrast token
- Labeled search and archive controls
- Polite search-result announcements
- Meaningful not-found, empty, loading, and error states
- Required alternative text for editorial images
- Figure captions and separately styled photo credits
- Reduced-motion styling
- Descriptive external-link announcements and safe new-tab attributes

Playwright runs axe rules tagged for WCAG 2.0 and 2.1 A/AA across the homepage, an article, search, an author, About, and the archive. WCAG 2.2 requirements that axe cannot fully judge still require the manual checks below.

## Author responsibilities

Contributor identity is presented as linked text rather than portraits, avatars, or initials artwork. Do not introduce person-image placeholders. Image alternative-text requirements apply to article photography, charts, illustrations, and the optional publication logo.

Before an article is published, its editor must confirm:

- Every informative image has concise, contextual alt text.
- Alt text does not repeat the caption or credit.
- Captions explain editorial context; credits record attribution, not visual meaning.
- Headings describe sections and do not skip levels.
- Link labels make sense outside the surrounding sentence.
- Tables, charts, audio, or video have an equivalent accessible explanation.
- Color is not the only way a chart or callout communicates meaning.
- Pull quotes do not contain information absent from the article body.

The current content model requires non-empty alt text for all editorial images. It does not yet support explicitly decorative editorial images. Do not work around validation with meaningless text. Add a documented decorative-image field before such assets are introduced.

## Developer checklist

- Preserve `header`, labeled `nav`, `main`, and `footer` landmarks.
- Keep the skip-link target on `main#main-content`.
- Maintain a logical heading outline when nesting cards beneath section headings.
- Use native controls and labels before adding ARIA.
- Keep every interaction reachable and operable by keyboard.
- Ensure focus remains visible at 200% and 400% zoom.
- Announce asynchronous results or errors without moving focus unexpectedly.
- Never expose provider exceptions, stack traces, private queries, or tokens publicly.
- Use `next/image` with accurate `sizes`, reserved aspect-ratio space, and meaningful alt text.
- Re-run `npm run verify` and `npm run test:e2e` after accessibility-sensitive changes.

## Manual keyboard test

1. Load the homepage and do not use a mouse.
2. Press Tab once. Confirm “Skip to content” becomes visible.
3. Activate it and confirm focus/navigation reaches the main content.
4. Tab through the header, navigation, article links, archive controls, search, and footer in a logical order.
5. At mobile width, focus Menu and activate it with Enter or Space.
6. Confirm every mobile-navigation link is reachable and focus remains visible.
7. Submit search with Enter, then confirm the result count or no-result message is announced.
8. Confirm Shift+Tab reverses direction and no component traps focus.
9. Trigger a not-found page and confirm recovery links are reachable.

## Screen-reader test outline

Test at minimum with VoiceOver and Safari on macOS or iOS. Add NVDA with Firefox or Chrome on Windows before launch when available.

- Navigate by landmarks and confirm they have distinct, useful names.
- Navigate by headings and confirm the outline reflects page structure.
- Read an article by paragraph, list, quote, figure, caption, and link.
- Confirm bylines, publication dates, image alternatives, captions, and credits are understandable.
- Open the mobile menu and confirm its expanded state and links are announced.
- Run a successful and unsuccessful search and listen for status messages.
- Confirm loading, error, empty, and not-found states provide recovery context.

## Alt-text guidance

Describe what matters in the image for this specific article. Prefer “Students compare budget notes around a cafeteria table” over “Photo of students.” Do not include “image of,” filenames, photographer names, or facts that cannot be seen. Put attribution in the credit field and broader context in the caption.

If an image is genuinely decorative, it should use an explicit decorative flag and `alt=""`. That capability is not present in the current editorial schema, so all current editorial images must be informative.

## Accessibility feedback

Use the “Contact the editors” link in the site footer to report an accessibility barrier. Include the page address, what you were trying to do, the browser or assistive technology used, and a description of the problem. Do not include passwords, private school records, or unnecessary student personal information.

Accessibility reports should be acknowledged by the publication’s administrative contact, reproduced where possible, prioritized by impact, and tracked through verification before closure.

## Remaining manual limitations

Automated tests cannot determine whether every editorial description is contextually useful, whether reading order feels natural in every screen reader, or whether the site works well under all zoom, forced-color, speech-input, and mobile assistive-technology combinations. These remain launch QA responsibilities.
