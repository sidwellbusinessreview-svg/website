import type { StructureResolver } from "sanity/structure";
import { ArticleStateList } from "./components/ArticleStateList";
import { ContributorStateList } from "./components/ContributorStateList";
import { SingletonPane } from "./components/SingletonPane";
import { ABOUT_ID, SITE_SETTINGS_ID } from "./singletons";

const articleDescriptions = {
  all: "All draft and published Articles.",
  draftOnly: "Articles that have never been published.",
  published: "Live Articles with no unpublished edits.",
  publishedWithChanges: "Live Articles that also contain edits readers cannot see yet.",
  pinned: "Articles selected for prominent homepage placement.",
} as const;

const statePane = (S: Parameters<StructureResolver>[0], title: string, state: "all" | "draftOnly" | "published" | "publishedWithChanges" | "pinned") =>
  S.component(ArticleStateList)
    .title(title)
    .options({ state, title, description: articleDescriptions[state] })
    .child((documentId) => S.document().schemaType("article").documentId(documentId));

const contributorPane = (S: Parameters<StructureResolver>[0], title: string, state: "active" | "archived" | "all") =>
  S.component(ContributorStateList).title(title).options({ state, title }).child((documentId) => S.document().schemaType("contributor").documentId(documentId));

export const structure: StructureResolver = (S) => S.list().title("Sidwell Business Review").items([
  S.listItem().title("Articles").child(S.list().title("Articles").items([
    S.listItem().title("All Articles").child(statePane(S, "All Articles", "all")),
    S.listItem().title("Draft Only").child(statePane(S, "Draft Only", "draftOnly")),
    S.listItem().title("Published").child(statePane(S, "Published", "published")),
    S.listItem().title("Published with Unpublished Changes").child(statePane(S, "Published with Unpublished Changes", "publishedWithChanges")),
    S.listItem().title("Pinned").child(statePane(S, "Pinned", "pinned")),
  ])),
  S.listItem().title("Contributors").child(S.list().title("Contributors").items([
    S.listItem().title("Active Contributors").child(contributorPane(S, "Active Contributors", "active")),
    S.listItem().title("Archived Contributors").child(contributorPane(S, "Archived Contributors", "archived")),
    S.listItem().title("All Contributors").child(contributorPane(S, "All Contributors", "all")),
  ])),
  S.listItem().id(ABOUT_ID).title("About").child(S.component(SingletonPane).id("about-lifecycle").title("About").options({
    documentId: ABOUT_ID,
    schemaType: "staticPage",
    title: "About",
    initialValue: { title: "About", slug: { _type: "slug", current: "about" } },
  })),
  S.divider(),
  S.listItem().id(SITE_SETTINGS_ID).title("Site Settings").child(S.component(SingletonPane).id("site-settings-lifecycle").title("Site Settings").options({
    documentId: SITE_SETTINGS_ID,
    schemaType: "siteSettings",
    title: "Site Settings",
    initialValue: {},
  })),
]);
