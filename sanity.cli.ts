import { defineCliConfig } from "sanity/cli";
import { getSanityEnvironment } from "./src/sanity/env";

const environment = getSanityEnvironment();

export default defineCliConfig({
  api: environment.configured
    ? {
        projectId: environment.projectId,
        dataset: environment.dataset,
      }
    : undefined,
  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
    path: "src/sanity/schema.json",
  },
  typegen: {
    enabled: true,
    path: "src/**/*.{ts,tsx}",
    schema: "src/sanity/schema.json",
    generates: "src/sanity/sanity.types.ts",
    overloadClientMethods: true,
  },
});
