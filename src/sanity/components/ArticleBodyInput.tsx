"use client";

import { Autocomplete, Box, Button, Card, Dialog, Flex, Select, Stack, Text, Tooltip } from "@sanity/ui";
import { BoldIcon } from "@sanity/icons/Bold";
import { ImageIcon } from "@sanity/icons/Image";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { ItalicIcon } from "@sanity/icons/Italic";
import { LinkIcon } from "@sanity/icons/Link";
import { OlistIcon } from "@sanity/icons/Olist";
import { RedoIcon } from "@sanity/icons/Redo";
import { UndoIcon } from "@sanity/icons/Undo";
import { UlistIcon } from "@sanity/icons/Ulist";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  useFormValue,
  type EditorChange,
  type PortableTextInputProps,
} from "sanity";
import { footnoteSourceOptions } from "./FootnoteSourceInput";
import styles from "./ArticleBodyInput.module.css";

export const ARTICLE_TOOLBAR_LABELS = [
  "Undo",
  "Redo",
  "Bold",
  "Italic",
  "Insert link",
  "Bulleted list",
  "Numbered list",
  "Add footnote",
  "Insert image",
  "Insert callout",
] as const;

export const ARTICLE_STYLE_OPTIONS = [
  { title: "Normal text", value: "normal" },
  { title: "Section heading", value: "h2" },
  { title: "Subheading", value: "h3" },
  { title: "Block quote", value: "blockquote" },
] as const;

type EditorState = {
  hasSelection: boolean;
  hasTextBlock: boolean;
  expandedSelection: boolean;
  style: "normal" | "h2" | "h3" | "blockquote" | null;
  bold: boolean;
  italic: boolean;
  link: boolean;
  list: "bullet" | "number" | null;
};

type PortableEditor = Exclude<NonNullable<PortableTextInputProps["editorRef"]>["current"], null>;
type EditorSelection = unknown;
type EditorApi = {
  addAnnotation: (editor: PortableEditor, type: PortableEditor["schemaTypes"]["annotations"][number]) => { markDefPath?: Parameters<PortableTextInputProps["onItemOpen"]>[0] } | undefined;
  focus: (editor: PortableEditor) => void;
  focusBlock: (editor: PortableEditor) => { _type?: string } | undefined;
  getSelection: (editor: PortableEditor) => EditorSelection;
  hasBlockStyle: (editor: PortableEditor, style: string) => boolean;
  hasListStyle: (editor: PortableEditor, style: string) => boolean;
  insertBlock: (editor: PortableEditor, type: PortableEditor["schemaTypes"]["blockObjects"][number], value?: Record<string, unknown>) => Parameters<PortableTextInputProps["onItemOpen"]>[0];
  insertChild: (editor: PortableEditor, type: PortableEditor["schemaTypes"]["inlineObjects"][number], value?: Record<string, unknown>) => unknown;
  isAnnotationActive: (editor: PortableEditor, type: string) => boolean;
  isExpandedSelection: (editor: PortableEditor) => boolean;
  isMarkActive: (editor: PortableEditor, mark: string) => boolean;
  removeAnnotation: (editor: PortableEditor, type: PortableEditor["schemaTypes"]["annotations"][number]) => void;
  select: (editor: PortableEditor, selection: EditorSelection) => void;
  toggleBlockStyle: (editor: PortableEditor, style: string) => void;
  toggleList: (editor: PortableEditor, style: string) => void;
  toggleMark: (editor: PortableEditor, mark: string) => void;
  undo: (editor: PortableEditor) => void;
  redo: (editor: PortableEditor) => void;
};

function editorApi(editor: PortableEditor): EditorApi {
  return editor.constructor as unknown as EditorApi;
}

export function applyArticleBlockStyle(editor: PortableEditor, style: "normal" | "h2" | "h3" | "blockquote") {
  editorApi(editor).toggleBlockStyle(editor, style);
}

