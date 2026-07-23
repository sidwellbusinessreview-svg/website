import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import type { ArticleContentBlock } from "@/content";
import { ImageCaption } from "./image-caption";

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

function inlineContent(item: RichListItem): ReactNode {
  return item.content.map((span, index) => {
    let content: ReactNode = span.text;
    if (span.marks?.includes("strong")) content = <strong>{content}</strong>;
    if (span.marks?.includes("em")) content = <em>{content}</em>;
    if (span.href) {
      const external = /^https?:\/\//.test(span.href);
      content = <a href={span.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
    }
    return <Fragment key={`${span.text}-${index}`}>{content}</Fragment>;
  });
}

function ArticleList({ block }: { block: ListBlock }) {
  const List = block.type === "bulletedList" ? "ul" : "ol";
  const renderItems = (items: ListTreeItem[]): ReactNode => items.map(({ item, children }, index) => (
    <li key={`${item.content.map(({ text }) => text).join("")}-${index}`}>
      {inlineContent(item)}
      {children.length > 0 && <List>{renderItems(children)}</List>}
    </li>
  ));
  return <List>{renderItems(listTree(block.items))}</List>;
}

export function ArticleBody({ blocks }: { blocks: ArticleContentBlock[] }) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "paragraph":
            return <p key={key}>{block.text}</p>;
          case "heading":
            return block.level === 2 ? <h2 key={key}>{block.text}</h2> : <h3 key={key}>{block.text}</h3>;
          case "bulletedList":
            return <ArticleList block={block} key={key} />;
          case "numberedList":
            return <ArticleList block={block} key={key} />;
          case "quote":
            return <blockquote key={key}><p>{block.text}</p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
          case "pullQuote":
            return <aside className="pull-quote" key={key}>{block.text}</aside>;
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
            return <aside className="callout" key={key}>{block.title && <h3>{block.title}</h3>}<p>{block.text}</p></aside>;
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
  );
}
