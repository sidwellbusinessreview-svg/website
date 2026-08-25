import { loadEnvConfig } from "@next/env";
import { getSanityEnvironment } from "../src/sanity/env";

loadEnvConfig(process.cwd());

const environment = getSanityEnvironment();
if (!environment.configured) throw new Error("Sanity target configuration is incomplete.");

console.log(`Project: ${environment.projectId}`);
console.log(`Dataset: ${environment.dataset}`);
console.log(`API version: ${environment.apiVersion}`);
console.log(`Studio URL: ${environment.studioUrl}`);
console.log("Public provider: published perspective, token-free");
console.log("Draft audits: authenticated CLI user locally, or server-only read token in CI");
