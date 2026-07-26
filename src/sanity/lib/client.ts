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

export function getDraftSanityClient(): SanityClient {
  const environment = getSanityEnvironment();
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!environment.configured || !token) {
    throw new Error("Draft preview requires complete Sanity configuration and a server-only read token.");
  }
  return createDraftSanityClient(environment, token);
}

export function createDraftSanityClient(
  environment: Extract<SanityEnvironment, { configured: true }>,
  token: string,
): SanityClient {
  return createClient({
    projectId: environment.projectId,
    dataset: environment.dataset,
    apiVersion: environment.apiVersion,
    perspective: "drafts",
    useCdn: false,
    token,
    stega: {
      enabled: true,
      studioUrl: environment.studioBasePath,
    },
  });
}
