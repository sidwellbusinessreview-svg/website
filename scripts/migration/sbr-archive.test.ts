import { describe, expect, it, vi } from "vitest";
import {
  CONFIRMATION_PHRASE,
  approvalFor,
  applyPilot,
  assertApplyGuards,
  buildMigrationPlan,
  getArticleBlockers,
  normalizeBody,
  parseGraduationYear,
  planIdempotentActions,
  summaryChecksum,
  selectRollbackRecords,
  verifyBackup,
} from "./sbr-archive";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

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
    expect(item.sourcePublicationDate).toBe("2025-03");
    expect(item.publicationDate).toBe("2025-03-01");
    expect(item.publicationDatePrecision).toBe("month");
    expect(item.publicationDateDisplay).toBe("March 2025");
  });

  it("keeps every proposed summary within 300 characters and marked for review", () => {
    const forbidden = /unfinished|incomplete|draft article|opinion article|source-recovery|migration|archival piece/i;
    for (const item of plan.articles) {
      expect(item.proposedSummary.text.length).toBeLessThanOrEqual(300);
      expect(item.proposedSummary.needsEditorialReview).toBe(true);
      expect(item.proposedSummary.text).not.toMatch(forbidden);
      expect((item.proposedSummary.text.match(/[.!?]/g) ?? [])).toHaveLength(1);
      expect(item.proposedSummary.checksum).toBe(summaryChecksum(item.proposedSummary.text));
    }
  });

  it("invalidates approval when a summary checksum changes", () => {
    const sourceId = plan.articles[0].sourceId;
    const old = { version: 1 as const, articles: { [sourceId]: { summaryChecksum: "old", approved: true, approvedBy: "Editor", approvedAt: "2026-08-01" } } };
    expect(approvalFor(sourceId, "Revised summary.", old)).toMatchObject({ approved: false, approvedBy: null, approvedAt: null });
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

  it("creates contributors before draft Articles only after complete preflight", async () => {
    const approvedArticles = plan.articles.map((item) => plan.pilotSourceIds.includes(item.sourceId) ? { ...item, proposedSummary: { ...item.proposedSummary, approved: true } } : item);
    const approvedPlan = { ...plan, articles: approvedArticles, pilotBlocked: false, pilotBlockers: Object.fromEntries(plan.pilotSourceIds.map((id) => [id, []])) };
    const directory = mkdtempSync(join(tmpdir(), "sbr-backup-"));
    const backup = join(directory, "production.tar.gz");
    writeFileSync(backup, "verified export fixture");
    writeFileSync(`${backup}.manifest.json`, JSON.stringify({ projectId: "project", dataset: "production", checksum: "" }));
    const backupChecksum = createHash("sha256").update("verified export fixture").digest("hex");
    writeFileSync(`${backup}.manifest.json`, JSON.stringify({ projectId: "project", dataset: "production", checksum: backupChecksum }));
    const action = vi.fn().mockResolvedValue({});
    const client = { fetch: vi.fn().mockResolvedValue([]), action };
    const actions = await applyPilot({ client, plan: approvedPlan, projectId: "project", dataset: "production", expectedProject: "project", backupPath: backup, confirmation: CONFIRMATION_PHRASE, apply: true });
    expect(actions).toHaveLength(plan.rollbackMappings.length);
    type ActionPayload = { attributes: { _type: string; publicationDatePrecision?: string; contributors?: Array<{ _ref: string }>; featuredImage?: unknown } };
    const payloads: ActionPayload[] = action.mock.calls.map((call) => call[0] as ActionPayload);
    const firstArticle = payloads.findIndex(({ attributes }) => attributes._type === "article");
    expect(payloads.slice(0, firstArticle).every(({ attributes }) => attributes._type === "contributor")).toBe(true);
    expect(payloads.slice(firstArticle).every(({ attributes }) => attributes._type === "article")).toBe(true);
    expect(payloads[firstArticle].attributes.publicationDatePrecision).toBe("month");
    expect(payloads[firstArticle].attributes.contributors?.map(({ _ref }) => _ref)).toEqual(approvedArticles.find(({ slug }) => slug === "economic-implications-trumps-mass-deportations")?.contributorSourceIds);
    expect(payloads.every(({ attributes }) => !("featuredImage" in attributes))).toBe(true);
  });

  it("rollback accepts only records from the selected batch", () => {
    expect(selectRollbackRecords([{ _id: "drafts.one", importBatchId: "sbr-archive-2026-08-pilot-01" }])).toHaveLength(1);
    expect(() => selectRollbackRecords([{ _id: "drafts.other", importBatchId: "other" }])).toThrow("outside the selected migration batch");
  });

  it("rejects missing, empty, and target-mismatched backups", () => {
    expect(() => verifyBackup("/definitely/missing/export.tar.gz", "project", "production")).toThrow("non-empty");
    const directory = mkdtempSync(join(tmpdir(), "sbr-empty-backup-"));
    const backup = join(directory, "production.tar.gz");
    writeFileSync(backup, "");
    expect(() => verifyBackup(backup, "project", "production")).toThrow("non-empty");
    writeFileSync(backup, "export");
    writeFileSync(`${backup}.manifest.json`, JSON.stringify({ projectId: "wrong", dataset: "production", checksum: createHash("sha256").update("export").digest("hex") }));
    expect(() => verifyBackup(backup, "project", "production")).toThrow("target");
  });
});
