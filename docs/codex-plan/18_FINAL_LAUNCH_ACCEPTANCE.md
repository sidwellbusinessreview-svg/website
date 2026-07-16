# Phase 18: Final Launch Acceptance

## Objective

Make a controlled launch decision based on evidence.

Do not launch merely because the homepage looks finished.

## Codex prompt

```text
You are performing Phase 18 of the Sidwell Business Review website project.

This is a final acceptance and defect-resolution phase, not a redesign.

Before changing anything:
1. Read PRODUCT_REQUIREMENTS.md and all operational documents.
2. Run git status and stop if uncommitted work exists.
3. Run the complete verification suite.
4. Confirm preview deployment and CMS access.
5. Confirm a recent CMS backup exists.
6. Confirm real content has been reviewed.

Create docs/LAUNCH_ACCEPTANCE.md as a requirement-by-requirement checklist.

Audit:

Public content:
- Homepage
- Latest
- Article pages
- Issues
- Issue pages
- Authors
- Author pages
- Categories
- Search
- Archive
- About
- Masthead
- Contact behavior
- 404
- Sitemap
- Robots
- RSS if implemented

Content:
- No placeholder copy
- No Unsplash placeholder images
- Correct author names
- Correct dates
- Correct issue assignment
- Captions
- Credits
- Alt text
- Working links
- No drafts public
- No test articles public unless intentionally retained

Editorial:
- Editor can create draft
- Preview works
- Adviser review workflow works
- Publish works
- Correction works
- Pinning works
- Issue creation works
- Author creation works

Technical:
- npm run verify
- npm run test:e2e
- npm run build
- CI passing
- Preview passing
- Production deployment passing
- Content revalidation passing
- Error logs reviewed
- Mobile tested
- Major browsers tested where available
- No console errors
- No broken internal links
- Performance acceptable
- Accessibility checks acceptable

Security:
- No committed secrets
- Draft isolation
- Preview authorization
- Webhook authorization
- Studio authentication
- Minimum two administrators
- Recovery process
- Backup exists
- Restore procedure documented
- Privacy review completed
- Image rights confirmed

Operations:
- Publication Gmail secured
- GitHub ownership
- Vercel ownership
- Sanity ownership
- Billing responsibility
- Renewal record
- Editor handbook
- Novice editor test
- Graduation handoff checklist
- Rollback instructions

For each item mark:
- Pass
- Fail
- Not applicable
- Blocked
- Evidence

Fix only launch-blocking defects found in this audit.
Do not hide failures by weakening tests.
Do not mark a manual item passed without human confirmation.

Create docs/KNOWN_LIMITATIONS.md.
Create docs/RELEASE_NOTES_V1.md.
Update PROJECT_STATUS.md to one of:
- Ready for launch
- Not ready for launch

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Run link checks.
- Test production deployment.
- Confirm CMS publish and revalidation.
- Confirm rollback instructions.
- Confirm backup timestamp.
- Report every remaining blocker.

Do not commit.
Recommend a release commit message only if all blocking items pass.
```

## Human launch decision

Launch only when `LAUNCH_ACCEPTANCE.md` says **Ready for launch** and the faculty adviser has reviewed the public content and school-policy questions.

## Suggested release commit

```text
release: prepare Sidwell Business Review website v1
```

## Suggested Git tag

```text
v1.0.0
```
