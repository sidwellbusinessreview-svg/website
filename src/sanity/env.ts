import { z } from "zod";

export const DEFAULT_SANITY_STUDIO_URL = "http://localhost:3333";

const projectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+$/, "must contain only lowercase letters and numbers");

const datasetSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9_-]+$/, "must contain only lowercase letters, numbers, underscores, and hyphens");

const apiVersionSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD format");

const studioUrlSchema = z
  .string()
  .trim()
  .url("must be an absolute URL")
  .refine((value) => /^https?:\/\//.test(value), "must use http or https");

const configuredEnvironmentSchema = z.object({
  projectId: projectIdSchema,
  dataset: datasetSchema,
  apiVersion: apiVersionSchema,
  studioUrl: studioUrlSchema,
});

export type SanityEnvironment =
  | { configured: false }
  | ({ configured: true } & z.infer<typeof configuredEnvironmentSchema>);

type PublicEnvironment = Record<string, string | undefined>;

export function readPublicSanityEnvironment(): PublicEnvironment {
  // These property accesses stay explicit so Next.js can inline public values
  // where required and standalone Studio can read the same checked settings.
  return {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  };
}

export function getSanityEnvironment(
  source: PublicEnvironment = readPublicSanityEnvironment(),
): SanityEnvironment {
  const values = {
    projectId: source.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "",
    dataset: source.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? "",
    apiVersion: source.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? "",
    studioUrl: source.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim() || DEFAULT_SANITY_STUDIO_URL,
  };

  const suppliedValues = [values.projectId, values.dataset, values.apiVersion];
  if (suppliedValues.every((value) => value.length === 0)) {
    return { configured: false };
  }

  if (suppliedValues.some((value) => value.length === 0)) {
    throw new Error(
      "Sanity configuration is incomplete. Set the project ID, dataset, and API version together, or leave all three blank to keep local-content mode.",
    );
  }

  const parsed = configuredEnvironmentSchema.safeParse(values);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid public Sanity configuration: ${details}`);
  }

  return { configured: true, ...parsed.data };
}
