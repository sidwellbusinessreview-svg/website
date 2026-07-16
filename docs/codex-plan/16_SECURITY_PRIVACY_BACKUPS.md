# Phase 16: Security, Privacy, Access, and Backups

## Objective

Protect student information, publication accounts, CMS content, and long-term access.

The joint publication Gmail solves part of the continuity problem, but it must not become a single shared-password failure point.

## Human account model

Use the publication Gmail for:

- Durable ownership
- Billing notices
- Recovery
- Administrative records

Use individual accounts for:

- GitHub organization membership
- Sanity editor access
- Vercel team access

Where a service does not support multiple members on the sustainable plan, document that limitation and maintain a secure transfer procedure.

## Codex prompt

```text
You are performing Phase 16 of the Sidwell Business Review website project.

Before changing anything:
1. Read SECURITY.md, ACCOUNT_OWNERSHIP_TEMPLATE.md, deployment documentation, and CMS documentation.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Inspect source and git history for accidental secrets using safe local methods.
5. Do not display any real secret found. Report only file, category, and remediation.
6. Do not collect additional student information.

Perform a security and privacy hardening review.

Application security:
- No write tokens in client code
- No preview secret in client code
- Webhook secret verification
- Safe redirect handling
- External-link safety
- No arbitrary HTML rendering
- Content links sanitized or validated
- Safe error messages
- Reasonable security headers compatible with Studio and image delivery
- Content Security Policy evaluated carefully rather than copied blindly
- Studio not publicly linked or indexed
- Rate or abuse considerations for search and public forms if any
- No unnecessary form or tracking data

Secret management:
- .env.local ignored
- .env.example contains placeholders only
- Vercel sensitive variables correctly scoped
- Sanity tokens use minimum required access
- Token rotation process
- Response plan for exposed credentials
- No secrets in documentation, tests, fixtures, or screenshots

Account security:
Create docs/ACCESS_CONTROL.md:
- Publication Gmail ownership
- Two-step verification
- Recovery methods
- Backup-code storage
- Individual team accounts
- Editor removal
- Graduation transfer
- Faculty adviser departure
- Minimum two current administrators
- Annual account review
- No passwords in Google Docs or repository

Privacy:
Create docs/PRIVACY_REVIEW.md:
- Student names
- Graduation years
- Headshots
- Biographies
- Contact information
- Image permissions
- Analytics decision
- Contact forms
- Cookies
- Data minimization
- School approval questions
- Correction and removal process

Do not draft a legally definitive privacy policy without school review. Create a clearly labeled operational checklist and placeholder instead.

Backups:
Create docs/BACKUPS.md:
- GitHub repository recovery
- Sanity dataset export
- Image asset inclusion
- Backup frequency
- Before-import backups
- Before-schema-migration backups
- Storage location
- Retention
- Restore test
- Owner
- Handoff

Add safe scripts or documented commands for:
- CMS export
- Timestamped backup name
- Optional validation of backup existence
- No automatic upload to an unapproved third party

Dependency security:
- Review current npm audit result.
- Do not run npm audit fix --force.
- Determine whether advisories are runtime-relevant.
- Document accepted temporary risk and review date.
- Upgrade only compatible patch/minor versions when justified and fully tested.
- Do not downgrade Next.js.

Tests:
- Secret exposure checks
- Preview authorization
- Webhook authorization
- Draft isolation
- Security headers where implemented
- No raw HTML injection
- External-link behavior
- Error response behavior

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run production build.
- Create a CMS export and verify the archive exists.
- Perform a documented restore rehearsal using a safe non-production dataset if available, or document why deferred.
- Update PROJECT_STATUS.md and DECISIONS.md.

Do not commit backup archives.
Do not commit.
Report findings by severity, fixes, deferred school-policy questions, changed files, and recommended commit message.
```

## Stop conditions

Do not launch if:

- Only one person can recover critical accounts
- A secret is committed
- Draft content is public
- Image permissions are unresolved
- Student contact information is exposed unnecessarily
- No backup has ever been created
- The faculty adviser or school has not reviewed required privacy questions

## Commit

```text
security: harden access privacy and backup procedures
```
