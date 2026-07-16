# Phase 15: Deployment, Environments, and Content Updates

## Objective

Create a safe preview and production deployment process connected to GitHub and Sanity.

Do not buy or connect the final domain until preview deployment is stable.

## Human steps

1. Create or open the Vercel account using the publication Gmail as durable owner.
2. Connect the GitHub organization repository.
3. Invite individual trusted administrators where supported.
4. Import the `website` repository.
5. Keep `main` as the production branch.
6. Use non-main branches for previews.

## Codex prompt

```text
You are performing Phase 15 of the Sidwell Business Review website project.

Before changing anything:
1. Read deployment, CMS, security, and preview documentation.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Confirm the CMS-backed site works locally.
5. Do not purchase or configure a custom domain.
6. Do not print environment-variable values.
7. Use current official Vercel and Next.js behavior.

Prepare production deployment.

Requirements:

1. Environment model
Document and validate:
- Local development
- Vercel Preview
- Vercel Production

Define which variables belong in each environment.
Distinguish:
- Public values
- Server-only values
- Sensitive values

2. Environment validation
- Clear startup errors for missing required production settings
- No private token required for public published reads unless architecture explicitly requires it
- Preview secrets server-only
- CMS project and dataset configurable
- Site URL configurable per environment

3. Git deployment
- Main branch is production
- Pull requests or feature branches produce previews
- Preview deployments do not mutate production content
- Production deployment occurs only after tests pass

4. Content revalidation
Implement secure Sanity webhook or current recommended content-update mechanism:
- Verify webhook secret
- Revalidate affected pages or tags
- Handle article, author, issue, category, site settings, and static pages
- Avoid rebuilding unrelated pages when practical
- Return useful safe status codes
- Log enough for debugging without logging secrets
- Prevent arbitrary public revalidation abuse

5. Deployment tests
- Homepage
- Article
- Issue
- Author
- Search
- Studio
- Preview activation
- Draft remains private
- Published update appears after webhook or documented cache interval
- 404
- Mobile navigation
- Sitemap and robots
- No console errors

6. Health checks
Add a lightweight documented health route only if it does not expose private configuration.
It may report:
- Application running
- CMS published-read connectivity
It must not report tokens, internal stack traces, or account details.

7. Documentation
Create:
- docs/DEPLOYMENT.md
- docs/ENVIRONMENTS.md
- docs/REVALIDATION.md
- docs/ROLLBACK.md

Rollback must include:
- Revert Git commit
- Redeploy previous Vercel deployment
- Switch temporarily to known-safe content mode only if the architecture still supports it
- Restore CMS dataset export when content corruption is involved

8. CI and branch protection notes
Document recommended GitHub settings:
- Require passing checks before merging
- Prevent accidental force pushes to main where available
- Require review when multiple editors are active

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Test a preview branch.
- Test production only after preview passes.
- Trigger one safe content update and verify revalidation.
- Inspect deployment logs for secrets.
- Update PROJECT_STATUS.md.

Do not commit.
Report deployment behavior, environment variables by name only, revalidation tests, changed files, and recommended commit message.
```

## Human acceptance

Do not launch publicly yet.

Share the Vercel preview only with:

- Editors-in-chief
- Faculty adviser
- Selected reviewers

Collect issues in one document rather than making untracked verbal changes.

## Commit

```text
chore: configure deployment and CMS revalidation
```
