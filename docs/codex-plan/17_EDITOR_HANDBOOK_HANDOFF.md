# Phase 17: Editor Handbook and Leadership Handoff

## Objective

Prove that the website can be operated by future editors without relying on the original developer.

Documentation is part of the product.

## Codex prompt

```text
You are performing Phase 17 of the Sidwell Business Review website project.

Before changing anything:
1. Read all operational documentation.
2. Run npm run verify and npm run test:e2e.
3. Show git status and stop if the repository is dirty.
4. Do not add new major features.
5. Focus on editor usability, support, and succession.

Create a complete handbook in docs/EDITOR_HANDBOOK.md for nontechnical editors.

The handbook must explain, in numbered steps:

1. Account access
- Publication Gmail purpose
- Individual Sanity login
- GitHub and Vercel access for administrators
- What to do when access fails

2. Article workflow
- Receive final approved Google Doc
- Create article draft
- Select authors
- Create a missing author
- Select issue
- Select category and tags
- Enter title, subtitle, summary
- Add featured image
- Write alt text
- Add caption and credit
- Add body content
- Add inline images
- Add pull quote
- Add callout
- Check links
- Preview
- Obtain adviser approval
- Publish
- Verify live site

3. Corrections
- Edit a published article
- Record updated date where policy requires
- Preview correction
- Publish correction
- Verify update
- Handle major correction notice if publication policy later requires it

4. Homepage
- Pin lead story
- Remove pin
- Set featured order
- Verify fallback behavior

5. Issues
- Create issue
- Add cover
- Add introduction
- Assign articles
- Publish in stages or together according to available plan features
- Verify issue page

6. Authors
- Create profile
- Add headshot
- Graduation year
- Biography
- Role
- Deactivate graduated contributors without deleting article history

7. About and Masthead
- Update leadership
- Update adviser
- Update mission
- Avoid deleting historical authors

8. Branding
- Replace logo
- Change publication text
- Change colors and typography through code with Codex
- Required tests after branding changes

9. Search and archive
- Verify new article appears
- Troubleshoot missing article

10. Backups
- Export before bulk imports
- Confirm backup
- Restore escalation

11. Account handoff
- Invite new editor
- Grant correct roles
- Verify access
- Remove graduating editor after transfer
- Transfer billing and recovery
- Update account register
- Rotate shared credentials when necessary

12. Emergency procedures
- Site down
- Bad deployment
- Incorrect article published
- Secret exposed
- Account lost
- Image takedown request
- Adviser departure

Create docs/PUBLISHING_CHECKLIST.md as a one-page checklist.
Create docs/GRADUATION_HANDOFF_CHECKLIST.md.
Create docs/TROUBLESHOOTING.md.
Create docs/ANNUAL_MAINTENANCE.md.

Add a Studio help link or help document reference where practical, without exposing private internal information publicly.

Usability test plan:
Create docs/NOVICE_EDITOR_TEST.md.
It must instruct a student unfamiliar with the code to:
- Sign in
- Create a draft article
- Add an image with caption and credit
- Assign an issue and author
- Preview
- Publish to a test environment or keep as draft
- Find instructions without verbal help
- Record confusion and time spent

Do not claim the handoff is complete until a novice test occurs.

Validation:
- Run npm run verify.
- Run npm run test:e2e.
- Run build.
- Check every handbook link.
- Confirm screenshots or placeholders are clearly labeled.
- Update PROJECT_STATUS.md.

Do not commit.
Report documents created, operational gaps found, changed files, and recommended commit message.
```

## Human novice test

Ask one editor who did not build the site to complete the test without you guiding every click.

Record:

- Where they became confused
- Terms they did not understand
- Fields they skipped
- Mistakes the interface allowed
- Documentation they could not find

Fix the system or handbook based on observed problems.

## Commit

```text
docs: add editor operations and leadership handoff system
```