export function applyEditorHistory(editor: PortableEditor, action: "undo" | "redo") {
  editorApi(editor)[action](editor);
}

const EMPTY_STATE: EditorState = {
  hasSelection: false,
  hasTextBlock: false,
  expandedSelection: false,
  style: null,
  bold: false,
  italic: false,
  link: false,
  list: null,
};

export function readArticleEditorState(editor: PortableEditor | null): EditorState {
  if (!editor) return EMPTY_STATE;
  const api = editorApi(editor);
  if (!api.getSelection(editor)) return EMPTY_STATE;
  const block = api.focusBlock(editor);
  const hasTextBlock = Boolean(block && block._type === "block");
  const style = (["normal", "h2", "h3", "blockquote"] as const).find((value) => api.hasBlockStyle(editor, value)) ?? null;
  return {
    hasSelection: true,
    hasTextBlock,
    expandedSelection: api.isExpandedSelection(editor),
    style,
    bold: api.isMarkActive(editor, "strong"),
    italic: api.isMarkActive(editor, "em"),
    link: api.isAnnotationActive(editor, "linkAnnotation"),
    list: api.hasListStyle(editor, "bullet") ? "bullet" : api.hasListStyle(editor, "number") ? "number" : null,
  };
}

function ToolbarButton({
  active,
  disabled = false,
  label,
  icon,
  onAction,
  tooltip = label,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon?: React.ComponentType;
  onAction: () => void;
  tooltip?: string;
}) {
  const activate = useCallback(() => {
    if (!disabled) onAction();
  }, [disabled, onAction]);

  return (
    <Tooltip content={<Box padding={2}><Text size={1}>{tooltip}</Text></Box>} fallbackPlacements={["bottom"]} placement="top">
      <Button
        aria-label={label}
        aria-pressed={active === undefined ? undefined : active}
        disabled={disabled}
        fontSize={1}
        icon={icon}
        mode={active ? "default" : "bleed"}
        onClick={activate}
        onMouseDown={(event) => event.preventDefault()}
        padding={2}
        tone={active ? "primary" : "default"}
      />
    </Tooltip>
  );
}

function Divider() {
  return <span aria-hidden="true" className={styles.divider} />;
}

