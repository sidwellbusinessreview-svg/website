import { render, screen } from "@testing-library/react";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { PortableTextInputProps } from "sanity";

vi.mock("sanity", async () => {
  const actual = await vi.importActual<typeof import("sanity")>("sanity");
  return {
    ...actual,
    PortableTextInput: () => <div data-testid="portable-text-editor" />,
    useFormValue: () => [],
  };
});

import {
  ARTICLE_TOOLBAR_LABELS,
  ARTICLE_STYLE_OPTIONS,
  ArticleBodyInput,
  applyArticleBlockStyle,
  applyEditorHistory,
  matchesFootnoteSource,
  readArticleEditorState,
} from "./ArticleBodyInput";

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

function fakeEditor(overrides: Record<string, unknown> = {}) {
  const api = {
    focusBlock: vi.fn(() => ({ _type: "block" })),
    getSelection: vi.fn(() => ({ anchor: {}, focus: {} })),
    hasBlockStyle: vi.fn((_editor, style) => style === "blockquote"),
    hasListStyle: vi.fn((_editor, style) => style === "bullet"),
    isAnnotationActive: vi.fn(() => false),
    isExpandedSelection: vi.fn(() => true),
    isMarkActive: vi.fn((_editor, mark) => mark === "strong"),
    toggleBlockStyle: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    ...overrides,
  };
  return { api, editor: { constructor: api, schemaTypes: { annotations: [], blockObjects: [], inlineObjects: [] } } as never };
}

describe("ArticleBodyInput", () => {
  it("shows the complete constrained toolbar with accessible names", () => {
    render(<ThemeProvider theme={studioTheme}><ArticleBodyInput {...({ value: [], readOnly: false, onPathFocus: vi.fn() } as unknown as PortableTextInputProps)} /></ThemeProvider>);
    for (const label of ARTICLE_TOOLBAR_LABELS) expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    const style = screen.getByRole("combobox", { name: "Paragraph style" });
    expect(style).toHaveValue("normal");
    expect([...style.querySelectorAll("option")].map(({ textContent }) => textContent)).toEqual(ARTICLE_STYLE_OPTIONS.map(({ title }) => title));
    const toolbar = screen.getByRole("toolbar", { name: "Article formatting" });
    expect(toolbar.tagName).toBe("DIV");
    expect(toolbar.parentElement?.className).toContain("toolbarShell");
    expect(style.parentElement?.parentElement?.className).toContain("styleSelect");
    for (const word of ["Bold", "Italic", "Bulleted list", "Numbered list", "Footnote", "Image", "Callout"]) expect(toolbar).not.toHaveTextContent(word);
    expect(screen.queryByRole("button", { name: /pull quote/i })).not.toBeInTheDocument();
    expect(screen.getByText("Start writing or paste the Article here.")).toBeInTheDocument();
  });

  it("searches a large Source picker by number or citation", () => {
    const options = Array.from({ length: 24 }, (_, index) => ({ number: String(index + 1), label: `${index + 1} — Research citation ${index + 1}` }));
    expect(options.filter((option) => matchesFootnoteSource("20", option))).toEqual([options[19]]);
    expect(options.filter((option) => matchesFootnoteSource("citation 17", option))).toEqual([options[16]]);
    expect(options.filter((option) => matchesFootnoteSource("missing", option))).toEqual([]);
  });

  it("derives active format, mark, and list states from the current selection", () => {
    const { editor } = fakeEditor();
    expect(readArticleEditorState(editor)).toMatchObject({
      style: "blockquote",
      bold: true,
      italic: false,
      list: "bullet",
      expandedSelection: true,
      hasTextBlock: true,
    });
  });

  it("uses the editor block-style action for Quote and Text", () => {
    const { api, editor } = fakeEditor();
    applyArticleBlockStyle(editor, "blockquote");
    applyArticleBlockStyle(editor, "normal");
    expect(api.toggleBlockStyle).toHaveBeenNthCalledWith(1, editor, "blockquote");
    expect(api.toggleBlockStyle).toHaveBeenNthCalledWith(2, editor, "normal");
  });

  it("delegates undo and redo to the editor's supported history", () => {
    const { api, editor } = fakeEditor();
    applyEditorHistory(editor, "undo");
    applyEditorHistory(editor, "redo");
    expect(api.undo).toHaveBeenCalledWith(editor);
    expect(api.redo).toHaveBeenCalledWith(editor);
  });
});
