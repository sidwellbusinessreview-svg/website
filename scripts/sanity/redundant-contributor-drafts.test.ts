import { describe, expect, it } from "vitest";
import { compareContributorDraftPairs, redundantDraftIds, type ContributorDocument } from "./redundant-contributor-drafts";

const contributor = (overrides: Partial<ContributorDocument>): ContributorDocument => ({
  _id: "evan", _type: "contributor", _rev: "published-rev", name: "Evan Tan", slug: { _type: "slug", current: "evan" }, active: true, ...overrides,
});

describe("redundant Contributor draft cleanup planning", () => {
  it("ignores only system metadata and selects a semantically identical draft", () => {
    const comparisons = compareContributorDraftPairs([
      contributor({ _createdAt: "old", _updatedAt: "old" }),
      contributor({ _id: "drafts.evan", _rev: "draft-rev", _createdAt: "new", _updatedAt: "new", _system: { base: { id: "evan", rev: "base-rev" } } }),
    ]);
    expect(comparisons[0]).toMatchObject({ identical: true, differingFields: [] });
    expect(redundantDraftIds(comparisons)).toEqual(["drafts.evan"]);
  });

  it("preserves drafts with any meaningful difference and reports the field", () => {
    const comparisons = compareContributorDraftPairs([
      contributor({}), contributor({ _id: "drafts.evan", _rev: "draft-rev", active: false }),
    ]);
    expect(comparisons[0]).toMatchObject({ identical: false, differingFields: [{ field: "active", published: true, draft: false }] });
    expect(redundantDraftIds(comparisons)).toEqual([]);
  });

  it("does not select a draft without a published counterpart", () => {
    expect(compareContributorDraftPairs([contributor({ _id: "drafts.evan" })])).toEqual([]);
  });
});
