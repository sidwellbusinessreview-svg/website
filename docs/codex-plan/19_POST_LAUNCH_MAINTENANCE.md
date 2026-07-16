# Phase 19: Post-Launch Maintenance

## Objective

Keep the site dependable after launch and prevent leadership transitions from turning it into an abandoned project.

## Maintenance schedule

### Every publication cycle

- Backup CMS before bulk work
- Create issue
- Verify authors
- Import or enter drafts
- Preview all articles
- Check images, captions, credits, and alt text
- Publish
- Verify homepage, issue, search, author, and category pages
- Review production logs
- Confirm backup after publication

### Monthly during the school year

- Check GitHub security alerts
- Check npm audit without force-fixing
- Check Vercel deployment health
- Check Sanity account access
- Test one editor login
- Check broken links
- Check contact inbox
- Confirm at least two administrators remain active

### Each semester

- Review dependencies
- Run full browser and accessibility tests
- Export CMS data
- Test restore procedure in a safe environment where practical
- Review privacy and image permissions
- Review editor roster
- Remove unnecessary access
- Update Masthead
- Review costs and renewal dates

### Before graduation

- Complete graduation handoff checklist
- Invite incoming editors
- Confirm they can publish a test draft
- Transfer GitHub, Sanity, Vercel, domain, and billing access
- Update recovery information
- Remove outgoing editors only after verification
- Rotate shared credentials where necessary
- Review backup-code storage
- Record current architecture and known limitations

## Codex maintenance prompt

```text
You are performing a scheduled maintenance review of the Sidwell Business Review website.

Do not begin by upgrading everything.

First:
1. Read AGENTS.md, PROJECT_STATUS.md, KNOWN_LIMITATIONS.md, and maintenance documentation.
2. Show git status.
3. Confirm the current branch.
4. Run npm ci.
5. Run npm run verify.
6. Run npm run test:e2e.
7. Run npm run build.
8. Review dependency advisories.
9. Review framework and CMS release notes only from official sources.
10. Review production error logs supplied by the human.
11. Review broken-link and accessibility results.
12. Review whether CMS schemas need migration.
13. Review whether documentation is still accurate.

Classify findings:
- Critical
- High
- Medium
- Low
- Informational

For every proposed dependency update:
- Explain why it is needed
- State breaking-change risk
- Make one logical update group at a time
- Run all tests
- Do not use npm audit fix --force
- Do not change major versions without a decision record and migration plan

Check:
- Draft privacy
- Preview security
- Webhook validation
- Search
- Sitemap
- Images
- Captions
- Credits
- Account ownership records
- Backup recency
- Editor handbook accuracy

Update PROJECT_STATUS.md, KNOWN_LIMITATIONS.md, and relevant documentation.

Do not commit automatically.
Report:
- Tests
- Advisories
- Recommended updates
- Deferred updates
- Operational risks
- Changed files
- Recommended commit message
```

## Maintenance principle

A stable, documented site is more valuable than a constantly rewritten site.

Do not rebuild the project every school year. Improve the existing architecture unless a specific measured limitation requires replacement.
