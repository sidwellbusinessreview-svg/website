# Sidwell Business Review — Human Verification Checklist

Complete these with authorized service owners and record evidence in the approved private operations register. Do not add names, credentials, recovery data, or backup locations to this public file.

## Access and ownership

- [ ] Verify the publication-controlled recovery identity and recovery methods.
- [ ] Verify at least two current authorized maintainers for GitHub, Cloudflare, and Sanity where policy and plan allow.
- [ ] Verify billing/renewal ownership and emergency contacts for each service.
- [ ] Remove departed members after successor access is proven.
- [ ] Confirm editors use individual accounts with the minimum useful role.

## Recovery

- [ ] Locate the latest production Sanity export and verify its project, dataset, date, checksum, and private storage record.
- [ ] Restore a recent export into a disposable dataset and record counts, references/assets, result, and cleanup owner.
- [ ] Identify the last known good Cloudflare Worker version and confirm an authorized maintainer knows how to promote it.
- [ ] Confirm maintainers understand that Worker rollback does not restore Sanity content.

## Publishing continuity and security

- [ ] During the next approved editorial publish, record webhook success and the first time the exact change appears on the public page.
- [ ] Save and Preview a draft, then confirm it remains absent in a clean public browser.
- [ ] Verify required production variable/secret names are present without revealing values.
- [ ] Review whether any secret rotation is required after the handoff and test affected workflows afterward.

## Search and discovery

- [ ] Reinspect the Homepage and one representative Article in Google Search Console after additional crawl time.
- [ ] Record coverage state, selected canonical, last crawl, and any specific blocker.
- [ ] Confirm the accepted sitemap still lists the expected current canonical pages after future publishing.

Do not mark an item complete from repository documentation alone.
