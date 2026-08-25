import type { Article, ArticleContentBlock } from "./types";

export type CitationOccurrence = {
  occurrenceId: string;
  number: number;
  sourceKey: string;
  source?: Article["sources"][number];
  location: ArticleContentBlock["type"];
};

type CitationReference = { occurrenceId?: string; sourceKey: string; location: ArticleContentBlock["type"] };

function blockReferences(block: ArticleContentBlock | unknown): CitationReference[] {
  if (!block || typeof block !== "object") return [];
  const record = block as Record<string, unknown>;
  if (record._type === "block") {
    const children = Array.isArray(record.children) ? record.children : [];
    return children.flatMap((child, index) => {
      if (!child || typeof child !== "object") return [];
      const inline = child as Record<string, unknown>;
      if (inline._type !== "footnoteReference" || typeof inline.sourceKey !== "string") return [];
      const location = record.listItem === "bullet" ? "bulletedList" as const : record.listItem === "number" ? "numberedList" as const : record.style === "blockquote" ? "quote" as const : "paragraph" as const;
      return [{ occurrenceId: typeof inline._key === "string" ? inline._key : `inline-${index}`, sourceKey: inline.sourceKey, location }];
    });
  }
  if (record._type === "callout" && typeof record.sourceKey === "string") {
    return [{ occurrenceId: typeof record._key === "string" ? `${record._key}-source` : undefined, sourceKey: record.sourceKey, location: "callout" }];
  }
  const domain = block as ArticleContentBlock;
  if (domain.type === "paragraph" || domain.type === "quote") {
    return (domain.content ?? []).flatMap(({ sourceKey }) => sourceKey ? [{ sourceKey, location: domain.type }] : []);
  }
  if (domain.type === "bulletedList" || domain.type === "numberedList") {
    return domain.items.flatMap((item) => typeof item === "string"
      ? []
      : item.content.flatMap(({ sourceKey }) => sourceKey ? [{ sourceKey, location: domain.type }] : []));
  }
  if (domain.type === "callout" && domain.sourceKey) return [{ sourceKey: domain.sourceKey, location: "callout" }];
  return [];
}

/**
 * Builds reader-facing Notes in body order. Sources are unique registry records;
 * every use of one Source creates a distinct numbered occurrence.
 */
export function getCitationOccurrences(
  blocks: ArticleContentBlock[] | unknown[],
  sources: Article["sources"] = [],
): CitationOccurrence[] {
  const sourcesByKey = new Map(sources.map((source) => [source.key, source]));
  const occurrences: CitationOccurrence[] = [];
  for (const block of blocks) {
    for (const reference of blockReferences(block)) {
      const number = occurrences.length + 1;
      occurrences.push({
        occurrenceId: reference.occurrenceId ?? String(number),
        number,
        sourceKey: reference.sourceKey,
        source: sourcesByKey.get(reference.sourceKey),
        location: reference.location,
      });
    }
  }
  return occurrences;
}
