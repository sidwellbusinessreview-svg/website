# Phase 16: Security, Privacy, Access, and Backups

## Objective

Make the project safe enough for real student content and sustainable account ownership.

This phase does not launch the site.

## Account model

Publication Gmail:

- Durable service ownership
- Billing and renewal notices
- Recovery
- Administrative records

Individual accounts:

- GitHub membership
- Sanity access
- Vercel access

Do not share the publication Gmail password as the normal team-access method.

## Codex prompt

```text
You are performing revised Phase 16 of the Sidwell Business Review website project.

Before changing anything:

1. Read:
   - SECURITY.md
   - docs/ACCESS_CONTROL.md if present
   - docs/ENVIRONMENTS.md
   - docs/DEPLOYMENT.md
   - docs/PREVIEW_WORKFLOW.md
   - docs/ARCHIVE_MIGRATION.md
   - docs/DATASET_AUDIT_AND_RESET.md
   - PROJECT_STATUS.md
2. Confirm Phase 15 is committed.
3. Show git status.
4. Run full verification.
5. Do not expose real secrets.
6. Do not collect new student data.
7. Do not draft legally definitive policies without school review.

Perform security, privacy, access, and backup hardening.

1. Secret audit.

Inspect:

- Tracked files
- Git diff
- Tests
- Fixtures
- Documentation
- Screenshots
- Client bundle configuration
- Vercel variable names and scopes
- Sanity configuration

Confirm:

- No API read token in client code
- No preview secret in client code
- No revalidation secret in client code
- No Gmail credential
- No backup code
- No hardcoded project-specific secret
- `.env.local` ignored
- `.env.example` placeholders only

If a secret is found:

- Do not print it.
- Report location and type.
- Rotate it.
- Remove it from active history according to the documented process.

2. Token scope.

Use minimum necessary access.

Document:

- Public token-free published reads
- Server-only read token for drafts
- Revalidation secret
- Sanity CLI personal authentication
- Rotation procedure
- Revocation procedure
- Owner

Do not create a write token for the public application.

3. Preview and webhook security.

Audit:

- Preview authorization
- Safe redirects
- Preview cookie
- No draft caching into public output
- Webhook verification
- Webhook request size
- Webhook method
- Safe error messages
- No arbitrary tag/path invalidation
- Basic abuse resistance
- Logs do not contain secrets or draft bodies

4. Content safety.

Audit:

- No raw HTML rendering
- Link validation
- External link attributes
- Portable Text behavior
- Image-type enforcement
- Image alt-text rules
- Optional image behavior
- No Contributor photos or personal contact data
- No biographies
- No hidden staff portraits
- No unsupported file uploads

5. Student privacy review.

Create:

docs/PRIVACY_REVIEW.md

Cover:

- Student names
- Roles
- Graduation years
- Article bylines
- Faculty adviser name
- Image permissions
- Article photographs
- Contact information
- Contact inbox
- Analytics
- Cookies
- Preview cookies
- Server logs
- Removal requests
- Corrections
- School approval questions
- Data minimization

Mark unresolved school-policy questions clearly.

Do not claim legal approval.

6. Account access.

Create or update:

docs/ACCESS_CONTROL.md

Require:

- Two-step verification on publication Gmail
- Current recovery information
- Backup codes stored securely
- At least two current administrators where service plan permits
- Individual Sanity accounts
- Individual GitHub accounts
- Individual Vercel accounts
- Faculty adviser access only when needed
- Removal of departed editors
- Annual review
- Graduation handoff
- Adviser departure procedure
- No passwords in Google Docs or repository

7. Dataset backup.

Create a real Sanity export that includes:

- Published documents
- Drafts
- Assets

Record:

- Date
- Dataset
- Project
- Purpose
- File location
- Owner
- Verification result

Do not commit the backup archive.

Add or improve safe scripts for:

- Timestamped export
- Backup verification
- Restore rehearsal to a safe temporary dataset
- Cleanup of old test datasets only after confirmation

8. Restore rehearsal.

Preferred:

- Create a temporary restore-test dataset.
- Import the backup.
- Run dataset audit.
- Run provider diagnostic against the temporary dataset if architecture supports safe configuration.
- Delete the temporary dataset only after verification.

If plan limits or safety prevent rehearsal:

- Document the blocker.
- Do not claim restore is tested.

9. GitHub and deployment recovery.

Document:

- Clone repository
- Restore environment variables
- Redeploy previous commit
- Promote previous deployment
- Switch to local provider
- Restore Sanity dataset
- Reconnect webhook
- Verify public site

10. Dependency security.

Run:

- npm audit
- Framework advisory review
- Sanity package advisory review

Rules:

- Do not run npm audit fix --force.
- Do not downgrade Next.js.
- Do not update major versions casually.
- Classify advisories by actual runtime relevance.
- Record accepted risk and review date.
- Apply compatible updates only with full testing.

11. Security headers.

Audit and implement only compatible headers.

Consider:

- Content Security Policy
- Referrer Policy
- X-Content-Type-Options
- Frame behavior
- Permissions Policy
- HSTS only on deployed HTTPS production when appropriate

Do not break:

- Embedded Studio
- Preview
- Sanity image delivery
- Vercel
- Required external assets

12. Tests.

Test:

- Secret exposure
- Preview authorization
- Redirect protection
- Draft isolation
- Webhook authorization
- Unsupported file rejection
- Raw HTML rejection
- External links
- Security headers
- Safe errors
- Backup script
- Restore audit
- Provider rollback

13. Documentation.

Create or update:

- docs/ACCESS_CONTROL.md
- docs/PRIVACY_REVIEW.md
- docs/BACKUPS.md
- SECURITY.md
- docs/ROLLBACK.md
- AGENTS.md
- PROJECT_STATUS.md

14. Validation.

Run:

- Full unit tests
- Public browser tests
- CMS browser tests
- Preview tests
- Webhook tests
- Dataset audit
- Provider diagnostic
- Backup export
- Restore rehearsal or documented blocker
- Production build
- Secret scan
- git diff --check

Do not commit backup archives.
Do not commit.

Report:

- Findings by severity
- Secrets result
- Token scope
- Privacy questions
- Account risks
- Backup path and verification
- Restore result
- Dependency advisories
- Security-header result
- Every changed file
- Recommended commit message
```

## Human acceptance

Confirm personally:

- Publication Gmail has two-step verification.
- Recovery methods are current.
- Backup codes are stored securely.
- At least one other trusted administrator has appropriate access where possible.
- The Sanity export file exists.
- The backup is not in GitHub.
- Privacy questions are sent to the faculty adviser or school contact.
- Image permissions are being tracked.
- No student contact information is public unnecessarily.

## Stop conditions

Do not continue if:

- A secret is committed.
- Only one person can recover critical services without a documented limitation.
- Draft content leaks.
- No backup exists.
- Image permissions are unresolved for launch content.
- Student personal contact information is exposed.
- Preview or webhook authorization is weak.
- Restore is claimed as tested when it was not.

## Commit

```text
security: harden access privacy and backup controls
```
