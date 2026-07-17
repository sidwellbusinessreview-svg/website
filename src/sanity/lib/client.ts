import { createClient, type SanityClient } from "next-sanity";
import { getSanityEnvironment, type SanityEnvironment } from "@/sanity/env";

export function createPublicSanityClient(
  environment: Extract<SanityEnvironment, { configured: true }>,
): SanityClient {
  return createClient({
    projectId: environment.projectId,
    dataset: environment.dataset,
    apiVersion: environment.apiVersion,
    perspective: "published",
    useCdn: true,
  });
}

export function getPublicSanityClient(): SanityClient | null {
  const environment = getSanityEnvironment();
  return environment.configured ? createPublicSanityClient(environment) : null;
}
