# Phase 17: Editor Handbook and Leadership Handoff

## Objective

Make the website operable by future student editors who did not build it.

Documentation is part of the website product.

## Codex prompt

```text
You are performing revised Phase 17 of the Sidwell Business Review website project.

Before changing anything:

1. Read all current editorial, deployment, security, backup, and migration documentation.
2. Confirm Phase 16 is committed.
3. Show git status.
4. Run full verification.
5. Do not add major new features.
6. Do not document removed concepts.
7. Use plain language for nontechnical student editors.

Create a complete operational handbook.

1. Editor Handbook.

Create:

docs/EDITOR_HANDBOOK.md

Include numbered instructions for:

Account access:
- Publication Gmail purpose
- Individual Sanity sign-in
- GitHub access for technical administrators
- Vercel access for deployment administrators
- Access failure
- Adviser departure
- Graduation handoff

Contributor workflow:
- Create Contributor
- Name and slug
- Optional role
- Optional graduation year
- Publish Contributor
- Archive Contributor
- Restore Contributor
- Reassign Articles
- Delete unreferenced Contributor
- Why normal departure uses Archive rather than Delete

Article workflow:
- Receive approved Google Doc
- Create Article draft
- Title
- Slug
- Subtitle
- Summary
- Contributors in byline order
- Publication date
- Optional featured image
- Conditional alt text
- Caption and credit
- Body blocks
- Links
- Pull quote
- Callout
- Save
- Preview
- Adviser approval
- Publish
- Verify live site

Article correction:
- Edit published Article
- Understand unpublished changes
- Preview changes
- Publish changes
- Discard changes
- Updated date if policy requires
- Verify public update

Article removal:
- Unpublish
- Republish
- Delete draft permanently
- Delete Article permanently
- When not to delete

Homepage:
- Pin Article
- Unpin Article
- Featured order
- Newest-Article fallback

About:
- Mission
- Editors-in-Chief
- Editors
- Faculty Adviser
- No photos or portraits
- Contributor references
- Update staff at leadership transition

Site Settings:
- Publication name
- Homepage tagline
- Optional logo
- Contact/social links
- SEO defaults
- What not to change casually

Search and Archive:
- Verify Article appearance
- Troubleshoot missing Article
- Chronological archive
- No Issues, Categories, or Tags

Preview:
- Open Preview
- Preview draft-only Article
- Preview unpublished changes
- Exit Preview
- Faculty adviser checklist

Publishing verification:
- Article page
- Homepage
- Latest
- Archive
- Search
- Contributor profile
- Sitemap
- Feed
- Cache/revalidation behavior

Migration:
- Article inventory
- Five-Article pilot
- Import drafts
- Review
- Backup before batch import
- Rollback batch

Backups:
- Create export
- Verify export
- Restore escalation
- Never commit backup

Emergency:
- Wrong Article published
- Site down
- Bad deployment
- Broken image
- Account lost
- Secret exposed
- Image removal request
- Contributor removal request
- Webhook failure
- Sanity outage

2. Publishing checklist.

Create:

docs/PUBLISHING_CHECKLIST.md

One-page checklist:

- Approved source
- Contributor published
- Title and slug
- Summary
- Date
- Body
- Links
- Images permitted
- Alt text
- Caption/credit
- Mobile preview
- Adviser approval
- Publish
- Verify all public locations
- No unpublished changes left accidentally

3. Graduation handoff.

Create:

docs/GRADUATION_HANDOFF_CHECKLIST.md

Include:

- Incoming editors nominated
- Accounts invited
- Access verified
- Publication Gmail recovery reviewed
- Sanity roles
- GitHub roles
- Vercel roles
- Domain/billing owner
- Backup completed
- Restore instructions reviewed
- Test Article created and removed
- Outgoing editor access removed after verification
- Shared credentials rotated where necessary
- Account register updated
- Known limitations reviewed

4. Troubleshooting.

Create:

docs/TROUBLESHOOTING.md

Cover:

- Article absent publicly
- Contributor unavailable in selector
- Archived Contributor
- Article has unpublished changes
- Preview unavailable
- Webhook/revalidation delay
- Search missing Article
- Sitemap/feed missing Article
- Image rejected
- Invalid Article excluded
- Provider mode wrong
- Vercel preview differs from production
- Sanity sign-in
- Reference blocking deletion
- Rollback to local content

5. Annual maintenance.

Create:

docs/ANNUAL_MAINTENANCE.md

Include:

- Account review
- Dependency review
- Backup
- Restore rehearsal
- Editor access
- Staff/About update
- Broken links
- Accessibility
- Image permissions
- Costs
- Renewal dates
- Analytics review
- Documentation review

6. Novice editor test.

Create:

docs/NOVICE_EDITOR_TEST.md

A student unfamiliar with the project must complete without verbal coaching:

- Sign in
- Create and publish Contributor
- Create Article draft
- Add two Contributors
- Add optional image or leave image-free
- Preview
- Publish
- Edit and publish changes
- Unpublish and republish
- Update About
- Find troubleshooting
- Exit safely

Record:

- Time
- Confusion
- Missed fields
- Incorrect assumptions
- Documentation failures
- UI defects

7. In-Studio help.

Add a restrained help link or help panel pointing editors to:

- Editor Handbook
- Publishing Checklist
- Troubleshooting

Do not expose private operational information publicly.

8. Tests and validation.

Check:

- Every documentation link
- No removed concepts
- Commands match package.json
- Screenshots or placeholders are current
- No secrets
- Novice test instructions are executable
- Full automated suite
- Build
- git diff --check

Update PROJECT_STATUS.md.

Do not commit.

Report:

- Documents created
- Outdated documentation removed
- Novice test result
- UI/documentation changes from novice test
- Every changed file
- Recommended commit message
```

## Human novice test

Ask another editor to complete `docs/NOVICE_EDITOR_TEST.md` without step-by-step coaching.

Do not pass the phase if:

- They cannot find Preview.
- They publish a draft accidentally.
- They cannot understand unpublished changes.
- They cannot add Contributors.
- They cannot verify the live Article.
- They cannot find Unpublish.
- They cannot recover from a simple error using documentation.

Fix either the UI or documentation based on what actually happens.

## Commit

```text
docs: complete editor handbook and leadership handoff
```
