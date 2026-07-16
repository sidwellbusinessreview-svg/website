# Phase 08: Accessibility, Performance, and Resilience

## Objective

Make the public frontend production-ready before introducing external content infrastructure.

## Codex prompt

```text
You are performing Phase 08 of the Sidwell Business Review website project.

Before changing anything:
1. Run npm run verify and npm run test:e2e.
2. Read accessibility requirements and current test coverage.
3. Show git status and stop if the repository is dirty.
4. Preserve working design and content behavior.
5. Do not add the CMS yet.

Perform a systematic audit and make targeted improvements.

Accessibility:
- Semantic landmarks
- Correct heading hierarchy
- Skip-to-content link
- Keyboard-operable navigation
- Visible focus
- Accessible mobile menu
- Meaningful link names
- Form labels and error states
- Image alt text
- Decorative image handling
- Captions and credits
- Color contrast
- Reduced-motion support
- No keyboard traps
- Screen-reader announcements for search results when useful

Performance:
- Next.js Image usage where appropriate
- Responsive image sizes
- Avoid unnecessary client components
- Avoid large client-side bundles
- Avoid blocking fonts
- Avoid layout shift
- Lazy-load below-the-fold media
- Preserve readable behavior if images fail
- Inspect bundle and route behavior using available framework tools

Resilience:
- Error boundaries where appropriate
- Loading states for future asynchronous CMS queries
- Empty states
- Not-found states
- Safe handling of missing optional data
- Safe handling of CMS downtime planned at the content-access boundary
- No raw error stack shown publicly
- External link safety

Testing:
- Expand axe coverage to homepage, article, search, issue, author, About, and Masthead.
- Add keyboard navigation tests.
- Add mobile navigation tests.
- Add image-alt validation tests.
- Add tests for empty and failure states where practical.
- Document any accessibility limitation that cannot reasonably be automated.

Create docs/ACCESSIBILITY.md containing:
- Standards followed
- Author responsibilities
- Developer checklist
- Manual keyboard test
- Screen-reader test outline
- Image alt-text guidance
- Contact process for accessibility feedback

Create docs/PERFORMANCE.md containing:
- Current baseline
- Improvements
- Image guidance
- Bundle guidance
- Performance regression checklist

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run npm run build.
- Run available Lighthouse or equivalent audits locally if feasible.
- Record results without manipulating tests merely to improve scores.
- Update PROJECT_STATUS.md.

Do not commit.
Report audit findings, fixes, remaining limitations, changed files, and recommended commit message.
```

## Stop condition

Do not begin the CMS if major keyboard, mobile navigation, route crash, or image accessibility defects remain.

## Commit

```text
fix: improve accessibility performance and resilience
```
