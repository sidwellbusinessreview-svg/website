import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createDraftId } from "@sanity/id-utils";
import type { SanityClient } from "next-sanity";

export const BUNDLE_ROOT = resolve("migration-input/SBR_All_Articles_Migration_Bundle");
export const STAGING_ROOT = resolve("migration-staging/sbr-archive-2026-08");
export const IMPORT_BATCH_ID = "sbr-archive-2026-08-pilot-01";
export const CONFIRMATION_PHRASE = "IMPORT SBR PILOT AS DRAFTS";
export const ROLLBACK_CONFIRMATION_PHRASE = "ROLL BACK SBR PILOT DRAFTS";
export const EXPECTED_DATASET = "production";

type Frontmatter = {
  title: string; slug: string; authors: string[]; date: string | null; section: string;
  migrationStatus: string; sourcePdf: string; issuePages: number[];
};
export type StagedContributor = {
  sourceId: string; name: string; slug: string; graduationYear?: number; role?: string;
  active: true; sourceArticleIds: string[]; identityWarnings: string[];
};
export type StagedBlock =
  | { type: "paragraph"; text: string; content?: Array<{ text: string; sourceKey?: string }> }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "orderedList" | "unorderedList"; items: string[] }
  | { type: "link"; label: string; href: string };
export type StagedArticle = {
  sourceId: string; title: string; slug: string; subtitle?: string;
  proposedSummary: { text: string; needsEditorialReview: true; checksum: string; approved: boolean };
  contributorSourceIds: string[]; originalAuthors: string[];
  publicationMonth: string | null; sourcePublicationDate: string | null; publicationMonthDisplay: string | null;
  sources: Array<{ key: string; citation: string; url?: string }>;
  structuredBody: StagedBlock[]; featuredImage: null; imagePermissionStatus: "unresolved" | "resolved";
  possibleImageMatches: string[]; sourcePdf: string; sourcePages: number[];
  migrationStatus: string; readiness: Readiness; migrationNotes: string[];
  importBatchId: string; originalSourceChecksum: string; reviewWarnings: string[];
};
export type Readiness = "pilotCandidate" | "metadataBlocked" | "sourceRecoveryHold" | "unfinishedDraft";
type ManifestArticle = { slug: string; title: string; authors: string[]; date: string | null; status: string; source_key: string; issue_pages: number[]; notes: string[] };
type Manifest = { uniqueArticleCount: number; articles: ManifestArticle[]; sourcePriorityRules: string[] };
type InventoryRow = { title: string; authors: string; date: string; status: string; source_pdf: string; issue_pages: string };
export type MigrationPlan = {
  contributors: StagedContributor[]; articles: StagedArticle[]; inconsistencies: string[];
  pilotSourceIds: string[]; pilotBlocked: boolean; pilotBlockers: Record<string, string[]>;
  rollbackMappings: Array<{ sourceId: string; sanityId: string; draftId: string; type: "contributor" | "article" }>;
};
type Approval = { summaryChecksum: string; approved: boolean; approvedBy: string | null; approvedAt: string | null };
type ApprovalFile = { version: 1; articles: Record<string, Approval> };

export function getArticleBlockers(article: StagedArticle): string[] {
  const blockers: string[] = [];
  if (!article.title.trim()) blockers.push("title: required");
  if (!article.proposedSummary.text.trim()) blockers.push("summary: required");
  if (article.proposedSummary.text.length > 300) blockers.push("summary: exceeds 300 characters");
  if (!article.contributorSourceIds.length) blockers.push("contributors: author decision required");
  if (!article.publicationMonth) blockers.push("publicationMonth: required");
  if (article.featuredImage && article.imagePermissionStatus !== "resolved") blockers.push("featuredImage: permission and metadata unresolved");
  if (article.readiness === "sourceRecoveryHold") blockers.push("body: trustworthy ending unavailable");
  if (article.readiness === "unfinishedDraft") blockers.push("body: unfinished; authorship confirmation required");
  return blockers;
}

const readinessBySlug: Record<string, Readiness> = {
  "economic-implications-trumps-mass-deportations": "pilotCandidate",
  "trump-memecoin-guy-down-the-street": "pilotCandidate",
  "environmental-economic-perspective-ai": "pilotCandidate",
  "archive-shohei-ohtani-contract-prediction": "pilotCandidate",
  "effects-russo-ukraine-war": "metadataBlocked",
  "business-of-nil-deals": "metadataBlocked",
  "opinion-wall-street-single-family-homes": "sourceRecoveryHold",
  "nfl-salary-cap-inflation-free-agency": "unfinishedDraft",
};

