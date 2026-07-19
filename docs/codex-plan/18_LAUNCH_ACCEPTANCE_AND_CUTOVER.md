# Phase 18: Launch Acceptance and Production Cutover

## Objective

Decide whether the website is ready for public launch, then switch Production from local content to Sanity only after all blocking checks pass.

This phase is acceptance and cutover, not a redesign.

## Human prerequisites

Before starting:

- Faculty adviser has reviewed launch content.
- Required school-policy questions are answered or explicitly accepted as blockers.
- Real Articles are migrated.
- Placeholder content is removed.
- Image permissions are confirmed.
- Backup exists.
- Preview deployment has been tested.
- Editor handbook and novice test are complete.

## Codex prompt

```text
You are performing revised Phase 18 of the Sidwell Business Review website project.

Before changing anything:

1. Read:
   - docs/PRODUCT_REQUIREMENTS.md
   - docs/LAUNCH_ACCEPTANCE.md if it exists
   - docs/DEPLOYMENT.md
   - docs/ENVIRONMENTS.md
   - docs/REVALIDATION.md
   - docs/ROLLBACK.md
   - docs/PRIVACY_REVIEW.md
   - docs/BACKUPS.md
   - docs/EDITOR_HANDBOOK.md
   - docs/KNOWN_LIMITATIONS.md if it exists
   - PROJECT_STATUS.md
2. Confirm Phase 17 is committed.
3. Show git status.
4. Confirm a recent backup exists.
5. Confirm Preview deployment is healthy.
6. Confirm Production still uses local content before cutover.
7. Do not switch Production until every blocking acceptance item passes.
8. Do not reintroduce Issues, Categories, Tags, Masthead, biographies, portraits, or avatars.

Create or replace:

docs/LAUNCH_ACCEPTANCE.md

For every item record:

- Pass
- Fail
- Not applicable
- Blocked
- Evidence
- Owner

1. Public routes.

Audit Production candidate in Sanity mode:

- Homepage
- Latest
- Archive
- Search
- Article pages
- Contributor profile pages
- About
- 404
- Sitemap
- Robots
- Feed
- Contact behavior if present

Do not audit removed routes as features.

Confirm removed routes return 404:

- /issues
- /masthead
- Category/Tag routes if any old path remains

2. Content.

Confirm:

- No placeholder Articles
- No invalid published Article excluded by validation
- No Unsplash placeholder images
- Correct titles
- Correct summaries
- Correct Contributor order
- Correct dates
- Correct body formatting
- Correct links
- Image permission
- Alt text when image exists
- Captions and credits
- No Contributor photos
- No biographies
- About staff correct
- Faculty adviser correct or approved empty state
- No test records public
- No drafts public
- No unpublished changes left accidentally

3. Editorial workflow.

Prove:

- Create Contributor
- Archive/restore Contributor
- Create Article draft
- Preview
- Publish
- Edit published Article
- Preview changes
- Publish changes
- Discard changes
- Unpublish
- Republish
- Permanent deletion through safe workflow
- Pin/unpin
- Update About
- Update Site Settings
- Search and Archive update
- Revalidation works

4. Technical.

Required:

- npm run sanity:typegen
- npm run sanity:audit-content
- npm run sanity:check-provider
- npm run validate:content
- npm run verify
- npm run test:e2e
- npm run test:e2e:sanity
- Preview tests
- Production build in Sanity mode
- CI passing
- Preview deployment passing
- Webhook passing
- No browser-console errors
- No broken internal links
- Mobile tested
- Keyboard tested
- Accessibility checks passing
- Performance acceptable

5. Security and privacy.

Confirm:

- No committed secrets
- Studio authentication
- Preview authorization
- Webhook authorization
- Draft isolation
- Two-step verification
- Recovery methods
- At least two administrators where possible
- Backup exists
- Restore process documented
- Privacy review completed
- School questions resolved or marked blocking
- Image rights confirmed
- No unnecessary personal data

6. Operations.

Confirm:

- Publication Gmail ownership
- GitHub ownership
- Sanity ownership
- Vercel ownership
- Domain ownership if purchased
- Billing owner
- Renewal record
- Account register
- Editor handbook
- Publishing checklist
- Troubleshooting
- Novice editor test
- Graduation handoff checklist
- Rollback tested

7. Production cutover plan.

Only if all blocking checks pass:

- Set Production CONTENT_SOURCE=sanity.
- Confirm all required Sanity public identifiers in Production.
- Confirm server-only preview and webhook secrets.
- Set canonical Production site URL.
- Redeploy Production.
- Verify deployment is READY.
- Verify Production is using Sanity and not local content.
- Verify local sample Articles are absent.
- Verify real CMS Articles are present.
- Verify Production webhook.
- Verify Preview remains operational.
- Keep rollback instructions open during cutover.

Do not remove local provider code during launch.

8. Cutover smoke test.

After deployment:

- Homepage
- Latest
- Archive
- Search
- One image-free Article
- One Article with image
- One multiple-Contributor Article
- One Contributor profile
- About
- Sitemap
- Feed
- 404
- Mobile
- Clean browser

Publish and restore one harmless temporary text change to confirm Production revalidation.

9. Rollback rehearsal.

Before declaring launch:

- Identify previous Production deployment.
- Confirm it can be redeployed.
- Confirm CONTENT_SOURCE can return to local.
- Do not actually disrupt the live site unless a controlled rehearsal is approved.
- Record exact rollback time and owner.

10. Release documents.

Create:

- docs/KNOWN_LIMITATIONS.md
- docs/RELEASE_NOTES_V1.md
- docs/LAUNCH_RECORD.md

Launch record must include:

- Date
- Commit
- Deployment
- Content source
- Backup timestamp
- Administrators
- Known limitations
- Rollback reference

Update PROJECT_STATUS.md to exactly one:

- Ready for launch
- Launched
- Not ready for launch

11. Validation.

Run all tests after cutover.
Do not weaken tests to obtain a pass.

Do not commit until the human confirms launch acceptance.

Report:

- Acceptance result
- Blocking failures
- Cutover performed or withheld
- Production provider mode
- Production route results
- Revalidation result
- Rollback readiness
- Every changed file
- Release commit message
```

## Human launch decision

Do not cut over if any blocking item fails.

If all pass:

1. Approve Production environment change.
2. Redeploy.
3. Complete the smoke test.
4. Have the faculty adviser review the live site.
5. Commit release documentation.
6. Push.
7. Tag release.

## Release commit

```text
release: launch Sidwell Business Review website v1
```

## Git tag

```text
v1.0.0
```

## Stop conditions

Do not launch if:

- Invalid published CMS content exists.
- Drafts leak.
- Production webhook fails.
- Backup is missing.
- School/privacy blockers remain.
- Test content remains public.
- Local-only sample content remains authoritative.
- Real content is incomplete.
- No rollback path exists.
- Novice editor test failed.
