import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { PortableTextInputProps } from "sanity";

const formValues = vi.hoisted(() => ({ sources: [] as unknown[] }));

vi.mock("sanity", async () => {
  const actual = await vi.importActual<typeof import("sanity")>("sanity");
  return {
    ...actual,
    useFormValue: (path: Array<string | number>) => path[0] === "sources" ? formValues.sources : [],
  };
});

import {
  ARTICLE_TOOLBAR_LABELS,
  ARTICLE_STYLE_OPTIONS,
  ArticleBodyInput,
  applyArticleBlockStyle,
  applyEditorHistory,
  insertFootnoteReference,
  readArticleEditorState,
} from "./ArticleBodyInput";
import { matchesFootnoteSource } from "./FootnoteSourceInput";

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

afterEach(() => { formValues.sources = []; });

function portableTextProps(value: unknown[] = []): PortableTextInputProps {
  return {
    value,
    readOnly: false,
    onPathFocus: vi.fn(),
    renderDefault: vi.fn((input: PortableTextInputProps) => <div data-testid="portable-text-editor">
      {input.value?.length
        ? input.value.flatMap((block) => block.children ?? []).map((child) => child && typeof child === "object" && "text" in child ? String(child.text) : "").join("")
        : <span data-testid="pt-input-placeholder">Start writing or paste here…</span>}
    </div>),
  } as unknown as PortableTextInputProps;
}

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
    render(<ThemeProvider theme={studioTheme}><ArticleBodyInput {...portableTextProps()} /></ThemeProvider>);
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
    expect(screen.getByText("Start writing or paste here…")).toBeInTheDocument();
    expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    expect(screen.getByTestId("article-body-editor-shell")).toContainElement(toolbar);
    expect(screen.getByTestId("article-body-editor-shell")).toContainElement(screen.getByTestId("portable-text-editor"));
  });

  it("passes an existing Portable Text value to the native editor without showing an empty state", () => {
    const value = [{ _type: "block", _key: "existing", children: [{ _type: "span", _key: "text", text: "Existing Article text remains visible." }] }];
    const props = portableTextProps(value);
    render(<ThemeProvider theme={studioTheme}><ArticleBodyInput {...props} /></ThemeProvider>);
    expect(screen.getByText("Existing Article text remains visible.")).toBeInTheDocument();
    expect(screen.queryByTestId("pt-input-placeholder")).not.toBeInTheDocument();
    expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    expect(vi.mocked(props.renderDefault).mock.calls[0]?.[0]).toEqual(expect.objectContaining({ value }));
    expect((vi.mocked(props.renderDefault).mock.calls[0]?.[0] as PortableTextInputProps).onPaste).toBeTypeOf("function");
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

  it("inserts exactly one footnote from the anchored Source picker without a Save step", async () => {
    formValues.sources = [{ _key: "source-a", citation: "Federal Reserve report" }];
    const user = userEvent.setup();
    const insertChild = vi.fn();
    const { editor } = fakeEditor({
      focus: vi.fn(),
      insertChild,
      select: vi.fn(),
    });
    Object.assign(editor, { schemaTypes: { annotations: [], blockObjects: [], inlineObjects: [{ name: "footnoteReference" }] } });
    let renderedInput: PortableTextInputProps | undefined;
    const props = portableTextProps();
    props.renderDefault = vi.fn((input) => {
      renderedInput = input as PortableTextInputProps;
      return <div data-testid="portable-text-editor" />;
    }) as never;
    render(<ThemeProvider theme={studioTheme}><ArticleBodyInput {...props} /></ThemeProvider>);
    act(() => {
      if (renderedInput?.editorRef) renderedInput.editorRef.current = editor;
      renderedInput?.onEditorChange?.({ type: "selection" } as never, editor);
    });
    await user.click(screen.getByRole("button", { name: "Add footnote" }));
    const search = screen.getByLabelText("Search Sources");
    expect(search).toBeInTheDocument();
    insertFootnoteReference(editor, "source-a", { anchor: {}, focus: {} });
    expect(insertChild).toHaveBeenCalledTimes(1);
    expect(insertChild).toHaveBeenCalledWith(editor, expect.objectContaining({ name: "footnoteReference" }), { sourceKey: "source-a" });
    expect(screen.getByText("Choose the Source for this citation. Search by Source-list number or citation.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("closes the add-footnote picker on Escape without creating a patch", async () => {
    formValues.sources = [{ _key: "source-a", citation: "Federal Reserve report" }];
    const user = userEvent.setup();
    const insertChild = vi.fn();
    const { editor } = fakeEditor({ focus: vi.fn(), insertChild, select: vi.fn() });
    Object.assign(editor, { schemaTypes: { annotations: [], blockObjects: [], inlineObjects: [{ name: "footnoteReference" }] } });
    let renderedInput: PortableTextInputProps | undefined;
    const props = portableTextProps();
    props.renderDefault = vi.fn((input) => { renderedInput = input as PortableTextInputProps; return <div data-testid="portable-text-editor" />; }) as never;
    render(<ThemeProvider theme={studioTheme}><ArticleBodyInput {...props} /></ThemeProvider>);
    act(() => {
      if (renderedInput?.editorRef) renderedInput.editorRef.current = editor;
      renderedInput?.onEditorChange?.({ type: "selection" } as never, editor);
    });
    const trigger = screen.getByRole("button", { name: "Add footnote" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(insertChild).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Search Sources")).not.toBeInTheDocument();
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(trigger).toHaveFocus();
  });
});
