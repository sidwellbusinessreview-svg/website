import { describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import type { DocumentActionComponent } from "sanity";
import { articleStatusLabel, classifyArticleVersions, searchArticleRecords, sortArticleRecords } from "../articleState";
import { relabelDiscardAction, relabelPublishAction, resolveDocumentActions, UnpublishArticleAction } from "../documentStatus";
import { ArticlePermanentDeleteAction, ContributorArchiveAction, ContributorDeleteAction } from "../lifecycleActions";
import { articleBodyMigrationMarkerWarning, duplicateSourceWarning, prepareArticlePreview, unusedSourceWarning, validateArticleSlug, validatePublicationMonth, validatePublishedContributors, validateSourceUrl } from "./documents/article";
import { articleBody, footnoteReference, validateOptionalSourceReference, validateSourceReference } from "./objects/articleBody";
import { schemaTypes } from ".";
import { validateUniqueStaff } from "./documents/staticPage";
import { isSupportedImageAsset } from "./shared/mediaValidation";
import { pairContributorVersions } from "../components/ContributorStateList";

type RawField = { name: string; type: string; readOnly?: boolean; initialValue?: unknown; description?: string; components?: { input?: unknown }; fields?: RawField[]; of?: Array<{ type: string; to?: Array<{ type: string }>; fields?: RawField[] }>; options?: { dateFormat?: string } };
const fieldsFor = (name: string) => ((schemaTypes.find((type) => type.name === name) as { fields?: RawField[] } | undefined)?.fields ?? []);
const action = (name: string, label = name): DocumentActionComponent => Object.assign(() => ({ label, onHandle: () => undefined }), { action: name }) as DocumentActionComponent;
const props = (draft: object | null, published: object | null) => ({ id: "test", type: "article", draft, published, liveEdit: false, onComplete: () => undefined } as never);

describe("article document states", () => {
  const records = classifyArticleVersions([{ _id: "drafts.draft-only", title: "Draft only" }, { _id: "published-only", title: "Published only" }, { _id: "changed", title: "Published base" }, { _id: "drafts.changed", title: "Changed draft" }]);
  it("classifies draft only", () => expect(records.find(({ id }) => id === "draft-only")?.state).toBe("draftOnly"));
  it("classifies published only", () => expect(records.find(({ id }) => id === "published-only")?.state).toBe("published"));
  it("classifies published with changes", () => expect(records.find(({ id }) => id === "changed")?.state).toBe("publishedWithChanges"));
  it("uses student-friendly wording", () => { expect(articleStatusLabel({}, null)).toBe("Draft only"); expect(articleStatusLabel(null, {})).toBe("Published"); expect(articleStatusLabel({}, {})).toBe("Published with unpublished changes"); });
  it("uses draft metadata without changing paired state", () => { const [record] = classifyArticleVersions([{ _id: "story", title: "Published title", publicationDate: "2026-01-01" }, { _id: "drafts.story", title: "Draft title", contributorNames: ["Maya Chen"] }]); expect(record).toMatchObject({ state: "publishedWithChanges", title: "Draft title", contributorNames: ["Maya Chen"] }); });
  it("searches editorial fields case-insensitively", () => { const records = classifyArticleVersions([{ _id: "story", title: "Market Signals", summary: "Rates and risk", publicationMonth: "2026-01", contributorNames: ["Maya Chen"] }]); expect(searchArticleRecords(records, "maya")).toHaveLength(1); expect(searchArticleRecords(records, "RATES")).toHaveLength(1); expect(searchArticleRecords(records, "2026-01")).toHaveLength(1); expect(searchArticleRecords(records, "missing")).toHaveLength(0); });
  it("sorts newest, oldest, title, and updated deterministically", () => { const records = classifyArticleVersions([{ _id: "b", title: "Beta", publicationMonth: "2026-02", _updatedAt: "2026-02-02" }, { _id: "a", title: "Alpha", publicationMonth: "2026-01", _updatedAt: "2026-03-01" }, { _id: "c", title: "No date" }]); expect(sortArticleRecords(records, "newest").map(({ id }) => id)).toEqual(["b", "a", "c"]); expect(sortArticleRecords(records, "oldest").map(({ id }) => id)).toEqual(["a", "b", "c"]); expect(sortArticleRecords(records, "title").map(({ id }) => id)).toEqual(["a", "b", "c"]); expect(sortArticleRecords(records, "updated").map(({ id }) => id)).toEqual(["a", "b", "c"]); });
});

describe("simplified Sanity editor model", () => {
  it("warns about likely migration citation markers only in ordinary text spans", () => {
    expect(articleBodyMigrationMarkerWarning([{ _type: "block", children: [{ _type: "span", text: "Claims [1] and [24]." }] }])).toMatch(/2 bracketed citation markers/);
    expect(articleBodyMigrationMarkerWarning([{ _type: "block", children: [{ _type: "span", text: "No marker." }] }])).toBe(true);
    expect(articleBodyMigrationMarkerWarning([{ _type: "editorialImage", caption: "Archive image [1]" }])).toBe(true);
  });
  it("registers no Masthead document", () => expect(schemaTypes.filter((type) => type.type === "document").map((type) => type.name)).toEqual(["siteSettings", "contributor", "article", "staticPage"]));
  it.each(["masthead", "author", "issue", "category", "tag"])("has no legacy %s schema file", (type) => expect(existsSync(`src/sanity/schemaTypes/documents/${type}.ts`)).toBe(false));
  it("keeps the contributor form compact with hidden migration identity", () => { const fields = fieldsFor("contributor"); expect(fields.map(({ name }) => name)).toEqual(["name", "slug", "role", "graduationYear", "active", "migrationSourceId", "importBatchId"]); expect(fields.filter(({ name }) => ["migrationSourceId", "importBatchId"].includes(name)).every(({ readOnly }) => readOnly)).toBe(true); });
  it("places staff sections on About", () => expect(fieldsFor("staticPage").map(({ name }) => name)).toEqual(expect.arrayContaining(["editorsInChief", "editors", "facultyAdviser"])));
  it("has no Contributor or About person-image fields", () => {
    expect(fieldsFor("contributor").map(({ name }) => name)).not.toEqual(expect.arrayContaining(["photo", "image", "portrait", "avatar"]));
    const staffFields = fieldsFor("staticPage").filter(({ name }) => ["editorsInChief", "editors", "facultyAdviser"].includes(name)).flatMap(({ of }) => of?.flatMap(({ fields }) => fields ?? []) ?? []);
    expect(staffFields.map(({ name }) => name)).not.toEqual(expect.arrayContaining(["portrait", "portraitAltText", "photo", "image", "avatar"]));
  });
  it("warns when About repeats a contributor across sections", () => expect(validateUniqueStaff({ editorsInChief: [{ contributor: { _ref: "a" } }], editors: [{ contributor: { _ref: "a" } }] })).toMatch(/only once/i));
  it("uses one month-only publication field and structured Sources", () => { const fields = fieldsFor("article"); expect(fields.find(({ name }) => name === "publicationMonth")).toMatchObject({ type: "string" }); expect(fields.find(({ name }) => name === "publicationDate")).toBeUndefined(); expect(fields.find(({ name }) => name === "publicationDatePrecision")).toBeUndefined(); expect(fields.find(({ name }) => name === "sources")).toMatchObject({ type: "array" }); expect(fields.find(({ name }) => name === "contributors")?.of?.[0]).toMatchObject({ type: "reference", to: [{ type: "contributor" }] }); });
  it("uses a friendly publication Month/Year input without exposing storage syntax", () => { const field = fieldsFor("article").find(({ name }) => name === "publicationMonth"); expect(field?.components?.input).toBeTypeOf("function"); expect(field?.description).not.toContain("YYYY-MM"); });
  it("keeps only the approved Article-body feature set", () => expect((articleBody as unknown as { of: Array<{ type: string }> }).of.map(({ type }) => type)).toEqual(["block", "editorialImage", "callout"]));
  it("keeps Block quote as a Portable Text style", () => {
    const bodyBlock = (articleBody as unknown as { of: Array<{ type: string; styles?: Array<{ title: string; value: string }> }> }).of[0];
    expect(bodyBlock.styles).toEqual(expect.arrayContaining([{ title: "Block quote", value: "blockquote" }]));
    expect(schemaTypes.find(({ name }) => name === "pullQuote")).toBeUndefined();
  });
  it("uses a cursor-inserted inline footnote object instead of a text annotation", () => {
    const bodyBlock = (articleBody as unknown as { of: Array<{ type: string; of?: Array<{ type: string }>; marks?: { annotations?: Array<{ type: string }> } }> }).of[0];
    expect(bodyBlock.of).toEqual([{ type: "footnoteReference" }]);
    expect(bodyBlock.marks?.annotations).not.toEqual(expect.arrayContaining([{ type: "footnoteReference" }]));
    expect(footnoteReference.type).toBe("object");
  });
  it("supports Source citations in text and callouts", () => {
    const bodyTypes = (articleBody as unknown as { of: Array<{ type: string }> }).of.map(({ type }) => type);
    expect(bodyTypes).toEqual(expect.arrayContaining(["callout"]));
    expect(validateSourceReference("source-a", { document: { sources: [{ _key: "source-a" }] } })).toBe(true);
    expect(validateSourceReference("missing", { document: { sources: [{ _key: "source-a" }] } })).toMatch(/no longer exists/i);
    expect(validateOptionalSourceReference(undefined, { document: { sources: [] } })).toBe(true);
  });
  it("gives friendly month and duplicate-slug validation", async () => {
    expect(validatePublicationMonth("2026-03")).toBe(true);
    expect(validatePublicationMonth("2026-13")).toMatch(/valid month/i);
    const fetch = vi.fn().mockResolvedValue("another");
    await expect(validateArticleSlug({ current: "market-story" }, { document: { _id: "drafts.current" }, getClient: () => ({ fetch }) })).resolves.toMatch(/already uses/i);
  });
  it("warns about duplicate and unused Sources without blocking valid references", () => {
    const sources = [{ _key: "a", citation: "  Report A ", url: "https://example.com" }, { _key: "b", citation: "report a", url: "https://example.com" }];
    expect(duplicateSourceWarning(sources)).toMatch(/duplicate Source 1/i);
    expect(unusedSourceWarning(sources, { document: { body: [{ _type: "block", children: [{ _type: "footnoteReference", sourceKey: "a" }] }] } })).toMatch(/2/);
    expect(duplicateSourceWarning([{ citation: "Different A", url: " https://example.com " }, { citation: "Different B", url: "https://example.com" }])).toMatch(/duplicate Source 1/i);
    expect(validateSourceUrl("https://example.com/report")).toBe(true);
    expect(validateSourceUrl("javascript:alert(1)")).toMatch(/http/i);
    expect(validateSourceUrl(" https://example.com ")).toMatch(/spaces/i);
  });
  it("prepares clear previews", () => expect(prepareArticlePreview({ id: "drafts.test", title: "A test", firstContributor: "Maya", pinned: true })).toMatchObject({ subtitle: "Draft · Pinned · Maya" }));
  it("warns for unpublished contributors", async () => { const fetch = vi.fn().mockResolvedValue(["a"]); await expect(validatePublishedContributors([{ _ref: "a" }, { _ref: "b" }], { getClient: () => ({ fetch }) })).resolves.toMatch(/publish every/i); });
  it("pairs Contributor drafts without hiding new records", () => expect(pairContributorVersions([{ _id: "person", name: "Published" }, { _id: "drafts.person", name: "Edited" }, { _id: "drafts.new-person", name: "New" }])).toEqual([{ _id: "person", name: "Edited" }, { _id: "new-person", name: "New" }]));
});

describe("editorial image formats", () => {
  it.each([
    ["image/jpeg", "editorial.jpg"],
    ["image/jpeg", "editorial.jpeg"],
    ["image/png", "chart.png"],
    ["image/webp", "cover.webp"],
  ])("accepts %s %s", (mimeType, originalFilename) => expect(isSupportedImageAsset({ mimeType, originalFilename })).toBe(true));
  it.each([
    ["application/pdf", "layout.pdf"],
    ["image/svg+xml", "logo.svg"],
    ["image/gif", "animation.gif"],
    ["image/png", "renamed.pdf"],
  ])("rejects %s %s", (mimeType, originalFilename) => expect(isSupportedImageAsset({ mimeType, originalFilename })).toBe(false));
});

describe("article actions", () => {
  it("labels Publish and Publish changes", () => { const publish = action("publish"); expect(relabelPublishAction(publish)(props({}, null))?.label).toBe("Publish"); expect(relabelPublishAction(publish)(props({}, {}))?.label).toBe("Publish changes"); });
  it("labels discard clearly", () => expect(relabelDiscardAction(action("discardChanges"))(props({}, {}))?.label).toBe("Discard unpublished changes"));
  it("removes Duplicate and adds Unpublish", () => { const result = resolveDocumentActions([action("duplicate"), action("publish"), action("discardChanges"), action("unpublish")], "article"); expect(result.some(({ action }) => action === "duplicate")).toBe(false); expect(result.filter(({ action }) => action === "unpublish")).toEqual([UnpublishArticleAction]); expect(result[0].action).toBe("publish"); });
  it("replaces generic article deletion", () => expect(resolveDocumentActions([action("delete")], "article")).toContain(ArticlePermanentDeleteAction));
  it("adds archive and reference-aware contributor deletion", () => expect(resolveDocumentActions([action("delete")], "contributor")).toEqual([ContributorArchiveAction, ContributorDeleteAction]));
  it("removes Duplicate for Contributors", () => expect(resolveDocumentActions([action("duplicate"), action("delete")], "contributor").some(({ action }) => action === "duplicate")).toBe(false));
  it.each(["staticPage", "siteSettings"])("allows no destructive singleton actions for %s", (type) => expect(resolveDocumentActions([action("publish"), action("discardChanges"), action("delete"), action("duplicate"), action("unpublish")], type).map(({ action }) => action)).toEqual(["publish", "discardChanges"]));
});