const summaries: Record<string, string> = {
  "economic-implications-trumps-mass-deportations": "An analysis of how mass deportation proposals could affect labor markets, consumer demand, agriculture, construction, prices, and economic growth.",
  "opinion-wall-street-single-family-homes": "An argument against large financial firms purchasing single-family homes and the effects that ownership may have on housing access.",
  "trump-memecoin-guy-down-the-street": "An examination of the launch, market activity, and ethical questions surrounding Donald Trump’s memecoin.",
  "environmental-economic-perspective-ai": "An analysis of artificial intelligence’s environmental demands and its potential economic benefits and costs.",
  "nfl-salary-cap-inflation-free-agency": "An examination of how salary cap growth affects NFL free agency, team spending, and player contracts.",
  "effects-russo-ukraine-war": "An analysis of the war’s effects on inflation, energy, food, trade, supply chains, investment, and economic growth.",
  "business-of-nil-deals": "An overview of how name, image, and likeness compensation is changing college athletics, advertising, recruiting, and athlete-brand partnerships.",
  "archive-shohei-ohtani-contract-prediction": "A prediction and analysis of the market forces that could shape Shohei Ohtani’s contract.",
};

export function summaryChecksum(value: string): string { return checksum(value); }

function existingApprovals(): ApprovalFile {
  const path = join(STAGING_ROOT, "editor-approvals.json");
  if (!existsSync(path)) return { version: 1, articles: {} };
  try { return JSON.parse(readFileSync(path, "utf8")) as ApprovalFile; }
  catch { return { version: 1, articles: {} }; }
}

export function approvalFor(sourceIdValue: string, summary: string, approvals: ApprovalFile): Approval {
  const checksumValue = summaryChecksum(summary);
  const prior = approvals.articles[sourceIdValue];
  if (prior?.summaryChecksum === checksumValue && prior.approved && prior.approvedBy?.trim() && prior.approvedAt?.trim()) return prior;
  return { summaryChecksum: checksumValue, approved: false, approvedBy: null, approvedAt: null };
}

function monthDisplay(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T12:00:00Z`));
}

export function extractStructuredSources(bodySource: string): { bodySource: string; sources: Array<{ key: string; citation: string }> } {
  const lines = bodySource.split(/\r?\n/);
  const removed = new Set<number>();
  const byNumber = new Map<number, string>();
  const candidate = (value: string) => value.length >= 8 && value.length <= 320 && /[“"][^”"]+[”"]/.test(value);
  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].trim().match(/^(\d{1,2})$/);
    if (!match) continue;
    const numberValue = Number(match[1]);
    const neighbors = [index + 1, index - 1].filter((position) => position >= 0 && position < lines.length && candidate(lines[position].trim()));
    const citationIndex = neighbors[0];
    if (citationIndex !== undefined) {
      byNumber.set(numberValue, lines[citationIndex].trim());
      removed.add(citationIndex);
    }
    removed.add(index);
  }
  return {
    bodySource: lines.filter((_, index) => !removed.has(index)).join("\n"),
    sources: [...byNumber].sort(([a], [b]) => a - b).map(([numberValue, citation]) => ({ key: `source-${numberValue}`, citation })),
  };
}

export function mapInlineFootnotes(blocks: StagedBlock[], sources: Array<{ key: string }>): StagedBlock[] {
  const keys = new Set(sources.map(({ key }) => key));
  return blocks.map((block) => {
    if (block.type !== "paragraph") return block;
    const content: Array<{ text: string; sourceKey?: string }> = [];
    let cursor = 0;
    const pattern = /(\d{1,2})(?=\s|$|[.,;:!?])/g;
    for (const match of block.text.matchAll(pattern)) {
      const sourceKey = `source-${match[1]}`;
      if (!keys.has(sourceKey) || match.index === 0 || !/\S/.test(block.text[match.index - 1])) continue;
      const textValue = block.text.slice(cursor, match.index);
      if (textValue) content.push({ text: textValue, sourceKey });
      cursor = match.index + match[0].length;
    }
    if (!content.length) return block;
    const remainder = block.text.slice(cursor);
    if (remainder) content.push({ text: remainder });
    return { ...block, text: content.map(({ text }) => text).join(""), content };
  });
}

export function slugify(value: string): string {
  return value.normalize("NFKD").replace(/[’']/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

export function parseGraduationYear(value: string): { name: string; graduationYear?: number } {
  const match = value.trim().match(/^(.*?)\s+[’'](\d{2})$/);
  if (!match) return { name: value.trim() };
  const short = Number(match[2]);
  return { name: match[1].trim(), graduationYear: 2000 + short };
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "null") return null;
  if (trimmed.startsWith("[") || trimmed.startsWith("\"")) return JSON.parse(trimmed.replaceAll("’", "’"));
  return trimmed;
}

export function parseMarkdownSource(source: string): { frontmatter: Frontmatter; bodySource: string; notes: string[] } {
  const parts = source.split(/^---\s*$/m);
  if (parts.length < 3) throw new Error("Markdown source is missing frontmatter.");
  const data: Record<string, unknown> = {};
  for (const line of parts[1].split("\n")) {
    const match = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (match) data[match[1]] = parseScalar(match[2]);
  }
  const articlePart = parts.slice(2).join("---");
  const sourceMarker = "## Source-derived text";
  const notesMarker = "## Migration notes";
  const bodyStart = articlePart.indexOf(sourceMarker);
  const notesStart = articlePart.indexOf(notesMarker);
  if (bodyStart < 0 || notesStart < 0) throw new Error("Markdown source is missing migration section markers.");
  const bodySource = articlePart.slice(bodyStart + sourceMarker.length, notesStart).trim();
  const notes = articlePart.slice(notesStart + notesMarker.length).split("\n").map((line) => line.replace(/^\s*-\s*/, "").trim()).filter(Boolean);
  return { frontmatter: data as unknown as Frontmatter, bodySource, notes };
}

export function normalizeBody(bodySource: string, title: string, authors: string[]): { blocks: StagedBlock[]; warnings: string[] } {
  const warnings: string[] = [];
  const authorNames = authors.map((author) => parseGraduationYear(author).name);
  const bylinePatterns = [
    /^\*\*By .*\*\*$/i,
    new RegExp(`^By\\s+${authorNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(?:,|,? and)\\s*")}$`, "i"),
  ];
  const rawLines = bodySource.split(/\r?\n/);
  const lines: string[] = [];
  let removedTitle = false;
  for (const raw of rawLines) {
    const line = raw.replace(/\u200b/g, "").trim();
    if (!line) { lines.push(""); continue; }
    if (/^The text below is extracted from the supplied PDF\./.test(line)) continue;
    if (!removedTitle && line === title) { removedTitle = true; continue; }
    if (bylinePatterns.some((pattern) => pattern.test(line))) continue;
    if (/^\d+$/.test(line)) continue;
    lines.push(line);
  }

  const blocks: StagedBlock[] = [];
  let paragraph: string[] = [];
  let list: { type: "orderedList" | "unorderedList"; items: string[] } | undefined;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };
  const flushList = () => { if (list?.items.length) blocks.push(list); list = undefined; };
  for (const line of lines) {
    if (!line) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); blocks.push({ type: "heading", level: heading[1].length as 2 | 3, text: heading[2] }); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      const type = bullet ? "unorderedList" : "orderedList";
      if (list && list.type !== type) flushList();
      list ??= { type, items: [] };
      list.items.push((bullet ?? ordered)![1]);
      continue;
    }
    if (/^https?:\/\/\S+$/.test(line)) { flushParagraph(); flushList(); blocks.push({ type: "link", label: line, href: line }); continue; }
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  if (blocks.some((block) => block.type === "paragraph" && /outline|drafting note|add more/i.test(block.text))) warnings.push("Possible outline or drafting-note text was preserved for editorial review.");
  return { blocks, warnings };
}

