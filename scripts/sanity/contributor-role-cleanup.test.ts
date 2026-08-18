import { describe, expect, it } from "vitest";
import { planContributorRoleCleanup, verifyContributorRoleCleanup, type ContributorRoleDocument } from "./contributor-role-cleanup";

const contributor = (overrides: Partial<ContributorRoleDocument> = {}): ContributorRoleDocument => ({
  _id: "person", _type: "contributor", name: "Person", slug: { current: "person" }, graduationYear: 2028, active: true, ...overrides,
});

describe("Contributor role cleanup", () => {
  it("plans only documents with the obsolete role field", () => {
    expect(planContributorRoleCleanup([contributor({ role: "Staff Writer" }), contributor({ _id: "clean" })])).toHaveLength(1);
  });

  it("refuses ambiguous role-like fields", () => {
    expect(() => planContributorRoleCleanup([contributor({ position: "Editor" })])).toThrow(/unexpected role-like fields/i);
  });

  it("proves role removal without changing retained fields", () => {
    const before = planContributorRoleCleanup([contributor({ role: "Editor" })]);
    expect(verifyContributorRoleCleanup(before, [contributor()])).toEqual({ valid: true, failures: [] });
    expect(verifyContributorRoleCleanup(before, [contributor({ name: "Changed" })]).valid).toBe(false);
  });
});
