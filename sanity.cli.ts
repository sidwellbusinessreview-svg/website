import { defineCliConfig } from "sanity/cli";
import { SANITY_STUDIO_DATASET, SANITY_STUDIO_PROJECT_ID } from "./src/sanity/studio-target";
export default defineCliConfig({
  api: {
    projectId: SANITY_STUDIO_PROJECT_ID,
    dataset: SANITY_STUDIO_DATASET,
  },
  deployment: {
    appId: "fmycvx6k6sss6ltq7ut0remd",
  },
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
