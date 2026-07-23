import { describe, expect, it } from "vitest";
import { auditDocuments, confirmationMatches, contributorDeletionCase, planEditorialReset, planFieldCleanup, planLegacyCleanup, planMalformedContributorRepairs, replaceContributorReferences, type RawDocument } from "../../scripts/sanity/content-operations";

const doc = (_id: string, _type: string, extra: Record<string, unknown> = {}): RawDocument => ({ _id, _type, ...extra });

describe("dataset audit", () => {
  it("detects a legacy Masthead draft", () => expect(auditDocuments([doc("drafts.masthead", "masthead")]).legacyDocuments).toEqual(["drafts.masthead"]));
  it.each(["author", "issue", "category", "tag"])("detects legacy %s documents", (type) => expect(auditDocuments([doc(`legacy-${type}`, type)]).legacyDocuments).toHaveLength(1));
  it("detects missing references", () => expect(auditDocuments([doc("a", "article", { contributors: [{ _ref: "missing" }] })]).danglingReferences).toHaveLength(1));
  it("does not misclassify Sanity-managed underscore metadata as an obsolete editorial field", () => expect(auditDocuments([doc("about", "staticPage", { _system: { base: { id: "x" } } })]).obsoleteFields).toEqual([]));
  it("ignores Sanity-managed system document types", () => expect(auditDocuments([doc("_.groups.read", "system.group")]).unregisteredTypes).toEqual([]));
  it("detects draft/published pairs", () => expect(auditDocuments([doc("a", "article"), doc("drafts.a", "article")]).pairs).toEqual(["a"]));
});

describe("destructive plans remain pure", () => {
  it("includes draft and published legacy IDs without mutation", () => { const documents = [doc("masthead", "masthead"), doc("drafts.masthead", "masthead")]; expect(planLegacyCleanup(documents).deleteIds).toEqual(["drafts.masthead", "masthead"]); expect(documents).toHaveLength(2); });
  it("finds incoming references that must be resolved first", () => expect(planLegacyCleanup([doc("legacy-author", "author"), doc("article", "article", { contributors: [{ _ref: "legacy-author" }] })]).blockedReferences).toHaveLength(1));
  it("reset selects editorial documents and preserves assets", () => expect(planEditorialReset([doc("a", "article"), doc("image-1", "sanity.imageAsset")])).toEqual(["a"]));
  it("requires the exact cleanup confirmation", () => { expect(confirmationMatches("CLEAN LEGACY CONTENT", "CLEAN LEGACY CONTENT")).toBe(true); expect(confirmationMatches("yes", "CLEAN LEGACY CONTENT")).toBe(false); });
  it("plans obsolete field removal without mutating data", () => { const documents = [doc("c", "contributor", { photo: {}, biography: "old" }), doc("settings", "siteSettings", { recentArticleCount: 4, homepageIntro: "old" })]; expect(planFieldCleanup(documents)).toEqual([{ id: "c", unset: ["photo", "biography"] }, { id: "settings", unset: ["recentArticleCount", "homepageIntro"] }]); expect(documents[0].photo).toEqual({}); });
  it("dry-runs nested About portrait cleanup without deleting assets", () => {
    const portrait = { asset: { _ref: "image-staff-portrait" } };
    const documents = [doc("about", "staticPage", { editorsInChief: [{ _key: "lead", contributor: { _ref: "person" }, portrait, portraitAltText: "Portrait" }] })];
    expect(planFieldCleanup(documents)).toEqual([{ id: "about", unset: ['editorsInChief[_key=="lead"].portrait', 'editorsInChief[_key=="lead"].portraitAltText'] }]);
    expect((documents[0].editorsInChief as Array<{ portrait: unknown }>)[0].portrait).toEqual(portrait);
  });
  it("creates a dry-run repair plan for incomplete and duplicate contributor selections", () => { const plan = planMalformedContributorRepairs([doc("drafts.article", "article", { title: "Test article", contributors: [{ _ref: "one" }, null, {}, { _ref: "drafts.one" }] })]); expect(plan).toEqual([{ id: "drafts.article", title: "Test article", state: "draft", unsetPaths: ["contributors[1]", "contributors[2]", "contributors[3]"] }]); });
});

describe("contributor reassignment", () => {
  it("allows unreferenced deletion", () => expect(contributorDeletionCase([])).toBe("none"));
  it("identifies About-only cleanup", () => expect(contributorDeletionCase([{ _type: "staticPage" }])).toBe("aboutOnly"));
  it("blocks immediate article-linked deletion", () => expect(contributorDeletionCase([{ _type: "article" }])).toBe("articles"));
  it("preserves order and avoids duplicate references", () => expect(replaceContributorReferences([{ _key: "1", _ref: "old" }, { _key: "2", _ref: "new" }], "old", "new")).toEqual([{ _key: "1", _ref: "new" }]));
});
