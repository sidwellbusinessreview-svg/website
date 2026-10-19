import { afterAll, describe, expect, it, vi } from "vitest";
import {
  BUNDLE_ROOT,
  CONFIRMATION_PHRASE,
  approvalFor,
  applyPilot,
  assertApplyGuards,
  buildMigrationPlan,
  getArticleBlockers,
  extractStructuredSources,
  mapInlineFootnotes,
  normalizeBody,
  parseGraduationYear,
  planIdempotentActions,
  portableBody,
  summaryChecksum,
  selectRollbackRecords,
  verifyBackup,
} from "./sbr-archive";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

describe("SBR archive migration intake", () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "sbr-migration-fixture-"));
  const bundleRoot = join(fixtureRoot, "bundle");
  const stagingRoot = join(fixtureRoot, "staging");
  const fixtureSlugs = ["fixture-article-01", "fixture-article-02", "fixture-article-03", "fixture-article-04"];
  const readinessBySlug = Object.fromEntries(fixtureSlugs.map((slug, index) => [slug, index < 2 ? "pilotCandidate" : index === 2 ? "sourceRecoveryHold" : "unfinishedDraft"])) as Record<string, "pilotCandidate" | "sourceRecoveryHold" | "unfinishedDraft">;
  const summaries = Object.fromEntries(fixtureSlugs.map((slug) => [slug, `Synthetic summary for ${slug}, prepared solely for automated checks.`]));
  const authorsBySlug = [
    ["Writer One ’28", "Writer Two '27"],
    ["Writer One ’28", "Writer Three ’27"],
    [],
    ["Writer Four ’26"],
  ];

  mkdirSync(join(bundleRoot, "articles"), { recursive: true });
  const fixtureArticles = fixtureSlugs.map((slug, index) => ({
    slug,
    title: `Fixture Article ${String(index + 1).padStart(2, "0")}`,
    authors: authorsBySlug[index],
    date: index < 2 ? (index === 0 ? "2025-03" : "2025-06") : null,
    status: "published",
    source_key: `fixture-source-${index + 1}`,
    issue_pages: [index + 1],
    notes: ["Synthetic test record."],
  }));
  writeFileSync(join(bundleRoot, "migration_manifest.json"), JSON.stringify({ uniqueArticleCount: fixtureArticles.length, articles: fixtureArticles, sourcePriorityRules: [] }));
  writeFileSync(join(bundleRoot, "article_inventory.csv"), [
    "title,authors,date,status,source_pdf,issue_pages",
    ...fixtureArticles.map((article, index) => [article.title, article.authors.join(";"), article.date ?? "UNKNOWN", article.status, `source-${index + 1}.pdf`, String(index + 1)].join(",")),
  ].join("\n"));
  fixtureArticles.forEach((article, index) => {
    const authors = JSON.stringify(article.authors);
    const date = article.date ?? "null";
    const source = `---\ntitle: ${article.title}\nslug: ${article.slug}\nauthors: ${authors}\ndate: ${date}\nsection: Test\nmigrationStatus: ${article.status}\nsourcePdf: source-${index + 1}.pdf\nissuePages: [${index + 1}]\n---\n## Source-derived text\nA synthetic article supports this claim.1\n\n1\nTest Author, “A Synthetic Source Citation for the Fixture.”\n## Migration notes\n- Synthetic test record only.\n`;
    writeFileSync(join(bundleRoot, "articles", `${String(index + 1).padStart(2, "0")}-${article.slug}.md`), source);
  });

  const plan = buildMigrationPlan({ bundleRoot, stagingRoot, articleSlugs: fixtureSlugs, readinessBySlug, summaries });
  const article = (slug: string) => plan.articles.find((item) => item.slug === slug)!;
  afterAll(() => rmSync(fixtureRoot, { recursive: true, force: true }));

  it("validates a synthetic source bundle with consistent manifest, inventory, and Markdown", () => {
    expect(plan.articles).toHaveLength(4);
    expect(new Set(plan.articles.map(({ slug }) => slug)).size).toBe(4);
    expect(plan.inconsistencies).toEqual([]);
  });

  it("uses stable contributor identity and deduplicates repeat appearances", () => {
    const writer = plan.contributors.find(({ slug }) => slug === "writer-one")!;
    expect(writer.sourceId).toBe("sbr-contributor-writer-one");
    expect(writer.sourceArticleIds).toHaveLength(2);
  });

  it("parses typographic and straight graduation years", () => {
    expect(parseGraduationYear("Evan Tan ’28")).toEqual({ name: "Evan Tan", graduationYear: 2028 });
    expect(parseGraduationYear("Areg Devoyans '26")).toEqual({ name: "Areg Devoyans", graduationYear: 2026 });
  });

  it("rejects missing author metadata from import readiness", () => {
    expect(getArticleBlockers(article("fixture-article-03"))).toContain("contributors: author decision required");
  });

  it("warns rather than inventing exact dates for month-only sources", () => {
    const item = article("fixture-article-01");
    expect(item.sourcePublicationDate).toBe("2025-03");
    expect(item.publicationMonth).toBe("2025-03");
    expect(item.publicationMonthDisplay).toBe("March 2025");
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
    expect(article("fixture-article-01").contributorSourceIds).toEqual([
      "sbr-contributor-writer-one",
      "sbr-contributor-writer-two",
    ]);
  });

  it("normalizes mechanical extraction defects while preserving footnote text", () => {
    const result = normalizeBody("Title\n\n**By Writer**\n\nParagraph with footnote.1\n\n7\n\nSecond paragraph.", "Title", ["Writer"]);
    expect(result.blocks).toEqual([
      { type: "paragraph", text: "Paragraph with footnote.1" },
      { type: "paragraph", text: "Second paragraph." },
    ]);
  });

  it("maps every manuscript marker to a distinct occurrence while reusing one Source key", () => {
    const extracted = extractStructuredSources("A material claim.1\n\n1\nNicci Mattey, “Mass Deportation in the U.S.: Explainer.”");
    expect(extracted.sources).toEqual([{ key: "source-1", citation: "Nicci Mattey, “Mass Deportation in the U.S.: Explainer.”" }]);
    expect(extracted.bodySource).not.toContain("Nicci Mattey");
    const blocks = mapInlineFootnotes([{ type: "paragraph", text: "A material claim.1 Repeated evidence.1" }], extracted.sources);
    expect(blocks).toEqual([{ type: "paragraph", text: "A material claim. Repeated evidence.", content: [
      { text: "A material claim.", sourceKey: "source-1" },
      { text: " Repeated evidence.", sourceKey: "source-1" },
    ] }]);
    const [portable] = portableBody(blocks);
    expect(portable.children.filter((child: { _type: string }) => child._type === "footnoteReference")).toMatchObject([
      { sourceKey: "source-1" },
      { sourceKey: "source-1" },
    ]);
  });

  it("stages citations as cursor-style inline footnote objects without visible numbers", () => {
    const [block] = portableBody([{ type: "paragraph", text: "Claim.", content: [{ text: "Claim. ", sourceKey: "source-1" }] }]);
    expect(block).toMatchObject({ markDefs: [], children: [
      { _type: "span", text: "Claim.", marks: [] },
      { _type: "footnoteReference", sourceKey: "source-1" },
    ] });
    expect(JSON.stringify(block)).not.toContain('"number"');
  });

  it("keeps configured source-recovery and unfinished items held", () => {
    expect(article("fixture-article-03").readiness).toBe("sourceRecoveryHold");
    expect(article("fixture-article-04").readiness).toBe("unfinishedDraft");
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
    expect(plan.pilotSourceIds).toHaveLength(2);
    expect(Object.values(plan.pilotBlockers).flat()).toHaveLength(2);
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
    type ActionPayload = { attributes: { _type: string; publicationMonth?: string; contributors?: Array<{ _ref: string }>; featuredImage?: unknown } };
    const payloads: ActionPayload[] = action.mock.calls.map((call) => call[0] as ActionPayload);
    const firstArticle = payloads.findIndex(({ attributes }) => attributes._type === "article");
    expect(payloads.slice(0, firstArticle).every(({ attributes }) => attributes._type === "contributor")).toBe(true);
    expect(payloads.slice(firstArticle).every(({ attributes }) => attributes._type === "article")).toBe(true);
    expect(payloads[firstArticle].attributes.publicationMonth).toBe("2025-03");
    expect(payloads[firstArticle].attributes.contributors?.map(({ _ref }) => _ref)).toEqual(approvedArticles.find(({ slug }) => slug === "fixture-article-01")?.contributorSourceIds);
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

  it.skipIf(!existsSync(join(BUNDLE_ROOT, "migration_manifest.json")))("validates the supplied local archive when it is available", () => {
    const localPlan = buildMigrationPlan();
    expect(localPlan.articles).toHaveLength(8);
    expect(localPlan.inconsistencies).toEqual([]);
  });
});