function parseCsv(source: string): InventoryRow[] {
  const rows = source.trim().split(/\r?\n/).map((line) => {
    const cells: string[] = []; let cell = ""; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
      else cell += char;
    }
    cells.push(cell); return cells;
  });
  const headers = rows.shift()!;
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])) as unknown as InventoryRow);
}

function checksum(source: string | Buffer): string { return createHash("sha256").update(source).digest("hex"); }
function sourceId(type: "article" | "contributor", slug: string): string { return `sbr-${type}-${slug}`; }

export function buildMigrationPlan(): MigrationPlan {
  const approvals = existingApprovals();
  const manifest = JSON.parse(readFileSync(join(BUNDLE_ROOT, "migration_manifest.json"), "utf8")) as Manifest;
  const inventory = parseCsv(readFileSync(join(BUNDLE_ROOT, "article_inventory.csv"), "utf8"));
  const files = manifest.articles.map((_, index) => join(BUNDLE_ROOT, "articles", `${String(index + 1).padStart(2, "0")}-${[
    "economic-implications-trumps-mass-deportations", "opinion-wall-street-single-family-homes", "trump-memecoin-guy-down-the-street",
    "environmental-economic-perspective-ai", "nfl-salary-cap-inflation-free-agency", "effects-russo-ukraine-war",
    "business-of-nil-deals", "archive-shohei-ohtani-contract-prediction",
  ][index]}.md`));
  const inconsistencies: string[] = [];
  if (manifest.uniqueArticleCount !== 8 || files.length !== 8 || inventory.length !== 8) inconsistencies.push("Bundle sources do not all report eight Articles.");
  const contributorMap = new Map<string, StagedContributor>();
  const articles = files.map((file, index): StagedArticle => {
    const source = readFileSync(file, "utf8");
    const parsed = parseMarkdownSource(source);
    const meta = parsed.frontmatter;
    const manifestEntry = manifest.articles[index];
    const inventoryEntry = inventory[index];
    for (const [field, left, right] of [
      ["title", meta.title, manifestEntry.title], ["slug", meta.slug, manifestEntry.slug], ["date", meta.date, manifestEntry.date],
      ["status", meta.migrationStatus, manifestEntry.status],
    ] as const) if (left !== right) inconsistencies.push(`${meta.slug}: Markdown ${field} differs from manifest.`);
    if (JSON.stringify(meta.authors) !== JSON.stringify(manifestEntry.authors)) inconsistencies.push(`${meta.slug}: Markdown authors differ from manifest.`);
    if (inventoryEntry.title !== meta.title) inconsistencies.push(`${meta.slug}: inventory title differs from Markdown.`);
    if (inventoryEntry.status !== meta.migrationStatus) inconsistencies.push(`${meta.slug}: inventory status differs from Markdown.`);
    const inventoryDate = !inventoryEntry.date || inventoryEntry.date === "UNKNOWN" ? null : inventoryEntry.date;
    const inventoryAuthors = !inventoryEntry.authors || inventoryEntry.authors === "UNKNOWN" ? [] : inventoryEntry.authors.split(";").map((author) => author.trim()).filter(Boolean);
    const inventoryPages = inventoryEntry.issue_pages ? inventoryEntry.issue_pages.split(",").map(Number).filter(Number.isFinite) : [];
    if (inventoryDate !== meta.date) inconsistencies.push(`${meta.slug}: inventory date differs from Markdown.`);
    if (inventoryAuthors.join("|") !== meta.authors.join("|")) inconsistencies.push(`${meta.slug}: inventory authors differ from Markdown.`);
    if (inventoryPages.join(",") !== meta.issuePages.join(",")) inconsistencies.push(`${meta.slug}: inventory issue pages differ from Markdown.`);
    if (inventoryEntry.source_pdf !== basename(meta.sourcePdf)) inconsistencies.push(`${meta.slug}: inventory source PDF differs from Markdown.`);
    const articleSourceId = sourceId("article", meta.slug);
    const contributorSourceIds = meta.authors.map((author) => {
      const parsedAuthor = parseGraduationYear(author); const slug = slugify(parsedAuthor.name); const id = sourceId("contributor", slug);
      const existing = contributorMap.get(id);
      if (existing) {
        if (!existing.sourceArticleIds.includes(articleSourceId)) existing.sourceArticleIds.push(articleSourceId);
        if (existing.graduationYear && parsedAuthor.graduationYear && existing.graduationYear !== parsedAuthor.graduationYear) existing.identityWarnings.push("Conflicting graduation years require review.");
      } else contributorMap.set(id, { sourceId: id, name: parsedAuthor.name, slug, ...(parsedAuthor.graduationYear ? { graduationYear: parsedAuthor.graduationYear } : {}), active: true, sourceArticleIds: [articleSourceId], identityWarnings: meta.slug === "nfl-salary-cap-inflation-free-agency" ? ["Authorship is inferred from a filename and is not proven by the document."] : [] });
      return id;
    });
    const extracted = extractStructuredSources(parsed.bodySource);
    const normalized = normalizeBody(extracted.bodySource, meta.title, meta.authors);
    const structuredBody = mapInlineFootnotes(normalized.blocks, extracted.sources);
    const readiness = readinessBySlug[meta.slug];
    const reviewWarnings = [...normalized.warnings];
    if (!meta.authors.length) reviewWarnings.push("Author is unresolved; do not invent a staff byline.");
    if (!meta.date) reviewWarnings.push("Publication month is unresolved.");
    if (readiness === "sourceRecoveryHold") reviewWarnings.push("Source ending is untrustworthy; preserve but do not import.");
    if (readiness === "unfinishedDraft") reviewWarnings.push("Outline notes and inferred authorship require editorial completion and confirmation.");
    const sourcePublicationDate = meta.date;
    const publicationMonth = sourcePublicationDate;
    const proposedText = summaries[meta.slug];
    const approval = approvalFor(articleSourceId, proposedText, approvals);
    return {
      sourceId: articleSourceId, title: meta.title, slug: meta.slug,
      proposedSummary: { text: proposedText, needsEditorialReview: true, checksum: approval.summaryChecksum, approved: approval.approved }, contributorSourceIds, originalAuthors: meta.authors,
      publicationMonth, sourcePublicationDate, publicationMonthDisplay: sourcePublicationDate ? monthDisplay(sourcePublicationDate) : null,
      structuredBody, sources: extracted.sources, featuredImage: null, imagePermissionStatus: "unresolved",
      possibleImageMatches: meta.issuePages.length ? ["Review extracted March issue images against rendered source pages; no automatic match approved."] : [],
      sourcePdf: meta.sourcePdf, sourcePages: meta.issuePages, migrationStatus: meta.migrationStatus, readiness,
      migrationNotes: parsed.notes, importBatchId: IMPORT_BATCH_ID, originalSourceChecksum: checksum(source), reviewWarnings,
    };
  });
  const contributors = [...contributorMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const pilot = articles.filter((article) => article.readiness === "pilotCandidate");
  const pilotBlockers = Object.fromEntries(pilot.map((article) => [article.sourceId, [
    ...getArticleBlockers(article),
    ...(!article.proposedSummary.approved ? ["summary: current checksum is not editor-approved"] : []),
  ]]));
  const rollbackMappings = [
    ...contributors.filter((contributor) => pilot.some((article) => article.contributorSourceIds.includes(contributor.sourceId))).map((contributor) => ({ sourceId: contributor.sourceId, sanityId: contributor.sourceId, draftId: createDraftId(contributor.sourceId), type: "contributor" as const })),
    ...pilot.map((article) => ({ sourceId: article.sourceId, sanityId: article.sourceId, draftId: createDraftId(article.sourceId), type: "article" as const })),
  ];
  return { contributors, articles, inconsistencies, pilotSourceIds: pilot.map(({ sourceId }) => sourceId), pilotBlocked: Object.values(pilotBlockers).some((items) => items.length), pilotBlockers, rollbackMappings };
}

function markdownTable(headers: string[], rows: string[][]): string {
  return `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map((row) => `| ${row.join(" | ")} |`).join("\n")}\n`;
}
function writeJson(path: string, value: unknown) { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`); }
function reportPath(name: string) { return join(STAGING_ROOT, "reports", name); }

export function writeStaging(plan: MigrationPlan): void {
  mkdirSync(join(STAGING_ROOT, "reports"), { recursive: true });
  writeJson(join(STAGING_ROOT, "contributors.json"), plan.contributors);
  writeJson(join(STAGING_ROOT, "articles.json"), plan.articles);
  const priorApprovals = existingApprovals();
  const approvals: ApprovalFile = { version: 1, articles: Object.fromEntries(plan.articles.map((article) => [article.sourceId, approvalFor(article.sourceId, article.proposedSummary.text, priorApprovals)])) };
  writeJson(join(STAGING_ROOT, "editor-approvals.json"), approvals);
  writeJson(join(STAGING_ROOT, "rollback-map.json"), plan.rollbackMappings);
  const pilot = plan.articles.filter((article) => article.readiness === "pilotCandidate");
  writeJson(join(STAGING_ROOT, "pilot-batch.json"), {
    batchId: IMPORT_BATCH_ID, applyAllowed: !plan.pilotBlocked, blocked: plan.pilotBlocked, blockers: plan.pilotBlockers,
    contributorSourceIds: [...new Set(pilot.flatMap((article) => article.contributorSourceIds))], articleSourceIds: plan.pilotSourceIds,
    creationOrder: ["contributors", "articles"], documentState: "draft", images: [],
    articles: pilot.map((article) => ({
      sourceId: article.sourceId, draftId: createDraftId(article.sourceId), title: article.title, slug: article.slug,
      proposedSummary: article.proposedSummary.text, summaryChecksum: article.proposedSummary.checksum,
      summaryApproved: article.proposedSummary.approved, contributorSourceIds: article.contributorSourceIds,
      publicationMonth: article.publicationMonth,
      sourcePublicationDate: article.sourcePublicationDate, structuredBody: article.structuredBody,
      sourceDocumentChecksum: article.originalSourceChecksum, importBatchId: article.importBatchId,
      rollback: plan.rollbackMappings.find(({ sourceId: id }) => id === article.sourceId),
    })),
  });
  writeJson(join(STAGING_ROOT, "dry-run.json"), { mutationCount: 0, wouldCreate: plan.rollbackMappings, pilotBlocked: plan.pilotBlocked, blockers: plan.pilotBlockers });
  writeFileSync(reportPath("BUNDLE_VALIDATION.md"), `# Bundle validation report\n\nArticles detected: ${plan.articles.length}\n\nInconsistencies: ${plan.inconsistencies.length ? plan.inconsistencies.map((item) => `\n- ${item}`).join("") : "none"}\n`);
  writeFileSync(reportPath("CONTRIBUTOR_MAPPING.md"), `# Contributor mapping report\n\n${markdownTable(["Source ID", "Name", "Slug", "Graduation year", "Source Articles", "Warnings"], plan.contributors.map((item) => [item.sourceId, item.name, item.slug, String(item.graduationYear ?? "unresolved"), item.sourceArticleIds.join("<br>"), item.identityWarnings.join("; ") || "none"]))}`);
  writeFileSync(reportPath("ARTICLE_READINESS.md"), `# Article readiness report\n\n${markdownTable(["Article", "Readiness", "Source status", "Date", "Import blockers"], plan.articles.map((item) => [item.title, item.readiness, item.migrationStatus, item.sourcePublicationDate ?? "unknown", [...getArticleBlockers(item), ...(!item.proposedSummary.approved ? ["summary: current checksum not approved"] : [])].join("; ") || "none"]))}`);
  writeFileSync(reportPath("PROPOSED_SUMMARIES.md"), `# Proposed-summary review report\n\nPublic summaries describe content only. Internal status is listed separately.\n\n${plan.articles.map((item) => `## ${item.title}\n\n${item.proposedSummary.text}\n\n- Characters: ${item.proposedSummary.text.length}\n- Approval: ${item.proposedSummary.approved ? "approved" : "not approved"}\n- Summary checksum: \`${item.proposedSummary.checksum}\`\n\n### Internal migration status\n\n- Readiness: ${item.readiness}\n- Source status: ${item.migrationStatus}\n- Warnings: ${item.reviewWarnings.join("; ") || "none"}\n`).join("\n")}`);
  writeFileSync(reportPath("DATE_RESOLUTION.md"), `# Publication-month report\n\nArticles store canonical YYYY-MM and readers see Month Year. Completely missing months remain blocked. No sorting day is created.\n\n${markdownTable(["Article", "Original source", "Publication month", "Display"], plan.articles.map((item) => [item.title, item.sourcePublicationDate ?? "unknown", item.publicationMonth ?? "blocked", item.publicationMonthDisplay ?? "blocked"]))}`);
  writeFileSync(reportPath("IMAGE_REVIEW.md"), `# Image-review report\n\nNo assets were uploaded or assigned. All Articles may remain image-free. Rendered issue pages are not featured images.\n\n${markdownTable(["Article", "Possible match", "Permission", "Required decision"], plan.articles.map((item) => [item.title, item.possibleImageMatches.join("; ") || "none identified", item.imagePermissionStatus, "Confirm mapping, alt text, caption, credit, and reuse permission before upload"]))}`);
  writeFileSync(reportPath("DRY_RUN.md"), `# Dry-run report\n\nSanity mutations performed: **0**\n\nPilot status: **${plan.pilotBlocked ? "BLOCKED" : "READY"}**\n\nWould create ${plan.rollbackMappings.filter((item) => item.type === "contributor").length} Contributor drafts before ${plan.rollbackMappings.filter((item) => item.type === "article").length} Article drafts. Published conflicts must abort apply.\n\n${Object.entries(plan.pilotBlockers).map(([id, blockers]) => `- ${id}: ${blockers.join("; ") || "none"}`).join("\n")}\n`);
  writeFileSync(reportPath("PILOT_BATCH.md"), `# Pilot-batch manifest\n\nBatch: ${IMPORT_BATCH_ID}\n\nThe four candidates remain draft-only and the batch is blocked until every current summary checksum is explicitly approved.\n\n${pilot.map((item) => `- ${item.title} (${item.sourceId}) — ${item.publicationMonthDisplay}; summary ${item.proposedSummary.approved ? "approved" : "not approved"}`).join("\n")}\n`);
  writeFileSync(reportPath("HOLD_LIST.md"), `# Hold-list report\n\n${plan.articles.filter((item) => item.readiness !== "pilotCandidate").map((item) => `- **${item.title}** — ${item.readiness}: ${getArticleBlockers(item).join("; ")}`).join("\n")}\n`);
}

export function assertApplyGuards(options: { apply: boolean; confirmation?: string; plan: MigrationPlan }): void {
  if (!options.apply) throw new Error("Apply flag is required.");
  if (options.confirmation !== CONFIRMATION_PHRASE) throw new Error(`Typed confirmation phrase is required: ${CONFIRMATION_PHRASE}`);
  if (options.plan.pilotBlocked) throw new Error("Pilot batch is blocked by unresolved required fields.");
}

export function verifyBackup(path: string | undefined, expectedProject: string, expectedDataset: string): void {
  if (!path || !existsSync(path) || statSync(path).size === 0) throw new Error("A non-empty verified dataset backup file is required.");
  const manifestPath = `${path}.manifest.json`;
  if (!existsSync(manifestPath)) throw new Error("The backup manifest is required beside the export file.");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { projectId?: string; dataset?: string; checksum?: string };
  if (manifest.projectId !== expectedProject || manifest.dataset !== expectedDataset) throw new Error("Backup target does not match the expected Sanity project and dataset.");
  if (!manifest.checksum || manifest.checksum !== checksum(readFileSync(path))) throw new Error("Backup checksum does not match its verification manifest.");
}

export function selectRollbackRecords(records: Array<{ _id: string; importBatchId?: string }>) {
  if (records.some((record) => record.importBatchId !== IMPORT_BATCH_ID)) throw new Error("Rollback selection contains a document outside the selected migration batch.");
  return records;
}

export function portableBody(blocks: StagedBlock[]) {
  return blocks.map((block, index) => block.type === "paragraph" ? {
    _type: "block", _key: `p${index}`, style: "normal",
    markDefs: [],
    children: block.content?.flatMap((span, spanIndex) => [
      { _type: "span", _key: `s${index}-${spanIndex}`, text: span.sourceKey ? span.text.replace(/\s+$/, "") : span.text, marks: [] },
      ...(span.sourceKey ? [{ _type: "footnoteReference", _key: `fn${index}-${spanIndex}`, sourceKey: span.sourceKey }] : []),
    ]) ?? [{ _type: "span", _key: `s${index}`, text: block.text, marks: [] }],
  }
    : block.type === "heading" ? { _type: "block", _key: `h${index}`, style: `h${block.level}`, markDefs: [], children: [{ _type: "span", _key: `s${index}`, text: block.text, marks: [] }] }
    : block.type === "link" ? { _type: "block", _key: `l${index}`, style: "normal", markDefs: [{ _type: "link", _key: `m${index}`, href: block.href }], children: [{ _type: "span", _key: `s${index}`, text: block.label, marks: [`m${index}`] }] }
    : block.items.map((textValue, itemIndex) => ({ _type: "block", _key: `li${index}-${itemIndex}`, style: "normal", listItem: block.type === "orderedList" ? "number" : "bullet", level: 1, markDefs: [], children: [{ _type: "span", _key: `s${index}-${itemIndex}`, text: textValue, marks: [] }] }))
  ).flat();
}

type MigrationClient = {
  fetch: (query: string, params?: Record<string, unknown>) => Promise<Array<{ _id: string; _type: string; slug?: string }>>;
  action: SanityClient["action"];
  delete?: SanityClient["delete"];
};

export async function applyPilot(options: { client: MigrationClient; plan: MigrationPlan; projectId: string; dataset: string; expectedProject: string; backupPath: string; confirmation?: string; apply: boolean }) {
  assertApplyGuards({ apply: options.apply, confirmation: options.confirmation, plan: options.plan });
  if (options.projectId !== options.expectedProject) throw new Error("Unexpected Sanity project.");
  if (options.dataset !== EXPECTED_DATASET) throw new Error("Unexpected Sanity dataset.");
  verifyBackup(options.backupPath, options.expectedProject, EXPECTED_DATASET);
  const pilotArticles = options.plan.articles.filter(({ sourceId: id }) => options.plan.pilotSourceIds.includes(id));
  if (pilotArticles.some(({ proposedSummary }) => !proposedSummary.approved)) throw new Error("Every pilot summary must be approved against its current checksum.");
  const existing = await options.client.fetch('*[_id in $ids || (_type == "article" && slug.current in $slugs)]{_id,_type,"slug":slug.current}', { ids: options.plan.rollbackMappings.flatMap(({ sanityId, draftId }) => [sanityId, draftId]), slugs: pilotArticles.map(({ slug }) => slug) });
  const actions = planIdempotentActions(existing, options.plan);
  const foreignSlug = existing.find((record) => record.slug && pilotArticles.some((article) => article.slug === record.slug) && !options.plan.rollbackMappings.some(({ sanityId, draftId }) => record._id === sanityId || record._id === draftId));
  if (foreignSlug) throw new Error(`Published slug conflict: ${foreignSlug.slug}`);
  const contributorById = new Map(options.plan.contributors.map((item) => [item.sourceId, item]));
  for (const mapping of actions) {
    const contributor = contributorById.get(mapping.sourceId);
    const article = pilotArticles.find(({ sourceId: id }) => id === mapping.sourceId);
    const attributes = contributor ? { _id: mapping.draftId, _type: "contributor", name: contributor.name, slug: { _type: "slug", current: contributor.slug }, graduationYear: contributor.graduationYear, role: contributor.role, active: contributor.active, migrationSourceId: contributor.sourceId, importBatchId: IMPORT_BATCH_ID }
      : article ? { _id: mapping.draftId, _type: "article", title: article.title, slug: { _type: "slug", current: article.slug }, summary: article.proposedSummary.text, contributors: article.contributorSourceIds.map((_ref, index) => ({ _type: "reference", _key: `c${index}`, _ref })), publicationMonth: article.publicationMonth, sources: article.sources.map((source) => ({ _type: "articleSource", _key: source.key, citation: source.citation, url: source.url })), body: portableBody(article.structuredBody), pinned: false, migrationSourceId: article.sourceId, importBatchId: IMPORT_BATCH_ID }
      : undefined;
    if (!attributes) throw new Error(`Missing staged document for ${mapping.sourceId}`);
    await options.client.action({ actionType: "sanity.action.document.create", publishedId: mapping.sanityId, attributes, ifExists: "fail" });
  }
  return actions;
}

export function planIdempotentActions(existing: Array<{ _id: string; _type: string }>, plan: MigrationPlan) {
  const byId = new Map(existing.map((doc) => [doc._id, doc]));
  const conflicts = plan.rollbackMappings.filter(({ sanityId }) => byId.has(sanityId));
  if (conflicts.length) throw new Error(`Published-document conflict: ${conflicts.map(({ sanityId }) => sanityId).join(", ")}`);
  const wrongType = plan.rollbackMappings.filter(({ draftId, type }) => byId.has(draftId) && byId.get(draftId)?._type !== type);
  if (wrongType.length) throw new Error(`Draft-document type conflict: ${wrongType.map(({ draftId }) => draftId).join(", ")}`);
  return plan.rollbackMappings.filter(({ draftId }) => !byId.has(draftId));
}

export async function main(argv = process.argv.slice(2)) {
  if (!existsSync(BUNDLE_ROOT)) throw new Error(`Migration bundle not found: ${BUNDLE_ROOT}`);
  const plan = buildMigrationPlan();
  writeStaging(plan);
  const apply = argv.includes("--apply");
  const rollback = argv.includes("--rollback");
  if (rollback) {
    const rollbackApply = argv.includes("--rollback-apply");
    writeJson(join(STAGING_ROOT, "rollback-dry-run.json"), { batchId: IMPORT_BATCH_ID, mutationCount: 0, selectedDraftIds: plan.rollbackMappings.map(({ draftId }) => draftId) });
    if (!rollbackApply) { console.log(`Rollback dry run complete. Sanity mutations: 0. Batch: ${IMPORT_BATCH_ID}.`); return; }
    if (process.env.SBR_MIGRATION_ROLLBACK_CONFIRMATION !== ROLLBACK_CONFIRMATION_PHRASE) throw new Error(`Typed rollback confirmation is required: ${ROLLBACK_CONFIRMATION_PHRASE}`);
    const environment = (await import("../../src/sanity/env")).getSanityEnvironment();
    const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
    const expectedProject = argv.find((value) => value.startsWith("--expect-project="))?.slice("--expect-project=".length);
    if (!environment.configured || !token || expectedProject !== environment.projectId || environment.dataset !== EXPECTED_DATASET) throw new Error("Rollback apply target or write-token configuration is invalid.");
    const { createClient } = await import("next-sanity");
    const client = createClient({ projectId: environment.projectId, dataset: environment.dataset, apiVersion: environment.apiVersion, useCdn: false, token, perspective: "raw" });
    const selected = await client.fetch<Array<{ _id: string; importBatchId?: string }>>('*[_id in $ids]{_id,importBatchId}', { ids: plan.rollbackMappings.map(({ draftId }) => draftId) });
    for (const record of selectRollbackRecords(selected)) await client.delete(record._id);
    writeJson(join(STAGING_ROOT, "rollback-applied-report.json"), { batchId: IMPORT_BATCH_ID, appliedAt: new Date().toISOString(), deletedDraftIds: selected.map(({ _id }) => _id) });
    console.log(`Rolled back ${selected.length} draft documents from batch ${IMPORT_BATCH_ID}.`);
    return;
  }
  if (argv.includes("--report")) {
    console.log(`Migration reports: ${join(STAGING_ROOT, "reports")}`);
    return;
  }
  if (apply) {
    const backupArg = argv.find((value) => value.startsWith("--backup="))?.slice("--backup=".length);
    const expectedProject = argv.find((value) => value.startsWith("--expect-project="))?.slice("--expect-project=".length);
    const environment = (await import("../../src/sanity/env")).getSanityEnvironment();
    const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
    if (!environment.configured || !token || !expectedProject || !backupArg) throw new Error("Apply requires configured Sanity, SANITY_API_WRITE_TOKEN, --expect-project, and --backup.");
    const { createClient } = await import("next-sanity");
    const client = createClient({ projectId: environment.projectId, dataset: environment.dataset, apiVersion: environment.apiVersion, useCdn: false, token, perspective: "raw" });
    const actions = await applyPilot({ client, plan, projectId: environment.projectId, dataset: environment.dataset, expectedProject, backupPath: backupArg, confirmation: process.env.SBR_MIGRATION_CONFIRMATION, apply });
    writeJson(join(STAGING_ROOT, "applied-operation-report.json"), { batchId: IMPORT_BATCH_ID, appliedAt: new Date().toISOString(), operations: actions });
    console.log(`Applied ${actions.length} draft creation actions for batch ${IMPORT_BATCH_ID}.`);
    return;
  }
  if (argv.includes("--validate")) {
    if (plan.articles.length !== 8 || new Set(plan.articles.map(({ slug }) => slug)).size !== 8 || plan.inconsistencies.length) process.exitCode = 1;
    console.log(`Migration bundle valid: ${plan.articles.length} unique Articles, ${plan.contributors.length} Contributors.`);
    console.log(`Pilot candidates: ${plan.pilotSourceIds.length}; pilot blocked: ${plan.pilotBlocked ? "yes" : "no"}.`);
    return;
  }
  console.log(`Dry run complete. Sanity mutations: 0. Pilot status: ${plan.pilotBlocked ? "BLOCKED" : "READY"}.`);
  console.log(`Staging: ${STAGING_ROOT}`);
}

if (process.argv[1]?.endsWith("sbr-archive.ts")) main().catch((error) => { console.error(error instanceof Error ? error.message : "Migration command failed."); process.exitCode = 1; });
