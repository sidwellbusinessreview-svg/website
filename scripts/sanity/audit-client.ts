import type { SanityClient } from "sanity";
import { DRAFT_AUTH_ERROR, auditModeDescription, resolveAuditMode, type AuditMode } from "../../src/sanity/auditAuth";

export function configureAuditClient(baseClient: SanityClient): {
  client: SanityClient;
  mode: AuditMode;
} {
  const publishedOnly = process.env.SANITY_AUDIT_PUBLISHED_ONLY === "1";
  const ci = process.env.SANITY_AUDIT_CI === "1";
  const serverToken = process.env.SANITY_API_READ_TOKEN?.trim();
  const client = serverToken ? baseClient.withConfig({ token: serverToken }) : baseClient;
  const mode = resolveAuditMode({
    hasClientToken: Boolean(client.config().token),
    publishedOnly,
    ci,
    hasServerReadToken: Boolean(serverToken),
  });

  console.log(`Audit scope: ${auditModeDescription(mode)}`);
  if (mode === "indeterminateAuth") throw new Error(DRAFT_AUTH_ERROR);

  return {
    client: client.withConfig({
      perspective: mode === "authenticated" ? "raw" : "published",
      useCdn: false,
    }),
    mode,
  };
}
