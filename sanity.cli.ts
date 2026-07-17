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
});
