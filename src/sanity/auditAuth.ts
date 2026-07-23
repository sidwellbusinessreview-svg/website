export const DRAFT_AUTH_ERROR =
  "Draft state could not be checked because this audit was not authenticated.";

export type AuditMode = "authenticated" | "publishedOnly" | "indeterminateAuth";

export function resolveAuditMode(input: {
  hasClientToken: boolean;
  publishedOnly?: boolean;
  ci?: boolean;
  hasServerReadToken?: boolean;
}): AuditMode {
  if (input.publishedOnly || (input.ci && !input.hasServerReadToken)) return "publishedOnly";
  if (input.hasClientToken || (input.ci && input.hasServerReadToken)) return "authenticated";
  return "indeterminateAuth";
}

export function auditModeDescription(mode: AuditMode): string {
  if (mode === "authenticated") return "authenticated raw audit (draft and published records)";
  if (mode === "publishedOnly") return "published-only audit (draft state not checked)";
  return DRAFT_AUTH_ERROR;
}

export function safeTargetSummary(input: {
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
  token?: unknown;
}) {
  return {
    projectId: input.projectId,
    dataset: input.dataset,
    apiVersion: input.apiVersion,
  };
}
