import {describe, expect, it} from "vitest";
import {documentAttributes, findPublicationSettingsCollisions, mapAboutFields, type RawSanityDocument} from "./publication-settings-consolidation";

const about = (overrides: Record<string, unknown> = {}): RawSanityDocument => ({
  _id: "about", _type: "staticPage", _rev: "one", title: "About", body: [{_type: "block"}], ...overrides,
});

describe("Publication Settings consolidation", () => {
  it("maps About content to collision-resistant flat fields", () => {
    expect(mapAboutFields(about({eyebrow: "Our publication", summary: "Summary"}))).toMatchObject({
      aboutTitle: "About", aboutEyebrow: "Our publication", aboutSummary: "Summary", aboutBody: [{_type: "block"}],
    });
  });
  it.each([1, 2, 3])("preserves %i ordered Editors-in-Chief", (count) => {
    const entries = Array.from({length: count}, (_, index) => ({_key: String(index), _type: "editorEntry", contributor: {_ref: `person-${index}`}}));
    expect((mapAboutFields(about({editorsInChief: entries})).editorsInChief as Array<{contributor: {_ref: string}}>).map((entry) => entry.contributor._ref)).toEqual(entries.map((entry) => entry.contributor._ref));
  });
  it("normalizes only the leadership wrapper type", () => {
    const mapped = mapAboutFields(about({
      editorsInChief: [{_key: "a", _type: "editorEntry", contributor: {_ref: "person"}}],
    }));
    expect(mapped).toMatchObject({
      editorsInChief: [{_key: "a", _type: "editorInChiefEntry", contributor: {_ref: "person"}}],
    });
  });
  it("detects destination collisions", () => {
    expect(findPublicationSettingsCollisions({_id: "siteSettings", _type: "siteSettings", aboutTitle: "Existing"}, {aboutTitle: "About"})).toEqual(["aboutTitle"]);
  });
  it("removes only system revision metadata when creating a draft", () => {
    expect(documentAttributes({_id: "siteSettings", _type: "siteSettings", _rev: "r", _createdAt: "date", publicationName: "SBR"})).toEqual({_id: "siteSettings", _type: "siteSettings", publicationName: "SBR"});
  });
});
