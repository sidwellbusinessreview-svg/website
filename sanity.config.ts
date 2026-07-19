"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { getSanityEnvironment } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import {
  filterSingletonActions,
  filterSingletonNewDocumentOptions,
  filterSingletonTemplates,
  SITE_SETTINGS_ID,
} from "./src/sanity/singletons";
import { structure } from "./src/sanity/structure";
import { ArticleStatusBadge, ContributorAvailabilityBadge, resolveDocumentActions } from "./src/sanity/documentStatus";

const environment = getSanityEnvironment();

export default environment.configured
  ? defineConfig({
      name: "sidwell_business_review",
      title: "Sidwell Business Review",
      basePath: environment.studioBasePath,
      projectId: environment.projectId,
      dataset: environment.dataset,
      plugins: [
        structureTool({ structure }),
      ],
      releases: { enabled: false },
      schema: {
        types: schemaTypes,
        templates: filterSingletonTemplates,
      },
      document: {
        actions: (actions, context) => resolveDocumentActions(filterSingletonActions(actions, context.schemaType), context.schemaType),
        badges: (badges, context) => context.schemaType === "article" ? [ArticleStatusBadge] : context.schemaType === "contributor" ? [ContributorAvailabilityBadge, ...badges] : badges,
        newDocumentOptions: filterSingletonNewDocumentOptions,
      },
    })
  : [];

export { SITE_SETTINGS_ID };
