# Sanity target alignment

All current Sanity surfaces resolve to public project `bumxf5q6` and dataset `production`. Project, dataset, and API version are safe public configuration; token values are never displayed. The public environment file is the authoritative target source, and CLI and Studio configuration both consume the same validated values.

| Component or script | Project source | Dataset source | API version | Perspective | CDN |
|---|---|---|---|---|---|
| `.env.local` | `NEXT_PUBLIC_SANITY_PROJECT_ID` | `NEXT_PUBLIC_SANITY_DATASET` | `NEXT_PUBLIC_SANITY_API_VERSION` (`2026-03-01`) | N/A | N/A |
| `sanity.cli.ts` | Validated public environment | Validated public environment | CLI operation or calling script | Operation-specific | Operation-specific |
| `sanity.config.ts` | Validated public environment | Validated public environment | Studio caller | Studio context | Studio context |
| Studio `useClient` for fixed pages | Studio workspace target | Studio workspace target | Validated public environment (`2026-03-01`) | Raw | Disabled |
| About/Site Settings lifecycle pane | Studio client above | Studio client above | `2026-03-01` | Raw, forced per request | Disabled; request cache bypassed |
| About/Site Settings audit | CLI configuration, checked against public environment | CLI configuration, checked against public environment | `2026-03-01` | Raw when authenticated; explicit published-only alternative | Disabled |
| General content audit | CLI configuration, checked against public environment | CLI configuration, checked against public environment | `2026-03-01` | Raw when authenticated; explicit published-only alternative | Disabled |
| Provider check | Public client configuration | Public client configuration | `2026-03-01` | Published | Enabled |
| Public Sanity provider | Validated public environment | Validated public environment | `2026-03-01` | Published | Enabled |
| Sanity TypeGen | `sanity.cli.ts` | `sanity.cli.ts` | Sanity CLI-managed schema/type operations | Schema extraction, not a content perspective | Not applicable |
| CMS Playwright tests | Next.js process loaded from `.env.local` | Next.js process loaded from `.env.local` | `2026-03-01` through the public client | Published | Enabled |

## Exact current-page query

The Studio lifecycle pane and the read-only About/Site Settings audit share this projection from `src/sanity/pageExistence.ts`:

```groq
*[
  _id in [$publishedId, $draftId] &&
  _type == $schemaType
]{
  _id,
  _type,
  _createdAt,
  _updatedAt
}
```

For About, parameters are `publishedId = "about"`, `draftId = "drafts.about"`, and `schemaType = "staticPage"`. In an authenticated raw audit, an empty array means there is no current About document. In an unauthenticated request, an empty draft result is not authoritative. Document history, form initial values, and prior navigation do not satisfy this check.

## Diagnostics

Run `npm run sanity:check-target` to print the safe target configuration without making a content mutation. Run `npm run sanity:audit-pages` for an authenticated raw check using the signed-in CLI user, or `npm run sanity:audit-pages:published` for a clearly labeled token-free check. The audits print project, dataset, API version, query, and exact current response. In development only, Studio writes a safe `Fixed page existence response` console entry containing the same target and returned ID/type pairs. Production Studio does not emit this diagnostic, and no path displays or logs tokens.

CI never uses `--with-user-token`. `npm run sanity:audit-pages:ci` uses a server-only `SANITY_API_READ_TOKEN` when configured; without it, the command switches to published-only and labels draft state as not checked. Public website queries always remain token-free and published-only.
