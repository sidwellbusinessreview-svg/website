import { describe, expect, it } from "vitest";
import {
  CONFIRMATION_PHRASE,
  assertApplyGuards,
  buildMigrationPlan,
  getArticleBlockers,
  normalizeBody,
  parseGraduationYear,
  planIdempotentActions,
} from "./sbr-archive";

describe("SBR archive migration intake", () => {
  const plan = buildMigrationPlan();
  const article = (slug: string) => plan.articles.find((item) => item.slug === slug)!;

  it("validates eight unique supplied Articles with consistent bundle metadata", () => {
    expect(plan.articles).toHaveLength(8);
    expect(new Set(plan.articles.map(({ slug }) => slug)).size).toBe(8);
    expect(plan.inconsistencies).toEqual([]);
  });

  it("uses stable contributor identity and deduplicates repeat appearances", () => {
    const stephen = plan.contributors.find(({ slug }) => slug === "stephen-koopersmith")!;
    expect(stephen.sourceId).toBe("sbr-contributor-stephen-koopersmith");
    expect(stephen.sourceArticleIds).toHaveLength(2);
  });

  it("parses typographic and straight graduation years", () => {
    expect(parseGraduationYear("Evan Tan ’28")).toEqual({ name: "Evan Tan", graduationYear: 2028 });
    expect(parseGraduationYear("Areg Devoyans '26")).toEqual({ name: "Areg Devoyans", graduationYear: 2026 });
  });

  it("rejects missing author metadata from import readiness", () => {
    expect(getArticleBlockers(article("effects-russo-ukraine-war"))).toContain("contributors: author decision required");
    expect(getArticleBlockers(article("business-of-nil-deals"))).toContain("contributors: author decision required");
  });

  it("warns rather than inventing exact dates for month-only sources", () => {
    const item = article("economic-implications-trumps-mass-deportations");
    expect(item.sourceDate).toBe("2025-03");
    expect(item.publicationDate).toBeNull();
    expect(item.reviewWarnings).toContain("Exact publication date is unresolved.");
  });

  it("keeps every proposed summary within 300 characters and marked for review", () => {
    for (const item of plan.articles) {
      expect(item.proposedSummary.text.length).toBeLessThanOrEqual(300);
      expect(item.proposedSummary.needsEditorialReview).toBe(true);
    }
  });

  it("preserves ordered multi-contributor bylines", () => {
    expect(article("economic-implications-trumps-mass-deportations").contributorSourceIds).toEqual([
      "sbr-contributor-evan-tan",
      "sbr-contributor-steven-huang",
      "sbr-contributor-felix-pacheco-lynch",
    ]);
  });

  it("normalizes mechanical extraction defects while preserving footnote text", () => {
    const result = normalizeBody("Title\n\n**By Writer**\n\nParagraph with footnote.1\n\n7\n\nSecond paragraph.", "Title", ["Writer"]);
    expect(result.blocks).toEqual([
      { type: "paragraph", text: "Paragraph with footnote.1" },
      { type: "paragraph", text: "Second paragraph." },
    ]);
  });

  it("keeps housing on source-recovery hold and NFL as an unfinished draft", () => {
    expect(article("opinion-wall-street-single-family-homes").readiness).toBe("sourceRecoveryHold");
    expect(article("nfl-salary-cap-inflation-free-agency").readiness).toBe("unfinishedDraft");
  });

  it("supports image-free staged Articles", () => {
    expect(plan.articles.every(({ featuredImage }) => featuredImage === null)).toBe(true);
  });

  it("prepares rollback mappings for contributors before Articles", () => {
    const firstArticle = plan.rollbackMappings.findIndex(({ type }) => type === "article");
    expect(firstArticle).toBeGreaterThan(0);
    expect(plan.rollbackMappings.slice(0, firstArticle).every(({ type }) => type === "contributor")).toBe(true);
    expect(plan.rollbackMappings.every(({ draftId }) => draftId.startsWith("drafts."))).toBe(true);
  });

  it("requires apply, typed confirmation, and an unblocked plan", () => {
    expect(() => assertApplyGuards({ apply: false, plan })).toThrow("Apply flag");
    expect(() => assertApplyGuards({ apply: true, confirmation: "wrong", plan })).toThrow("Typed confirmation");
    expect(() => assertApplyGuards({ apply: true, confirmation: CONFIRMATION_PHRASE, plan })).toThrow("blocked");
  });

  it("refuses published conflicts and is idempotent for existing matching drafts", () => {
    const mapping = plan.rollbackMappings[0];
    expect(() => planIdempotentActions([{ _id: mapping.sanityId, _type: mapping.type }], plan)).toThrow("Published-document conflict");
    const actions = planIdempotentActions([{ _id: mapping.draftId, _type: mapping.type }], plan);
    expect(actions).toHaveLength(plan.rollbackMappings.length - 1);
    expect(() => planIdempotentActions([{ _id: mapping.draftId, _type: "wrong" }], plan)).toThrow("type conflict");
  });

  it("the dry-run model has no mutation operation", () => {
    expect(plan.pilotBlocked).toBe(true);
    expect(plan.pilotSourceIds).toHaveLength(4);
    expect(Object.values(plan.pilotBlockers).flat()).toHaveLength(4);
  });
});
