# Phase 12 acceptance checklist

This checklist tests the existing provider without enabling preview, deploying, or committing. The canonical published fixtures are **CMS Integration Test Article** (`cms-integration-test-article`) by **CMS Integration Test Contributor** (`cms-integration-test-contributor`). The temporary rollback source remains `local`.

## Fixed-page recovery prerequisite

An absent `about`/`drafts.about` pair is not proof that About has never existed. In the authenticated Studio, open **About** and use the lifecycle pane. Never restore, initialize, publish, or delete content merely to run an audit.

Draft-aware command-line audits require authentication. `npm run sanity:audit-pages` includes Sanity CLI's `--with-user-token` option and uses the locally signed-in CLI user. It reports exact published and draft IDs without printing the token. Use `npm run sanity:audit-pages:published` only when a deliberately token-free, published-only result is sufficient; it must never claim a draft is absent.

## Local provider

Set `CONTENT_SOURCE=local` in `.env.local`, then run:

```bash
CONTENT_SOURCE=local npm run validate:content
CONTENT_SOURCE=local npm run verify
CONTENT_SOURCE=local npm run test:e2e
CONTENT_SOURCE=local npm run build
```

Open `http://localhost:3000` after `CONTENT_SOURCE=local npm run dev`. Check a sample Article, its Contributor, About, Search, `/sitemap.xml`, and `/feed.xml`. Sanity values may be absent in this mode; no public Sanity request should occur.

## Sanity provider

Keep the approved public Sanity values in `.env.local`, set `CONTENT_SOURCE=sanity`, and run:

```bash
npm run sanity:typegen
npm run sanity:check-target
npm run sanity:audit-pages
npm run sanity:audit-content
npm run sanity:check-provider
CONTENT_SOURCE=sanity npm run test:e2e:sanity
CONTENT_SOURCE=sanity npm run build
```

The authenticated audits inspect draft and published records. The provider diagnostic is intentionally token-free and published-only. The diagnostic must report no `INVALID PUBLISHED ARTICLE` before acceptance. The browser suite verifies the canonical Article across Homepage, Article, Contributor, Search, Latest, Archive, sitemap, and feed while confirming local-only sample content remains absent. It must not create or publish content automatically. Public reads use no token.

The four canonical fixture values are defaults. For an approved replacement fixture, set `CMS_TEST_ARTICLE_TITLE`, `CMS_TEST_ARTICLE_SLUG`, `CMS_TEST_CONTRIBUTOR_NAME`, and `CMS_TEST_CONTRIBUTOR_SLUG` only for the Playwright command.

The canonical Article must also demonstrate a visible bulleted list. The CMS browser test checks semantic list markup, visible markers, mobile width, and absence of horizontal overflow.

CI must not use a personal CLI token. `npm run sanity:audit-pages:ci` uses `SANITY_API_READ_TOKEN` only when supplied as a server-only CI secret; otherwise it explicitly performs a published-only audit.

## Superseded test-Article note

Earlier audits identified **feawfweaf** (`fwaefw`) as invalid. Phase 12H no longer finds that record or any published Article. Do not follow the historical deletion steps below unless a new authenticated audit finds that exact record again.

After confirming it is disposable:

1. Open standalone Studio (`npm run studio:dev`, normally `http://localhost:3333`), then **Articles → Published → feawfweaf**.
2. Choose **Unpublish article**, review the title, and confirm.
3. Open the resulting draft-only Article, choose the guarded permanent-delete action, and confirm the exact record.
4. Run `npm run sanity:audit-content` and `npm run sanity:check-provider` again. Both must report zero invalid published Articles.

If it must be retained, replace the Summary with an accurate description of at least 20 characters, verify a Contributor, publication date, slug, and non-empty body, then publish changes and rerun both commands.

## Draft-isolation test

1. In Studio, open **CMS Integration Test Article** but do not publish.
2. Change its title to `CMS Integration Test Article — DRAFT ISOLATION TEST`.
3. Save the draft and leave the published version in place.
4. Wait at least five minutes, then run `CONTENT_SOURCE=sanity npm run dev`.
5. Check Homepage, Latest, Archive, Search, the Article, Contributor page, `/sitemap.xml`, and `/feed.xml`. They must still show exactly `CMS Integration Test Article` and never the draft suffix.
6. Use **Discard unpublished changes**. Do not publish the test suffix.
7. Repeat with an unpublished Contributor or About change if desired; public output must remain unchanged.

There are currently no draft-only Articles or draft/published pairs, so the audit cannot provide a live draft fixture until the manual draft above is created.

## Revalidation timing test

### Current evidence

On July 23, 2026, a completely stopped development server, deleted `.next` cache, and clean restart immediately showed the newly published Article title on Homepage. This proves that published Content Lake data and the provider query were correct. It does **not** prove automatic refresh within 300 seconds: the earlier page was a stale development cache/session, and the clean restart bypassed that state.

Run `npm run sanity:check-cache` for a deterministic, read-only comparison of origin, CDN, and provider results. It does not sleep for five minutes and does not mutate content. Automatic 300-second refresh and hosted webhook delivery remain separate acceptance checks.

Hosted webhook setup is deferred. To test the implemented five-minute fallback:

1. Record the exact current title `CMS Integration Test Article`.
2. In Studio, change it to `CMS Integration Test Article — CACHE TEST` and publish.
3. Do not call the revalidation endpoint. Refresh the CMS-backed Article until the new title appears; it should appear no later than five minutes after the cached read.
4. Restore the title to exactly `CMS Integration Test Article` and publish again.
5. Wait up to five minutes and confirm the restored title across Article, Homepage, Search, sitemap, and feed.

When hosted webhook testing begins, send only a server-configured `Authorization: Bearer` secret to `POST /api/revalidate/sanity`. Never paste that secret into documentation, client code, or browser JavaScript.

## Development cache incident

A transient `ChunkLoadError` was reported during the stale development session. It has not reproduced after the full stop, `.next` removal, and clean restart. Treat it as a stale development artifact unless it recurs from a clean server with a stable reproduction; do not change production bundling or caching to address a one-off development chunk.

## Return to the intended state

1. Ensure the valid Article title is exactly `CMS Integration Test Article` and no test draft remains.
2. Set `.env.local` back to `CONTENT_SOURCE=local` until migration acceptance.
3. Stop the development server with Ctrl-C.
4. Run `git status --short` and confirm `.env.local` is absent from the output.
