# Sanity setup

Sanity Studio is hosted separately from the public Next.js application. Its source, schemas, custom editor controls, Structure, and Presentation configuration remain in this repository, while the public deployment contains no `/studio` route.

## Before creating anything

Confirm that the school has approved Sanity for published student bylines, approved profile details, images, and articles. Use the publication Gmail as the durable administrator or recovery account, and record ownership details in the private operations register—not in Git.

Do not paste tokens into source code, issues, chat, screenshots, or this documentation. Phase 10 needs no API token. Sanity Studio authenticates invited users through Sanity, while the health check reads only published data from the public dataset.

## 1. Create or select the Sanity project

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage) with the approved publication administrative identity.
2. Create a project for Sidwell Business Review, or select the project already approved for the publication.
3. In project settings, find the project ID. A project ID is public configuration, not a password.
4. Confirm the existing `production` dataset. This project intentionally uses the same production dataset for local Studio, hosted Studio, preview, and public reads.
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
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=YYYY-MM-DD
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

Choose and retain one documented API date rather than changing it on every build. Leave `SANITY_API_READ_TOKEN`, `SANITY_PREVIEW_SECRET`, and `SANITY_REVALIDATE_SECRET` blank in Phase 10. They are reserved for later server-only preview and webhook work.

The standalone workspace target itself is fixed in source to project `bumxf5q6` and dataset `production`; it never depends on `NEXT_PUBLIC_*` variables to exist. `SANITY_STUDIO_PREVIEW_ORIGIN` is optional public configuration for Presentation and must contain the frontend origin, not a token or secret.

`.env.local` is ignored by Git. Confirm before proceeding:

```bash
git check-ignore .env.local
git status --short
```

Never add `NEXT_PUBLIC_` to a secret. Values with that prefix can be included in browser code.

## 3. Add trusted CORS origins

Because Studio runs in the browser and makes authenticated requests to Sanity, each trusted Studio origin must be in the project's CORS list with credentials enabled.

In Sanity Manage, select the project, open **Settings → API settings → CORS Origins**, and add:

- `http://localhost:3333` with credentials for local standalone Studio access.
- The chosen `https://<hostname>.sanity.studio` origin with credentials after the first Studio deployment.
- The exact public site origin when Presentation/Preview is configured.
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

Then start the public application and Studio in separate terminals:

```bash
npm run dev
npm run studio:dev
```

Open [http://localhost:3333](http://localhost:3333). Sanity should present its sign-in flow to a signed-out visitor. Signing in does not grant access by itself: the identity must be a member of the selected project. A visitor without membership cannot edit publication content.

The public site remains at [http://localhost:3000](http://localhost:3000) and has no Studio route. If public Sanity values are incomplete or malformed, validation stops with a configuration-focused error.

Build standalone Studio without deploying it:

```bash
npm run studio:build
```

When the publication is ready to choose its Sanity-hosted hostname, run `npm run studio:deploy`. After deployment, set `NEXT_PUBLIC_SANITY_STUDIO_URL` to that exact HTTPS origin in the public hosting environment and rebuild the public site. Do not commit a hostname merely to complete a local build.

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

- **Studio does not start:** confirm the three public Sanity variables are present, then restart `npm run studio:dev`.
- **Configuration error during build:** one value is missing, the API version is not `YYYY-MM-DD`, or `NEXT_PUBLIC_SANITY_STUDIO_URL` is not an absolute HTTP(S) origin.
- **CORS or credentials error:** add the exact current origin with credentials enabled. Do not solve this using a broad wildcard.
- **Sign-in succeeds but editing is unavailable:** confirm the signed-in identity was invited to this project and has an appropriate role.
- **Health check fails while Studio signs in:** confirm the dataset exists and is public; Phase 10's health client intentionally sends no token.

## Phase boundary

Phase 11C provides the simplified Contributor, Article, About-with-staff, and Site Settings schemas. Public routes still use local content; queries, provider adapters, caching, and cutover belong to later phases.

Before schema removal or a dataset reset, follow `DATASET_AUDIT_AND_RESET.md`. Schema changes alone never remove old Content Lake documents. Always inspect both published and draft records and export before an approved destructive cleanup.

Official references: [Studio deployment](https://www.sanity.io/docs/studio/deployment), [CORS configuration](https://www.sanity.io/docs/content-lake/cors), and [token safety](https://www.sanity.io/docs/content-lake/keeping-your-data-safe).
