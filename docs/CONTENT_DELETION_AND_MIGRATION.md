# Content deletion and migration

Removing a schema from source code does not remove matching documents from Content Lake. Published and `drafts.*` variants must be audited separately. Before any destructive schema migration, export the target dataset, run the audit, add a repeatable cleanup, review its dry-run report, and obtain explicit approval.

## Editorial deletion behavior

- About (`about`) and Site Settings (`siteSettings`) are durable fixed-ID singletons. They must never be deleted, duplicated, copied, or unpublished through Studio. Draft-only singleton discard is also prohibited because it would destroy the only editable version.
- Contributors normally leave the staff through **Archive contributor**. Existing bylines and history remain intact.
- An unreferenced Contributor can be permanently deleted after confirmation.
- A Contributor used only by About can be removed from About and deleted in one guarded transaction.
- A Contributor used by Articles cannot be deleted immediately. Editors must archive them or reassign every draft and published byline first. Articles are never cascade-deleted.
- Draft-only Articles use **Delete draft permanently**.
- Published Articles should normally use **Unpublish article**. **Delete article permanently** is destructive and removes both variants after confirmation.
- Assets are never deleted by cleanup/reset defaults.

## Relationship decisions

| Relationship | Strength and reason | Deletion behavior | Editor resolution |
|---|---|---|---|
| Article → Contributor | Strong; a byline must never silently break | Blocks Contributor deletion | Archive or reassign in byline order |
| About → Contributor | Strong; staff entries must remain intentional | Blocks ordinary deletion | Remove from About and delete transaction |
| Article → featured image | Strong asset reference; published media must remain | Asset deletion is blocked/reported | Replace image before asset cleanup |
| Site Settings → logo | Strong brand dependency | Asset remains while referenced | Switch logo or replace asset |
| Article body → inline image | Strong asset reference | Asset remains while referenced | Replace/remove the block |
| Portable Text internal link → document | Strong where modeled as a reference | Target deletion is blocked | Update/remove the link first |

Compatibility schemas are not an acceptable substitute for migration. Any temporary compatibility layer needs an ADR, owner, and removal date.

Run `npm run sanity:audit-singletons` before singleton lifecycle or migration work. It is read-only and reports both fixed IDs, draft/published state, retained-history evidence available to the CLI, wrong-ID records, duplicates, legacy singleton IDs, and references to obsolete IDs. A partial history probe is reported as `historyIndeterminate`; it is not proof that a singleton was never created. Confirm deleted/discarded history in authenticated Studio before choosing restoration or clean initialization.
