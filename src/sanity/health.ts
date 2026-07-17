import { getSanityEnvironment } from "@/sanity/env";
import { createPublicSanityClient } from "@/sanity/lib/client";

export type SanityHealthResult = {
  ok: boolean;
  message: string;
};

export async function checkSanityConnectivity(): Promise<SanityHealthResult> {
  const environment = getSanityEnvironment();

  if (!environment.configured) {
    return {
      ok: false,
      message:
        "Sanity is not configured. Add the three public Sanity values to .env.local, then run this check again.",
    };
  }

  try {
    const client = createPublicSanityClient(environment);
    await client.fetch<number>("count(*[!(_id in path(\"drafts.**\"))])");
    return {
      ok: true,
      message: `Connected to the ${environment.dataset} dataset with a public, read-only client.`,
    };
  } catch {
    return {
      ok: false,
      message:
        "Sanity could not be reached. Check the project ID, dataset, network connection, and Sanity CORS settings.",
    };
  }
}
