import Image from "next/image";
import type { ArticleContentBlock } from "@/content";
import { ImageCaption } from "./image-caption";

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
            return <ul key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
          case "numberedList":
            return <ol key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
          case "quote":
            return <blockquote key={key}><p>{block.text}</p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
          case "pullQuote":
            return <aside className="pull-quote" key={key}>{block.text}</aside>;
          case "image":
            return (
              <figure className="article-figure" key={key}>
                <div className="article-figure__image">
                  <Image src={block.src} alt={block.alt} fill sizes="(max-width: 800px) 100vw, 800px" />
                </div>
                <ImageCaption caption={block.caption} credit={block.credit} />
              </figure>
            );
          case "callout":
            return <aside className="callout" key={key}>{block.title && <h3>{block.title}</h3>}<p>{block.text}</p></aside>;
          case "divider":
            return <hr key={key} />;
          case "link":
            return <p key={key}>{block.text} <a href={block.href} target="_blank" rel="noreferrer">{block.label} <span aria-hidden="true">↗</span></a></p>;
        }
      })}
    </div>
  );
}
