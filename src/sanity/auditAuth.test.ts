import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DRAFT_AUTH_ERROR,
  auditModeDescription,
  resolveAuditMode,
  safeTargetSummary,
} from "./auditAuth";
import { exactCurrentPageVersions } from "./pageExistence";

describe("Sanity audit authentication", () => {
  it("accepts an authenticated raw draft result", () => {
    expect(exactCurrentPageVersions([{ _id: "drafts.about", _type: "staticPage" }], "about", "staticPage"))
      .toEqual([{ _id: "drafts.about", _type: "staticPage" }]);
    expect(resolveAuditMode({ hasClientToken: true })).toBe("authenticated");
  });

  it("does not let an unauthenticated audit claim drafts are absent", () => {
    const mode = resolveAuditMode({ hasClientToken: false });
    expect(mode).toBe("indeterminateAuth");
    expect(auditModeDescription(mode)).toBe(DRAFT_AUTH_ERROR);
  });

  it("labels a deliberate anonymous check as published-only", () => {
    expect(auditModeDescription(resolveAuditMode({ hasClientToken: false, publishedOnly: true })))
      .toContain("published-only");
  });

  it("uses a server read token in CI and otherwise falls back to published-only", () => {
    expect(resolveAuditMode({ hasClientToken: false, ci: true, hasServerReadToken: true })).toBe("authenticated");
    expect(resolveAuditMode({ hasClientToken: false, ci: true, hasServerReadToken: false })).toBe("publishedOnly");
  });

  it("prints safe target fields without retaining a token", () => {
    expect(safeTargetSummary({ projectId: "project", dataset: "production", apiVersion: "2026-03-01", token: "secret" }))
      .toEqual({ projectId: "project", dataset: "production", apiVersion: "2026-03-01" });
  });
});

describe("documented Sanity commands", () => {
  const root = process.cwd();
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { scripts: Record<string, string> };

  it.each(["sanity:audit-pages", "sanity:audit-pages:published", "sanity:audit-pages:ci", "sanity:audit-content", "sanity:check-target"])(
    "defines %s",
    (command) => expect(packageJson.scripts[command]).toBeTruthy(),
  );

  it("keeps documented npm commands synchronized with package.json", () => {
    const documentation = ["AGENTS.md", "TESTING.md", "docs/PHASE_12_ACCEPTANCE.md", "docs/SANITY_TARGET_ALIGNMENT.md"]
      .map((file) => readFileSync(resolve(root, file), "utf8"))
      .join("\n");
    const commands = [...documentation.matchAll(/npm run (sanity:[a-z0-9:-]+)/g)].map((match) => match[1]);
    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) expect(packageJson.scripts[command], command).toBeTruthy();
  });
});
