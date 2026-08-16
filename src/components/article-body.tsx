import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import type { Article, ArticleContentBlock } from "@/content";
import { getCitationOccurrences, type CitationOccurrence } from "@/content/citations";
import { ImageCaption } from "./image-caption";
import { ArticleNotes } from "./article-notes";

type ListBlock = Extract<ArticleContentBlock, { type: "bulletedList" | "numberedList" }>;
type ListItem = ListBlock["items"][number];
type RichListItem = Exclude<ListItem, string>;
type ListTreeItem = { item: RichListItem; children: ListTreeItem[] };

function normalizedListItem(item: ListItem): RichListItem {
  return typeof item === "string"
    ? { content: [{ text: item }], level: 1 }
    : item;
}

function listTree(items: ListItem[]): ListTreeItem[] {
  const roots: ListTreeItem[] = [];
  const parents: ListTreeItem[] = [];
  for (const rawItem of items) {
    const item = normalizedListItem(rawItem);
    const level = Math.min(item.level, parents.length + 1);
    const node = { item: { ...item, level }, children: [] };
    if (level === 1) roots.push(node);
    else parents[level - 2].children.push(node);
    parents.splice(level - 1);
    parents[level - 1] = node;
  }
  return roots;
}

type CitationContext = { nextOccurrence: (sourceKey: string) => CitationOccurrence | undefined };

function FootnoteReference({ sourceKey, context }: { sourceKey: string; context: CitationContext }) {
  const occurrence = context.nextOccurrence(sourceKey);
  if (!occurrence) return <sup className="footnote-ref footnote-ref--missing" title={`Missing citation occurrence: ${sourceKey}`}>?</sup>;
  const missing = !occurrence.source;
  return <sup className={`footnote-ref${missing ? " footnote-ref--missing" : ""}`}>
    <a id={`note-ref-${occurrence.occurrenceId}`} href={`#note-${occurrence.occurrenceId}`} aria-label={`Footnote ${occurrence.number}`}>{occurrence.number}</a>
  </sup>;
}

function inlineContent(item: RichListItem, context: CitationContext): ReactNode {
  return item.content.map((span, index) => {
    let content: ReactNode = span.text;
    if (span.marks?.includes("strong")) content = <strong>{content}</strong>;
    if (span.marks?.includes("em")) content = <em>{content}</em>;
    if (span.href) {
      const external = /^https?:\/\//.test(span.href);
      content = <a href={span.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
    }
    return <Fragment key={`${span.text}-${index}`}>{content}{span.sourceKey && <FootnoteReference sourceKey={span.sourceKey} context={context} />}</Fragment>;
  });
}

function ArticleList({ block, context }: { block: ListBlock; context: CitationContext }) {
  const List = block.type === "bulletedList" ? "ul" : "ol";
  const renderItems = (items: ListTreeItem[]): ReactNode => items.map(({ item, children }, index) => (
    <li key={`${item.content.map(({ text }) => text).join("")}-${index}`}>
      {inlineContent(item, context)}
      {children.length > 0 && <List>{renderItems(children)}</List>}
    </li>
  ));
  return <List>{renderItems(listTree(block.items))}</List>;
}

type ArticleSource = Article["sources"][number];

function RichTextContent({ block, context }: { block: Extract<ArticleContentBlock, { type: "paragraph" | "quote" }>; context: CitationContext }) {
  if (!block.content?.length) return block.text;
  return block.content.map((span, index) => {
    const nextIsFootnote = Boolean(block.content?.[index + 1]?.sourceKey);
    const displayText = span.sourceKey || nextIsFootnote ? span.text.replace(/\s+$/, "") : span.text;
    let content: ReactNode = displayText;
    if (span.marks?.includes("strong")) content = <strong>{content}</strong>;
    if (span.marks?.includes("em")) content = <em>{content}</em>;
    if (span.href) {
      const external = /^https?:\/\//.test(span.href);
      content = <a href={span.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
    }
    if (span.sourceKey) {
      content = <>{content}<FootnoteReference sourceKey={span.sourceKey} context={context} /></>;
    }
    return <Fragment key={`${span.text}-${index}`}>{content}</Fragment>;
  });
}

export function ArticleBody({ blocks, sources = [] }: { blocks: ArticleContentBlock[]; sources?: ArticleSource[] }) {
  const occurrences = getCitationOccurrences(blocks, sources);
  let occurrenceCursor = 0;
  const context = { nextOccurrence: () => occurrences[occurrenceCursor++] };
  return (
    <>
    <div className="article-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "paragraph":
            return <p key={key}><RichTextContent block={block} context={context} /></p>;
          case "heading":
            return block.level === 2 ? <h2 key={key}>{block.text}</h2> : <h3 key={key}>{block.text}</h3>;
          case "bulletedList":
            return <ArticleList block={block} context={context} key={key} />;
          case "numberedList":
            return <ArticleList block={block} context={context} key={key} />;
          case "quote":
            return <blockquote key={key}><p><RichTextContent block={block} context={context} /></p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
          case "image":
            return (
              <figure className="article-figure" key={key}>
                <div className="article-figure__image">
                  <Image src={block.src} alt={block.alt} fill sizes="(max-width: 800px) 100vw, 800px" style={block.hotspot ? { objectPosition: `${block.hotspot.x * 100}% ${block.hotspot.y * 100}%` } : undefined} />
                </div>
                <ImageCaption caption={block.caption} credit={block.credit} />
              </figure>
            );
          case "callout":
            return <aside className="callout" key={key}>{block.title && <h3>{block.title}</h3>}<p>{block.text}{block.sourceKey && <FootnoteReference sourceKey={block.sourceKey} context={context} />}</p></aside>;
          case "divider":
            return <hr key={key} />;
          case "link":
            return <p key={key}>{block.text} <a href={block.href} target="_blank" rel="noopener noreferrer">{block.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></p>;
          default: {
            const unsupported = block as { type?: unknown };
            if (process.env.NODE_ENV !== "production") {
              console.warn("Unsupported article block", unsupported.type);
            }
            return null;
          }
        }
      })}
    </div>
    {occurrences.length > 0 && <ArticleNotes occurrences={occurrences} />}
    </>
  );
}
