import { describe, expect, it } from "vitest";
import type { ArticleContentBlock } from "./types";
import { getCitationOccurrences } from "./citations";

const sources = [
  { key: "a", citation: "Source A" },
  { key: "b", citation: "Source B" },
  { key: "c", citation: "Source C" },
];
const paragraph = (...sourceKeys: string[]): ArticleContentBlock => ({
  type: "paragraph",
  text: sourceKeys.join(" "),
  content: sourceKeys.map((sourceKey) => ({ text: sourceKey, sourceKey })),
});

describe("citation occurrences", () => {
  it("numbers repeated Sources by citation occurrence rather than Source position", () => {
    const occurrences = getCitationOccurrences([paragraph("a", "b", "a", "c", "a")], sources);
    expect(occurrences.map(({ number }) => number)).toEqual([1, 2, 3, 4, 5]);
    expect(occurrences.map(({ sourceKey }) => sourceKey)).toEqual(["a", "b", "a", "c", "a"]);
    expect(occurrences.map(({ occurrenceId }) => occurrenceId)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("is independent of Source registry order", () => {
    const reordered = [sources[2], sources[0], sources[1]];
    expect(getCitationOccurrences([paragraph("a", "b", "a", "c", "a")], reordered).map(({ sourceKey }) => sourceKey))
      .toEqual(["a", "b", "a", "c", "a"]);
  });

  it("renumbers when body blocks move, insert, or delete without persisted numbers", () => {
    expect(getCitationOccurrences([paragraph("a"), paragraph("b"), paragraph("c")], sources).map(({ sourceKey }) => sourceKey)).toEqual(["a", "b", "c"]);
    expect(getCitationOccurrences([paragraph("c"), paragraph("a"), paragraph("b")], sources).map(({ sourceKey }) => sourceKey)).toEqual(["c", "a", "b"]);
    expect(getCitationOccurrences([paragraph("a"), paragraph("a"), paragraph("b"), paragraph("c")], sources).map(({ number }) => number)).toEqual([1, 2, 3, 4]);
    expect(getCitationOccurrences([paragraph("a"), paragraph("b"), paragraph("c")], sources).map(({ number }) => number)).toEqual([1, 2, 3]);
  });

  it("traverses paragraphs, Block quotes, lists, and Callouts in reading order", () => {
    const blocks: ArticleContentBlock[] = [
      paragraph("a"),
      { type: "quote", text: "Quote", content: [{ text: "Quote", sourceKey: "b" }] },
      { type: "bulletedList", items: [{ level: 1, content: [{ text: "List", sourceKey: "a" }] }] },
      { type: "callout", text: "Callout", sourceKey: "c" },
      { type: "numberedList", items: [{ level: 1, content: [{ text: "List", sourceKey: "b" }] }] },
      paragraph("a"),
    ];
    expect(getCitationOccurrences(blocks, sources).map(({ sourceKey }) => sourceKey)).toEqual(["a", "b", "a", "c", "b", "a"]);
    expect(getCitationOccurrences(blocks, sources).map(({ number }) => number)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("keeps missing Sources in sequence and reaches multi-digit note 21", () => {
    const keys = Array.from({ length: 21 }, (_, index) => index === 1 ? "missing" : index % 2 ? "b" : "a");
    const occurrences = getCitationOccurrences([paragraph(...keys)], sources);
    expect(occurrences).toHaveLength(21);
    expect(occurrences[1]).toMatchObject({ number: 2, sourceKey: "missing", source: undefined });
    expect(occurrences.slice(8).map(({ number }) => number)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
  });

  it("uses stable Portable Text object keys for live Studio occurrence mapping", () => {
    const body = [
      { _type: "block", _key: "p", style: "normal", children: [{ _type: "footnoteReference", _key: "inline-a", sourceKey: "a" }] },
      { _type: "block", _key: "list", listItem: "bullet", children: [{ _type: "footnoteReference", _key: "inline-b", sourceKey: "b" }] },
      { _type: "callout", _key: "callout", sourceKey: "a" },
    ];
    expect(getCitationOccurrences(body).map(({ occurrenceId, number, sourceKey, location }) => ({ occurrenceId, number, sourceKey, location }))).toEqual([
      { occurrenceId: "inline-a", number: 1, sourceKey: "a", location: "paragraph" },
      { occurrenceId: "inline-b", number: 2, sourceKey: "b", location: "bulletedList" },
      { occurrenceId: "callout-source", number: 3, sourceKey: "a", location: "callout" },
    ]);
  });
});
