import { createElement, useState } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DocumentActionComponent } from "sanity";
import { filterSingletonActions, filterSingletonNewDocumentOptions, filterSingletonTemplates, SITE_SETTINGS_ID, singletonDefinitions } from "./singletons";
import { auditSingletonDocuments } from "./singletonAudit";
import { singletonDocumentState, singletonStatusLabel } from "./singletonState";

const action = (name: string): DocumentActionComponent => Object.assign(() => ({ label: name, onHandle: () => undefined }), { action: name }) as DocumentActionComponent;
const props = (draft: object | null, published: object | null) => ({ id: SITE_SETTINGS_ID, type: "siteSettings", draft, published, liveEdit: false, onComplete: () => undefined } as never);

describe("singleton lifecycle", () => {
  it("uses the authoritative Publication Settings ID", () => expect(singletonDefinitions).toEqual([
    { schemaType: "siteSettings", documentId: SITE_SETTINGS_ID, title: "Publication Settings" },
  ]));
  it.each([
    [null, null, "neverCreated", "Not published"], [{}, null, "draftOnly", "Draft only"],
    [null, {}, "publishedOnly", "Published"], [{}, {}, "publishedWithChanges", "Published with unpublished changes"],
  ])("classifies every draft/published state", (draft, published, state, label) => {
    expect(singletonDocumentState(draft, published)).toBe(state);
    expect(singletonStatusLabel(draft, published)).toBe(label);
  });
  it("allows only publish and guarded discard for Publication Settings", () => {
    const schemaType = "siteSettings";
    const result = filterSingletonActions([action("publish"), action("discardChanges"), action("delete"), action("duplicate"), action("unpublish"), action("copy")], schemaType);
    expect(result.map(({ action }) => action)).toEqual(["publish", "discardChanges"]);
    const discard = result.find(({ action }) => action === "discardChanges")!;
    expect(discard(props({}, null))).toBeNull();
    expect(discard(props(null, {}))).toBeNull();
    expect(discard(props({}, {}))?.label).toBe("Discard unpublished changes");
  });
  it("invokes a hook-using discard action on every render before applying the fixed-page guard", () => {
    const invocations = vi.fn();
    const hookAction = Object.assign(((actionProps: Parameters<DocumentActionComponent>[0]) => {
      useState(false);
      invocations();
      return { label: "Discard changes", onHandle: actionProps.onComplete };
    }) as DocumentActionComponent, { action: "discardChanges" });
    const discard = filterSingletonActions([hookAction], "siteSettings")[0];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Harness({ draft, published }: { draft: object | null; published: object | null }) {
      const result = discard(props(draft, published));
      return createElement("span", null, result?.label ?? "Unavailable");
    }

    const view = render(createElement(Harness, { draft: null, published: {} }));
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    view.rerender(createElement(Harness, { draft: {}, published: {} }));
    expect(screen.getByText("Discard unpublished changes")).toBeInTheDocument();
    view.rerender(createElement(Harness, { draft: {}, published: null }));
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(invocations).toHaveBeenCalledTimes(3);
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("change in the order of Hooks");
    consoleError.mockRestore();
  });
  it("removes Publication Settings from creation menus and templates", () => {
    expect(filterSingletonTemplates([{ schemaType: "article" }, { schemaType: "siteSettings" }])).toEqual([{ schemaType: "article" }]);
    expect(filterSingletonNewDocumentOptions([{ templateId: "article", schemaType: "article" }, { templateId: "siteSettings", schemaType: "siteSettings" }] as never)).toEqual([{ templateId: "article", schemaType: "article" }]);
  });
  it("audits missing, paired, incorrectly named, and legacy singleton records", () => {
    const result = auditSingletonDocuments([
      { _id: SITE_SETTINGS_ID, _type: "siteSettings" }, { _id: `drafts.${SITE_SETTINGS_ID}`, _type: "siteSettings" },
      { _id: "wrong-settings", _type: "siteSettings" }, { _id: "masthead", _type: "masthead" },
      { _id: "referrer", _type: "article", old: { _ref: "masthead" } },
    ]);
    expect(result.singletons).toEqual(expect.arrayContaining([
      expect.objectContaining({ documentId: SITE_SETTINGS_ID, state: "publishedWithChanges", incorrectIds: ["wrong-settings"] }),
    ]));
    expect(result.legacySingletonIds).toEqual(["masthead"]);
    expect(result.obsoleteSingletonReferences).toHaveLength(1);
    expect(result.valid).toBe(false);
  });
  it("uses neverCreated only after a complete history probe finds no evidence", () => {
    expect(singletonDocumentState(null, null, { available: false, restorableRevision: false, probeComplete: true })).toBe("neverCreated");
  });
  it.each([
    [{ available: true, restorableRevision: true }, "deletedRestorable"],
    [{ available: true, restorableRevision: false }, "deletedNoHistory"],
    [{ available: true, restorableRevision: false, latestEvent: "discard" }, "draftDiscardedNoPublished"],
    [{ available: true, restorableRevision: true, restoredDraft: true }, "restoredPendingPublication"],
  ])("classifies retained singleton history as %s", (history, expected) => {
    const draft = expected === "restoredPendingPublication" ? {} : null;
    expect(singletonDocumentState(draft, null, history)).toBe(expected);
  });
  it("distinguishes a discarded draft when a published version remains", () => {
    expect(singletonDocumentState(null, {}, { available: true, restorableRevision: true, latestEvent: "discard" })).toBe("draftDiscardedWithPublished");
  });
});
