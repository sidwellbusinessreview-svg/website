import { htmlToBlocks } from "@portabletext/block-tools";
import type { OnPasteFn, PasteData, PortableTextInputProps } from "sanity";

type ArticleTextBlock = {
  _key: string;
  _type: "block";
  style: "normal";
  markDefs: [];
  children: Array<{
    _key: string;
    _type: "span";
    marks: [];
    text: string;
  }>;
};

export type ClipboardClassification = "plainProse" | "richStructured" | "emptyUnsupported";

const createKey = () => crypto.randomUUID().replaceAll("-", "").slice(0, 12);
const RICH_STRUCTURE_PATTERN = /<(?:p|blockquote|ul|ol|li|strong|b|em|i|a)(?:\s|>)/i;

/** Convert migration-style plain text into one Portable Text block per non-empty line. */
export function plainTextToArticleBlocks(
  value: string,
  keyGenerator: () => string = createKey,
): ArticleTextBlock[] {
  return value
    .replace(/\r\n?/g, "\n")
    .replaceAll("\t", " ")
    .split("\n")
    .filter((line) => Boolean(line.trim()))
    .map((text) => ({
      _key: keyGenerator(),
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: keyGenerator(), _type: "span", marks: [], text }],
    }));
}

export function classifyArticleClipboard(data: Pick<PasteData, "event">): ClipboardClassification {
  const clipboard = data.event.clipboardData;
  const plain = clipboard?.getData("text/plain") ?? "";
  const html = clipboard?.getData("text/html") ?? "";
  const htmlOutsidePre = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
  if (htmlOutsidePre.trim() && RICH_STRUCTURE_PATTERN.test(htmlOutsidePre)) return "richStructured";
  if (plain.trim()) return "plainProse";
  return "emptyUnsupported";
}

export function richHtmlToArticleBlocks(
  html: string,
  schemaType: PortableTextInputProps["schemaType"],
) {
  // block-tools and Studio resolve separate compatible @sanity/types copies;
  // bridge that package-identity mismatch at this single schema boundary.
  return htmlToBlocks(html, schemaType as unknown as Parameters<typeof htmlToBlocks>[1], {
    keyGenerator: createKey,
    parseHtml: (value) => new DOMParser().parseFromString(value, "text/html"),
    rules: [{
      deserialize(element, next) {
        if (!(element instanceof HTMLElement) || element.tagName.toLowerCase() !== "a") return undefined;
        const href = element.getAttribute("href") ?? "";
        if (!/^https?:\/\//i.test(href)) return next(element.childNodes);
        return {
          _type: "__annotation",
          markDef: {
            _key: createKey(),
            _type: "linkAnnotation",
            linkType: "external",
            href,
            openInNewTab: false,
          },
          children: next(element.childNodes),
        };
      },
    }],
    unstable_whitespaceOnPasteMode: "normalize",
  }) as unknown as Array<{ _type: string; [key: string]: unknown }>;
}

/**
 * Plain prose is normalized by SBR. Genuinely structured HTML is converted
 * with Sanity's schema-aware Block Tools. Both return one insertion fragment,
 * leaving selection replacement and undo to the Portable Text editor.
 */
export function createArticlePasteHandler(
  schemaType: PortableTextInputProps["schemaType"],
  fallback?: OnPasteFn,
): OnPasteFn {
  return (data) => {
    const classification = classifyArticleClipboard(data);
    if (classification === "plainProse") {
      const insert = plainTextToArticleBlocks(data.event.clipboardData?.getData("text/plain") ?? "");
      return insert.length ? { insert } : fallback?.(data);
    }
    if (classification === "richStructured") {
      const insert = richHtmlToArticleBlocks(data.event.clipboardData?.getData("text/html") ?? "", schemaType);
      return insert.length ? { insert } : fallback?.(data);
    }
    return fallback?.(data);
  };
}
