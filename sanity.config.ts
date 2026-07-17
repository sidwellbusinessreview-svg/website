"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { getSanityEnvironment } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

const environment = getSanityEnvironment();

export default environment.configured
  ? defineConfig({
      name: "sidwell_business_review",
      title: "Sidwell Business Review",
      basePath: environment.studioBasePath,
      projectId: environment.projectId,
      dataset: environment.dataset,
      plugins: [
        structureTool(),
        visionTool({ defaultApiVersion: environment.apiVersion }),
      ],
      schema: { types: schemaTypes },
    })
  : [];
