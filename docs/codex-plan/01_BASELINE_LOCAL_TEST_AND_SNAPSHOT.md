# Phase 01: Baseline Local Test and Safety Snapshot

## Objective

Verify that the existing prototype actually works in a browser, record its current state, and create a recoverable baseline before further development.

The prior build summary is encouraging, but `npm run lint` and `npm run build` do not prove that the site looks correct, that navigation works, or that the local development server starts normally.

## Human steps before Codex

1. Open GitHub Desktop.
2. Confirm the selected repository is:
   `/Users/Evan/Documents/GitHub/website`
3. Look for uncommitted changes.
4. If changes exist, do not discard them.
5. Confirm the repository has been pushed to GitHub.
6. Open Codex in the exact `website` folder.

## Codex prompt

```text
You are performing Phase 01 of the Sidwell Business Review website project.

Repository:
- Work only in the current repository.
- The expected root is /Users/Evan/Documents/GitHub/website.
- Do not initialize a new Next.js project.
- Do not replace the existing application.
- Do not upgrade dependencies in this phase.
- Do not add a CMS in this phase.
- Do not make visual redesigns in this phase.

First:
1. Inspect the repository root.
2. Show the current git branch and git status.
3. Confirm that package.json, package-lock.json, src, public, README.md, AGENTS.md, and PROJECT_STATUS.md exist.
4. Read README.md, AGENTS.md, and PROJECT_STATUS.md.
5. Summarize the current architecture and available npm scripts.
6. Check the installed Node.js and npm versions.
7. Check whether node_modules exists.
8. If package-lock.json exists, use npm ci rather than npm install unless npm ci cannot run. Explain any exception.

Then verify the baseline:
1. Run npm run lint.
2. Run npm run build.
3. Start the local development server.
4. Confirm the actual local URL.
5. Check the server logs for warnings and errors.
6. Inspect every public route available in the app, including dynamic sample article, issue, author, category, search, about, masthead, latest, archive if present, and not-found behavior.
7. Check for runtime errors, hydration warnings, missing images, broken links, console errors, and 404s.
8. Do not silently fix broad design issues. Fix only clear baseline-breaking defects such as a route crash, invalid link, missing import, or impossible startup.
9. Record all findings in a new file named docs/BASELINE_REPORT.md.
10. Update PROJECT_STATUS.md with the baseline verification date and result.

The baseline report must include:
- Repository path
- Git branch and clean/dirty status
- Node and npm versions
- Framework and major dependency versions
- Commands run
- Routes checked
- Any runtime errors
- Any console warnings
- Any broken links or images
- Known npm audit warnings
- Whether the site is safe to continue developing
- A list of manual checks the human must perform

Before finishing:
- Stop the development server cleanly if possible.
- Run npm run lint again if any files changed.
- Run npm run build again if any files changed.
- Do not commit.
- Give me exact instructions for opening the local site and manually testing it.
- List every file changed.
```

## Manual browser test

Start the server using the command Codex gives you, usually:

```bash
npm run dev
```

Open the reported address, usually:

```text
http://localhost:3000
```

Check the following.

### Homepage

- Publication name appears correctly
- Header and navigation are readable
- Lead article is visible
- Article cards have images and metadata
- Current issue appears
- About page is reachable
- No element overlaps another

### Article page

Open at least:

- The longest article
- The article with multiple authors
- The article with multiple images
- The article with a long title
- The article with a callout or pull quote

Check:

- Headline wrapping
- Author names
- Date, category, and issue
- Image loading
- Captions and credits
- Body spacing
- Links
- Mobile width

### Other routes

Check:

- Latest
- Issues
- One issue
- Authors
- One author
- About
- Masthead
- Search
- A fake URL to trigger the 404 page

### Mobile simulation

In the browser, narrow the window to approximately phone width.

Check:

- Mobile navigation
- No horizontal scrolling
- No cut-off text
- Readable article body
- Images fit the viewport
- Buttons and links remain usable

## Stop conditions

Do not proceed to Phase 02 if:

- The site cannot start
- The build fails
- Major routes crash
- The repository is not connected to GitHub
- There are uncommitted changes you do not recognize
- The current code appears to be in a nested or incorrect folder

Resolve those issues first.

## Completion

When the site passes:

1. Review `docs/BASELINE_REPORT.md`.
2. In GitHub Desktop, commit with:

```text
chore: verify and document project baseline
```

3. Push to GitHub.
4. Continue to Phase 02.
