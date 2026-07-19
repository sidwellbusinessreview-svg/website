# Phase 19: Post-Launch Maintenance

## Objective

Keep the website reliable without rebuilding it every school year.

## Operating principle

A stable, documented publication system is more valuable than frequent rewrites.

Fix measured problems. Do not replace the stack because a new tool appears.

## Every publishing batch

Before publishing:

- Confirm approved Google Docs
- Confirm Contributor records
- Backup before bulk import
- Create Article drafts
- Preview
- Check links
- Check optional images
- Confirm image permission
- Check alt text
- Check captions and credits
- Adviser approval

After publishing:

- Verify Article
- Verify Homepage
- Verify Latest
- Verify Archive
- Verify Search
- Verify Contributor profile
- Verify sitemap and feed
- Review webhook behavior
- Confirm no unpublished changes remain accidentally
- Export backup after a large batch

## Monthly during the school year

- Check GitHub security alerts
- Review npm audit without force-fixing
- Check Vercel deployment health
- Check Sanity access
- Test one editor login
- Test Preview
- Test one harmless publish/revalidation cycle
- Check broken links
- Check contact inbox
- Confirm at least two administrators where possible
- Review failed webhook logs
- Review unexpected CMS validation exclusions

## Each semester

- Run full browser tests
- Run accessibility tests
- Run CMS audit
- Export dataset
- Review restore procedure
- Review image permissions
- Review Contributor archive state
- Update About staff
- Remove unnecessary account access
- Review costs
- Review renewal dates
- Review privacy questions
- Review documentation accuracy
- Review whether local rollback provider is still useful

## Before graduation

- Complete graduation handoff checklist
- Invite incoming editors
- Verify individual accounts
- Create and remove a test draft
- Preview and publish a harmless test change
- Transfer GitHub administration
- Transfer Sanity administration
- Transfer Vercel administration
- Transfer domain and billing control
- Update publication Gmail recovery
- Create fresh backup
- Review restore
- Update account register
- Remove outgoing editor access only after successful transfer
- Rotate shared credentials where appropriate
- Review known limitations
- Record current versions

## Codex maintenance prompt

```text
You are performing a scheduled maintenance review of the Sidwell Business Review website.

Do not begin by upgrading everything.
Do not rebuild the project.
Do not reintroduce removed editorial concepts.

Before changing anything:

1. Read:
   - AGENTS.md
   - PROJECT_STATUS.md
   - docs/KNOWN_LIMITATIONS.md
   - docs/ANNUAL_MAINTENANCE.md
   - docs/BACKUPS.md
   - docs/ACCESS_CONTROL.md
   - docs/DEPLOYMENT.md
   - docs/ROLLBACK.md
2. Show git status.
3. Confirm current branch.
4. Record current Node, Next.js, Sanity, and next-sanity versions.
5. Run npm ci.
6. Run all verification commands.
7. Review production logs supplied by the human.
8. Review CMS audit.
9. Review backup recency.
10. Use only official release notes for technical update decisions.

Classify findings:

- Critical
- High
- Medium
- Low
- Informational

Audit:

Content:
- Invalid published Articles
- Draft leaks
- Broken references
- Archived Contributor behavior
- Search
- Archive
- Sitemap
- Feed
- About
- Site Settings
- Images
- Links

Editorial:
- Draft
- Preview
- Publish
- Publish changes
- Unpublish
- Revalidation
- Contributor selector
- About selector
- Safe deletion

Technical:
- CI
- Builds
- Browser tests
- Accessibility
- Performance
- Dependencies
- Webhook
- Preview authorization
- Provider mode
- Rollback

Operations:
- Administrators
- Recovery
- Billing
- Domain
- Backup
- Restore
- Editor handbook
- Handoff readiness

For dependency updates:

- Explain the reason.
- State breaking-change risk.
- Make one logical update group at a time.
- Do not use npm audit fix --force.
- Do not downgrade Next.js.
- Do not change major versions without an architecture decision and migration plan.
- Run all tests after each update group.

Schema changes:

- Export before migration.
- Audit drafts and published documents.
- Create dry-run migration.
- Delete obsolete implementation.
- Do not hide stale data behind aliases.
- Update TypeGen.
- Test rollback.

Update:

- PROJECT_STATUS.md
- KNOWN_LIMITATIONS.md
- Relevant documentation
- Maintenance record

Do not commit automatically.

Report:

- Tests
- Production health
- CMS audit
- Advisories
- Recommended updates
- Deferred updates
- Backup status
- Access risks
- Operational risks
- Every changed file
- Recommended commit message
```

## Maintenance decision rules

### Remove the local provider only when:

- Sanity production has been stable for at least one full publishing cycle.
- Backups and restore are proven.
- Production rollback no longer depends on local data.
- All launch sample content has been migrated or intentionally archived.
- An architecture decision documents removal.

### Add Categories, Tags, or Issues only when:

- Editors can name a concrete recurring problem they solve.
- The archive is large enough to justify the extra workflow.
- Public navigation or search needs them.
- A migration plan exists.
- The faculty adviser and editors approve the added complexity.

Do not add them merely because other publications use them.

### Add Contributor photos only when:

Do not add them under the current accepted model.

A future reversal requires:

- Editorial justification
- Privacy approval
- Permission process
- Accessible image policy
- Schema migration
- Public-layout redesign
- Written architecture decision
