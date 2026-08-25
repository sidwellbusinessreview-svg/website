import { defineCliConfig } from "sanity/cli";
export default defineCliConfig({
  api: {
    projectId: "bumxf5q6",
    dataset: "production",
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
