# Sanity setup

Phase 10 embeds Sanity Studio at `/studio` while every public page continues to use validated local sample content. Connecting a Sanity project enables the Studio and the manual health check; it does not switch the publication website to CMS content.

## Before creating anything

Confirm that the school has approved Sanity for published student bylines, biographies, images, and articles. Use the publication Gmail as the durable administrator or recovery account, and record ownership details in the private operations register—not in Git.

Do not paste tokens into source code, issues, chat, screenshots, or this documentation. Phase 10 needs no API token. Sanity Studio authenticates invited users through Sanity, while the health check reads only published data from the public dataset.

## 1. Create or select the Sanity project

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage) with the approved publication administrative identity.
2. Create a project for Sidwell Business Review, or select the project already approved for the publication.
3. In project settings, find the project ID. A project ID is public configuration, not a password.
4. Create or confirm a public `development` dataset for local work. Keep the later `production` dataset separate.
5. Do not put private student information in a public dataset. Published documents in a public dataset can be read without authentication.

The current code does not create projects or datasets automatically because doing so changes an external account and requires the human owner to confirm policy, organization, region, and billing choices.

## 2. Create `.env.local`

From the repository root:

```bash
cp .env.example .env.local
```

Set these public values in `.env.local`:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_SANITY_API_VERSION=YYYY-MM-DD
NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH=/studio
```

Choose and retain one documented API date rather than changing it on every build. Leave `SANITY_API_READ_TOKEN`, `SANITY_PREVIEW_SECRET`, and `SANITY_REVALIDATE_SECRET` blank in Phase 10. They are reserved for later server-only preview and webhook work.

`.env.local` is ignored by Git. Confirm before proceeding:

```bash
git check-ignore .env.local
git status --short
```

Never add `NEXT_PUBLIC_` to a secret. Values with that prefix can be included in browser code.

## 3. Add trusted CORS origins

Because `/studio` runs in the browser and makes authenticated requests to Sanity, each trusted Studio origin must be in the project's CORS list with credentials enabled.

In Sanity Manage, select the project, open **Settings → API settings → CORS Origins**, and add:

- `http://localhost:3000` with credentials for local Studio access.
- The exact production site origin with credentials when production Studio access is approved.
- Only exact, trusted preview origins that need Studio access.

Do not add a platform-wide wildcard such as all Vercel or Netlify sites with credentials. A public repository's fork previews make broad credentialed wildcards especially dangerous. Remove temporary preview origins after review. Server-side public reads do not require a CORS entry.

Administrators may inspect configured origins with:

```bash
npx sanity cors list
```

## 4. Verify connectivity and open Studio

Run the public, token-free connectivity check:

```bash
npm run sanity:check
```

Then start the application:

```bash
npm run dev
```

Open [http://localhost:3000/studio](http://localhost:3000/studio). Sanity should present its sign-in flow to a signed-out visitor. Signing in does not grant access by itself: the identity must be a member of the selected project. A visitor without membership cannot edit publication content.

If the public environment values are blank, `/studio` intentionally shows a setup message and the rest of the website continues normally. If only some values are present or malformed, validation stops the build with a configuration-focused error.

## 5. Invite and revoke editors

In Sanity Manage, open the project's member/access settings:

1. Invite each approved editor through an individual identity.
2. Grant the minimum role supported by the approved plan and workflow.
3. Do not create shared student credentials.
4. Writers do not need Studio accounts merely to submit drafts through the publication's existing process.
5. Review membership each semester and before leadership handoff.
6. Remove an editor's project access promptly when their role ends; confirm they no longer appear in the member list.

The publication Gmail remains the durable administrator or recovery identity. A faculty adviser may be added with the minimum useful role when school policy calls for it. Sanity plan limitations and role choices must be reviewed before inviting a larger editorial team.

## Security boundaries

- `src/sanity/lib/client.ts` is the public published-content client. It deliberately has no token or write capability.
- Sanity Studio handles its own authenticated editing session for invited project members.
- Future draft-preview tokens belong only in server-side code and deployment secret storage.
- Never print, inspect, or troubleshoot secrets through browser logs or commands that could enter shared transcripts.
- If a token is exposed, revoke it in Sanity Manage immediately, create a replacement only if still needed, update the approved secret store, and review repository and deployment history.

## Common problems

- **Setup message at `/studio`:** the three required public Sanity variables are blank. Add all three to `.env.local` and restart Next.js.
- **Configuration error during build:** one value is missing, the API version is not `YYYY-MM-DD`, or the base path is not `/studio`.
- **CORS or credentials error:** add the exact current origin with credentials enabled. Do not solve this using a broad wildcard.
- **Sign-in succeeds but editing is unavailable:** confirm the signed-in identity was invited to this project and has an appropriate role.
- **Health check fails while Studio signs in:** confirm the dataset exists and is public; Phase 10's health client intentionally sends no token.

## Phase boundary

The schema registry is intentionally present but empty in Phase 10. Phase 11 adds document schemas, queries, provider adapters, mapping validation, cache tags, and migration parity tests. Until that work is accepted, local content remains authoritative for all public routes.

Official references: [embedded Studio for Next.js](https://www.sanity.io/docs/nextjs/embedding-sanity-studio-in-nextjs), [CORS configuration](https://www.sanity.io/docs/content-lake/cors), and [token safety](https://www.sanity.io/docs/content-lake/keeping-your-data-safe).
