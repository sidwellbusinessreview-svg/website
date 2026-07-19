import { describe, expect, it } from "vitest";
import {
  createContributorReferences,
  createInvalidContributorRemovalPatches,
  contributorSecondaryLine,
  normalizeContributorValues,
  reorderContributorReferences,
  type ContributorReference,
} from "./ContributorSelectors";

const reference = (_ref: string, _key = `key-${_ref}`): ContributorReference => ({ _key, _type: "reference", _ref });

describe("Contributor selector defensive normalization", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["empty array", []],
  ])("handles %s", (_label, value) => expect(normalizeContributorValues(value)).toMatchObject({ references: [], invalidIndices: [] }));

  it.each([
    ["undefined member", [undefined]],
    ["null member", [null]],
    ["empty object", [{}]],
    ["undefined reference", [{ _key: "a", _type: "reference", _ref: undefined }]],
    ["empty reference", [{ _key: "a", _type: "reference", _ref: "" }]],
  ])("ignores and reports an %s", (_label, value) => {
    const result = normalizeContributorValues(value);
    expect(result.references).toEqual([]);
    expect(result.invalidIndices).toEqual([0]);
  });

  it("normalizes valid published and draft-prefixed references", () => {
    const result = normalizeContributorValues([reference("person"), reference("drafts.other")]);
    expect([...result.selectedIds]).toEqual(["person", "other"]);
    expect(result.invalidIndices).toEqual([]);
  });

  it("deduplicates draft and published IDs while marking the later item for repair", () => {
    const result = normalizeContributorValues([reference("person", "a"), reference("drafts.person", "b")]);
    expect([...result.selectedIds]).toEqual(["person"]);
    expect(result.references).toEqual([reference("person", "a")]);
    expect(result.invalidIndices).toEqual([1]);
  });

  it("keeps multiple valid contributors and isolates mixed malformed entries", () => {
    const result = normalizeContributorValues([reference("one"), null, reference("two"), {}]);
    expect(result.references.map(({ _ref }) => _ref)).toEqual(["one", "two"]);
    expect(result.invalidIndices).toEqual([1, 3]);
  });
});

describe("Contributor selector patches", () => {
  it("creates one complete reference only from a confirmed ID", () => {
    expect(createContributorReferences(["person"], new Set(), () => "stable-key")).toEqual([
      { _key: "stable-key", _type: "reference", _ref: "person" },
    ]);
  });

  it("prevents duplicate published/draft references", () => {
    expect(createContributorReferences(["person"], new Set(["person"]), () => "new-key")).toEqual([]);
  });

  it("creates multiple stable keyed references in confirmed order", () => {
    let key = 0;
    expect(createContributorReferences(["one", "two", "one"], new Set(), () => `key-${++key}`)).toEqual([
      reference("one", "key-1"), reference("two", "key-2"),
    ]);
  });

  it("treats cancel and X close as no patch", () => {
    expect(createContributorReferences([null], new Set(), () => "unused")).toEqual([]);
    expect(createContributorReferences([undefined], new Set(), () => "unused")).toEqual([]);
  });

  it("removes only malformed entries", () => {
    const patches = createInvalidContributorRemovalPatches([reference("one"), null, reference("two"), {}]);
    expect(patches).toMatchObject([{ type: "unset", path: [3] }, { type: "unset", path: [1] }]);
  });

  it("preserves order during a reorder", () => {
    const values = [reference("one"), reference("two"), reference("three")];
    expect(reorderContributorReferences(values, 2, 0).map(({ _ref }) => _ref)).toEqual(["three", "one", "two"]);
  });
});

describe("Contributor editorial presentation", () => {
  it("spaces role and graduation year clearly", () => expect(contributorSecondaryLine({ role: "Editor", graduationYear: 2027 })).toBe("Editor · Class of 2027"));
  it("search metadata remains useful when either optional value is missing", () => {
    expect(contributorSecondaryLine({ role: "Editor" })).toBe("Editor");
    expect(contributorSecondaryLine({ graduationYear: 2028 })).toBe("Class of 2028");
  });
});
