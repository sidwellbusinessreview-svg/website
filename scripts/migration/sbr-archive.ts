import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createDraftId } from "@sanity/id-utils";

export const BUNDLE_ROOT = resolve("migration-input/SBR_All_Articles_Migration_Bundle");
export const STAGING_ROOT = resolve("migration-staging/sbr-archive-2026-08");
export const IMPORT_BATCH_ID = "sbr-archive-2026-08-pilot-01";
export const CONFIRMATION_PHRASE = "IMPORT SBR PILOT AS DRAFTS";

type Frontmatter = {
  title: string; slug: string; authors: string[]; date: string | null; section: string;
  migrationStatus: string; sourcePdf: string; issuePages: number[];
};
export type StagedContributor = {
  sourceId: string; name: string; slug: string; graduationYear?: number; role?: string;
  active: true; sourceArticleIds: string[]; identityWarnings: string[];
};
export type StagedBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "orderedList" | "unorderedList"; items: string[] }
  | { type: "link"; label: string; href: string };
export type StagedArticle = {
  sourceId: string; title: string; slug: string; subtitle?: string;
  proposedSummary: { text: string; needsEditorialReview: true };
  contributorSourceIds: string[]; originalAuthors: string[];
  publicationDate: null; sourceDate: string | null; datePrecision: "month" | "unknown";
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

export function getArticleBlockers(article: StagedArticle): string[] {
  const blockers: string[] = [];
  if (!article.title.trim()) blockers.push("title: required");
  if (!article.proposedSummary.text.trim()) blockers.push("summary: required");
  if (article.proposedSummary.text.length > 300) blockers.push("summary: exceeds 300 characters");
  if (!article.contributorSourceIds.length) blockers.push("contributors: author decision required");
  if (!article.publicationDate) blockers.push("publicationDate: exact day unresolved");
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
  "opinion-wall-street-single-family-homes": "An opinion arguing that institutional purchases of single-family homes can reduce access to homeownership and worsen affordability for individual buyers.",
  "trump-memecoin-guy-down-the-street": "An examination of the launch, market activity, and ethical questions surrounding Donald Trump’s memecoin.",
  "environmental-economic-perspective-ai": "An analysis of artificial intelligence’s environmental demands and its potential economic benefits and costs.",
  "nfl-salary-cap-inflation-free-agency": "An unfinished exploration of NFL salary-cap growth, player compensation, and free-agency trends.",
  "effects-russo-ukraine-war": "An analysis of the war’s effects on inflation, energy, food, trade, supply chains, investment, and economic growth.",
  "business-of-nil-deals": "An overview of how name, image, and likeness compensation is changing college athletics, advertising, recruiting, and athlete-brand partnerships.",
  "archive-shohei-ohtani-contract-prediction": "An archival analysis estimating Shohei Ohtani’s contract value, followed by a retrospective note on his agreement with the Los Angeles Dodgers.",
};

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

function checksum(source: string): string { return createHash("sha256").update(source).digest("hex"); }
function sourceId(type: "article" | "contributor", slug: string): string { return `sbr-${type}-${slug}`; }

export function buildMigrationPlan(): MigrationPlan {
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
    const normalized = normalizeBody(parsed.bodySource, meta.title, meta.authors);
    const readiness = readinessBySlug[meta.slug];
    const reviewWarnings = [...normalized.warnings];
    if (!meta.authors.length) reviewWarnings.push("Author is unresolved; do not invent a staff byline.");
    if (!meta.date || /^\d{4}-\d{2}$/.test(meta.date)) reviewWarnings.push("Exact publication date is unresolved.");
    if (readiness === "sourceRecoveryHold") reviewWarnings.push("Source ending is untrustworthy; preserve but do not import.");
    if (readiness === "unfinishedDraft") reviewWarnings.push("Outline notes and inferred authorship require editorial completion and confirmation.");
    return {
      sourceId: articleSourceId, title: meta.title, slug: meta.slug,
      proposedSummary: { text: summaries[meta.slug], needsEditorialReview: true }, contributorSourceIds, originalAuthors: meta.authors,
      publicationDate: null, sourceDate: meta.date, datePrecision: meta.date ? "month" : "unknown",
      structuredBody: normalized.blocks, featuredImage: null, imagePermissionStatus: "unresolved",
      possibleImageMatches: meta.issuePages.length ? ["Review extracted March issue images against rendered source pages; no automatic match approved."] : [],
      sourcePdf: meta.sourcePdf, sourcePages: meta.issuePages, migrationStatus: meta.migrationStatus, readiness,
      migrationNotes: parsed.notes, importBatchId: IMPORT_BATCH_ID, originalSourceChecksum: checksum(source), reviewWarnings,
    };
  });
  const contributors = [...contributorMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const pilot = articles.filter((article) => article.readiness === "pilotCandidate");
  const pilotBlockers = Object.fromEntries(pilot.map((article) => [article.sourceId, getArticleBlockers(article)]));
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
  writeJson(join(STAGING_ROOT, "rollback-map.json"), plan.rollbackMappings);
  const pilot = plan.articles.filter((article) => article.readiness === "pilotCandidate");
  writeJson(join(STAGING_ROOT, "pilot-batch.json"), { batchId: IMPORT_BATCH_ID, applyAllowed: !plan.pilotBlocked, blocked: plan.pilotBlocked, blockers: plan.pilotBlockers, contributorSourceIds: [...new Set(pilot.flatMap((article) => article.contributorSourceIds))], articleSourceIds: plan.pilotSourceIds, creationOrder: ["contributors", "articles"], documentState: "draft" });
  writeJson(join(STAGING_ROOT, "dry-run.json"), { mutationCount: 0, wouldCreate: plan.rollbackMappings, pilotBlocked: plan.pilotBlocked, blockers: plan.pilotBlockers });
  writeFileSync(reportPath("BUNDLE_VALIDATION.md"), `# Bundle validation report\n\nArticles detected: ${plan.articles.length}\n\nInconsistencies: ${plan.inconsistencies.length ? plan.inconsistencies.map((item) => `\n- ${item}`).join("") : "none"}\n`);
  writeFileSync(reportPath("CONTRIBUTOR_MAPPING.md"), `# Contributor mapping report\n\n${markdownTable(["Source ID", "Name", "Slug", "Graduation year", "Source Articles", "Warnings"], plan.contributors.map((item) => [item.sourceId, item.name, item.slug, String(item.graduationYear ?? "unresolved"), item.sourceArticleIds.join("<br>"), item.identityWarnings.join("; ") || "none"]))}`);
  writeFileSync(reportPath("ARTICLE_READINESS.md"), `# Article readiness report\n\n${markdownTable(["Article", "Readiness", "Source status", "Date", "Import blockers"], plan.articles.map((item) => [item.title, item.readiness, item.migrationStatus, item.sourceDate ?? "unknown", getArticleBlockers(item).join("; ") || "none"]))}`);
  writeFileSync(reportPath("PROPOSED_SUMMARIES.md"), `# Proposed-summary review report\n\nEvery summary requires editorial review and is at most 300 characters.\n\n${plan.articles.map((item) => `## ${item.title}\n\n${item.proposedSummary.text}\n\n- needsEditorialReview: true\n- characters: ${item.proposedSummary.text.length}\n`).join("\n")}`);
  writeFileSync(reportPath("DATE_RESOLUTION.md"), `# Date-resolution report\n\nNo exact day was supplied for any Article. Choose per Article: obtain the exact date; approve a month-precision model; or approve a documented archival sorting convention that does not display an invented day.\n\n${markdownTable(["Article", "Source date", "Precision", "Status"], plan.articles.map((item) => [item.title, item.sourceDate ?? "unknown", item.datePrecision, "blocked until editor decision"]))}`);
  writeFileSync(reportPath("IMAGE_REVIEW.md"), `# Image-review report\n\nNo assets were uploaded or assigned. All Articles may remain image-free. Rendered issue pages are not featured images.\n\n${markdownTable(["Article", "Possible match", "Permission", "Required decision"], plan.articles.map((item) => [item.title, item.possibleImageMatches.join("; ") || "none identified", item.imagePermissionStatus, "Confirm mapping, alt text, caption, credit, and reuse permission before upload"]))}`);
  writeFileSync(reportPath("DRY_RUN.md"), `# Dry-run report\n\nSanity mutations performed: **0**\n\nPilot status: **${plan.pilotBlocked ? "BLOCKED" : "READY"}**\n\nWould create ${plan.rollbackMappings.filter((item) => item.type === "contributor").length} Contributor drafts before ${plan.rollbackMappings.filter((item) => item.type === "article").length} Article drafts. Published conflicts must abort apply.\n\n${Object.entries(plan.pilotBlockers).map(([id, blockers]) => `- ${id}: ${blockers.join("; ") || "none"}`).join("\n")}\n`);
  writeFileSync(reportPath("PILOT_BATCH.md"), `# Pilot-batch manifest\n\nBatch: ${IMPORT_BATCH_ID}\n\nThe four candidates remain drafts and the batch is blocked by unresolved exact dates.\n\n${pilot.map((item) => `- ${item.title} (${item.sourceId})`).join("\n")}\n`);
  writeFileSync(reportPath("HOLD_LIST.md"), `# Hold-list report\n\n${plan.articles.filter((item) => item.readiness !== "pilotCandidate").map((item) => `- **${item.title}** — ${item.readiness}: ${getArticleBlockers(item).join("; ")}`).join("\n")}\n`);
}

export function assertApplyGuards(options: { apply: boolean; confirmation?: string; plan: MigrationPlan }): void {
  if (!options.apply) throw new Error("Apply flag is required.");
  if (options.confirmation !== CONFIRMATION_PHRASE) throw new Error(`Typed confirmation phrase is required: ${CONFIRMATION_PHRASE}`);
  if (options.plan.pilotBlocked) throw new Error("Pilot batch is blocked by unresolved required fields.");
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
  if (apply) {
    assertApplyGuards({ apply, confirmation: process.env.SBR_MIGRATION_CONFIRMATION, plan });
    throw new Error("Apply is guarded and intentionally unavailable while the pilot has unresolved dates.");
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
