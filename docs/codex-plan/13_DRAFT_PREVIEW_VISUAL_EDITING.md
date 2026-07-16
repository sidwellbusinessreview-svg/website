# Phase 13: Draft Preview and Visual Editing

## Objective

Allow authenticated editors to preview unpublished or changed content in the actual website before publication.

This is essential because the faculty adviser approves content before it goes live.

## Codex prompt

```text
You are performing Phase 13 of the Sidwell Business Review website project.

Before changing anything:
1. Read CMS and content-provider documentation.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Confirm public queries exclude drafts.
5. Use current official Sanity and Next.js App Router visual-editing guidance.
6. Do not use deprecated preview APIs from old tutorials.
7. Do not expose preview secrets.

Implement secure draft preview and visual editing.

Requirements:

1. Draft Mode
- Secure server-only route to enable preview.
- Secret verification.
- Safe redirect validation.
- Route to disable preview.
- Preview state clearly indicated to the editor.
- Public visitors cannot activate preview without authorization.

2. Sanity preview
- Authenticated editors can view draft content.
- Draft and published perspectives are clearly separated.
- Public mode remains published-only.
- Preview pages use the same components as production pages.
- Draft preview supports article, issue, author, static page, and homepage changes where applicable.

3. Visual Editing
- Integrate current-supported Sanity visual editing or Presentation Tool if practical and supported.
- Editors can click content in preview and reach the relevant Studio field.
- Avoid adding excessive client-side code to normal public pages.
- Disable visual overlays outside preview.

4. Security
- Preview secret stored in environment variables.
- No secret in URL logs longer than necessary.
- No open redirect.
- No caching of private draft content into public output.
- No draft content in sitemap, RSS, search, metadata, or static public payloads.

5. Editorial indicators
- A fixed but unobtrusive preview banner.
- Shows that unpublished content may be visible.
- Provides an exit-preview action.
- Does not appear in normal public mode.

6. Tests
- Unauthorized preview request rejected.
- Valid preview activation.
- Preview exit.
- Draft visible in preview.
- Draft invisible publicly.
- Published article visible in both.
- Preview secret not client-exposed.
- Safe redirect behavior.
- No-index behavior for preview pages where appropriate.

7. Documentation
Create docs/PREVIEW_WORKFLOW.md:
- How an editor opens preview
- How to review an article
- How to exit preview
- What the faculty adviser checks
- Difference between Save, Draft, Preview, and Publish
- Troubleshooting

Update README, SECURITY, AGENTS, and PROJECT_STATUS.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Test in authenticated and incognito browsers.
- Inspect response and cache behavior.
- Confirm draft content never appears publicly.

Do not commit.
Report security behavior, tests, changed files, and recommended commit message.
```

## Human acceptance test

1. Create a draft article and do not publish it.
2. Open the public site in an incognito window.
3. Confirm the article is absent.
4. Open editor preview.
5. Confirm the draft appears.
6. Exit preview.
7. Confirm it disappears.
8. Publish it.
9. Confirm it appears publicly.

## Commit

```text
feat: add secure editorial draft preview
```
