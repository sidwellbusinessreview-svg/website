# Sidwell Business Review — Editor and Maintainer Handbook

## 1. Normal publishing workflow

For routine publishing, use the hosted Sanity Studio:

https://sidwell-business-review.sanity.studio

You should not need Cloudflare, GitHub, Terminal, or local development for ordinary editorial work.

### Publish a new Article

1. Open Sanity Studio.
2. Open **Articles**.
3. Create a new Article.
4. Fill in the title, publication month, summary, contributors, and Article body.
5. Add images and captions where appropriate. In the Article body toolbar choose **Image**, upload/select an approved image, then complete the required alternative text and optional caption and credit. Featured image fields are also available on the Article form.
6. Add Sources/Footnotes through the Article toolbar when needed.
7. Preview the Article before publishing.
8. Publish.

After publishing, Sanity sends a webhook to the production site so cached content can refresh automatically.

### Edit a published Article

1. Open the Article in Sanity Studio.
2. Make the correction.
3. Preview if the change affects formatting or layout.
4. Publish the updated version.

### Add a Contributor

Create a Contributor document when a new writer needs an author page or needs to be attached to an Article.

Contributor records are intentionally simple. Do not add role fields to Contributors.

### Update the About page or leadership

Use **Publication Settings** in Sanity Studio.

In the **Homepage** group, edit **Purpose statement headline** and **Purpose statement**. Blank values use the site's built-in fallback text. In the **About** group, edit the About page title and body. In **Leadership**, add, remove, or reorder the Editor-in-Chief, Editors, and Faculty Adviser entries. Each entry references a Contributor; create and publish that Contributor first. Publication Settings is the single source of truth for the managed About page and roster. If the fixed page has no published content, the public site uses the local fallback until settings are initialized and published.

Leadership is stored there rather than inside Contributor records.

## 2. Preview

The hosted Studio preview should load the live website rather than localhost.

Production preview origin:

https://website.sidwellbusinessreview.workers.dev

Preview is for checking draft content before publishing. The public website should continue to show published content only.

## 3. Search

Public search is intended to find Articles by title or author.

Current search placeholder:

`Search by author or title`

## 4. Author pages

Individual Contributor pages use URLs such as:

`/authors/evan-tan`

The `/authors` directory itself is not essential to the normal user journey. It can remain available without being linked prominently. Removing the directory in the future should not require removing individual Contributor pages.

## 5. What editors should not touch

For routine editorial work, do not change:

- Cloudflare build settings
- Cloudflare runtime secrets
- Sanity project IDs or dataset names
- webhook authentication
- GitHub deployment configuration
- Next.js configuration
- schema files
- preview security

## 6. Local development and deployment

Routine editors do not need local development access. Technical maintainers should work from the GitHub repository, use Node.js 24 (`nvm install && nvm use`), install dependencies with `npm ci`, copy `.env.example` to `.env.local` without committing it, and run `npm run dev`. For local CMS authoring, use a separate terminal for `npm run studio:dev`. See `docs/CONTENT_PROVIDER.md` for safe local provider configuration.

Changes to code or Studio schemas require review and deployment through the repository's configured GitHub/Cloudflare workflow; do not deploy directly from a local machine unless the maintainers have documented that process. Published content changes are made in Sanity and refreshed by the configured webhook.

The next leadership team needs individual Sanity project membership for editors, repository access for technical maintainers, and access to the publication-owned administrative/recovery identity. Maintainers also need the authorized deployment platform and webhook/environment administration access. Request access from the current project administrator; never store credentials in this repository or this handbook.

## 7. Publishing checklist

Before publishing an Article, confirm:

- Title is final.
- Publication month is correct.
- Contributor names are correct and ordered correctly.
- Summary is present.
- Body formatting looks right.
- Images have captions when appropriate.
- Sources/Footnotes display correctly if used.
- Preview looks correct.

After publishing:

- Open the live Article.
- Confirm the Article appears where expected.
- Confirm author links work.
- If the live site appears stale, wait briefly and refresh once before changing infrastructure.

## 8. Current migrated archive

The production dataset contains seven migrated published Articles and ten published Contributors from the initial archive migration.

Do not restore the dropped NFL salary-cap draft unless the editorial team later decides to publish it.