export function ArticleBodyInput(props: PortableTextInputProps) {
  const editorRef = useRef<PortableEditor | null>(null);
  const sourceValue = useFormValue(["sources"]);
  const sources = useMemo(() => footnoteSourceOptions(sourceValue), [sourceValue]);
  const [editorState, setEditorState] = useState<EditorState>(EMPTY_STATE);
  const [footnoteOpen, setFootnoteOpen] = useState(false);
  const savedSelection = useRef<EditorSelection>(null);
  const toolbarSelection = useRef<EditorSelection>(null);

  const refreshState = useCallback((editor = editorRef.current) => {
    setEditorState(readArticleEditorState(editor));
  }, []);

  const runEditorAction = useCallback((action: (editor: PortableEditor) => void) => {
    const editor = editorRef.current;
    if (!editor) return;
    action(editor);
    editorApi(editor).focus(editor);
    refreshState(editor);
  }, [refreshState]);

  const toggleStyle = useCallback((style: "normal" | "h2" | "h3" | "blockquote") => {
    runEditorAction((editor) => {
      if (toolbarSelection.current) editorApi(editor).select(editor, toolbarSelection.current);
      applyArticleBlockStyle(editor, style);
    });
  }, [runEditorAction]);

  const insertBlock = useCallback((name: "editorialImage" | "callout") => {
    runEditorAction((editor) => {
      const schemaType = editor.schemaTypes.blockObjects.find((type) => type.name === name);
      if (!schemaType) return;
      const path = editorApi(editor).insertBlock(editor, schemaType);
      props.onItemOpen(path);
    });
  }, [props, runEditorAction]);

  const openFootnotePicker = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !editorState.hasTextBlock) return;
    savedSelection.current = editorApi(editor).getSelection(editor);
    setFootnoteOpen(true);
  }, [editorState.hasTextBlock]);

  const insertFootnote = useCallback((sourceKey: string) => {
    const selection = savedSelection.current;
    setFootnoteOpen(false);
    runEditorAction((editor) => {
      if (selection) editorApi(editor).select(editor, selection);
      const schemaType = editor.schemaTypes.inlineObjects.find((type) => type.name === "footnoteReference");
      if (schemaType) editorApi(editor).insertChild(editor, schemaType, { sourceKey });
    });
  }, [runEditorAction]);

  const editLink = useCallback((editor: PortableEditor) => {
    const schemaType = editor.schemaTypes.annotations.find((type) => type.name === "linkAnnotation");
    if (!schemaType) return;
    const api = editorApi(editor);
    if (api.isAnnotationActive(editor, "linkAnnotation")) {
      api.removeAnnotation(editor, schemaType);
      return;
    }
    const paths = api.addAnnotation(editor, schemaType);
    if (paths?.markDefPath) props.onItemOpen(paths.markDefPath);
  }, [props]);

  const toggleLink = useCallback(() => runEditorAction(editLink), [editLink, runEditorAction]);
  const hotkeys = useMemo<PortableTextInputProps["hotkeys"]>(() => ({
    ...props.hotkeys,
    custom: {
      ...props.hotkeys?.custom,
      "mod+k": (event, editor) => {
        event.preventDefault();
        editLink(editor);
      },
    },
  }), [editLink, props.hotkeys]);

  const onEditorChange = useCallback((change: EditorChange, editor: PortableEditor) => {
    props.onEditorChange?.(change, editor);
    refreshState(editor);
  }, [props, refreshState]);

  const footnoteDisabled = !editorState.hasTextBlock || props.readOnly;
  const footnoteTooltip = !editorState.hasTextBlock
      ? "Place the cursor in article text, a quote, or a list."
      : "Add footnote";

  const footnoteOptions = useMemo(() => sources.map((source, index) => ({
    value: source.key,
    label: `Source ${index + 1} · ${source.citation}`,
    number: String(index + 1),
  })), [sources]);

  const focusSources = useCallback(() => {
    setFootnoteOpen(false);
    props.onPathFocus(["sources"]);
  }, [props]);

  const RenderDefault = props.renderDefault;

  return (
    <Stack space={0}>
      <Card className={styles.editorShell} data-testid="article-body-editor-shell" radius={2}>
      <div className={styles.toolbarShell}>
      <div aria-label="Article formatting" className={styles.toolbar} data-testid="article-body-toolbar" role="toolbar">
        <span className={styles.toolbarGroup}>
          <ToolbarButton disabled={!editorState.hasSelection || props.readOnly} icon={UndoIcon} label="Undo" onAction={() => runEditorAction((editor) => applyEditorHistory(editor, "undo"))} tooltip="Undo (Cmd/Ctrl+Z)" />
          <ToolbarButton disabled={!editorState.hasSelection || props.readOnly} icon={RedoIcon} label="Redo" onAction={() => runEditorAction((editor) => applyEditorHistory(editor, "redo"))} tooltip="Redo (Cmd/Ctrl+Shift+Z)" />
        </span>
        <Divider />
        <span className={styles.styleSelect}>
          <Select
            aria-label="Paragraph style"
            disabled={!editorState.hasTextBlock || props.readOnly}
            fontSize={1}
            onChange={(event) => toggleStyle(event.currentTarget.value as "normal" | "h2" | "h3" | "blockquote")}
            onMouseDown={() => {
              const editor = editorRef.current;
              toolbarSelection.current = editor ? editorApi(editor).getSelection(editor) : null;
            }}
            padding={2}
            style={{ width: "100%" }}
            value={editorState.style ?? "normal"}
          >
            {ARTICLE_STYLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.title}</option>)}
          </Select>
        </span>
        <Divider />
        <span className={styles.toolbarGroup}>
          <ToolbarButton active={editorState.bold} disabled={!editorState.hasSelection || props.readOnly} icon={BoldIcon} label="Bold" onAction={() => runEditorAction((editor) => editorApi(editor).toggleMark(editor, "strong"))} tooltip="Bold (Cmd/Ctrl+B)" />
          <ToolbarButton active={editorState.italic} disabled={!editorState.hasSelection || props.readOnly} icon={ItalicIcon} label="Italic" onAction={() => runEditorAction((editor) => editorApi(editor).toggleMark(editor, "em"))} tooltip="Italic (Cmd/Ctrl+I)" />
          <ToolbarButton active={editorState.link} disabled={(!editorState.expandedSelection && !editorState.link) || props.readOnly} icon={LinkIcon} label="Insert link" onAction={toggleLink} tooltip="Insert link (Cmd/Ctrl+K)" />
        </span>
        <Divider />
        <span className={styles.toolbarGroup}>
          <ToolbarButton active={editorState.list === "bullet"} disabled={!editorState.hasTextBlock || props.readOnly} icon={UlistIcon} label="Bulleted list" onAction={() => runEditorAction((editor) => editorApi(editor).toggleList(editor, "bullet"))} />
          <ToolbarButton active={editorState.list === "number"} disabled={!editorState.hasTextBlock || props.readOnly} icon={OlistIcon} label="Numbered list" onAction={() => runEditorAction((editor) => editorApi(editor).toggleList(editor, "number"))} />
        </span>
        <Divider />
        <span className={styles.toolbarGroup}>
          <ToolbarButton disabled={footnoteDisabled} icon={FootnoteIcon} label="Add footnote" onAction={openFootnotePicker} tooltip={footnoteTooltip} />
          <ToolbarButton disabled={!editorState.hasSelection || props.readOnly} icon={ImageIcon} label="Insert image" onAction={() => insertBlock("editorialImage")} tooltip="Insert image" />
          <ToolbarButton disabled={!editorState.hasSelection || props.readOnly} icon={InfoOutlineIcon} label="Insert callout" onAction={() => insertBlock("callout")} tooltip="Insert callout" />
        </span>
      </div>
      </div>
      <div className={styles.editorSurface} data-testid="article-body-writing-surface">
        <RenderDefault {...props} editorRef={editorRef} hideToolbar hotkeys={hotkeys} onEditorChange={onEditorChange} />
      </div>
      </Card>
      {footnoteOpen && (
        <Dialog header="Choose a Source" id="footnote-source-dialog" onClose={() => setFootnoteOpen(false)} width={1}>
          <Box padding={4}>
            <Stack space={4}>
              {footnoteOptions.length ? <>
                <Text size={1}>Choose the Source for this citation. Search by Source-list number or citation.</Text>
                <Autocomplete
                  aria-label="Search Sources"
                  autoFocus
                  filterOption={matchesFootnoteSource}
                  id="footnote-source-search"
                  onSelect={insertFootnote}
                  openButton
                  openOnFocus
                  options={footnoteOptions}
                  placeholder="Search Sources"
                  renderOption={(option) => <Card as="button" padding={3}><Text size={1}>{option.label}</Text></Card>}
                  renderValue={(_value, option) => option?.label ?? ""}
                />
              </> : <Card padding={3} radius={2} tone="caution"><Stack space={2}><Text weight="semibold">No Sources yet</Text><Text size={1}>Add a Source before inserting a footnote.</Text></Stack></Card>}
              <Flex justify="flex-end">
                <Button mode="bleed" onClick={focusSources} text="Add source" />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}

function FootnoteIcon() {
  return <span aria-hidden="true" className={styles.footnoteIcon}>1</span>;
}

export function matchesFootnoteSource(query: string, option: { label: string; number: string }): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  return option.number === normalized || option.label.toLocaleLowerCase().includes(normalized);
}
