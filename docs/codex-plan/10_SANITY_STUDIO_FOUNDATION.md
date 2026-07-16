# Phase 10: Sanity Project and Studio Foundation

## Objective

Create the actual CMS project and add an authenticated editor interface without yet replacing the public site's local content.

This phase includes human account setup and Codex code integration.

## Human steps

### 1. Create the Sanity account and project

Use the publication's joint Gmail as the durable project owner or recovery identity.

Where Sanity supports team members, invite editors using their individual accounts rather than sharing the joint Gmail password.

Create a project named:

```text
Sidwell Business Review
```

Use a production dataset named:

```text
production
```

Do not paste any token into chat, Codex prompts, GitHub issues, Markdown files, or committed code.

Record these non-secret values in your private account register:

- Sanity project name
- Project ID
- Dataset name
- Project owner
- Invited administrators

### 2. Environment file

Codex will update `.env.example`.

You will create `.env.local` yourself from the template and add the real values. `.env.local` must remain ignored by Git.

## Codex prompt

```text
You are performing Phase 10 of the Sidwell Business Review website project.

The CMS decision is Sanity.

Before changing anything:
1. Read CMS_DECISION.md and all project instructions.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Confirm .env.local is ignored.
5. Do not ask for or print secret tokens.
6. Do not replace local public content yet.
7. Preserve all current public routes.

Use current official Sanity and next-sanity integration patterns compatible with the installed Next.js version. Do not copy deprecated APIs from old tutorials.

Implement the Sanity foundation:

1. Dependencies
Add only required current packages, expected to include equivalents of:
- sanity
- next-sanity
- @sanity/vision
- @sanity/image-url
- @portabletext/react if required later

Explain every package.

2. Configuration
Create:
- sanity.config.ts or the current recommended equivalent
- sanity.cli.ts if required
- src/sanity or another clearly documented integration directory
- Environment-variable validation
- A public read client that never includes a write token in browser code

3. Embedded Studio
Embed Sanity Studio at:
- /studio

Requirements:
- Studio route is not linked in public navigation
- Sanity authentication protects editing
- Search engines are discouraged from indexing Studio
- Public visitors cannot edit content
- The route has a clear title
- Studio configuration remains in source control
- Secrets remain outside source control

4. Environment variables
Update .env.example with placeholders for:
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- NEXT_PUBLIC_SANITY_API_VERSION
- SANITY_API_READ_TOKEN only if required for server-side draft preview later
- SANITY_PREVIEW_SECRET later
- Any selected Studio base path

Do not add real values.

5. CORS and project settings documentation
Create docs/SANITY_SETUP.md with beginner instructions for:
- Creating the project
- Finding project ID
- Setting dataset
- Creating .env.local
- Adding local and preview origins to Sanity when needed
- Inviting editors
- Revoking editors
- Never sharing tokens
- Opening /studio

6. Temporary content behavior
- Keep public pages using local content.
- Add a CMS connectivity health check that can be run manually without affecting production pages.
- Do not fail the site if Sanity environment variables are absent in local-data mode.

7. Tests
- Configuration validation
- Studio route behavior when environment variables exist
- Safe failure or clear setup message when they do not
- No secrets exposed in client bundle
- Existing public routes remain unchanged

8. Documentation
Update README.md, AGENTS.md, DECISIONS.md, and PROJECT_STATUS.md.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run npm run build both with documented placeholder-safe mode and with the human's local Sanity variables if available.
- Confirm /studio opens and requires Sanity authentication.
- Inspect git diff for secrets.
- Do not commit .env.local.

Do not commit.
Report dependencies, routes, environment variables, tests, changed files, and recommended commit message.
```

## Human verification

1. Start the site.
2. Open `/studio`.
3. Sign in.
4. Open a private/incognito window.
5. Confirm an unauthenticated person cannot edit.
6. Confirm the public homepage still works from local sample data.
7. Search the Git diff for your actual project ID and tokens.
   - Public project ID may technically be non-secret, but the project should still obtain it through environment configuration.
   - Tokens must never appear.

## Stop conditions

Do not continue if:

- `.env.local` is tracked by Git
- A write token appears in browser code
- The Studio route bypasses authentication
- Public pages stopped working
- The site cannot build without a private token

## Commit

```text
feat: add authenticated Sanity Studio foundation
```
