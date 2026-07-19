# Phase 13: Secure Draft Preview

## Objective

Allow editors and the faculty adviser to preview unpublished Article, About, and Site Settings changes on the real website before publication.

The required feature is secure preview.

Click-to-edit visual overlays are optional. Do not add them if they make the editor workflow materially more complicated or unstable.

## Accepted model

Preview must support:

- Draft-only Articles
- Unpublished changes to published Articles
- Contributor changes
- About changes
- Site Settings changes
- Homepage effects such as pinned Articles and publication text

Public mode must remain published-only.

## Codex prompt

```text
You are performing revised Phase 13 of the Sidwell Business Review website project.

Before changing anything:

1. Read:
   - docs/CONTENT_PROVIDER.md
   - docs/PHASE_12_ACCEPTANCE.md
   - docs/CMS_EDITOR_MODEL.md
   - docs/SIMPLIFIED_PUBLISHING_WORKFLOW.md
   - SECURITY.md
   - PROJECT_STATUS.md
2. Confirm Phase 12 is committed and the worktree is clean.
3. Run local and CMS verification.
4. Confirm public Sanity queries use the published perspective.
5. Use current official Sanity and Next.js App Router Draft Mode guidance.
6. Do not use deprecated previewDrafts terminology when the current drafts perspective is supported.
7. Do not expose any preview token or secret to browser JavaScript.
8. Do not add Issues, Categories, Tags, Masthead, portraits, avatars, or biographies.

Implement secure draft preview.

1. Draft Mode architecture.

Implement:

- Secure server-only preview enable route
- Preview disable route
- Validation using current supported Sanity preview-secret tooling or an equivalently secure implementation
- Safe redirect handling
- No open redirect
- Server-only token
- Draft Mode cookie
- Draft perspective with CDN disabled
- Published perspective outside Draft Mode

Do not let a public visitor activate Draft Mode by guessing a URL.

2. Preview entry points.

Provide a clear editorial action such as:

- Preview Article
- Preview About
- Preview Site Settings
- Preview homepage

The action should open the correct frontend URL.

Prefer one understandable workflow over multiple overlapping preview controls.

If a Presentation Tool is added:

- Label it Preview.
- Keep it separate from the main Structure editing workflow.
- Do not restore Vision or Releases.
- Document why it exists.
- Make the normal Article preview action easy to find.

3. Live updates.

Use current-supported Sanity live-preview behavior if it is stable with the installed versions.

Acceptable outcomes:

- Preview updates as the editor types, or
- Preview updates after saving and refreshing

The actual behavior must be documented clearly.

Do not promise live updates unless they are proven.

4. Public isolation.

Confirm draft content never enters:

- Normal public Article pages
- Homepage
- Latest
- Archive
- Search
- Contributor profiles
- About
- Sitemap
- Feed
- Metadata
- JSON-LD
- Cached public payloads

Draft Mode content must not be cached into public responses.

5. Preview interface.

Preview mode must display a clear banner:

- “Previewing unpublished content”
- Exit preview control
- No ambiguity that readers may not see these changes

The banner must:

- Appear only in Draft Mode
- Be keyboard accessible
- Not cover important content
- Not appear in screenshots or metadata intended for public sharing where avoidable

6. Supported content.

Preview:

- Draft-only Article
- Published Article with unpublished changes
- Contributor changes affecting byline or profile
- About changes
- Site Settings changes
- Homepage pinning changes
- Image-free Article
- Article with editorial image

Do not require Article images.

7. Security.

Required:

- SANITY_API_READ_TOKEN remains server-only.
- SANITY_PREVIEW_SECRET remains server-only.
- No secret uses NEXT_PUBLIC_.
- No secret printed in logs.
- Invalid preview requests return a safe response.
- Redirect target is restricted to local site paths or approved origins.
- Preview responses discourage indexing.
- Preview state cannot be activated from an untrusted cross-origin request.
- Preview routes have focused rate/abuse consideration.
- Draft client uses `useCdn: false`.

8. Tests.

Add tests for:

- Missing secret rejected
- Incorrect secret rejected
- Valid activation
- Safe redirect
- Unsafe redirect rejected
- Preview exit
- Draft-only Article visible in preview
- Draft-only Article invisible publicly
- Unpublished Article edit visible in preview
- Old published version visible publicly
- About draft visible only in preview
- Site Settings draft visible only in preview
- Draft excluded from Search, sitemap, and feed
- Preview banner
- Preview noindex behavior
- Token not exposed to client
- Draft query uses drafts perspective and CDN disabled

9. Documentation.

Create:

docs/PREVIEW_WORKFLOW.md

Include:

- Save versus Publish
- Draft only
- Published with unpublished changes
- Preview Article
- Preview About
- Preview homepage
- Exit preview
- Faculty adviser review checklist
- Troubleshooting
- Security cautions
- What live update behavior actually exists

Update:

- README.md
- SECURITY.md
- AGENTS.md
- docs/CMS_EDITOR_MODEL.md
- docs/SIMPLIFIED_PUBLISHING_WORKFLOW.md
- PROJECT_STATUS.md
- .env.example

10. Validation.

Run:

- Sanity TypeGen
- CMS provider diagnostic
- Unit tests
- Preview route tests
- Published public browser tests
- Draft-preview browser tests
- Production build
- Secret scan
- git diff --check

Test in:

- Signed-in editor browser
- Clean Guest or unrelated browser
- Normal published mode
- Preview mode

Do not commit.

Report:

- Preview architecture
- Preview entry points
- Live-update behavior
- Security controls
- Draft-isolation result
- Tests
- Manual sequence
- Every changed file
- Recommended commit message
```

## Human acceptance test

1. Create a new draft-only Article.
2. Confirm it is absent from the normal public site.
3. Open Preview Article.
4. Confirm it appears in preview.
5. Exit preview.
6. Confirm it disappears.
7. Publish it.
8. Confirm it appears publicly.

Then:

1. Edit the published Article without publishing.
2. Confirm the public page retains the old version.
3. Confirm preview shows the new version.
4. Publish changes.
5. Confirm public mode updates according to the documented cache behavior.

Repeat a smaller test for About.

Use a clean browser profile to confirm unauthorized visitors cannot activate preview.

## Stop conditions

Do not commit if:

- Draft content leaks publicly.
- A preview secret is client-exposed.
- Unsafe redirects work.
- Preview content appears in sitemap or feed.
- Preview is impossible to exit.
- Public caching receives draft content.
- The editor workflow is more confusing than before.

## Commit

```text
feat: add secure Sanity draft preview
```
