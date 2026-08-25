import { defineConfig, defineLocaleResourceBundle } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { getSanityEnvironment } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import {
  filterSingletonNewDocumentOptions,
  filterSingletonTemplates,
  isSingletonSchemaType,
  SITE_SETTINGS_ID,
} from "./src/sanity/singletons";
import { structure } from "./src/sanity/structure";
import { ArticleStatusBadge, ContributorAvailabilityBadge, resolveDocumentActions, SingletonStatusBadge } from "./src/sanity/documentStatus";

const environment = getSanityEnvironment();
const previewOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const articleEditorLocale = defineLocaleResourceBundle({
  locale: "en-US",
  namespace: "studio",
  resources: {
    "inputs.portable-text.empty-placeholder": "Start writing or paste here…",
  },
});

export default environment.configured
  ? defineConfig({
      name: "sidwell_business_review",
      title: "Sidwell Business Review",
      projectId: environment.projectId,
      dataset: environment.dataset,
      plugins: [
        structureTool({ structure }),
        presentationTool({
          name: "preview",
          title: "Preview",
          allowOrigins: [previewOrigin],
          previewUrl: {
            initial: previewOrigin,
            previewMode: { enable: "/api/draft-mode/enable", shareAccess: false },
          },
          resolve: {
            mainDocuments: [
              { route: "/", type: "siteSettings" },
              { route: "/about", type: "siteSettings" },
              {
                route: "/articles/:slug",
                filter: `_type == "article" && slug.current == $slug`,
                params: ({ params }) => ({ slug: params.slug }),
              },
              {
                route: "/authors/:slug",
                filter: `_type == "contributor" && slug.current == $slug`,
                params: ({ params }) => ({ slug: params.slug }),
              },
            ],
            locations: {
              siteSettings: {
                locations: [
                  { title: "Homepage and publication settings", href: "/", showHref: false },
                  { title: "About page", href: "/about" },
                ],
              },
              article: {
                select: { title: "title", slug: "slug.current" },
                resolve: (value) => value?.slug ? {
                  locations: [{ title: value.title || "Article preview", href: `/articles/${value.slug}` }],
                } : { message: "Generate the Article slug to open its frontend preview.", tone: "caution" },
              },
              contributor: {
                select: { name: "name", slug: "slug.current" },
                resolve: (value) => value?.slug ? {
                  locations: [{ title: value.name || "Contributor preview", href: `/authors/${value.slug}` }],
                } : { message: "Generate the Contributor slug to open its frontend preview.", tone: "caution" },
              },
            },
          },
        }),
      ],
      releases: { enabled: false },
      scheduledDrafts: { enabled: false },
      i18n: { bundles: [articleEditorLocale] },
      schema: {
        types: schemaTypes,
        templates: filterSingletonTemplates,
      },
      document: {
        actions: (actions, context) => resolveDocumentActions(actions, context.schemaType),
        badges: (badges, context) => context.schemaType === "article" ? [ArticleStatusBadge] : context.schemaType === "contributor" ? [ContributorAvailabilityBadge, ...badges] : isSingletonSchemaType(context.schemaType) ? [SingletonStatusBadge] : badges,
        newDocumentOptions: filterSingletonNewDocumentOptions,
      },
    })
  : [];

export { SITE_SETTINGS_ID };
