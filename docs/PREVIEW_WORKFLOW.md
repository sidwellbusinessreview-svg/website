# Draft preview workflow

## Save, Preview, and Publish

**Save** records an unpublished draft. A draft-only Article is invisible to readers. Editing a published Article creates **Published with unpublished changes**; readers continue to see the prior published version. **Publish** replaces that public version.

1. Write and edit metadata, body, Sources, and footnotes in Studio **Structure**. Add Sources first; place the cursor after punctuation and choose **Add footnote** without highlighting text.
2. Choose **Preview** in Studio’s top navigation.
3. Navigate to Homepage, an Article, Contributor, or About.
4. Confirm the banner says **Previewing unpublished content**.
5. Refresh Preview after saving. Use **Exit preview** when viewing the frontend directly.

Site Settings changes are identified in the preview banner, and Homepage reflects saved pinning changes. Articles may be image-free. The frontend renders Sanity’s Visual Editing bridge so Presentation can connect and list documents on the page. The current implementation still promises saved changes after refresh, not live updates while typing; no Sanity Live subscription is installed.

The Studio location named **Homepage and site settings** opens `/`, because there is no public Site Settings route. Saved Site Settings changes appear through the Homepage header, footer, logo, structured publication data, and metadata. The Homepage tagline is the clearest quick check.

A complete draft-only Article is previewable before publication. Generate its slug, save it, then use its Article preview location or open `/articles/{slug}` inside Preview. It may appear on Preview Homepage, Latest, Archive, Search, and its Contributor page, but must remain absent from the ordinary published site.

The Draft Mode cookie applies to the local origin, but preview UI is deliberately limited to public frontend pages. Studio, nested Studio tools, API routes, feed, sitemap, and robots never mount the preview banner or Visual Editing bridge. This keeps the Studio shell and tool navigation independent from the frontend preview chrome.

## Faculty adviser review

- Confirm the preview banner is visible.
- Review headline, byline order, dates, body, links, captions, credits, alt text, footnote jumps, and source backlinks. Every visible Article date must use Month Year; no day may appear.
- Confirm superscripts touch the preceding punctuation with no visible space. Use Preview for review, not as the primary complex-content editor.
- Check Homepage placement, Contributor profile, About, and mobile width.
- In a clean browser without preview, confirm drafts are absent.
- Confirm Search, sitemap, and feed remain published-only.
- Publish only after editorial approval.

## Security and troubleshooting

Preview requires an expiring Sanity preview URL secret from an authenticated Studio session, or the separately configured long server-only fallback secret. Never expose `SANITY_API_READ_TOKEN` or `SANITY_PREVIEW_SECRET` through `NEXT_PUBLIC_`, browser code, logs, screenshots, chat, or source control.

The enable route strips secret parameters, permits only local public-page paths, disables caching, and discourages indexing. Exiting preview leaves the Presentation iframe, disables Draft Mode, and navigates the top-level browser to the current public page when safe. It removes preview-secret parameters and falls back to Homepage for Studio, API, external, protocol-relative, or non-page destinations. Shared Presentation links are disabled.

Draft Mode is a browser-session setting for the localhost origin, not a setting for one tab. Enabling or exiting Preview therefore affects every localhost tab in the same browser session. Use a Guest or Private browser window for a trustworthy simultaneous view of the public site.

- **Invalid preview request:** reopen Preview; the generated secret may have expired.
- **Preview unavailable:** ask an administrator to check the server-only Viewer token and Sanity target.
- **Draft not visible:** save, refresh, and confirm required slug/references exist.
- **Public page shows a draft:** exit preview and retry in a clean browser. Stop publishing if it remains visible.
- **Preview returns after exiting inside Studio:** the exit control must navigate the top-level window away from Presentation. Confirm the resulting URL is the clean public page path and the banner stays absent after refresh.
- **Presentation says it cannot connect:** confirm Draft Mode is active, the preview banner appears, and the frontend renders the Visual Editing bridge. Then align `NEXT_PUBLIC_SITE_URL` and Sanity CORS with credentials.
- **Studio shows the frontend preview banner:** stop acceptance. Hard refresh `/studio`; neither the banner nor the Visual Editing bridge may be mounted on Studio or any nested Studio tool.
