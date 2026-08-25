import { createHash } from "node:crypto";

export const obsoleteContributorRoleFields = ["role"] as const;

export type ContributorRoleDocument = {
  _id: string;
  _type: "contributor";
  name?: string;
  slug?: { current?: string };
  role?: unknown;
  graduationYear?: number;
  active?: boolean;
  migrationSourceId?: string;
  importBatchId?: string;
  roles?: unknown;
  position?: unknown;
  editorialRole?: unknown;
};

export type ContributorRoleCleanupItem = {
  id: string;
  name: string;
  fields: { role: unknown };
  retained: Omit<ContributorRoleDocument, "role" | "roles" | "position" | "editorialRole">;
  retainedChecksum: string;
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function valueChecksum(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

export function retainedContributor(document: ContributorRoleDocument) {
  return Object.fromEntries(Object.entries(document).filter(([field]) => !["role", "roles", "position", "editorialRole"].includes(field))) as Omit<ContributorRoleDocument, "role" | "roles" | "position" | "editorialRole">;
}

export function retainedChecksum(document: ContributorRoleDocument): string {
  return valueChecksum(retainedContributor(document));
}

export function planContributorRoleCleanup(documents: ContributorRoleDocument[]): ContributorRoleCleanupItem[] {
  const present = (value: unknown) => value !== undefined && value !== null;
  const ambiguous = documents.filter((document) => present(document.roles) || present(document.position) || present(document.editorialRole));
  if (ambiguous.length) throw new Error(`Unexpected role-like fields found on: ${ambiguous.map(({ _id }) => _id).join(", ")}`);
  return documents.filter((document) => present(document.role)).map((document) => ({
    id: document._id,
    name: document.name ?? "Unnamed contributor",
    fields: { role: document.role },
    retained: retainedContributor(document),
    retainedChecksum: retainedChecksum(document),
  }));
}

export function verifyContributorRoleCleanup(before: ContributorRoleCleanupItem[], after: ContributorRoleDocument[]) {
  const byId = new Map(after.map((document) => [document._id, document]));
  const failures = before.flatMap((item) => {
    const document = byId.get(item.id);
    if (!document) return [`${item.id}: document is missing after cleanup`];
    if (document.role !== undefined) return [`${item.id}: role remains after cleanup`];
    if (retainedChecksum(document) !== item.retainedChecksum) return [`${item.id}: a retained field changed`];
    return [];
  });
  return { valid: failures.length === 0, failures };
}
